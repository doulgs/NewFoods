import { NativeModules } from "react-native";

// Extrai o módulo nativo
const { CancellationModule } = NativeModules;

// Função para realizar o cancelamento de um pagamento chamando o módulo nativo
export const CancellationModuleService = async ({ amount, atk, editableAmount, return_scheme }: NativeCancellation) => {
  try {
    //console.log("Iniciando o cancelamento com os seguintes parâmetros:", amount, atk, editableAmount, return_scheme);
    // Chama o módulo nativo passando o objeto de cancelamento completo
    await CancellationModule.startCancellation(amount, atk, editableAmount, return_scheme);
  } catch (error) {
    console.error("Erro ao cancelar pagamento: ", error);
  }
};
