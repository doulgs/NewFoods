import { PublisoftIcon } from "@/assets/icons/publisoft";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { useProdutoStorage } from "@/storages/useProdutoStorage";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function LaucherGoup3List() {
  const { navigateToProductList } = useNavigationFoods();
  const { handleGrupo2 } = useLocalSearchParams<{
    handleGrupo2: string;
  }>();

  const { grupo3 } = useProdutoStorage();

  const [sortOption, setSortOption] = useState("Codigo"); // Opção de ordenação

  // Ordenar a lista com base na opção selecionada
  const sortGrupo2List = () => {
    return [...grupo3].sort((a, b) => {
      if (sortOption === "Handle") return a.Handle - b.Handle;
      if (sortOption === "Codigo") return parseInt(a.Codigo) - parseInt(b.Codigo);
      if (sortOption === "Nome") return a.Nome.localeCompare(b.Nome);
      return 0;
    });
  };

  // Função disparada ao clicar em um item
  const handleItemPress = (item: Grupo3) => {
    //console.log("handleItemPress", handleGrupo2, item.Handle);
    navigateToProductList({ handleGrupo2, handleGrupo3: item.Handle.toString() });
  };

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
              <Text className="text-sm font-bold text-gray-500">{item.Handle}</Text>
            </View>
            <View className=" justify-between items-center p-1">
              <PublisoftIcon fill={"#044470"} />
              <Text
                className="text-center text-gray-800 font-bold mt-2"
                numberOfLines={2} // Limitar a 2 linhas
              >
                {item.Nome}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">Nenhum grupo disponível.</Text>}
      />
    </View>
  );
}
