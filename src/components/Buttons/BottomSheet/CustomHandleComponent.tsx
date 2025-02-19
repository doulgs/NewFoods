import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { View, Text } from "react-native";

export function CustomHandleComponent(props: BottomSheetHandleProps) {
  return (
    <View className="w-full items-center justify-center py-4">
      <View className="w-14 h-3 rounded-3xl bg-white border" />
    </View>
  );
}
