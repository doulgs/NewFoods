import { LoadingScreen } from "@/components/Loadings";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { pessoaController, PessoaProps } from "@/services/Pessoa";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import clsx from "clsx";
import React, { useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PersonRegister() {
  const { navigationController, navigateToEditPerson } = useNavigationFoods();

  const { getPessoa } = pessoaController();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchPessoa, setSearchPessoa] = useState("");
  const [pessoaList, setPessoaList] = useState<PessoaProps[]>([]);

  // Zustand: Obtemos a pessoa selecionada e a função para definir a seleção
  const { selectedPessoa, setSelectedPessoa, clearSelectedPessoa, confirmedSelectedPessoa } = usePedidoStore();

  const handleSearchPessoa = async () => {
    if (!searchPessoa) {
      Alert.alert("Sistema", "Para realizar a busca de uma pessoa preencha o campo de busca.");
      return;
    }

    setIsLoading(true);
    clearSelectedPessoa(); // Limpa a seleção ao buscar uma nova lista

    try {
      const listPessoa = await getPessoa({ filtroPesquisa: searchPessoa });
      if (listPessoa?.IsValid && listPessoa.Data) {
        setPessoaList(listPessoa.Data);
      }
    } catch (error) {
      console.error("Erro ao buscar pessoa:", error);
    } finally {
      setSearchPessoa("");
      setIsLoading(false);
    }
  };

  const handleSelectPessoa = (pessoa: PessoaProps) => {
    setSelectedPessoa(selectedPessoa?.Handle === pessoa.Handle ? null : pessoa); // Alterna a seleção
  };

  const handlePaintenancePerson = (type: "edit" | "register") => {
    switch (type) {
      case "register":
        navigateToEditPerson("register");
        break;

      case "edit":
        navigateToEditPerson("edit");
        break;

      default:
        break;
    }
  };

  const handleConfirm = () => {
    if (!selectedPessoa) {
      Alert.alert("Sistema", "Nenhuma pessoa selecionada");
      return;
    }

    confirmedSelectedPessoa(selectedPessoa);
    navigationController.dismissTo("/laucher-OrderList");
  };

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-gray-100 rounded-lg shadow-lg p-4 border border-zinc-400 m-4">
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 p-2 border rounded-lg">
            <TextInput
              value={searchPessoa}
              onChangeText={setSearchPessoa}
              placeholder="Busque por Nome ou CPF ou CNPJ..."
              className="text-lg font-semibold text-gray-700"
            />
          </View>
          <TouchableOpacity onPress={handleSearchPessoa} className="border rounded-lg p-2 bg-primary-800">
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-2 gap-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handlePaintenancePerson("register")}
              className="border rounded-lg p-2 bg-zinc-700"
            >
              <Text className="text-lg font-semibold text-white">Cadastrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePaintenancePerson("edit")}
              className="border rounded-lg p-2 bg-zinc-700"
            >
              <Text className="text-lg font-semibold text-white">Editar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedPessoa}
            className={clsx("border rounded-lg p-2 items-center justify-center", {
              "bg-gray-400": !selectedPessoa,
              "bg-yellow-600": selectedPessoa,
            })}
          >
            <Text className="text-lg font-semibold text-white">Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Pessoas */}
      <FlatList
        data={pessoaList}
        keyExtractor={(item, index) => item.Handle.toString() + index}
        renderItem={({ item }) => {
          const isSelected = selectedPessoa?.Handle === item.Handle; // Verifica se o item está selecionado
          return (
            <TouchableOpacity
              className={`bg-gray-100 mb-3 rounded-lg shadow-md p-4 border ${
                isSelected ? "border-blue-500" : "border-zinc-400"
              } m-4`}
              onPress={() => handleSelectPessoa(item)} // Atualiza a seleção
            >
              <View className="flex-1 flex-row gap-2">
                <View className="items-center justify-center pr-4">
                  <MaterialIcons
                    name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                    size={24}
                    color="black"
                  />
                </View>
                <View className="gap-1">
                  <Text className="font-bold flex-1">
                    {item.CgcCpf.replace(/[^\w\s]|_/g, "").length === 11 ? "Nome" : "Fornecedor"}:
                  </Text>
                  <Text className="font-bold">
                    {item.CgcCpf.replace(/[^\w\s]|_/g, "").length === 11 ? "CPF" : "CNPJ"}:
                  </Text>
                  <Text className="font-bold">Telefone:</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className="font-semibold">{item.Nome}</Text>
                  <Text className="font-semibold">{item.CgcCpf}</Text>
                  <Text className="font-semibold">{item.Telefone}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
