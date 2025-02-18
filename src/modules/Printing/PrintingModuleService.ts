import { NativeModules } from "react-native";

// Extrai o módulo nativo
const { PrinterModule } = NativeModules;

/**
 * Função para realizar a impressão chamando o módulo nativo
 * @param showFeedback - Booleano para mostrar feedback ao usuário.
 * @param printableContent - Conteúdo em string JSON a ser impresso.
 */
export const PrintingModuleService = async (props: NativePrint) => {
  try {
    console.log("Inicianda a impressão com os seguintes parâmetros:", props);
    // Chama o módulo nativo passando o objeto de pagamento completo
    await PrinterModule.startPrinter(props.showFeedback, props.printableContent);
  } catch (error) {
    console.error("Erro ao imprimir: ", error);
  }
};
