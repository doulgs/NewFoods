import { Input } from "@/components/Inputs/Input";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { pessoaController } from "@/services/Pessoa";
import { usePedidoStore } from "@/storages/usePedidoStore";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Alert, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as yup from "yup";

type FormValues = {
  name: string;
  tell: string;
  cpfcnpj: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  completo?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
};

// Esquema de validação com Yup
const validationSchema = yup.object().shape({
  name: yup.string().required("Campo Nome é obrigatório"),
  tell: yup.string().required("Campo Telefone é obrigatório"),
  cpfcnpj: yup.string().required("Campo CPF/CNPJ é obrigatório"),
});

export default function PersonEdit() {
  const { navigationController } = useNavigationFoods();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { insertPessoa, updatePessoa } = pessoaController();
  const { selectedPessoa } = usePedidoStore(); // Obter a pessoa selecionada do Zustand

  const [showAddress, setShowAddress] = useState(false);

  // Alterna a visibilidade do showAddress
  const toggleMenuActions = () => {
    setShowAddress((prev) => !prev);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues:
      type === "edit" && selectedPessoa
        ? {
            name: selectedPessoa.Nome,
            tell: selectedPessoa.Telefone,
            cpfcnpj: selectedPessoa.CgcCpf,
            cep: selectedPessoa.Cep || "87020015",
            endereco: selectedPessoa.Endereco || "rua joão paulino viera filho",
            numero: selectedPessoa.Numero ? selectedPessoa.Numero.toString() : "1",
            completo: selectedPessoa.Complemento || "CENTRO",
            bairro: selectedPessoa.Bairro || "CENTRO",
            cidade: selectedPessoa.CidNome || "MARINGÁ",
            estado: "PR", // Preencher conforme necessário
          }
        : {},
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    Keyboard.dismiss();

    try {
      if (type === "register") {
        // Lógica para cadastro
        const response = await insertPessoa({
          Nome: data.name,
          CgcCpf: data.cpfcnpj,
          Cep: data.cep,
          Endereco: data.endereco,
          Numero: Number(data.numero) || undefined,
          Complemento: data.completo,
          CidNome: data.cidade,
          Bairro: data.bairro,
          Telefone: data.tell,
        });

        if (response?.IsValid) {
          Alert.alert("Sucesso", "Pessoa cadastrada com sucesso!");
          navigationController.dismissTo("/laucher-OrderList");
        } else {
          Alert.alert("Erro", response?.Msg || "Erro ao cadastrar pessoa.");
        }
      } else if (type === "edit" && selectedPessoa) {
        // Lógica para edição
        const response = await updatePessoa({
          Handle: selectedPessoa.Handle,
          Codigo: selectedPessoa.Codigo,
          Nome: data.name,
          CgcCpf: data.cpfcnpj,
          Cep: data.cep || null,
          Endereco: data.endereco || null,
          Numero: data.numero ? Number(data.numero) : null,
          Complemento: data.completo || null,
          CidNome: data.cidade || "",
          Bairro: data.bairro || "",
          Telefone: data.tell,
          Ativo: selectedPessoa.Ativo,
        });

        if (response?.IsValid) {
          Alert.alert("Sucesso", "Pessoa atualizada com sucesso!");
          navigationController.dismissTo("/laucher-OrderList");
        } else {
          Alert.alert("Erro", response?.Msg || "Erro ao atualizar pessoa.");
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao processar a solicitação.");
      console.error(error);
    }
  };
  return (
    <ScrollView className="flex-1 p-6">
      <View className="mb-4">
        <Text className="mb-2 text-lg text-zinc-700 font-semibold">Nome*</Text>
        <Input variant="default">
          <FontAwesome name="user-o" size={20} color={"#000000"} />

          <Input.ControlledField variant="default" control={control} name="name" placeholder="Nome" className="px-4" />
        </Input>
        {errors.name && <Text className="text-red-500">{errors.name.message}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg text-zinc-700 font-semibold">Telefone*</Text>
        <Input variant="default">
          <FontAwesome name="user-o" size={20} color={"#000000"} />
          <Input.ControlledField
            variant="default"
            control={control}
            name="tell"
            placeholder="Telefone"
            keyboardType="phone-pad"
            className="px-4"
          />
        </Input>
        {errors.tell && <Text className="text-red-500">{errors.tell.message}</Text>}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg text-zinc-700 font-semibold">CPF/CNPJ*</Text>
        <Input variant="default">
          <FontAwesome name="user-o" size={20} color={"#000000"} />
          <Input.ControlledField
            variant="default"
            control={control}
            name="cpfcnpj"
            placeholder="CPF ou CNPJ"
            keyboardType="numeric"
            className="px-4"
          />
        </Input>
        {errors.cpfcnpj && <Text className="text-red-500">{errors.cpfcnpj.message}</Text>}
      </View>

      <TouchableOpacity
        onPress={toggleMenuActions}
        className="bg-zinc-300 p-4 rounded-lg my-6 flex-row items-center justify-between"
      >
        <Text className="text-black font-bold text-lg">{showAddress ? "Ocultar Endereço" : "Informar o Endereço"}</Text>
        <Ionicons name={showAddress ? "chevron-up" : "chevron-down"} size={20} color="black" />
      </TouchableOpacity>

      {showAddress && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} className="flex-1">
          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">CEP*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="cep"
                placeholder="CEP"
                keyboardType="numeric"
                className="px-4"
              />
            </Input>
            {errors.cep && <Text className="text-red-500">{errors.cep.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Endereço*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="endereco"
                placeholder="Endereço"
                className="px-4"
              />
            </Input>
            {errors.endereco && <Text className="text-red-500">{errors.endereco.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Número*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="numero"
                placeholder="Número"
                keyboardType="numeric"
                className="px-4"
              />
            </Input>
            {errors.numero && <Text className="text-red-500">{errors.numero.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Complemento*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="completo"
                placeholder="Complemento"
                className="px-4"
              />
            </Input>
            {errors.completo && <Text className="text-red-500">{errors.completo.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Bairro*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="bairro"
                placeholder="Bairro"
                className="px-4"
              />
            </Input>
            {errors.bairro && <Text className="text-red-500">{errors.bairro.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Cidade*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="cidade"
                placeholder="Cidade"
                className="px-4"
              />
            </Input>
            {errors.cidade && <Text className="text-red-500">{errors.cidade.message}</Text>}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-lg text-zinc-700 font-semibold">Estado*</Text>
            <Input variant="default">
              <FontAwesome name="user-o" size={20} color={"#000000"} />
              <Input.ControlledField
                variant="default"
                control={control}
                name="estado"
                placeholder="Estado"
                className="px-4"
              />
            </Input>
            {errors.estado && <Text className="text-red-500">{errors.estado.message}</Text>}
          </View>
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="bg-primary-800 p-4 rounded-lg items-center justify-center mt-6 mb-12"
      >
        <Text className="text-white font-bold text-lg">
          {type === "edit" ? "Salvar Alterações" : "Cadastrar Pessoa"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
