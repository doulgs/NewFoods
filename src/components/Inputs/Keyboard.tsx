import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";

interface KeyboardProps {
  onKeyPress: (key: number | "confirm" | "del") => void;
  confirmIcon?: React.ReactNode; // Ícone de confirmação agora é opcional
}

const KEYS: Array<number | "del" | "confirm"> = [1, 2, 3, 4, 5, 6, 7, 8, 9, "del", 0, "confirm"];

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, confirmIcon }) => {
  return (
    <View className="w-full flex flex-col items-center">
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-2 my-1">
          {KEYS.slice(rowIndex * 3, rowIndex * 3 + 3).map((key) => (
            <TouchableOpacity
              key={key}
              className={clsx(
                "w-24 h-20 justify-center items-center rounded-lg border",
                key === "confirm" ? "bg-primary-800" : key === "del" ? "bg-red-400" : "bg-gray-300"
              )}
              accessibilityRole="button"
              accessibilityLabel={typeof key === "number" ? `Tecla ${key}` : key === "del" ? "Apagar" : "Confirmar"}
              onPress={() => onKeyPress(key)}
            >
              {key === "del" && <Ionicons name="backspace" size={32} color="white" />}
              {key === "confirm" && confirmIcon}
              {typeof key === "number" && <Text className="text-2xl font-extraBold text-gray-950">{key}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};
