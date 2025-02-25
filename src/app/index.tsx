import React, { useCallback, useState } from "react";
import { Alert, Keyboard, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Background } from "@/components/Backgrounds";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { DropdownComponent, DropdownItem } from "@/components/Inputs/DropdownComponent";
import { Input } from "@/components/Inputs/Input";
import { LoadingScreen } from "@/components/Loadings";
import { dbo_Usuario } from "@/database/schemas/dbo_Usuario";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { fetchGarcom } from "@/services/Garcom/fetchGarcom";
import { performAccess } from "@/services/Garcom/performAccess";
import { useUrlApiStore } from "@/storages/useUrlApiStorage";
import { useFocusEffect } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { dbo_Configuracoes } from "@/database/schemas/dbo_Configuracoes";
import { fetchConfig } from "@/services/Parametros/fetchConfig";

type FormValues = {
  selectedItem: DropdownItem;
  password: string;
};

const schema = yup.object().shape({
  selectedItem: yup.mixed<DropdownItem>().required("Selecione um usuário"),
  password: yup.string().required("Campo senha é obrigatória"),
});

export default function Index() {
  const { navigateToRegister, navigateToMainScreen } = useNavigationFoods();
  const { insertUsuario } = dbo_Usuario();
  const { insertConfig } = dbo_Configuracoes();
  const [listUsers, setListUsers] = useState<DropdownItem[]>([]);
  const [isLoadingScreen, setIsLoadingScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ selectedItem, password }) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const userInfo = {
        HandleGarcom: Number(selectedItem.value),
        NomeLogin: selectedItem.label,
        Senha: password,
      };

      const result = await performAccess(userInfo);

      if (!result) {
        Alert.alert("Sistema", "Tente novamente...");
        return;
      }

      if (result.IsValid) {
        insertUsuario({
          Handle: result.Data.Handle,
          Nome: result.Data.Nome,
          Apelido: result.Data.Apelido,
        });
        navigateToMainScreen({ reset: true });
      } else {
        Alert.alert("Sistema", "Usuário ou senha inválidos. Tente novamente...");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateConfigPage = () => {
    navigateToRegister();
  };

  const getBusinessURL = async () => {
    setIsLoadingScreen(true);
    try {
      // Atualiza a URL do serviço via AsyncStorage
      await useUrlApiStore.getState().getUrl();
      const { url } = useUrlApiStore.getState();

      if (!url) {
        Alert.alert("Sistema", "Não foi possível identificar a URL do serviço. Verifique a configuração da API");
        navigateToRegister();
        return;
      }

      const config = await fetchConfig();
      if (!config) {
        Alert.alert("Sistema", "Não foi possível buscar as configurações. Verifique a conexão com a internet");
        return;
      }

      await insertConfig(config);

      const result = await fetchGarcom();
      if (!result || !result.IsValid) {
        Alert.alert("Sistema", "Não foi possível buscar os usuários. Verifique a configuração da API");
        return;
      }

      const users = result.Data.map((garcom) => ({
        value: garcom.Handle.toString(),
        label: garcom.Nome,
      }));

      setListUsers(users);
    } catch (error) {
      console.error("Erro na função getBusinessURL:", error);
      Alert.alert("Erro", "Erro ao consultar API. Tente novamente mais tarde.");
    } finally {
      setIsLoadingScreen(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getBusinessURL();
    }, [])
  );

  if (isLoadingScreen) {
    return (
      <LoadingScreen
        useBackground
        color="#FFF"
        stylesText="text-white"
        msg="Carregando as informações disponíveis, aguarde..."
      />
    );
  }

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 30,
          }}
        >
          {/* Cabeçalho com logo e descrição */}
          <View className="items-center mb-10">
            <Text className="text-6xl text-white font-extraBold">QuickFoods</Text>
            <Text className="mt-2 font-regular text-lg text-center text-zinc-200 px-5">
              Simplifique o pagamento e o lançamento de forma rápida e sem complicações.
            </Text>
          </View>

          {/* Formulário de Login */}
          <View className="mb-5">
            <Text className="mb-2 text-lg text-zinc-200 font-semibold">Selecione o usuário</Text>
            <Controller
              control={control}
              name="selectedItem"
              render={({ field: { onChange, value } }) => (
                <DropdownComponent data={listUsers} placeholder="Usuário" value={value} onChange={onChange} />
              )}
            />
            {errors.selectedItem && <Text className="mt-1 text-red-500">{errors.selectedItem.message}</Text>}
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-lg text-zinc-200 font-semibold">Senha de acesso</Text>
            <Input variant="base">
              <Input.ControlledField
                variant="flat"
                control={control}
                name="password"
                placeholder="********"
                secureTextEntry
                className="px-4"
              />
            </Input>
            {errors.password && <Text className="mt-1 text-red-500">{errors.password.message}</Text>}
          </View>

          <CustomButton variant="solid" disabled={isLoading} isLoading={isLoading} onPress={handleSubmit(onSubmit)}>
            <CustomButton.Title>Acessar</CustomButton.Title>
          </CustomButton>

          <TouchableOpacity onPress={handleNavigateConfigPage} className="mt-5 self-center">
            <Text className="text-zinc-200 font-semibold underline">Realizar configuração de conexão</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Background>
  );
}
