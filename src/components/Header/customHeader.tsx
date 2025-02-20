// CustomHeader.tsx
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheet, BottomSheetHandle } from "../Buttons/BottomSheet/CustomBottomSheet";
import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";

interface selectedOptionsProps {
  option: "mesa" | "cartao" | "logoff";
}

export function CustomHeader({ back, navigation, options, route }: NativeStackHeaderProps) {
  const { navigateToListTables, navigateToListCards, navigateToLogin } = useNavigationFoods();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetHandle>(null);

  const { deleteUsuario } = dbo_Usuario();

  const handleSelectedOption = ({ option }: selectedOptionsProps) => {
    bottomSheetRef.current?.close();
    switch (option) {
      case "mesa":
        navigateToListTables();
        break;
      case "cartao":
        navigateToListCards();
        break;
      case "logoff":
        deleteUsuario();
        navigateToLogin({ reset: true });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <View
        className="bg-primary-800 shadow-md flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top, height: insets.top + 56 }}
      >
        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center justify-start">
            {route.name === "panel-Main" && (
              <TouchableOpacity onPress={() => bottomSheetRef.current?.open()} className="w-10">
                <MaterialCommunityIcons name="menu" size={26} color="#fff" />
              </TouchableOpacity>
            )}
            {back && route.name !== "panel-Main" && (
              <TouchableOpacity onPress={navigation.goBack} className="w-10">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-2">
            <Text className="text-center text-3xl font-extraBold text-white">{options.title ?? ""}</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-end pr-2" />
        </View>
      </View>

      {/* BottomSheet Component */}
      <BottomSheet ref={bottomSheetRef} snapPoints={["45%", "55%", "65%", "75%", "100%"]} initialIndex={0}>
        <View className="flex-1 px-6 gap-3">
          <Text className="text-white text-2xl font-extraBold">Consultar Paineis</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-lg p-3 bg-yellow-600"
            onPress={() => handleSelectedOption({ option: "cartao" })}
          >
            <Text className="text-lg px-4 font-semibold text-white">Painel de Cartões</Text>
            <Feather name="arrow-right-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-lg p-3 bg-yellow-600"
            onPress={() => handleSelectedOption({ option: "mesa" })}
          >
            <Text className="text-lg px-4 font-semibold text-white">Painel de Mesas</Text>
            <Feather name="arrow-right-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-extraBold">Mais Opções</Text>

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-lg p-3 bg-yellow-600"
            onPress={() => handleSelectedOption({ option: "logoff" })}
          >
            <Text className="text-lg px-4 font-semibold text-red-700">Sair do App</Text>
            <FontAwesome6 name="person-walking-dashed-line-arrow-right" size={20} color="#b91c1c" />
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
}
