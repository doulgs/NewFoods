// usePrinter.ts
/**
 * Hook para gerenciamento de impressão via módulo nativo.
 */

import { NativeModules, ToastAndroid } from "react-native";
import { buildLayoutExtract } from "./layoutExtract";
import { extratoQuickFoodsCards } from "@/services/Cartoes/extratoQuickFoods";

// Constante para o bloco de quebra de linha, usado em todas as impressões
const LINE_BREAK: TextPrint = {
  type: "text",
  content: "\n\r",
  align: "center",
  size: "big",
};

function usePrinter() {
  const { PrinterModule } = NativeModules;

  /**
   * Executa a impressão nativa utilizando o PrinterModule.
   *
   * @param showFeedback - Indica se deve exibir feedback visual.
   * @param printableContent - Conteúdo a ser impresso, em formato JSON.
   */
  const runNativePrint = async (showFeedback: boolean, printableContent: string): Promise<void> => {
    try {
      await PrinterModule.startPrinter(showFeedback, printableContent);
    } catch (error) {
      console.error("Erro ao realizar a impressão:", error);
      ToastAndroid.show("Erro ao enviar a impressão", ToastAndroid.LONG);
    }
  };

  /**
   * Prepara e retorna o conteúdo para impressão de imagens.
   *
   * @param images - Caminho ou lista de caminhos das imagens.
   * @returns Array de PrintContent.
   */
  const printImage = async (images: string | string[]): Promise<PrintContent[]> => {
    const imageArray = Array.isArray(images) ? images : [images];

    const printContent: PrintContent[] = imageArray.map((imagePath) => ({
      type: "image",
      imagePath,
    }));

    // Adiciona um bloco de quebra de linha
    printContent.push(LINE_BREAK);
    return printContent;
  };

  /**
   * Obtém as imagens do extrato via serviço e as envia para impressão.
   *
   * @param props - Propriedades contendo Número e Handle do Garçom.
   * @returns Conteúdo impresso ou null, caso não haja dados.
   */
  const printImages = async ({ Numero, HandleGarcom }: PrintPropsImage): Promise<PrintContent[] | null> => {
    const result = await extratoQuickFoodsCards({ Numero, HandleGarcom });
    console.log("extratoQuickFoodsCards", result);

    if (!result) {
      return null;
    }

    const imageArray: string[] = Array.isArray(result.Data) ? (result.Data as string[]) : [result.Data as string];
    const printContent: PrintContent[] = imageArray.map((imagePath: string) => ({
      type: "image",
      imagePath,
    }));

    printContent.push(LINE_BREAK);

    await runNativePrint(true, JSON.stringify(printContent));
    return printContent;
  };

  /**
   * Gera o layout de impressão para o extrato do pedido e o envia para impressão.
   *
   * @param data - Dados do pedido e dos itens.
   */
  const printText = async (data: ExtratoPedidoProps): Promise<void> => {
    try {
      const layoutExtract = await buildLayoutExtract(data);
      const layout = [...layoutExtract];
      await runNativePrint(true, JSON.stringify(layout));
    } catch (error) {
      console.error("Erro ao executar impressão de texto:", error);
    }
  };

  return { printImage, printImages, printText };
}

export { usePrinter };
