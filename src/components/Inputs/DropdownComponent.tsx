import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { colors } from "@/styles/colors";
import { Entypo, FontAwesome } from "@expo/vector-icons";

export type DropdownItem = {
  label: string;
  value: string;
};

export type DropdownProps = {
  placeholder: string;
  data: DropdownItem[];
  value: DropdownItem | null;
  onChange: (item: DropdownItem | null) => void;
  showLeftIcon?: boolean; // Agora o ícone é opcional
};

const DropdownComponent: React.FC<DropdownProps> = ({
  data,
  placeholder,
  value,
  onChange,
  showLeftIcon = true, // Valor padrão: Ícone ativado
}) => {
  // Memoiza o renderItem para evitar re-renderizações desnecessárias
  const renderItem = useCallback(
    (item: DropdownItem) => (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.label}</Text>
        {item.value === value?.value && <Entypo name="check" color={colors.zinc[100]} size={24} />}
      </View>
    ),
    [value]
  );

  return (
    <Dropdown
      style={styles.dropdown}
      containerStyle={styles.dropdownContainerList}
      itemContainerStyle={styles.dropdownList}
      iconStyle={styles.iconStyle}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value} // Corrigido para passar diretamente o objeto
      onChange={onChange} // Agora passa o item diretamente sem filtrar `data`
      renderLeftIcon={showLeftIcon ? () => <FontAwesome name="user-o" size={20} color={colors.zinc[100]} /> : undefined}
      renderItem={renderItem}
    />
  );
};

export { DropdownComponent };

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    backgroundColor: colors.zinc[800],
    borderColor: colors.primary[800],
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dropdownContainerList: {
    backgroundColor: colors.zinc[800],
    borderColor: colors.primary[800],
    shadowColor: "#000",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    padding: 16,
  },
  dropdownList: {
    backgroundColor: colors.primary[600],
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: colors.zinc[400],
    paddingHorizontal: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: colors.zinc[100],
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.zinc[800],
    height: 48,
    paddingHorizontal: 12,
    //borderRadius: 6,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.zinc[200],
  },
});
