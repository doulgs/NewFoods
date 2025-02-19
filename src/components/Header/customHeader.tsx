// CustomHeader.tsx
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Fontisto, Ionicons } from "@expo/vector-icons";

export function CustomHeader({ back, navigation, options, route }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-primary-800 shadow-md flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top, height: insets.top + 56 }}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-end">
          {back && (
            <TouchableOpacity onPress={navigation.goBack} className="w-10">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-2">
          <Text className="text-center text-3xl font-extraBold text-white">{options.title ?? ""}</Text>
        </View>
        <View className="flex-1 flex-row items-center justify-end pr-2">
          <TouchableOpacity onPress={navigation.goBack} className="pr-2">
            <Fontisto name="more-v-a" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
