import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";
import { useNavigationFoods } from "@/hooks/useNavegitionFoods";
import { getProdutosOptions } from "@/services/sincronizar/GetProdutos";
import { PedidoItem, usePedidoStore } from "@/storages/usePedidoStore";
import { useProdutoStorage } from "@/storages/useProdutoStorage";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type FormValues = {
  selectedItems: Record<number, number>; // Permite índices dinâmicos do tipo number
};

export default function LaucherProductList() {
  const route = useRoute();
  const { navigationController } = useNavigationFoods();

  const { getUsuario } = dbo_Usuario();

  const { produtos } = useProdutoStorage();
  const { handleGrupo2, handleGrupo3, searchNomeProduto } = useLocalSearchParams<{
    handleGrupo2: string;
    handleGrupo3: string;
    searchNomeProduto: string;
  }>();

  const { control, setValue, watch, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      selectedItems: {}, // Inicialmente vazio
    },
  });

  const selectedItems = watch("selectedItems");

  const [sortOption, setSortOption] = useState("Codigo");
  const [incrementStep, setIncrementStep] = useState(1); // Opções Disponiveis "1" | "0.1" | "0.01" | "0.001"

  const infoPedido = usePedidoStore((state) => state.pedido);
  const addPedidoItem = usePedidoStore((state) => state.addPedidoItem);

  /*   const grupo2ComQuantidade = config.Grupo2ComQuantidadeMultiSelect
    ? config.Grupo2ComQuantidadeMultiSelect.split(",").map((id) => Number(id))
    : []; */

  const filterAndSortProductList = () => {
    const _handleGrupo2 = Number(handleGrupo2);
    const _handleGrupo3 = Number(handleGrupo3);

    return [...produtos]
      .filter((produto) => {
        const filtroGrupo2 = handleGrupo2 !== null && handleGrupo2 !== undefined;
        const filtroGrupo3 = handleGrupo3 !== null && handleGrupo3 !== undefined;
        const filtroNomeProduto = searchNomeProduto && searchNomeProduto.trim().length > 0;

        if (filtroGrupo2 && !filtroGrupo3 && !filtroNomeProduto) {
          return produto.HandleGrupo2 === _handleGrupo2;
        }
        if (!filtroGrupo2 && filtroGrupo3 && !filtroNomeProduto) {
          return produto.HandleGrupo3 === _handleGrupo3;
        }
        if (!filtroGrupo2 && !filtroGrupo3 && filtroNomeProduto) {
          const nomeProdutoLower = produto.Nome.toLowerCase();
          const searchLower = searchNomeProduto.toLowerCase();
          return nomeProdutoLower.includes(searchLower);
        }
        if (filtroGrupo2 && filtroGrupo3 && !filtroNomeProduto) {
          return produto.HandleGrupo2 === _handleGrupo2 && produto.HandleGrupo3 === _handleGrupo3;
        }
        if (filtroGrupo2 && filtroGrupo3 && filtroNomeProduto) {
          const nomeProdutoLower = produto.Nome.toLowerCase();
          const searchLower = searchNomeProduto.toLowerCase();
          return (
            produto.HandleGrupo2 === _handleGrupo2 &&
            produto.HandleGrupo3 === _handleGrupo3 &&
            nomeProdutoLower.includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "Handle") return a.Handle - b.Handle;
        if (sortOption === "Codigo") return parseInt(a.Codigo) - parseInt(b.Codigo);
        if (sortOption === "Nome") return a.Nome.localeCompare(b.Nome);
        return 0;
      });
  };

  const toggleSelectItem = (handle: number) => {
    if (selectedItems[handle]) {
      const { [handle]: _, ...rest } = selectedItems;
      setValue("selectedItems", rest);
    } else {
      setValue("selectedItems", { ...selectedItems, [handle]: 1 });
    }
  };

  const updateQuantity = (handle: number, delta: number, currentValue: string | undefined) => {
    const currentQuantity = parseFloat(currentValue || "0"); // Obtém o valor atual como número
    const newQuantity = Math.max(0, currentQuantity + delta * incrementStep); // Calcula o novo valor
    setValue("selectedItems", { ...selectedItems, [handle]: newQuantity }); // Atualiza o estado via Hook Form
  };

  const handleConfirmItems = async () => {
    const usuario = await getUsuario();

    const itensSelecionados = Object.entries(selectedItems)
      .map(([handle, quantidade]) => {
        const produto = produtos.find((item) => item.Handle === Number(handle));
        if (produto) {
          return {
            NumeroMesa: infoPedido.Numero,
            NumeroMesaCartao: null,
            NumeroCartao: null,
            HandleMesa: null,
            HandleCartao: null,
            HandleGarcom: usuario.Handle || 11,
            NomeGarcom: null,
            HandleItem: produto.Handle,
            HandleCombo: null,
            Quantidade: quantidade,
            QuantidadePessoas: infoPedido.QtdPessoasMesa ? infoPedido.QtdPessoasMesa : 1,
            Valor: produto.Valor,
            Total: quantidade * produto.Valor,
            ListaExcecoes: [],
            ListaExcecoesInt: null,
            ListaComposicao: [],
            HandleOrigem: null,
            DescricaoItem: produto.Nome,
            DescricaoExcecoes: null,
            DescricaoComposicao: null,
            NomeGrupo: "",
            NomeSabor: "",
            ObservacaoExcecao: "",
            ObservacaoPedido: "",
            DetalheItem: null,
            HandlePessoa: null,
            HandlePessoaComplemento: null,
            PessoaNome: null,
            ValorAcrescimo: 0.0,
            ValorOutros: 0.0,
            ValorDesconto: 0.0,
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    itensSelecionados.forEach((item) => addPedidoItem(item as Omit<PedidoItem, "id">));
    navigationController.dismissTo("/laucher-OrderList");
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 p-4">
        <Text className="text-lg font-bold text-gray-500">Ordenar por:</Text>
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
      <FlashList
        data={filterAndSortProductList()}
        keyExtractor={(item) => String(item.Handle)}
        estimatedItemSize={100}
        renderItem={({ item }) => {
          const isSelected = selectedItems[item.Handle] !== undefined;
          //const canAdjustQuantity = grupo2ComQuantidade.includes(item.HandleGrupo2);

          return (
            <TouchableOpacity
              className={`bg-gray-100 m-3 rounded-lg border shadow-md p-4 ${
                isSelected ? "border-blue-500" : "border-zinc-300"
              }`}
              onPress={() => toggleSelectItem(item.Handle)}
            >
              <View className="flex-row items-center justify-between mt-2">
                <Text className="flex-1 text-gray-800 font-bold pr-4" numberOfLines={2}>
                  {item.Nome}
                </Text>
                <Text className="text-gray-800 font-bold" numberOfLines={2}>
                  {formatToCurrency(item.Valor)} {item.UnidadeSigla}
                </Text>
              </View>

              {isSelected && (
                <Controller
                  control={control}
                  name="selectedItems"
                  render={({ field }) => (
                    <View className="flex-1 flex-row items-center border rounded-lg overflow-hidden mt-4 bg-gray-200">
                      {/* Botão de Decrementar */}
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.Handle, -1, field.value?.[item.Handle]?.toString())}
                        className="bg-red-500 w-12 h-12 items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xl">-</Text>
                      </TouchableOpacity>

                      {/* Quantidade Centralizada */}
                      <TextInput
                        className="flex-1 text-center text-xl font-bold text-gray-700 py-2"
                        keyboardType="numeric"
                        value={field.value?.[item.Handle]?.toString().slice(0, 5) || "0"} // Exibe apenas 3 caracteres
                        onChangeText={(text) => {
                          const validText = text.replace(/[^0-9.]/g, "").slice(0, 5); // Limita a 3 caracteres
                          field.onChange({ ...field.value, [item.Handle]: validText }); // Atualiza o estado
                        }}
                      />

                      {/* Botão de Incrementar */}
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.Handle, 1, field.value?.[item.Handle]?.toString())}
                        className="bg-green-500 w-12 h-12 items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xl">+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">Nenhum Item disponível.</Text>}
        showsVerticalScrollIndicator={false}
      />
      <View className="p-3 bg-primary-800 items-end">
        <TouchableOpacity className="border rounded-lg p-2 bg-yellow-600" onPress={handleSubmit(handleConfirmItems)}>
          <Text className="text-lg px-4 font-semibold text-white">Salvar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
