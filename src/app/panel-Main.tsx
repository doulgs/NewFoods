import { PublisoftIcon } from "@/assets/icons/publisoft";
import { statusSelected, ToggleButtons } from "@/components/Buttons/ToggleButtons";
import { Keyboard } from "@/components/Inputs/Keyboard";
import { LoadingScreen } from "@/components/Loadings";
import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";
import { useNavigationFoods } from "@/hooks/useNavegitionFoods";
import { startCard } from "@/services/Cartoes/startTable";
import { startTable } from "@/services/Mesas/startTable";
import { getDisponibilidadeMesaCartao } from "@/services/Status/getDisponibilidadeMesaCartao";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { useRequestStore } from "@/storages/useRequestStore";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

interface StartLaucherProps {
  handleGarcom: number;
  numero: string;
  tipo: statusSelected;
}

export default function PanelMain() {
  const { navigateToDetailPayment, navigateToOrderList } = useNavigationFoods();

  const { getUsuario } = dbo_Usuario();

  const { setRequestData, resetRequestStatus } = useRequestStore();
  const { setPedido, clearPedido, clearSelectedPessoa } = usePedidoStore();

  const [currentValue, setCurrentValue] = useState<string>("0"); // Valor atual do teclado
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carregamento
  const [selectedType, setSelectedType] = useState<statusSelected>("mesa");

  // Função chamada quando o usuário troca entre "mesa" e "cartão"
  const handleToggle = (value: statusSelected) => {
    setSelectedType(value);
  };

  const handleKeyPress = async (key: number | "del" | "confirm") => {
    if (key === "del") {
      setCurrentValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === "confirm") {
      const usaurio = await getUsuario();

      startLaunch({
        handleGarcom: usaurio.Handle,
        numero: currentValue,
        tipo: selectedType,
      });
    } else {
      setCurrentValue((prev) => (prev === "0" ? key.toString() : prev + key.toString()));
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
    }
  };

  const startLaunch = async ({ handleGarcom, numero, tipo }: StartLaucherProps) => {
    resetRequestStatus();

    if (currentValue === "0") {
      Alert.alert("Sistema", "Selecione um Cartão ou Mesa válidos", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true);
    const numeroDigitado = Number(numero);

    try {
      const disponibilidade = await getDisponibilidadeMesaCartao({ numero: numeroDigitado, tipo });

      console.log(disponibilidade, handleGarcom, numero, tipo);

      if (disponibilidade) {
        if (selectedType === "mesa") {
          await iniciarMesa(handleGarcom, numeroDigitado);
          return;
        }

        if (selectedType === "cartao") {
          await iniciarCartao(handleGarcom, numeroDigitado);
          return;
        }
      } else {
        setRequestData(handleGarcom, numeroDigitado, tipo);
        navigateToDetailPayment();
      }
    } catch (error) {
      console.error("Erro ao iniciar lançamento:", error);
    } finally {
      setCurrentValue("0");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen msg="Carregando, aguarde um instante..." />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Componente ToggleButtons */}
      <View className="p-4 py-6 border-b-2 border-gray-300">
        <ToggleButtons onSelect={(v) => handleToggle(v)} lancamentoLiberado="Ambos" />
      </View>

      {/* Exibe a opção selecionada e o valor atual */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl text-gray-700">
          Número da <Text className="font-bold">{selectedType}</Text> a ser consultado
        </Text>
        <Text className="text-6xl font-bold text-gray-900 mt-4">{currentValue}</Text>
      </View>

      {/* Componente Keyboard */}
      <View className="w-full bg-white py-4 border-t-2 border-gray-300">
        <Keyboard onKeyPress={handleKeyPress} confirmIcon={<PublisoftIcon />} />
      </View>
    </View>
  );
}
