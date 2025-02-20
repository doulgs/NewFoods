import { PublisoftIcon } from "@/assets/icons/publisoft";
import { LoadingScreen } from "@/components/Loadings";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { fetchGrupo3 } from "@/services/sincronizar/GetGrupos3";
import { useProdutoStorage } from "@/storages/useProdutoStorage";
import { useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function LaucherGroup2List() {
  const { navigateToGroup3List, navigateToProductList } = useNavigationFoods();
  const { grupo2, setGrupo3 } = useProdutoStorage();

  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Codigo"); // Opção de ordenação

  // Ordenar a lista com base na opção selecionada
  const sortGrupo2List = () => {
    return [...grupo2].sort((a, b) => {
      if (sortOption === "Handle") return a.Handle - b.Handle;
      if (sortOption === "Codigo") return parseInt(a.Codigo) - parseInt(b.Codigo);
      if (sortOption === "Nome") return a.Nome.localeCompare(b.Nome);
      return 0;
    });
  };

  // Função disparada ao clicar em um item
  const handleItemPress = async (item: Grupo2) => {
    try {
      setIsLoading(true);
      if (item.EhComposicao) {
        const grupo3list = await fetchGrupo3({ handleGrupo2: item.Handle });
        if (grupo3list) {
          setGrupo3(grupo3list.Data.Grupos3);
          navigateToGroup3List(item.Handle.toString());
        }
      } else {
        navigateToProductList({ handleGrupo2: item.Handle.toString() });
      }
    } catch (error) {
      Alert.alert("Sistema", `Erro ao buscar grupos3: ${error}`);
      console.error("Erro ao buscar grupos3:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Botões de ordenação */}
      <View className="flex-row items-center gap-2 p-4">
        <Text className="text-lg font-bold text-gray-500">Order por:</Text>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${sortOption === "Nome" ? "bg-primary-800" : "bg-gray-400"}`}
          onPress={() => setSortOption("Nome")}
        >
          <Text className="text-white font-semibold">Nome</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${sortOption === "Codigo" ? "bg-primary-800" : "bg-gray-400"}`}
          onPress={() => setSortOption("Codigo")}
        >
          <Text className="text-white font-semibold">Código</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${sortOption === "Handle" ? "bg-primary-800" : "bg-gray-400"}`}
          onPress={() => setSortOption("Handle")}
        >
          <Text className="text-white font-semibold">Handle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortGrupo2List()} // Lista ordenada
        keyExtractor={(item) => String(item.Handle)} // Garantindo chave única
        numColumns={3} // Define o número de colunas
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 8 }} // Espaçamento entre colunas
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 bg-gray-100 m-3 rounded-lg items-center justify-center border border-zinc-300 shadow-md"
            style={{ aspectRatio: 1 }} // Quadrado
            onPress={() => handleItemPress(item)}
          >
            <View className="absolute top-2 left-2">
              <Text className="text-xs font-bold text-gray-500">{item.Handle}</Text>
            </View>
            <View className=" justify-between items-center p-1">
              <PublisoftIcon fill={"#044470"} />
              <Text className="text-center text-gray-800 font-bold mt-2" numberOfLines={2}>
                {item.NomeReduzido ? item.NomeReduzido.toLocaleUpperCase() : item.Nome.slice(0, 10).toLocaleUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">Nenhum grupo disponível.</Text>}
      />
    </View>
  );
}
