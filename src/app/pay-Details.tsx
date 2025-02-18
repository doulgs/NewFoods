import React, { useCallback, useState } from "react";
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CustomToggleButtons } from "@/components/Buttons/CustomToggleButtons";
import { LoadingScreen } from "@/components/Loadings";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { dbo_DetalhesPedido } from "@/database/schemas/dbo_DetalhesPedido";
import { useFocusEffect } from "expo-router";
import { formatDateTime } from "@/utils/dateFormatter";
import { useNavigationFoods } from "@/hooks/useNavegitionFoods";
import { usePaymentCalculationStore } from "@/storages/usePaymentCalculationStore";
import { usePreviousRouteName } from "@/hooks/useNavigationStateFoods";
import { useRequestStore } from "@/storages/useRequestStore";
import { fetchDetailOrder } from "@/services/Pedido/fetchDetailOrder";
import { startTable } from "@/services/Mesas/startTable";
import { startCard } from "@/services/Cartoes/startTable";
import { usePedidoStore } from "@/storages/usePedidoStore";

type RenderType = "payments" | "items" | "details";

export default function PayDetails() {
  const { navigateToMainScreen, navigateToOptionsPayment, navigateToOrderList, navigationController } =
    useNavigationFoods();

  const { handleGarcom, numero, tipo } = useRequestStore();
  const { saveAndGetPedido } = dbo_DetalhesPedido();
  const { setPedido, clearPedido, clearSelectedPessoa } = usePedidoStore();
  const { setPendingValue, setTotalAmountPaid } = usePaymentCalculationStore();

  const [currentOrder, setCurrentOrder] = useState<PedidoCompleto | null>(null);
  const [render, setRender] = useState<RenderType>("payments");
  const [ignoreWaiterFee, setIgnoreWaiterFee] = useState(false); // Estado para controlar se a taxa de garçom deve ser desconsiderada

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      // Reseta a aba para "payments" toda vez que a tela ganhar foco
      setRender("payments");

      let isActive = true;

      async function fetchOrderDetails() {
        setIsLoading(true);
        try {
          if (!isActive) return;
          const detailOrder = await fetchDetailOrder({ handleGarcom, numero, tipo });

          if (detailOrder?.Msg?.includes("Edição") && detailOrder.Data === null) {
            Alert.alert("Sistema", `${detailOrder.Msg}`);
            navigationController.back();
            return;
          }

          if (detailOrder?.IsValid && detailOrder.Data) {
            const result = await saveAndGetPedido(detailOrder.Data);

            if (result) {
              setCurrentOrder(result);
            } else {
              navigateToMainScreen();
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do pedido:", error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      fetchOrderDetails();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const optionsMapping: Record<string, RenderType> = {
    Pagamentos: "payments",
    Itens: "items",
    Detalhes: "details",
  };

  const handleSelection = (selected: "Pagamentos" | "Itens" | "Detalhes") => {
    setRender(optionsMapping[selected]);
  };

  const toggleIgnoreWaiterFee = useCallback(() => {
    setIgnoreWaiterFee((prev) => !prev);
  }, []);

  const calculateTotals = useCallback(() => {
    if (!currentOrder) return { valorTotal: 0, valorPago: 0, valorPendente: 0 };

    // Valor Total vem da API; se desconsiderar a taxa de garçom, subtrai ValorAcrescimo
    let valorTotal = currentOrder.Pedido.Total;
    if (ignoreWaiterFee) {
      valorTotal = valorTotal - (currentOrder.Pedido.ValorAcrescimo || 0);
    }

    // Valor Pago: soma de todos os pagamentos (propriedade ValorPago)
    const valorPago = (currentOrder.Pagamentos || []).reduce((sum, pagamento) => sum + pagamento.ValorPago, 0);

    // Valor Pendente: diferença entre o total (possivelmente ajustado) e o valor pago
    const valorPendente = valorTotal - valorPago;

    return { valorTotal, valorPago, valorPendente };
  }, [currentOrder, ignoreWaiterFee]);

  const { valorTotal, valorPago, valorPendente } = calculateTotals();

  const renderPayments = useCallback(
    ({ item }: { item: PagamentoRealizado }) => (
      <View className="bg-white border-b border-zinc-400 p-4 mb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-extraBold">Parcela</Text>
          <Text className="text-sm font-extraBold">{formatDateTime(item.DataHora, "short")}</Text>
          <Text className="text-lg font-extraBold">Valor</Text>
        </View>
        <View className="flex-row items-start justify-between pl-2">
          <Text className="text-md font-medium">{item.DescricaoCondicao}</Text>
          <Text className="text-md font-medium">{formatToCurrency(item.ValorPago)}</Text>
        </View>
        {item.ValorTroco !== 0 && (
          <View className="flex-row items-center justify-between border-t-hairline py-2 my-2">
            <Text className="text-md font-bold">Valor do troco:</Text>
            <Text className="text-md font-medium">{formatToCurrency(item.ValorTroco)}</Text>
          </View>
        )}
      </View>
    ),
    []
  );

  const renderItems = useCallback(
    ({ item }: { item: PedidoItem }) => (
      <View className="bg-white border-b border-zinc-400 p-4 mb-2">
        <Text className="text-lg font-extraBold">
          Produto: <Text className="font-medium">{item.DescricaoItem}</Text>
        </Text>
        <View className="flex-row items-start justify-between my-2">
          <Text className="text-md font-extraBold">
            Qtd: <Text className="font-medium">x{item.Quantidade}</Text>
          </Text>
          <Text className="text-md font-extraBold">
            Valor: <Text className="font-medium">{formatToCurrency(item.Valor)}</Text>
          </Text>
          <Text className="text-md font-extraBold">
            Total: <Text className="font-medium">{formatToCurrency(item.Valor * item.Quantidade)}</Text>
          </Text>
        </View>

        {item.DescricaoExcecoes && (
          <View className="py-2">
            <Text className="font-extraBold">Exceções: </Text>
            <Text className="font-medium pl-2">{item.DescricaoExcecoes}</Text>
          </View>
        )}

        {item.ListaComposicao && item.ListaComposicao?.length > 0 && (
          <View className="py-2">
            <Text className="font-extraBold">Composições: </Text>
            {item.ListaComposicao.map((comp, i) => (
              <Text className="font-medium pl-2" key={i}>
                {comp.NomeSabor}
              </Text>
            ))}
          </View>
        )}

        {item.DetalheItem?.map((detalhe, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <Text className="text-sm font-extraBold">
              Hora: <Text className="font-base">{detalhe.HoraInclusao}</Text>
            </Text>
            <Text className="text-sm font-extraBold">
              Garçom: <Text className="font-base">{detalhe.Garcom}</Text>
            </Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  const renderViewPayments = useCallback(() => {
    return (
      <>
        <FlatList
          data={currentOrder?.Pagamentos || []}
          renderItem={renderPayments}
          keyExtractor={(item) => String(item.Handle)}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg font-semibold">Nenhum pagamento encontrado</Text>
            </View>
          }
        />
      </>
    );
  }, [currentOrder, renderPayments]);

  const renderViewItems = useCallback(() => {
    return (
      <FlatList
        data={currentOrder?.Itens || []}
        renderItem={renderItems}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-semibold">Nenhum item encontrado</Text>
          </View>
        }
      />
    );
  }, [currentOrder, renderItems]);

  const renderViewDetails = useCallback(
    () => (
      <View className="flex-1 bg-white">
        <ScrollView>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Cliente:</Text>
            <Text className="text-lg font-extraBold text-gray-500">{currentOrder?.Pedido.Nome}</Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Numero:</Text>
            <Text className="text-lg font-extraBold text-gray-500">
              {currentOrder?.Pedido.Tipo} {currentOrder?.Pedido.Numero}
            </Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Quantidade de Pessoas:</Text>
            <Text className="text-xl font-extraBold text-gray-500">
              {currentOrder?.Pedido.FoodsQtdPessoas} {currentOrder?.Pedido.FoodsQtdPessoas === 1 ? "Pessoa" : "Pessoas"}
            </Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Valor por Pessoa:</Text>
            <Text className="text-xl font-extraBold text-gray-500">
              {formatToCurrency(currentOrder?.Pedido.Total! / currentOrder?.Pedido.FoodsQtdPessoas!)}
            </Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">A conta foi solicitada:</Text>
            <Text className="text-xl font-extraBold text-gray-500">
              {currentOrder?.Pedido.SolicitouConta === true ? "Sim" : "Não"}
            </Text>
          </View>

          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Data de lançamento:</Text>
            <Text className="text-lg font-extraBold text-gray-500">
              {formatDateTime(currentOrder?.Pedido.Data, "date")}
            </Text>
          </View>
          <View className="flex-row gap-4 items-center justify-between border-b border-zinc-400 p-2 mb-2">
            <Text className="text-xl font-semibold">Garcom:</Text>
            <Text className="text-lg font-extraBold text-gray-500">{currentOrder?.Pedido.GarcomNome}</Text>
          </View>
        </ScrollView>
      </View>
    ),
    [currentOrder]
  );

  const handleStartPayment = () => {
    setPendingValue(valorPendente);
    setTotalAmountPaid(Math.max(0, valorTotal - valorPago));
    navigateToOptionsPayment();
  };

  const handleAddNewItem = () => {
    setIsLoading(true);
    clearPedido();
    clearSelectedPessoa();

    if (tipo === "mesa") {
      iniciarMesa(handleGarcom, numero);
      return;
    } else {
      iniciarCartao(handleGarcom, numero);
      return;
    }
  };

  // 🚀 Função auxiliar para iniciar mesa
  const iniciarMesa = async (handleGarcom: number, numero: number) => {
    try {
      const tableStart = await startTable({ HandleGarcom: handleGarcom, Numero: numero.toString() });

      if (tableStart?.Msg?.includes("A mesa já solicitou a conta.") && tableStart.Data === null) {
        return Alert.alert("Sistema", `${tableStart.Msg}`);
      }

      if (tableStart?.IsValid && tableStart.Data) {
        setPedido({
          ...tableStart.Data,
          tipoLancamento: "mesa",
        });
        navigateToOrderList();
      }
    } catch (error) {
      console.error("Erro ao iniciar mesa:", error);
      Alert.alert("Erro", "Não foi possível iniciar a mesa.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Função auxiliar para iniciar cartão
  const iniciarCartao = async (handleGarcom: number, numero: number) => {
    try {
      const cardStart = await startCard({ HandleGarcom: handleGarcom, Numero: numero.toString() });

      if (cardStart?.Msg?.includes("O cartão já solicitou a conta.") && cardStart.Data === null) {
        return Alert.alert("Sistema", `${cardStart.Msg}`);
      }

      if (cardStart?.IsValid && cardStart.Data) {
        setPedido({
          ...cardStart.Data,
          tipoLancamento: "cartao",
        });
        navigateToOrderList();
      }
    } catch (error) {
      console.error("Erro ao iniciar cartão:", error);
      Alert.alert("Erro", "Não foi possível iniciar o cartão.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !currentOrder) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <>
      <View className="flex-1 p-2 gap-3 bg-white">
        {/* Seletor de abas */}
        <View className="p-3 gap-4 rounded-lg border">
          <CustomToggleButtons options={["Pagamentos", "Itens", "Detalhes"]} onSelect={handleSelection} />
        </View>

        {/* Cabeçalho com valores totais */}
        <View className="flex-row gap-2 rounded-lg border overflow-hidden bg-primary-800">
          <View className="flex-1 py-2 items-center justify-center ">
            <Text className="text-base font-semibold text-white">Total</Text>
            <Text className="text-xl font-extraBold text-white">{formatToCurrency(valorTotal)}</Text>
          </View>
          <View className="flex-1 py-2 items-center justify-center bg-primary-800">
            <Text className="text-base font-semibold text-white">Pago</Text>
            <Text className="text-xl font-extraBold text-white">{formatToCurrency(valorPago)}</Text>
          </View>
          <View className="flex-1 py-2 items-center justify-center bg-primary-800">
            <Text className="text-base font-semibold text-white">Pendente</Text>
            <Text className="text-xl font-extraBold text-white">{formatToCurrency(valorPendente)}</Text>
          </View>
        </View>

        {render === "details" && (
          <View className="flex-row gap-2 rounded-lg border overflow-hidden bg-primary-800">
            <View className="flex-1 py-2 items-center justify-center bg-primary-800">
              <Text className="text-base font-semibold text-white">Outros</Text>
              <Text className="text-xl font-extraBold text-white">
                {formatToCurrency(currentOrder.Pedido.ValorOutros)}
              </Text>
            </View>
            <View className="flex-1 py-2 items-center justify-center bg-primary-800">
              <Text className="text-base font-semibold text-white">Descontos</Text>
              <Text className="text-xl font-extraBold text-white">
                {formatToCurrency(currentOrder.Pedido.ValorDesconto)}
              </Text>
            </View>
            <View className="flex-1 py-2 items-center justify-center ">
              <Text className="text-base font-semibold text-white">Acréscimo</Text>
              <Text className="text-xl font-extraBold text-white">
                {formatToCurrency(currentOrder.Pedido.ValorAcrescimo)}
              </Text>
            </View>
          </View>
        )}

        {/* Conteúdo da aba selecionada */}
        <View className="flex-1 rounded-lg border overflow-hidden">
          {render === "payments" && renderViewPayments()}
          {render === "items" && renderViewItems()}
          {render === "details" && renderViewDetails()}
        </View>
      </View>

      {/* Botões de ação inferiores */}

      {render === "payments" && (
        <View className="p-3 bg-primary-800 items-end">
          <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600" onPress={handleStartPayment}>
            <Text className="text-lg px-4 font-semibold text-white">Adicionar Pagamento</Text>
          </TouchableOpacity>
        </View>
      )}
      {render === "items" && (
        <View className="p-3 bg-primary-800 items-end">
          <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600" onPress={handleAddNewItem}>
            <Text className="text-lg px-4 font-semibold text-white">Adicionar Itens</Text>
          </TouchableOpacity>
        </View>
      )}
      {render === "details" && (
        <View className="border overflow-hidden p-3 gap-2 bg-primary-800">
          <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600 " onPress={toggleIgnoreWaiterFee}>
            <Text className="text-lg px-4 font-semibold text-white">
              {ignoreWaiterFee ? "Considerar taxa de garçom" : "Desconsiderar taxa de garçom"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600" onPress={toggleIgnoreWaiterFee}>
            <Text className="text-lg px-4 font-semibold text-white">Realizar impressão do extrato</Text>
          </TouchableOpacity>

          <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600 " onPress={toggleIgnoreWaiterFee}>
            <Text className="text-lg px-4 font-semibold text-white">Alterar quantidade de Pessoas</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
