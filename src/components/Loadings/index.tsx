import { Background } from "@/components/Backgrounds";
import clsx from "clsx";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

type LoadingProps = {
  msg?: string; // Mensagem opcional exibida abaixo do indicador de carregamento
  size?: number; // Tamanho do indicador de carregamento
  color?: string; // Cor do indicador de carregamento
  useBackground?: boolean | React.ReactNode; // Define se usa um Background ou aceita um componente personalizado
  stylesContainer?: string; // Classe para estilos do container
  stylesText?: string; // Classe para estilos do texto
};

const LoadingScreen: React.FC<LoadingProps> = ({
  msg,
  size = 50,
  color = "#02619F",
  useBackground = false,
  stylesContainer,
  stylesText,
}) => {
  const Wrapper = useBackground ? Background : React.Fragment;
  const wrapperProps = useBackground ? { children: null } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View
        className={clsx("flex-1 items-center justify-center gap-6 p-3", stylesContainer)}
        aria-busy={true} // 🔹 Corrigido para booleano
      >
        <ActivityIndicator size={size} color={color} />
        {msg && <Text className={clsx("text-2xl font-extraBold text-center", stylesText)}>{msg}</Text>}
      </View>
    </Wrapper>
  );
};

export { LoadingScreen };
