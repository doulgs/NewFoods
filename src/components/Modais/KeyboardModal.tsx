import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View, Switch, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";

type FormData = {
  amount: number;
  changeAmount: number;
};

interface KeyboardModalProps {
  visible: boolean;
  initialValue: number;
  allowChangeAmount?: boolean; // 🔹 Nova prop para permitir informar troco
  onClose: () => void;
  onConfirm: (amount: number, changeAmount: number, calculatedChange: number) => void;
}

const KeyboardModal: React.FC<KeyboardModalProps> = ({
  visible,
  initialValue,
  allowChangeAmount = true, // 🔹 Por padrão, permite informar troco
  onClose,
  onConfirm,
}) => {
  const { control, setValue, watch, reset } = useForm<FormData>({
    defaultValues: { amount: 0, changeAmount: 0 },
  });

  const [informarTroco, setInformarTroco] = useState(false);
  const amount = watch("amount") || 0;
  const changeAmount = watch("changeAmount") || 0;

  useEffect(() => {
    if (visible) {
      reset({ amount: Math.round(initialValue * 100), changeAmount: 0 });
      setInformarTroco(false);
    }
  }, [visible]);

  const handleKeyPress = (key: number | "confirm" | "del", field: "amount" | "changeAmount" = "amount") => {
    let prevAmount = watch(field) || 0;
    let newValue = prevAmount;

    if (key === "del") {
      newValue = Math.floor(prevAmount / 10);
    } else if (key === "confirm") {
      const valorCompra = amount / 100;
      const valorTrocoInformado = informarTroco ? changeAmount / 100 : 0;
      const trocoCalculado = informarTroco ? valorTrocoInformado - valorCompra : 0;

      onConfirm(valorCompra, valorTrocoInformado, trocoCalculado);
      onClose();
      return;
    } else {
      newValue = prevAmount * 10 + key;
    }

    setValue(field, newValue);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable className="flex-1 bg-black/70 justify-center items-center" onPress={onClose}>
        <View className="w-11/12 bg-white rounded-lg p-6" onStartShouldSetResponder={() => true}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">Digite o Valor</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center bg-gray-100 p-4 rounded-md mb-4">
            <Text className="text-4xl font-bold text-gray-800">R$</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { value } }) => (
                <Text className="text-4xl font-bold text-gray-800 ml-2">
                  {(value / 100).toFixed(2).replace(".", ",")}
                </Text>
              )}
            />
          </View>

          {/* Checkbox para informar troco */}
          {allowChangeAmount && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg">Informar troco?</Text>
              <Switch value={informarTroco} onValueChange={setInformarTroco} />
            </View>
          )}

          {/* Campo para informar o troco */}
          {informarTroco && (
            <View className="flex-row justify-center items-center bg-gray-100 p-4 rounded-md mb-4">
              <Text className="text-4xl font-bold text-gray-800">R$</Text>
              <Controller
                control={control}
                name="changeAmount"
                render={({ field: { value } }) => (
                  <Text className="text-4xl font-bold text-gray-800 ml-2">
                    {(value / 100).toFixed(2).replace(".", ",")}
                  </Text>
                )}
              />
            </View>
          )}

          <Keyboard
            onKeyPress={(key) => handleKeyPress(key, informarTroco ? "changeAmount" : "amount")}
            confirmIcon={<Ionicons name="checkmark" size={32} color="white" />}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

// Componente Keyboard
interface KeyboardProps {
  onKeyPress: (key: number | "confirm" | "del") => void;
  confirmIcon: React.ReactNode;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, confirmIcon }) => {
  const KEYS: Array<number | "del" | "confirm"> = [1, 2, 3, 4, 5, 6, 7, 8, 9, "del", 0, "confirm"];

  return (
    <View>
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-evenly w-full my-2">
          {KEYS.slice(rowIndex * 3, rowIndex * 3 + 3).map((key) => (
            <TouchableOpacity
              key={key}
              className={clsx(
                "w-24 h-20 justify-center items-center rounded-lg border",
                key === "confirm" ? "bg-green-500" : key === "del" ? "bg-red-400" : "bg-gray-300"
              )}
              onPress={() => onKeyPress(key)}
              accessibilityLabel={typeof key === "number" ? `Tecla ${key}` : key === "del" ? "Apagar" : "Confirmar"}
              accessibilityRole="button"
            >
              {key === "del" && <Ionicons name="backspace" size={32} color="white" />}
              {key === "confirm" && confirmIcon}
              {typeof key === "number" && <Text className="text-2xl font-bold text-gray-950">{key}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

// Componente Pai (Exemplo de uso)
export { KeyboardModal, Keyboard };
