import { LoadingScreen } from "@/components/Loadings";
import { KeyboardModal } from "@/components/Modais/KeyboardModal";
import { dbo_DetalhesPedido } from "@/database/schemas/dbo_DetalhesPedido";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { handlePaymentProcess } from "@/modules/Payment/PaymentModuleController";
import { fetchConditions } from "@/services/Condicoes/fetchConditions";
import { InsertPayment } from "@/services/Pedido/insertPayment";
import { usePaymentCalculationStore } from "@/storages/usePaymentCalculationStore";
import { getCurrentDateTimeISO } from "@/utils/dateFormatter";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import * as Linking from "expo-linking";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

interface DeepLinkUrlParams {
  amount: string;
  cardholder_name: string;
  itk: string;
  atk: string;
  authorization_date_time: string;
  brand: string;
  order_id: string;
  authorization_code: string;
  installment_count: string;
  pan: string;
  type: string;
  entry_mode: string;
  account_id: string;
  customer_wallet_provider_id: string;
  code: string;
  success: string;
  transaction_qualifier: string;
  message: string;
}

/**
 * Mapeia os parâmetros da query do deep link para um objeto tipado.
 */
function parseDeepLinkParams(params: Linking.QueryParams): DeepLinkUrlParams {
  const getParam = (value: string | string[] | undefined): string =>
    typeof value === "string" ? value : Array.isArray(value) && value.length > 0 ? value[0] : "";
  return {
    amount: getParam(params.amount),
    cardholder_name: getParam(params.cardholder_name),
    itk: getParam(params.itk),
    atk: getParam(params.atk),
    authorization_date_time: getParam(params.authorization_date_time),
    brand: getParam(params.brand),
    order_id: getParam(params.order_id),
    authorization_code: getParam(params.authorization_code),
    installment_count: getParam(params.installment_count),
    pan: getParam(params.pan),
    type: getParam(params.type),
    entry_mode: getParam(params.entry_mode),
    account_id: getParam(params.account_id),
    customer_wallet_provider_id: getParam(params.customer_wallet_provider_id),
    code: getParam(params.code),
    success: getParam(params.success),
    transaction_qualifier: getParam(params.transaction_qualifier),
    message: getParam(params.message),
  };
}

export default function PayOptions() {
  const url = Linking.useURL();
  const dataHoraAtual = getCurrentDateTimeISO();

  const { getPedido, insertPagamento } = dbo_DetalhesPedido();

  const {
    change,
    computedChange,
    pendingValue,
    setPendingValue,
    setChange,
    setComputedChange,
    selectedCondition,
    setSelectedCondition,
    clearSelectedCondition,
  } = usePaymentCalculationStore();

  const { navigateToProcessingPayment } = useNavigationFoods();

  const [currentOrder, setCurrentOrder] = useState<PedidoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [conditions, setConditions] = useState<CondicaoPagamento[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function get() {
        try {
          clearSelectedCondition();
          const resultPedido = await getPedido();
          const resultCondicoes = await fetchConditions();

          if (!isActive) return;

          if (resultPedido) {
            setCurrentOrder(resultPedido);
          }

          if (resultCondicoes && resultCondicoes.Data.length > 0) {
            setConditions(resultCondicoes.Data);
            setSelectedCondition(resultCondicoes.Data[0]);
          }
        } catch (error) {
          console.error("Erro na função get", error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      get();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const finishOrder = useCallback(
    ({ tipo }: { tipo: "Total" | "Crédito" }) => {
      navigateToProcessingPayment(tipo === "Total" ? "finish" : "pending");
    },
    [navigateToProcessingPayment]
  );

  const renderConditionItem = useCallback(
    ({ item }: { item: CondicaoPagamento }) => {
      const isSelected = selectedCondition?.Handle === item.Handle;
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedCondition(item)}
          className={clsx(
            "mx-4 my-2 rounded-lg border shadow-sm p-4",
            isSelected ? "border-primary-800 bg-primary-800" : "bg-gray-50"
          )}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className={clsx("pl-2 text-lg font-extraBold", {
                "text-white": isSelected,
                "text-black": !isSelected,
              })}
            >
              {item.Descricao}
            </Text>
            <MaterialIcons
              name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={isSelected ? "#ffffff" : "#034570"}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [selectedCondition, setSelectedCondition]
  );

  const recordPayment = useCallback(
    async (extractedParams: DeepLinkUrlParams) => {
      const { pendingValue, totalAmountPaid } = usePaymentCalculationStore.getState();
      const valorPendente = Number(pendingValue.toFixed(2));
      const valorTotalPendente = Number(totalAmountPaid.toFixed(2));

      const isFinishOrder: "Total" | "Crédito" = valorTotalPendente === valorPendente ? "Total" : "Crédito";

      if (!selectedCondition) {
        Alert.alert("Sistema", "Condição de pagamento não encontrada. Tente novamente.");
        return;
      }
      if (!currentOrder) {
        Alert.alert("Sistema", "Pedido não encontrado. Tente novamente.");
        return;
      }

      const paymentDetails = {
        HandleCondicaoPagamento: selectedCondition.Handle,
        DescricaoCondicaoPagamento: selectedCondition.Descricao,
        ValorPagamento: pendingValue,
        TipoPagamento: isFinishOrder,
        QuantidadePessoas: currentOrder.Pedido.FoodsQtdPessoas,
        Data: dataHoraAtual,
        ValorDesconto: 0.0,
        ValorAcrescimo: 0.0,
        ValorOutros: 0.0,
        Usuario: currentOrder.Pedido.GarcomNome,
        ValorTroco: change,
        TotalRecebido: pendingValue,
        DesconsiderarTaxaGarcom: false,
        InformacoesPagamento: {
          Code: extractedParams.code,
          Amount: pendingValue,
          Sucesso: true,
          Itk: extractedParams.itk,
          Type: extractedParams.type,
          InstallmentCount: extractedParams.installment_count,
          Brand: extractedParams.brand,
          EntryMode: extractedParams.entry_mode,
          Atk: extractedParams.atk,
          Pan: extractedParams.pan,
          Plataforma: "POS",
          AuthorizationCode: extractedParams.authorization_code,
          AuthorizationDateTime: extractedParams.authorization_date_time,
          Data: dataHoraAtual,
          Valor: pendingValue,
          ValorDeTroco: computedChange,
        },
      };

      const payment = {
        HandlePedido: currentOrder.Pedido.Handle,
        ListaPagamento: [paymentDetails],
      };

      try {
        const resultPayment = await InsertPayment({
          HandlePedido: payment.HandlePedido,
          ListaPagamento: payment.ListaPagamento,
        });

        const pagamentoRealizado: Omit<PagamentoRealizado, "id"> = {
          pedido_handle: payment.HandlePedido,
          Tabela: "G_PEDIDOS_PAGTO",
          Handle: 0, // Valor temporário, se for gerado automaticamente, não precisa ser preenchido
          HandleCondicaoPagamento: paymentDetails.HandleCondicaoPagamento,
          ValorPago: paymentDetails.ValorPagamento,
          ValorTroco: paymentDetails.ValorTroco,
          ValorAcrescimo: paymentDetails.ValorAcrescimo,
          ValorOutros: paymentDetails.ValorOutros,
          ValorDesconto: paymentDetails.ValorDesconto,
          ValorProdutos: 0,
          GpeHandleDestino: null,
          Sequencia: 0,
          QuantidadePessoas: paymentDetails.QuantidadePessoas,
          PesHandle: 0,
          NtaHandle: null,
          Observacao: "",
          Usuario: paymentDetails.Usuario,
          DataHora: paymentDetails.Data,
          PesCnpjCfp: "",
          PesNome: "0",
          TipoOperacao: "",
          HandleTipoNota: null,
          DescricaoCondicao: paymentDetails.DescricaoCondicaoPagamento,
          Atk: paymentDetails.InformacoesPagamento.Atk,
        };

        if (resultPayment?.IsValid) {
          await insertPagamento(currentOrder, pagamentoRealizado);
        }

        finishOrder({ tipo: isFinishOrder });
      } catch (error) {
        console.error("Erro ao registrar o pagamento:", error);
        Alert.alert("Erro", "Falha ao registrar o pagamento. Tente novamente.");
      }
    },
    [currentOrder, selectedCondition, dataHoraAtual, computedChange, change]
  );

  const startPaymentProcess = useCallback(
    (selected: CondicaoPagamento) => {
      try {
        const amountWithoutDecimal = Math.round(pendingValue * 100).toString();
        handlePaymentProcess({
          amount: amountWithoutDecimal,
          transactionType: selected.CodigoIntegracaoPagamento,
        });
      } catch (error) {
        console.error("Erro ao iniciar pagamento:", error);
      }
    },
    [pendingValue]
  );

  const processSelectedCondition = useCallback(
    (selected: CondicaoPagamento) => {
      if (selected.CodigoIntegracaoPagamento === "DIN") {
        const defaultParams: DeepLinkUrlParams = {
          amount: pendingValue.toString(),
          cardholder_name: "",
          itk: "",
          atk: "",
          authorization_date_time: dataHoraAtual,
          brand: "",
          order_id: "",
          authorization_code: "",
          installment_count: "0",
          pan: "",
          type: selected.CodigoIntegracaoPagamento,
          entry_mode: "",
          account_id: "",
          customer_wallet_provider_id: "",
          code: "0", // Força o código 0 para simular deep link
          success: "true",
          transaction_qualifier: "",
          message: "Pagamento DIN processado manualmente",
        };
        recordPayment(defaultParams);
      } else {
        startPaymentProcess(selected);
      }
    },
    [pendingValue, dataHoraAtual, recordPayment, startPaymentProcess]
  );

  const handleConfirmSelection = useCallback(() => {
    if (!selectedCondition) {
      Alert.alert("Atenção", "Selecione uma condição de pagamento");
      return;
    }
    processSelectedCondition(selectedCondition);
  }, [selectedCondition, processSelectedCondition]);

  const handleDeepLinkEvent = useCallback(
    async (event: { url: string }) => {
      if (!event?.url) return;
      const { queryParams } = Linking.parse(event.url);
      const typedParams = parseDeepLinkParams(queryParams ?? {});
      if (typedParams.code === "0") {
        console.log("Código recebido é 0. Processando pagamento...", typedParams);
        await recordPayment(typedParams);
      } else {
        console.log("Deep link recebido com código diferente de 0.", typedParams);
        Alert.alert("Sistema", typedParams.message || "Erro ao processar o deep link.");
      }
    },
    [recordPayment]
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLinkEvent);
    return () => {
      subscription.remove();
    };
  }, [url, handleDeepLinkEvent]);

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  if (conditions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-center text-3xl font-bold text-black">
          Nenhuma condicão de pagamento foi encontrada...
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white">
        <FlatList
          data={conditions}
          keyExtractor={(item) => String(item.Handle)}
          ListHeaderComponent={() => (
            <View className="px-6 py-4 border-b border-zinc-300 mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold text-gray-600">Valor</Text>
                <Text className="text-3xl font-bold text-black">{formatToCurrency(pendingValue)}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="calculator-variant" size={36} color="#034570" />
              </TouchableOpacity>
            </View>
          )}
          renderItem={renderConditionItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />

        <View className="absolute bottom-0 left-0 right-0 p-4 bg-primary-800 border-t">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-yellow-600 py-3 rounded-lg"
            onPress={handleConfirmSelection}
          >
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text className="ml-2 text-lg font-extraBold text-white">Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardModal
        initialValue={pendingValue}
        visible={modalVisible}
        allowChangeAmount={selectedCondition?.CodigoIntegracaoPagamento === "DIN"}
        onClose={() => setModalVisible(false)}
        onConfirm={(editedAmount, editedChange, calculatedChange) => {
          setPendingValue(editedAmount);
          setChange(editedChange);
          setComputedChange(calculatedChange);
          setModalVisible(false);
        }}
      />
    </>
  );
}
