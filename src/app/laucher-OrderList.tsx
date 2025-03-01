import { LoadingScreen } from "@/components/Loadings";
import { dbo_Configuracoes } from "@/database/schemas/dbo_Configuracoes";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { saveOrder } from "@/services/Pedido/saveOrder";
import { fetchGrupo2 } from "@/services/sincronizar/GetGrupos2";
import { getProdutos } from "@/services/sincronizar/GetProdutos";
import { Pedido, usePedidoStore } from "@/storages/usePedidoStore";
import { useProdutoStorage } from "@/storages/useProdutoStorage";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

type FormData = {
  searchProduct: string;
  qtdPessoas: number;
  observacoes: string;
  numeroMesaCartao: string;
};

export default function LaucherOrderList() {
  const { pedido, pedidoItens, incrementPedidoItem, decrementPedidoItem, removePedidoItem, updatePedidoFields } =
    usePedidoStore(); // Obtendo `pedidoItens` do store
  const { produtos, setGrupo2, setProdutos, setProdutosExcecoes, setProdutoExcAuto, setComboItems, clearStorage } =
    useProdutoStorage();

  const { getConfig } = dbo_Configuracoes();

  const {
    navigateToProductList,
    navigateToExceptionList,
    navigateToGroup2List,
    navigateToListPeople,
    navigateToMainScreen,
  } = useNavigationFoods();
  const { control, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    defaultValues: {
      searchProduct: "",
      qtdPessoas: pedido.QtdPessoasMesa, // Valor padrão
      observacoes: pedido.Observacao || "", // Valor padrão
      numeroMesaCartao: pedido.NumeroMesaCartao.toString(), // Valor padrão
    },
  });

  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o loading
  const [showMenuActions, setShowMenuActions] = useState(false); // Estado para controlar o card
  const [showSearchAction, setShowSearchAction] = useState(false); // Estado para controlar o card
  const [config, setConfig] = useState<ResultConfigData>({} as ResultConfigData);

  const onSubmitSearchProduct: SubmitHandler<FormData> = async (data) => {
    try {
      Keyboard.dismiss();

      navigateToProductList({ searchNomeProduto: data.searchProduct });

      // Reseta o campo após o envio
      reset({ searchProduct: "" });
      setShowSearchAction(false);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
    }
  };

  const onSubmitAction: SubmitHandler<FormData> = (data) => {
    // Filtrar e transformar os dados para o tipo correto
    const updatedFields = Object.entries({
      QtdPessoasMesa: data.qtdPessoas ? Number(data.qtdPessoas) : undefined,
      Observacao: data.observacoes?.trim() || undefined,
      NumeroMesaCartao: data.numeroMesaCartao ? parseInt(data.numeroMesaCartao) : undefined,
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof Pedido] = value as never;
      }
      return acc;
    }, {} as Partial<Pedido>);

    // Se o pedido for de cartão e se estiver configurado para usar o mesmo número,
    // então atribuímos o valor do Número da Mesa Cartão também ao campo que representa o número da mesa
    if (
      pedido.tipoLancamento === "cartao" &&
      config.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao &&
      updatedFields.NumeroMesaCartao
    ) {
      updatedFields.Numero = updatedFields.NumeroMesaCartao.toString();
    }

    // Atualiza os campos do pedido se houver valores válidos
    if (Object.keys(updatedFields).length > 0) {
      updatePedidoFields(updatedFields);
    }
    setShowMenuActions(false);
  };

  const toggleMenuActions = () => {
    setShowMenuActions((prev) => !prev);
  };

  const toggleSearchAction = () => {
    setShowSearchAction((prev) => !prev);
  };

  const handleNavigationGrups2 = React.useCallback(() => {
    navigateToGroup2List();
  }, []);

  const handleNavigationExcecao = (idPedido: string, HandleItem: number) => {
    // Busca o item no array de produtos pelo HandleItem
    const produto = produtos.find((item) => item.Handle === HandleItem);

    if (!produto) {
      Alert.alert("Erro", "O produto não foi encontrado.");
      return;
    }

    // Navega para a tela de exceção com os dados encontrados
    navigateToExceptionList(idPedido, HandleItem.toString(), produto.HandleGrupo2.toString());
  };

  const handleNavigationPessoa = React.useCallback(() => {
    navigateToListPeople();
  }, []);

  const loadingProductsList = async () => {
    setIsLoading(true); // Inicia o estado de carregamento
    clearStorage(); // Limpa o storage para evitar inconsistências

    try {
      const result = await getConfig();
      setConfig(result);
      // Funções auxiliares para carregar grupos e produtos
      const fetchGrupoData = async () => {
        const grupo = await fetchGrupo2();
        if (grupo?.IsValid && grupo.Data) {
          setGrupo2(grupo.Data.Grupos2); // Atualiza os grupos no estado
        } else {
          throw new Error("Não foi possível carregar os detalhes dos grupos.");
        }
      };

      const fetchProdutosData = async () => {
        const result = await getProdutos({});
        if (result?.IsValid && result.Data) {
          setProdutos(result.Data.Produtos);
          setProdutosExcecoes(result.Data.ProdutosExcecoes);
          setProdutoExcAuto(result.Data.ProdutoExcAuto);
          setComboItems(result.Data.ComboItem);
        } else {
          throw new Error("Não foi possível carregar os produtos.");
        }
      };

      // Requisições paralelas para grupos e produtos
      await Promise.all([fetchGrupoData(), fetchProdutosData()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Erro ao consultar API. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  useEffect(() => {
    loadingProductsList();
  }, []);

  const handleFinished = async () => {
    setIsLoading(true);
    try {
      if (pedidoItens.length === 0) {
        Alert.alert(
          "Sistema",
          "Não é possível salvar um pedido que não contenha nenhum item.",
          [{ text: "Ok", style: "cancel" }],
          { cancelable: false }
        );
        return;
      }

      // Validação do campo do número da mesa para lançamentos cartão
      if (pedido.tipoLancamento === "cartao" && config.ObrigatorioNumeroMesaLancamentoCartao) {
        const numeroMesaCartaoStr = watch("numeroMesaCartao");
        if (numeroMesaCartaoStr === "" || numeroMesaCartaoStr === "0") {
          Alert.alert(
            "Sistema",
            "É necessário preencher o número da mesa para lançamentos cartão.",
            [{ text: "Ok", style: "cancel" }],
            { cancelable: false }
          );
          return;
        }
      }

      // Se o pedido for de cartão e se estiver configurado para usar o mesmo número,
      // atualizamos o pedido para que o número seja o mesmo para ambos os campos.
      if (pedido.tipoLancamento === "cartao" && config.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao) {
        const numeroMesaCartao = parseInt(watch("numeroMesaCartao"));
        updatePedidoFields({
          Numero: numeroMesaCartao.toString(),
          NumeroMesaCartao: numeroMesaCartao,
        });
      }

      // Remover a propriedade 'id' de cada item do array
      const pedidoItensSemId = pedidoItens.map(({ id, ...resto }) => resto);

      const isOrderSaved = await saveOrder(pedidoItensSemId);

      if (isOrderSaved?.IsValid) {
        reset({
          qtdPessoas: 1,
          observacoes: "",
          numeroMesaCartao: "",
        });
        ToastAndroid.show("Pedido salvo com sucesso!", ToastAndroid.SHORT);
        navigateToMainScreen({ reset: true });
      } else {
        Alert.alert("Erro", "O pedido não foi salvo. Verifique os dados e tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={pedidoItens}
        contentContainerClassName="p-2"
        keyExtractor={(item, index) => item.HandleItem.toString() + index.toString()}
        ListHeaderComponent={() => (
          <>
            {/* Informações da Mesa */}
            <View className="bg-gray-100 rounded-lg shadow-lg p-4 mb-4 gap-1 border border-zinc-400">
              <Text className="text-2xl font-bold text-gray-700">
                {pedido.tipoLancamento.charAt(0).toUpperCase() + pedido.tipoLancamento.slice(1).toLowerCase()} #
                {pedido.Numero || "?"}
              </Text>
              {pedido.tipoLancamento === "mesa" && (
                <Text className="text-lg font-bold text-gray-700">
                  Quantidade de Pessoas:{" "}
                  <Text className="text-lg font-extrabold text-gray-700">{pedido.QtdPessoasMesa}</Text>
                </Text>
              )}
              <Text className="text-lg font-bold text-gray-700">
                Total Consumido:{" "}
                <Text className="text-lg font-extrabold text-green-600">R$ {pedido.TotalConsumido.toFixed(2)}</Text>
              </Text>
              {pedido.Observacao && (
                <Text className="text-lg font-bold text-gray-700">
                  Observação do Pedido:{" "}
                  <Text className="text-lg font-extrabold text-gray-700">{pedido.Observacao}</Text>
                </Text>
              )}

              <View>
                <Text className="text-lg font-semibold mb-1 text-gray-700">Cliente:</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 p-2 border rounded-lg">
                    <Text className="text-lg font-semibold text-gray-700" numberOfLines={1}>
                      {pedido.PessoaNome || "*** Consumidor ***"}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleNavigationPessoa} className="border rounded-lg p-2 bg-primary-800">
                    <Ionicons name="search" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-1 flex-row justify-between items-center mt-2 gap-2">
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    className="border rounded-lg p-2 bg-primary-800"
                    onPress={toggleMenuActions} // Alterna o estado de visibilidade
                  >
                    <Text className="text-md font-semibold text-white">Ações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="border rounded-lg p-2 bg-primary-800" onPress={toggleSearchAction}>
                    <Text className="text-md font-semibold text-white">Pesquisar</Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    className="border rounded-lg p-2 bg-yellow-600 items-center justify-center"
                    onPress={() => handleNavigationGrups2()}
                  >
                    <Text className="text-md font-semibold text-white">Adicionar Produtos</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card de Ações */}
            {showMenuActions && (
              <Animated.View
                className="bg-gray-100 rounded-lg shadow-lg p-4 mb-4 border border-zinc-400"
                style={{
                  opacity: showMenuActions ? 1 : 0,
                  transform: [{ scale: showMenuActions ? 1 : 0.9 }],
                }}
              >
                <View className="flex-col">
                  <Text className="text-lg font-semibold text-gray-700 mb-4">Mais Ações</Text>

                  {/* Quantidade de Pessoas */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-700 mb-2">Qtd Pessoas:</Text>
                    <View className="flex-1 flex-row items-center border rounded-lg overflow-hidden">
                      <TouchableOpacity
                        onPress={() => setValue("qtdPessoas", Math.max(1, watch("qtdPessoas") - 1))}
                        className="bg-red-500 w-12 h-12 items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xl">-</Text>
                      </TouchableOpacity>

                      <Text className="flex-1 text-center text-xl font-bold text-gray-700 py-2">
                        {watch("qtdPessoas")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setValue("qtdPessoas", watch("qtdPessoas") + 1)}
                        className="bg-green-500 w-12 h-12 items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xl">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Observações */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-700 mb-2">Observações:</Text>
                    <View className="flex-row gap-2">
                      <Controller
                        name="observacoes"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="Digite uma observação para o item"
                            className="flex-1 border p-2 rounded-md text-gray-700"
                          />
                        )}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          updatePedidoFields({ Observacao: "" }), setValue<"observacoes">("observacoes", "");
                        }}
                        className="border rounded-lg p-2 bg-red-500"
                      >
                        <Ionicons name="close" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Número da Mesa */}
                  {pedido.tipoLancamento === "cartao" && (
                    <View className="mb-4">
                      <Text className="text-lg font-bold text-gray-700 mb-2">Nº Mesa:</Text>
                      <View className="flex-row gap-2">
                        <Controller
                          name="numeroMesaCartao"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <TextInput
                              value={value}
                              onChangeText={onChange}
                              placeholder="Digite o número da mesa"
                              keyboardType="numeric"
                              className="flex-1 border p-2 rounded-md text-gray-700"
                            />
                          )}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            updatePedidoFields({ NumeroMesaCartao: 0 }),
                              setValue<"numeroMesaCartao">("numeroMesaCartao", "");
                          }}
                          className="border rounded-lg p-2 bg-red-500"
                        >
                          <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View className="items-end">
                    <TouchableOpacity
                      className="border rounded-lg p-2 bg-primary-800"
                      onPress={handleSubmit(onSubmitAction)}
                    >
                      <Text className="text-lg font-semibold text-white">Salvar Alterações</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Card de Pesquisa de Item */}
            {showSearchAction && (
              <Animated.View
                className="bg-gray-100 rounded-lg shadow-lg p-4 mb-4 border border-zinc-400"
                style={{
                  opacity: showSearchAction ? 1 : 0,
                  transform: [{ scale: showSearchAction ? 1 : 0.9 }],
                }}
              >
                <View className="flex-col">
                  {/* Observações */}
                  <View className="mb-2">
                    <Text className="text-lg font-bold text-gray-700 mb-2">Buscar por produto:</Text>
                    <Controller
                      name="searchProduct"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="Código ou Nome do Produto..."
                          keyboardType="default"
                          className="border p-2 rounded-md text-gray-700"
                          returnKeyType="search"
                          onSubmitEditing={handleSubmit(onSubmitSearchProduct)}
                        />
                      )}
                    />
                  </View>

                  <View className="items-end">
                    <TouchableOpacity
                      className="border rounded-lg p-2 bg-primary-800"
                      onPress={handleSubmit(onSubmitSearchProduct)}
                    >
                      <Text className="text-lg font-semibold text-white">Buscar Produto</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <View className={`bg-gray-100 mb-3 rounded-lg shadow-md p-4 border border-zinc-400`}>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="flex-1 text-gray-800 font-bold text-lg pr-4" numberOfLines={2}>
                {item.DescricaoItem}
              </Text>
              <Text className="text-gray-800 font-bold text-lg" numberOfLines={2}>
                {formatToCurrency(item.Valor)}
              </Text>
            </View>

            <View className="mt-4 flex-row gap-8">
              <View className="flex-1 flex-row items-center border rounded-lg overflow-hidden">
                {/* Botão de Decrementar */}
                <TouchableOpacity
                  onPress={() => decrementPedidoItem(item.id)}
                  className="bg-red-500 w-12 h-12 items-center justify-center"
                >
                  <Text className="text-white font-bold text-xl">-</Text>
                </TouchableOpacity>

                {/* Quantidade Centralizada */}
                <Text className="flex-1 text-center text-xl font-bold text-gray-700 py-2">{item.Quantidade}</Text>

                {/* Botão de Incrementar */}
                <TouchableOpacity
                  onPress={() => incrementPedidoItem(item.id)}
                  className="bg-green-500 w-12 h-12 items-center justify-center"
                >
                  <Text className="text-white font-bold text-xl">+</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2" style={{ marginLeft: 32 }}>
                <TouchableOpacity
                  onPress={() => handleNavigationExcecao(item.id, item.HandleItem)}
                  className="border rounded-lg p-2 bg-primary-800 items-center justify-center"
                >
                  <MaterialCommunityIcons name="clipboard-edit-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removePedidoItem(item.id)}
                  className="rounded-lg p-2 border bg-red-500 items-center justify-center"
                >
                  <Feather name="trash-2" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      {!showSearchAction && !showMenuActions && (
        <Animated.View
          className="p-3 bg-primary-800 items-end"
          style={{
            opacity: !showSearchAction && !showMenuActions ? 1 : 0,
          }}
        >
          <TouchableOpacity
            className={clsx("border rounded-lg p-2", {
              "bg-zinc-700": pedidoItens.length === 0,
              "bg-yellow-600": pedidoItens.length > 0,
            })}
            onPress={handleFinished}
            disabled={pedidoItens.length === 0}
          >
            <Text className="text-lg px-4 font-semibold text-white">Salvar Pedido</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
