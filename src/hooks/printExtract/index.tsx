// usePrinter.ts
/**
 * Hook para gerenciamento de impressão via módulo nativo.
 */
import { NativeModules, ToastAndroid } from "react-native";
import { buildLayoutExtract } from "./layoutExtract";
import { PagamentoRealizado, PedidoItensProps, PedidoProps } from "@/stores/useDetalhesPedidoStore";

export interface DetalhesPedidoProps {
  Pedido: PedidoProps;
  PedidoItens: PedidoItensProps[];
  PagamentosRealizados?: PagamentoRealizado[];
}

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
   * Gera o layout de impressão para o extrato do pedido e o envia para impressão.
   *
   * @param data - Dados do pedido e dos itens.
   */
  const printExtractText = async (detalhes: DetalhesPedidoProps): Promise<void> => {
    try {
      const layoutExtract = await buildLayoutExtract(detalhes);
      const layout = [...layoutExtract];
      await runNativePrint(true, JSON.stringify(layout));
    } catch (error) {
      console.error("Erro ao executar impressão de texto:", error);
    }
  };

  return { printExtractText };
}

export { usePrinter };
