import { useNavigationFoods } from "@/hooks/useNavegitionFoods";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { useProdutoStorage } from "@/storages/useProdutoStorage";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import clsx from "clsx";
import React, { useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";

interface ExcecaoScreenParams {
  idPedido: string; // ID único do PedidoItem
  HandleItem: number;
  HandleGrupo2: number;
}

type ExceptionListProps = {};

export default function LaucherExceptionList() {
  const route = useRoute();
  const { navigationController } = useNavigationFoods();
  const { produtosExcecoes, grupo2 } = useProdutoStorage(); // Obtendo o storage dos produtos
  const { idPedido, HandleItem, HandleGrupo2 } = route.params as ExcecaoScreenParams;

  const updateListaExcecoes = usePedidoStore((state) => state.updateListaExcecoes); // Método do Zustand

  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({}); // Estado para controlar as seções expandidas
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({}); // Itens selecionados

  const incrementStep = 1; // Incremento padrão para quantidade

  // Agrupar exceções por GrupoExcecao
  const getGroupedExcecoes = () => {
    const filteredExcecoes = [
      // Filtrar exceções de produtosExcecoes e grupo2 com base no HandleItem e HandleGrupo2
      ...produtosExcecoes.filter((ex) => ex.HandleItem === HandleItem),
      ...(grupo2
        .find((g) => g.Handle === HandleGrupo2)
        ?.Excecoes.map((ex) => ({
          Handle: ex.Handle,
          Nome: ex.Nome,
          Valor: ex.Valor,
          Ordem: ex.Ordem !== null ? String(ex.Ordem) : null, // Converter Ordem para string
          Quantidade: ex.Quantidade,
          Mark: ex.Mark,
          GrupoExcecao: ex.GrupoExcecao,
          HandleItem: null, // Para manter consistência com ProdutosExcecoes
          HabilitaQuantidade: false, // Adicionado para consistência
        })) || []),
    ];

    // Agrupar exceções por GrupoExcecao
    const grouped = filteredExcecoes.reduce((acc, ex) => {
      const groupHandle = ex.GrupoExcecao.Handle;
      if (!acc[groupHandle]) {
        acc[groupHandle] = {
          title: ex.GrupoExcecao.Descricao,
          data: [] as ProdutosExcecoes[], // Tipagem explícita para garantir consistência
        };
      }
      acc[groupHandle].data.push(ex as ProdutosExcecoes); // Cast explícito para garantir compatibilidade
      return acc;
    }, {} as { [key: number]: { title: string; data: ProdutosExcecoes[] } });

    return Object.values(grouped); // Retorna como um array para a SectionList
  };

  // Alternar expansão da seção
  const toggleSection = (handle: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [handle]: !prev[handle], // Alterna o estado da seção
    }));
  };

  // Alternar seleção de item
  const handleToggleSelectItem = (handle: number) => {
    setSelectedItems((prev) => {
      const newState = { ...prev };
      if (newState[handle] !== undefined) {
        delete newState[handle];
      } else {
        newState[handle] = 0; // Inicializa a quantidade como 0
      }
      return newState;
    });
  };

  // Atualizar a quantidade de um item
  const handleUpdateQuantity = (handle: number, delta: number) => {
    setSelectedItems((prev) => {
      const currentQuantity = prev[handle] || 0;
      const newQuantity = Math.max(0, parseFloat((currentQuantity + delta * incrementStep).toFixed(3)));
      if (newQuantity === 0) {
        const { [handle]: _, ...rest } = prev; // Remove o item se a quantidade for 0
        return rest;
      }
      return { ...prev, [handle]: newQuantity };
    });
  };

  // Confirmar a seleção e atualizar o PedidoItem
  const handleConfirmSelection = () => {
    const selectedList = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0) // Somente itens com quantidade > 0
      .map(([handle, quantity]) => ({
        HandleExcecao: Number(handle),
        Quantidade: quantity,
        Valor: produtosExcecoes.find((ex) => ex.Handle === Number(handle))?.Valor || 0,
        EhExcComposicao: false, // Adapte conforme necessário
      }));

    if (selectedList.length > 0) {
      updateListaExcecoes(idPedido, selectedList);
      navigationController.back();
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* SectionList com exceções agrupadas */}
      <SectionList
        sections={getGroupedExcecoes()} // Dados agrupados
        keyExtractor={(item, index) => `${item.Handle}-${index}`} // Garante um `key` único
        renderSectionHeader={({ section }) => (
          <TouchableOpacity
            className="bg-gray-200 p-4"
            onPress={() => toggleSection(section.data[0].GrupoExcecao.Handle)} // Alternar expansão
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-700">{section.title}</Text>
              <Ionicons
                name={expandedSections[section.data[0].GrupoExcecao.Handle] ? "chevron-up" : "chevron-down"}
                size={20}
                color="gray"
              />
            </View>
          </TouchableOpacity>
        )}
        renderItem={({ item }) =>
          expandedSections[item.GrupoExcecao.Handle] ? ( // Mostrar itens somente se a seção estiver expandida
            <TouchableOpacity
              className="m-3 rounded-lg border shadow-md p-4 border-zinc-300 bg-zinc-100"
              onPress={() => handleToggleSelectItem(item.Handle)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-gray-800 font-bold pr-4" numberOfLines={2}>
                  {item.Nome}
                </Text>
                <Text className="text-gray-800 font-bold" numberOfLines={2}>
                  {formatToCurrency(item.Valor)}
                </Text>
              </View>

              {selectedItems[item.Handle] !== undefined && (
                <View className="flex-row items-center justify-around mt-4">
                  <TouchableOpacity
                    className="bg-red-500 p-2 rounded-lg"
                    onPress={() => handleUpdateQuantity(item.Handle, -1)}
                  >
                    <Ionicons name="remove" size={24} color="white" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-gray-800">{selectedItems[item.Handle]?.toFixed(3)}</Text>
                  <TouchableOpacity
                    className="bg-green-500 p-2 rounded-lg"
                    onPress={() => handleUpdateQuantity(item.Handle, 1)}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">Nenhuma exceção disponível.</Text>}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão de confirmação */}
      <View className="p-4 bg-primary-800 items-end">
        <TouchableOpacity className={clsx("border rounded-lg p-2 bg-yellow-600", {})} onPress={handleConfirmSelection}>
          <Text className="text-lg px-4 font-semibold text-white">Salvar Seleção</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
