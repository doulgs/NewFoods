import { LoadingScreen } from "@/components/Loadings";
import { dbo_DetalhesPedido } from "@/database/schemas/dbo_DetalhesPedido";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { CancellationModuleController } from "@/modules/Cancellation/CancellationModuleController";
import { DeletePayment } from "@/services/Pedido/deletePayment";
import { formatDateTime } from "@/utils/dateFormatter";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";

interface DeepLinkUrlParams {
  success: string;
  atk: string;
  canceledamount: string;
  paymenttype: string;
  transactionamount: string;
  orderid: string;
  authorizationcode: string;
  reason: string;
  responsecode: string;
}

function parseDeepLinkParams(params: Linking.QueryParams): DeepLinkUrlParams {
  const getParam = (value: string | string[] | undefined): string =>
    typeof value === "string" ? value : Array.isArray(value) && value.length > 0 ? value[0] : "";
  return {
    success: getParam(params.success),
    atk: getParam(params.atk),
    canceledamount: getParam(params.canceledamount),
    paymenttype: getParam(params.paymenttype),
    transactionamount: getParam(params.transactionamount),
    orderid: getParam(params.orderid),
    authorizationcode: getParam(params.authorizationcode),
    reason: getParam(params.reason),
    responsecode: getParam(params.responsecode),
  };
}

export default function Cancel() {
  const url = Linking.useURL();

  const { handlePayment } = useLocalSearchParams<{ handlePayment: string }>();
  const { navigationController } = useNavigationFoods();
  const { getPagamentoByHandle } = dbo_DetalhesPedido();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [payment, setPayment] = useState<PagamentoRealizado | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetch() {
        setIsLoading(true);
        try {
          if (!isActive) return;

          if (!handlePayment) {
            navigationController.back();
            return;
          }

          const pagamento_realizado = await getPagamentoByHandle(handlePayment);

          if (!pagamento_realizado) {
            navigationController.back();
            return;
          }

          setPayment(pagamento_realizado);
        } catch (error) {
          console.error("Erro ao buscar pagamento:", error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      fetch();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Função para iniciar o cancelamento do pagamento
  const handleStartCancelPayment = useCallback(async () => {
    setIsLoading(true);
    if (!payment) return;

    const HandlePedido = payment.pedido_handle; // Handle do pedido
    const Handle = payment.Handle; // Handle do pagamento
    const TipoPagamento = payment.TipoOperacao;

    try {
      if (payment.Atk === "DIN" || !payment.Atk) {
        await DeletePayment({ Handle, HandlePedido, TipoPagamento });
        navigationController.back();
      } else {
        // Chama o controller para cancelamento
        await CancellationModuleController({ amount: payment.ValorPago, atk: payment.Atk });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao executar o cancelamento:", error);
    }
  }, [payment, navigationController]);

  // Função para processar o cancelamento via deep link
  const processCancellation = useCallback(async () => {
    if (!payment) {
      Alert.alert("Atenção", "Informações sobre a parcela insuficiente verifique.");
      navigationController.back();
      return;
    }
    const HandlePedido = payment.pedido_handle;
    const Handle = payment.Handle;
    const TipoPagamento = payment.TipoOperacao;
    try {
      await DeletePayment({ Handle, HandlePedido, TipoPagamento });
      navigationController.back();
    } catch (error) {
      setIsLoading(false);
      console.error("Erro ao processar o cancelamento:", error);
    } finally {
      setIsLoading(false);
    }
  }, [payment, navigationController]);

  // Handler para evento de deep link
  const handleDeepLinkEvent = useCallback(
    async (event: { url: string }) => {
      if (!event?.url) return;
      try {
        const { queryParams } = Linking.parse(event.url);
        const typedParams = parseDeepLinkParams(queryParams ?? {});
        if (typedParams.success === "true") {
          //console.log("Processando cancelamento via deep link...", typedParams);
          // Aguarda 2 segundos (2000 milissegundos) antes de chamar a função
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await processCancellation();
        } else {
          if (typedParams.reason === "7011") {
            Alert.alert("Atenção", "Cancelamento abordado.");
            navigationController.back();
            return;
          }
          if (typedParams.reason === "7202") {
            Alert.alert("Atenção", "Código unico(ATK) não localizado no dispositivo");
            navigationController.back();
            return;
          }

          Alert.alert("Sistema", `Não foi possível realizar o cancelamento tente novamente.`);
          console.error("Deep link recebido com código diferente de 'true'.", typedParams);
          navigationController.back();
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Erro no handleDeepLinkEvent:", error);
      }
    },
    [processCancellation]
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLinkEvent);
    return () => {
      subscription.remove();
    };
  }, [handleDeepLinkEvent]);

  if (isLoading || !payment) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Handle Pedido:</Text>
            <Text className="text-lg font-extraBold">{payment.pedido_handle}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Handle Pagamento:</Text>
            <Text className="text-lg font-extraBold">{payment.Handle}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Código ATK:</Text>
            <Text className="text-lg font-extraBold">{payment.Atk}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Garçom:</Text>
            <Text className="text-lg font-extraBold">{payment.Usuario}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Forma de Pgmt:</Text>
            <Text className="text-lg font-extraBold">{payment.DescricaoCondicao}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Valor Pago:</Text>
            <Text className="text-lg font-extraBold">{formatToCurrency(payment.ValorPago)}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Valor do Troco:</Text>
            <Text className="text-lg font-extraBold">{formatToCurrency(payment.ValorTroco)}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Data/Hora:</Text>
            <Text className="text-lg font-extraBold">{formatDateTime(payment.DataHora, "medium")}</Text>
          </View>
        </ScrollView>
      </View>

      <View className="p-3 bg-primary-800 items-end">
        <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600" onPress={handleStartCancelPayment}>
          <Text className="text-lg px-4 font-semibold text-white">Estornar Pagamento</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
