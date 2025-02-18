import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

// 🔹 Usamos Generics <T extends string> para inferir os tipos dinamicamente
interface CustomToggleButtonsProps<T extends string> {
  options: readonly T[]; // Lista de opções dos botões (imutável para inferência)
  onSelect?: (value: T) => void; // Callback opcional para retorno ao componente pai
}

const CustomToggleButtons = <T extends string>({ options, onSelect }: CustomToggleButtonsProps<T>) => {
  const [selectedOption, setSelectedOption] = useState<T>(options[0]);

  // Função para trocar a opção selecionada
  const handlePress = (value: T) => {
    if (selectedOption !== value) {
      setSelectedOption(value);
      onSelect?.(value);
    }
  };

  return (
    <View className="flex-row justify-between items-center space-x-4 gap-4">
      {options.map((option) => (
        <Pressable
          key={option}
          className={clsx(
            "flex-1 items-center justify-center py-3 rounded-lg border",
            selectedOption === option ? "bg-primary-800 border-primary-800" : "bg-white border-primary-800"
          )}
          onPress={() => handlePress(option)}
        >
          <Text className={clsx("text-lg font-bold", selectedOption === option ? "text-white" : "text-primary-800")}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export { CustomToggleButtons };
