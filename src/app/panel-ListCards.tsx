// stack/(tabs)/screenCard.tsx
import { LoadingScreen } from "@/components/Loadings";
import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { fetchCards } from "@/services/Cartoes/fetchCards";
import { startCard } from "@/services/Cartoes/startTable";
import { fetchDetailOrder } from "@/services/Pedido/fetchDetailOrder";
import { getDisponibilidadeMesaCartao } from "@/services/Status/getDisponibilidadeMesaCartao";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { useRequestStore } from "@/storages/useRequestStore";
import { useTempMesaCartao } from "@/storages/useTempMesaCartao";
import { useFocusEffect } from "@react-navigation/native";
import { clsx } from "clsx";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";

const REFRESH_INTERVAL = 30; // 30 segundos para o contador
const NUM_COLUMNS = 3; // Número de colunas na FlatList

export default function PanelListCards() {
  const tmcStorege = useTempMesaCartao();
  const { navigateToDetailPayment, navigateToOrderList } = useNavigationFoods();

  const { getUsuario } = dbo_Usuario();
  const { setRequestData, resetRequestStatus } = useRequestStore();
  const { setPedido, clearPedido, clearSelectedPessoa } = usePedidoStore();

  const [isLoading, setIsLoading] = useState(true);
  const [sortOption] = useState("Pesquisar");
  const [counter, setCounter] = useState(REFRESH_INTERVAL);

  const { control, watch } = useForm<{ search: string }>({
    defaultValues: { search: "" },
  });
  const searchValue = watch("search");

  // useRef para armazenar o ID do intervalo e garantir sua limpeza
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtra os dados de acordo com o valor da busca
  const filteredData = useMemo(() => {
    return tmcStorege.tempMesaCartao.filter((item) => {
      if (sortOption === "Pesquisar") {
        if (!searchValue) return true;
        const searchLower = searchValue.toLowerCase();
        return (
          item.Numero.toString().toLowerCase().includes(searchLower) || item.Nome.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [tmcStorege.tempMesaCartao, sortOption, searchValue]);

  // Função de renderização do item (memoizada com useCallback)
  const renderTable = useCallback(({ item, index }: { item: TempMesaCartao; index: number }) => {
    // Aplica margem direita se o item não for o último da linha
    const marginRight = (index + 1) % NUM_COLUMNS === 0 ? 0 : 10;

    return (
      <Pressable
        style={{ marginRight }}
        className={clsx(
          "flex-1 h-28 rounded-lg p-2 mb-4 border border-zinc-400 items-center justify-center overflow-hidden",
          {
            "bg-rose-500": item.SolicitouConta === true,
            "bg-emerald-900": item.Status === "AGRUPADO_VAZIO",
            "bg-emerald-600": item.SolicitouConta === false || item.Status === "AGRUPADO_PRINCIPAL",
          }
        )}
        onPress={() => handleStartLaunch(item.Numero)}
      >
        <Text className="text-zinc-900 p-2 text-4xl font-extraBold">{item.Numero}</Text>
        <Text className="text-center text-zinc-700 text-xl font-extraBold absolute bottom-1">{item.Nome}</Text>
        {item.QuantidadePessoas > 0 && (
          <View className="absolute bg-zinc-400 min-w-7 h-7 -top-1 -left-1 rounded-lg border items-center justify-center">
            <Text className="text-zinc-200 text-md font-extraBold">{item.QuantidadePessoas}</Text>
          </View>
        )}
      </Pressable>
    );
  }, []);

  const handleStartLaunch = async (numercartao: string) => {
    setIsLoading(true);
    clearPedido();
    clearSelectedPessoa();
    resetRequestStatus();

    const user = await getUsuario();

    if (!user) return;

    const handleGarcom = user.Handle;
    const numeroDigitado = Number(numercartao);

    try {
      const disponibilidade = await getDisponibilidadeMesaCartao({ numero: numeroDigitado, tipo: "cartao" });

      if (disponibilidade) {
        await iniciarCartao(handleGarcom, numeroDigitado);
        return;
      } else {
        setRequestData(handleGarcom, numeroDigitado, "cartao");
        navigateToDetailPayment();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao iniciar lançamento:", error);
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

  // Função para buscar os cartões e atualizar o store
  const getListCards = async () => {
    try {
      const result = await fetchCards();
      if (!result || !result.IsValid) {
        Alert.alert("Sistema", "Não foi possível carregar os cartões.");
        return;
      }
      // Atualiza o store somente se os dados forem diferentes
      if (JSON.stringify(result.Data) !== JSON.stringify(tmcStorege.tempMesaCartao)) {
        tmcStorege.setTempMesaCartao(result.Data);
      }
    } catch (fetchError) {
      console.log("Erro ao consultar API na função getListCards", fetchError);
      Alert.alert("Erro", "Erro ao consultar API. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect: recarrega os dados e reinicia o contador sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      getListCards();
      setCounter(REFRESH_INTERVAL);

      intervalRef.current = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            getListCards();
            return REFRESH_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [])
  );

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <View className="flex-1 p-3 bg-white">
      <View className="bg-gray-100 rounded-lg p-4 mb-4 border border-zinc-400">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-lg font-extraBold text-gray-700">Buscar Cartão:</Text>
          <Text className="text-gray-600 font-medium">
            Recarregando em <Text className="font-extraBold text-gray-700">{counter}s</Text>
          </Text>
        </View>
        {/* Barra de busca sempre exibida (pois sortOption é "Pesquisar") */}
        <Controller
          name="search"
          control={control}
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Nome ou Número do Cartão..."
              keyboardType="default"
              className="border p-3 rounded-md text-gray-700"
            />
          )}
        />
      </View>

      {/* Listagem filtrada */}
      <FlatList
        initialNumToRender={100}
        numColumns={NUM_COLUMNS}
        data={filteredData}
        keyExtractor={(item) => item.Numero.toString()}
        renderItem={renderTable}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
      />
    </View>
  );
}
