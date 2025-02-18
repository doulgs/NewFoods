import React from "react";
import { Dimensions, ImageBackground } from "react-native";

type Props = {
  children?: React.ReactNode;
};

const HEIGHT = Dimensions.get("screen").height;
const WIDTH = Dimensions.get("screen").width;

function Background({ children }: Props) {
  return (
    <ImageBackground
      style={{ flex: 1, width: "100%", height: "100%" }} // 🔹 Garante o `flex-1`
      imageStyle={{ width: WIDTH, height: HEIGHT, resizeMode: "cover" }} // 🔹 Corrige `resizeMode`
      source={require("../../assets/images/background.png")} // 🔹 `require()` precisa ser direto
    >
      {children}
    </ImageBackground>
  );
}

export { Background };
