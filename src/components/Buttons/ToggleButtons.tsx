import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export type statusSelected = "mesa" | "cartao";

interface ToggleButtonsProps {
  lancamentoLiberado: "Ambos" | "Mesa" | "Cartao"; // Define os tipos permitidos
  onSelect?: (value: statusSelected) => void; // Callback opcional para retorno ao componente pai
}

const ToggleButtons: React.FC<ToggleButtonsProps> = ({ lancamentoLiberado, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<statusSelected>("mesa");

  // 🛠️ UseEffect para sincronizar o estado com a prop lancamentoLiberado
  useEffect(() => {
    const initialOption: statusSelected = lancamentoLiberado === "Cartao" ? "cartao" : "mesa";
    setSelectedOption(initialOption);
    onSelect?.(initialOption);
  }, [lancamentoLiberado]); // 🔥 Garante que se `lancamentoLiberado` mudar, o estado será atualizado

  // Função para trocar a opção selecionada
  const handlePress = (value: statusSelected) => {
    if (selectedOption !== value) {
      setSelectedOption(value);
      onSelect?.(value);
    }
  };

  return (
    <View className="flex-row justify-between items-center space-x-4 gap-4">
      {/* Renderiza o botão Mesa apenas se permitido */}
      {lancamentoLiberado !== "Cartao" && (
        <Pressable
          className={clsx(
            "flex-1 items-center justify-center py-3 rounded-lg border",
            selectedOption === "mesa" ? "bg-primary-800 border-primary-800" : "bg-white border-primary-800"
          )}
          onPress={() => handlePress("mesa")}
        >
          <Text className={clsx("text-lg font-bold", selectedOption === "mesa" ? "text-white" : "text-primary-800")}>
            Mesa
          </Text>
        </Pressable>
      )}

      {/* Renderiza o botão Cartão apenas se permitido */}
      {lancamentoLiberado !== "Mesa" && (
        <Pressable
          className={clsx(
            "flex-1 items-center justify-center py-3 rounded-lg border",
            selectedOption === "cartao" ? "bg-primary-800 border-primary-800" : "bg-white border-primary-800"
          )}
          onPress={() => handlePress("cartao")}
        >
          <Text className={clsx("text-lg font-bold", selectedOption === "cartao" ? "text-white" : "text-primary-800")}>
            Cartão
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export { ToggleButtons };
