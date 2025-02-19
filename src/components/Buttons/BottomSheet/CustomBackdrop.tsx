import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import React from "react";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";

const CustomBackdrop: React.FC<BottomSheetBackdropProps> = ({ animatedPosition, style }) => {
  // Estilo animado para o backdrop
  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Interpola a opacidade com base na posição do Bottom Sheet
    const opacity = interpolate(
      animatedPosition.value,
      [0, 1], // Valores de entrada (posição mínima e máxima normalizadas)
      [0, 1] // Valores de saída (opacidade mínima e máxima)
    );
    return { opacity };
  });

  // Combina os estilos
  const containerStyle = [
    style,
    {
      backgroundColor: "#00000090",
    },
    containerAnimatedStyle,
  ];

  return <Animated.View style={containerStyle} />;
};

export { CustomBackdrop };
