import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View, Pressable } from "react-native";

interface ActionMenuModalProps {
  visible: boolean;
  onClose: () => void;
  actions: { label: string; onPress: () => void }[];
}

const ActionMenuModal: React.FC<ActionMenuModalProps> = ({ visible, onClose, actions }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* Fundo escuro com efeito de clique para fechar */}
      <Pressable onPress={onClose} className="flex-1 bg-black/70 justify-center items-center">
        <View className="w-4/5 bg-white rounded-xl shadow-md border border-gray-300 p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center border-b pb-3">
            <Text className="text-2xl font-extraBold text-gray-800">Menu de Opções</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-200 rounded-lg border border-gray-300"
              accessibilityLabel="Fechar menu"
            >
              <Text className="text-lg font-bold text-red-500">X</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de ações */}
          <View className="gap-3 mt-3">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="flex-row px-4 py-3 bg-primary-800 rounded-xl items-center active:opacity-80"
                accessibilityLabel={`Opção ${index + 1}: ${action.label}`}
              >
                <Text className="flex-1 text-white text-base font-semibold">{action.label}</Text>
                <AntDesign name="right" size={20} color="white" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export { ActionMenuModal };
