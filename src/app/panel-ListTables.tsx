// stack/(tabs)/screenTable.tsx
import { LoadingScreen } from "@/components/Loadings";
import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { fetchTables } from "@/services/Mesas/fetchTables";
import { startTable } from "@/services/Mesas/startTable";
import { fetchDetailOrder } from "@/services/Pedido/fetchDetailOrder";
import { getDisponibilidadeMesaCartao } from "@/services/Status/getDisponibilidadeMesaCartao";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { useRequestStore } from "@/storages/useRequestStore";
import { useTempMesaCartao } from "@/storages/useTempMesaCartao";
import { useFocusEffect } from "@react-navigation/native";
import { clsx } from "clsx";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

const REFRESH_INTERVAL = 30; // 30 segundos (em segundos) para o contador
const NUM_COLUMNS = 3; // Número de colunas na FlatList

export default function PanelListTables() {
  const tmcStorege = useTempMesaCartao();

  const { navigateToDetailPayment, navigateToOrderList } = useNavigationFoods();

  const { getUsuario } = dbo_Usuario();
  const { setRequestData, resetRequestStatus } = useRequestStore();
  const { setPedido, clearPedido, clearSelectedPessoa } = usePedidoStore();

  const [isLoading, setIsLoading] = useState(true);
  // sortOption continuará com "Todas", "Ocupadas" e "Vazias"
  const [sortOption, setSortOption] = useState("Todas");
  const [counter, setCounter] = useState(REFRESH_INTERVAL);

  const { control, watch } = useForm<{ search: string }>({
    defaultValues: { search: "" },
  });
  const searchValue = watch("search");

  // Gerencia o ID do intervalo para limpeza adequada
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtra os dados de acordo com o sortOption E com o valor da busca (se houver)
  const filteredData = useMemo(() => {
    return tmcStorege.tempMesaCartao.filter((item) => {
      // Primeiro, aplica o filtro por sortOption
      let sortCondition = true;
      if (sortOption === "Ocupadas") {
        sortCondition =
          item.Status === "OCUPADA" || item.Status === "AGRUPADA_PRINCIPAL" || item.Status === "AGRUPADA_VAZIA";
      } else if (sortOption === "Vazias") {
        sortCondition = item.Status === "LIVRE";
      }
      if (!sortCondition) return false;

      // Em seguida, se houver texto de busca, aplica o filtro por Nome ou Numero
      if (searchValue && searchValue.trim() !== "") {
        const searchLower = searchValue.toLowerCase();
        return (
          item.Numero.toString().toLowerCase().includes(searchLower) || item.Nome.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [tmcStorege.tempMesaCartao, sortOption, searchValue]);

  // Função de renderização do item, utilizando useCallback para evitar recriações desnecessárias.
  const renderTable = useCallback(({ item, index }: { item: TempMesaCartao; index: number }) => {
    // Aplica margem direita somente se não for o último item da linha
    const marginRight = (index + 1) % NUM_COLUMNS === 0 ? 0 : 10;

    return (
      <Pressable
        style={{ marginRight }}
        className={clsx(
          "flex-1 h-28 rounded-lg p-2 mb-4 border border-zinc-400 items-center justify-center overflow-hidden",
          {
            "bg-gray-100": item.Status === "LIVRE",
            "bg-rose-500/80": item.SolicitouConta,
            "bg-emerald-600":
              item.Status === "OCUPADA" || item.Status === "AGRUPADA_PRINCIPAL" || item.Status === "AGRUPADA_VAZIA",
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
      const disponibilidade = await getDisponibilidadeMesaCartao({ numero: numeroDigitado, tipo: "mesa" });

      if (disponibilidade) {
        await iniciarMesa(handleGarcom, numeroDigitado);
        return;
      } else {
        setRequestData(handleGarcom, numeroDigitado, "mesa");
        navigateToDetailPayment();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao iniciar lançamento:", error);
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

  // Função para buscar as mesas e atualizar o store
  const getListTables = async () => {
    try {
      const result = await fetchTables();
      if (!result || !result.IsValid) {
        Alert.alert("Sistema", "Não foi possível carregar as mesas.");
        return;
      }
      // Atualiza somente se os dados forem diferentes
      if (JSON.stringify(result.Data) !== JSON.stringify(tmcStorege.tempMesaCartao)) {
        tmcStorege.setTempMesaCartao(result.Data);
      }
    } catch (fetchError) {
      console.log("Erro ao consultar API na função getListTables", fetchError);
      Alert.alert("Erro", "Erro ao consultar API. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect para executar a lógica sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      getListTables();
      setCounter(REFRESH_INTERVAL);

      // Cria o intervalo para atualizar o contador e recarregar os dados
      intervalRef.current = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            getListTables();
            return REFRESH_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);

      // Limpa o intervalo ao sair da tela
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
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-extraBold text-gray-700">Exibir Mesas</Text>
        </View>

        <View className="flex-row gap-2 py-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${sortOption === "Todas" ? "bg-primary-800" : "bg-gray-400"}`}
            onPress={() => setSortOption("Todas")}
          >
            <Text className="text-white font-semibold">Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${sortOption === "Ocupadas" ? "bg-primary-800" : "bg-gray-400"}`}
            onPress={() => setSortOption("Ocupadas")}
          >
            <Text className="text-white font-semibold">Ocupadas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${sortOption === "Vazias" ? "bg-primary-800" : "bg-gray-400"}`}
            onPress={() => setSortOption("Vazias")}
          >
            <Text className="text-white font-semibold">Vazias</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de busca sempre exibida */}
        <View className="flex-col mt-2">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-extraBold text-gray-700">Buscar mesa:</Text>
            <Text className="text-gray-600 font-medium">
              Recarregando em <Text className="font-extraBold text-gray-700">{counter}s</Text>
            </Text>
          </View>
          <Controller
            name="search"
            control={control}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Nome ou Número da Mesa..."
                keyboardType="default"
                className="border p-3 rounded-md text-gray-700"
              />
            )}
          />
        </View>
      </View>

      {/* Listagem filtrada */}
      <FlatList
        initialNumToRender={100}
        numColumns={NUM_COLUMNS}
        data={filteredData}
        keyExtractor={(item) => item.Numero.toString()} // Utiliza item.Numero como chave única
        renderItem={renderTable}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
      />
    </View>
  );
}
