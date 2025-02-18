import { Background } from "@/components/Backgrounds";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { Input } from "@/components/Inputs/Input";
import { useNavigationFoods } from "@/hooks/useNavegitionFoods";
import { useUrlApiStore } from "@/storages/useUrlApiStorage";
import { AntDesign } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Alert, Keyboard, Pressable, SafeAreaView, Text, ToastAndroid, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as yup from "yup";

// Definição da validação com Yup
const validationSchema = yup.object().shape({
  businessURL: yup.string().required("URL Empresarial é obrigatória"),
});

// Definição do tipo do formulário
type FormValues = {
  businessURL: string;
};

// Definição do tipo de resposta da API
type ResponseApiCheck = {
  IsValid: boolean;
  Msg: string;
  Data: null;
};

export default function AuthRegister() {
  const { navigateToLogin } = useNavigationFoods();
  const { setUrl, removeUrl } = useUrlApiStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  /**
   * Função para verificar se a URL fornecida responde corretamente
   */
  const verifyValidationUrl = async (url: string): Promise<ResponseApiCheck> => {
    try {
      const response = await axios.get<ResponseApiCheck>(`${url}/api/status`);
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      return { IsValid: false, Msg: "Status da resposta inválido.", Data: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { IsValid: false, Msg: errorMessage, Data: null };
    }
  };

  /**
   * Função para salvar a URL no banco de dados e navegar para a tela de login
   */
  const onSubmit: SubmitHandler<FormValues> = async ({ businessURL }) => {
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const isValidUrl = await verifyValidationUrl(businessURL);

      if (!isValidUrl.IsValid) {
        Alert.alert("Sistema", `URL fornecida não é válida.\n${isValidUrl.Msg}`);
        return;
      }

      await setUrl(businessURL);

      Alert.alert("Sistema", "Retaguarda Configurada. Aplicação pronta para ser utilizada.", [
        { text: "OK", onPress: () => navigateToLogin() },
      ]);
    } catch (error) {
      console.error("Erro ao configurar a URL:", error);
      Alert.alert("Sistema", `Erro identificado - ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para limpar a URL armazenada no banco de dados
   */
  const handleClearURL = () => {
    Alert.alert("Sistema", "Deseja realmente limpar a URL existente? Esse processo não pode ser desfeito.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpar",
        style: "destructive",
        onPress: async () => {
          try {
            await removeUrl();
            ToastAndroid.show("URL excluída com sucesso.", ToastAndroid.LONG);
          } catch (err) {
            ToastAndroid.show(`Falha na exclusão da URL: ${err}`, ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  /**
   * Botão de voltar
   */
  const CustomButtonBack = () => (
    <Pressable
      className="h-14 w-14 items-center justify-center rounded-2xl overflow-hidden bg-zinc-800 border border-primary-800 absolute top-16 left-7"
      onPress={() => navigateToLogin()}
    >
      <AntDesign name="arrowleft" color={"#FFF"} size={29} />
    </Pressable>
  );

  /**
   * Botão para limpar a URL
   */
  const CustomButtonClear = () => (
    <Pressable
      className="h-14 w-14 items-center justify-center rounded-2xl overflow-hidden bg-zinc-800 border border-primary-800 absolute top-16 right-7"
      onPress={handleClearURL}
    >
      <AntDesign name="delete" color={"#FFF"} size={29} />
    </Pressable>
  );

  return (
    <Background>
      <SafeAreaView className="flex-1">
        <View className="flex-grow flex-shrink">
          <KeyboardAwareScrollView className="flex-1">
            <CustomButtonBack />
            <CustomButtonClear />

            <View className="flex-shrink flex-grow px-8 gap-8 my-52">
              <View>
                <Text className="mb-4 text-4xl text-zinc-100 font-extraBold">URL Empresarial</Text>
                <Text className="mb-4 text-lg text-zinc-200 font-semibold">
                  Digite a URL Empresarial. Caso não possua uma, solicite a sua imediatamente.
                </Text>

                <Input variant="base">
                  <AntDesign name="link" color={"#FFF"} size={20} />
                  <Input.ControlledField
                    variant="flat"
                    control={control}
                    name="businessURL"
                    placeholder="URL Empresarial"
                    className="px-4 items-center justify-center"
                    returnKeyType="next"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                </Input>

                {errors.businessURL && <Text className="text-red-500 p-2">{errors.businessURL.message}</Text>}
              </View>

              {/* Botão de cadastro */}
              <CustomButton variant="solid" disabled={isLoading} isLoading={isLoading} onPress={handleSubmit(onSubmit)}>
                <CustomButton.Title>Cadastrar URL</CustomButton.Title>
              </CustomButton>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </Background>
  );
}
