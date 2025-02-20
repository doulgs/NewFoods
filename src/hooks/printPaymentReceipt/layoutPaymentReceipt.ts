// printPaymentReceipt.ts
/**
 * Função para imprimir o extrato de pagamento (filipetinha de cartão de crédito).
 *
 * Monta um layout com os detalhes do pagamento e envia para o módulo nativo.
 */

import { NativeModules, ToastAndroid } from "react-native";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { dateFormatter } from "@/utils/dateFormatter";

/** Tipo do item que será impresso */
export type PrintItem = {
  type: "text" | "image";
  content: string;
  align: "left" | "center" | "right";
  size: "small" | "medium" | "big";
};

/**
 * Cria um item de texto para o layout de impressão.
 */
const createTextItem = (
  content: string,
  align: "left" | "center" | "right",
  size: "small" | "medium" | "big"
): PrintItem => ({
  type: "text",
  content,
  align,
  size,
});

// Linha divisória para separar seções
const DIVIDER = "--------------------------------";

/**
 * Imprime o extrato de pagamento utilizando o módulo nativo.
 *
 * @param receipt - Dados do extrato de pagamento.
 */
async function printPaymentReceipt(receipt: PagamentoRealizado): Promise<void> {
  const { PrinterModule } = NativeModules;
  const layout: PrintItem[] = [];

  // Cabeçalho
  layout.push(createTextItem("PAGAMENTO REALIZADO", "center", "big"));
  layout.push(createTextItem(DIVIDER, "center", "medium"));

  // Detalhes do pagamento
  layout.push(createTextItem(`Método: ${receipt.DescricaoCondicao}`, "left", "medium"));
  layout.push(createTextItem(`Data: ${dateFormatter(receipt.DataHora, "short")}`, "left", "medium"));
  layout.push(createTextItem(`Valor: ${formatToCurrency(receipt.ValorPago)}`, "left", "medium"));

  if (receipt.ValorTroco) {
    layout.push(createTextItem(`Troco: ${receipt.ValorTroco}`, "left", "medium"));
  }

  // Rodapé
  layout.push(createTextItem(DIVIDER, "center", "medium"));
  layout.push(createTextItem("Publisoft Informática LTDA", "center", "small"));
  layout.push(createTextItem("www.publisoft.com.br", "center", "small"));
  layout.push(createTextItem("Obrigado!", "center", "big"));

  try {
    await PrinterModule.startPrinter(true, JSON.stringify(layout));
  } catch (error) {
    console.error("Erro ao imprimir o extrato de pagamento:", error);
    ToastAndroid.show("Erro ao enviar o extrato de pagamento", ToastAndroid.LONG);
  }
}

export { printPaymentReceipt };
