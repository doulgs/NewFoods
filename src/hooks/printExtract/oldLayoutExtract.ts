import { dateFormatter, formatDateTime } from "@/utils/dateFormatter";
import { formatToCurrency } from "@/utils/formatToCurrency";
import { getDeviceInformation } from "@/utils/getDeviceInformation";
import { DetalhesPedidoProps } from ".";

type PrintPedidoType = {
  type: string;
  content: string;
  align: string;
  size: string;
};

const capitalizeFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

async function buildLayoutExtract_modelo_P2B(detalhes: DetalhesPedidoProps): Promise<PrintPedidoType[]> {
  const printExtrato: PrintPedidoType[] = [];

  // Função para ajustar o tamanho da string com preenchimento
  function ajustarTamanhoString(string: string, tamanho: number, preenchimento: string = " "): string {
    return string.length > tamanho ? string.substring(0, tamanho) : string.padEnd(tamanho, preenchimento);
  }

  // Função para criar o objeto de texto para o extrato
  function criarTexto(text: string, align: string, size: string) {
    // Adiciona o comando de nova linha ao final do texto
    const textWithEndOfLine = `${text}`;
    return { type: "text", content: textWithEndOfLine, align, size };
  }

  // Cabeçalho do extrato
  printExtrato.push(criarTexto(detalhes.Pedido.FilialNome, "center", "medium"));
  printExtrato.push(criarTexto(detalhes.Pedido.FilialEndereco, "center", "medium"));
  printExtrato.push(criarTexto(detalhes.Pedido.FilialFone, "center", "medium"));
  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));
  printExtrato.push(
    criarTexto(
      `${capitalizeFirstLetter(detalhes.Pedido.Tipo)}: ${detalhes.Pedido.Numero} - ${formatDateTime(
        detalhes.Pedido.Data,
        "date"
      )}`,
      "center",
      "medium"
    )
  );
  printExtrato.push(criarTexto(`Atendente: ${detalhes.Pedido.GarcomNome}`, "center", "medium"));
  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));
  printExtrato.push(criarTexto(`${ajustarTamanhoString("Descrição", 12, " ")}Qtd | Valor | Total`, "center", "medium"));
  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));
  // Corpo do extrato com os itens do pedido

  // Função para formatar as linhas dos itens do pedido
  function formatarLinhaItens(item: PedidoItem): {
    descricao: string;
    info: string;
  } {
    const descricao = item.DescricaoItem.slice(0, 27);
    const quantidade = ajustarTamanhoString(`${item.Quantidade.toString()}x`, 7, " ");
    const valor = ajustarTamanhoString(formatToCurrency(item.Valor), 10, " ");
    const total = ajustarTamanhoString(formatToCurrency(item.Valor * item.Quantidade), 10, " ");
    const info = `${quantidade} ${valor} ${total}`;
    return { descricao, info };
  }

  for (const item of detalhes.PedidoItens) {
    const { descricao, info } = formatarLinhaItens(item);
    printExtrato.push(criarTexto(descricao, "left", "medium"));
    printExtrato.push(criarTexto(info, "right", "medium"));
    printExtrato.push(criarTexto(" ", "center", "medium"));
  }

  // Rodapé do extrato com as formas de pagamento
  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));
  const valorTotalPedido = formatToCurrency(detalhes.Pedido.Total);
  printExtrato.push(criarTexto(`Total do Pedido: ${valorTotalPedido}`, "right", "medium"));

  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));
  printExtrato.push(criarTexto("Sem Valor Fiscal/Peça Nota Fiscal", "center", "small"));
  printExtrato.push(criarTexto("Publisoft Informática LTDA", "center", "small"));
  printExtrato.push(criarTexto("www.publisoft.com.br", "center", "small"));
  printExtrato.push(criarTexto("--------------------------------", "center", "medium"));

  return printExtrato;
}

// Função principal para construir o layout do extrato do pedido
export async function buildLayoutExtract(detalhes: DetalhesPedidoProps): Promise<PrintPedidoType[]> {
  return await buildLayoutExtract_modelo_P2B(detalhes);
}
