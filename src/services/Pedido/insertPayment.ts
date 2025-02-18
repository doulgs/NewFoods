import { useApiSettings } from "@/services/api";
import { handleAPIError } from "../handleAPIError";

export type InfoPgmto = {
  Code: string;
  Amount: number;
  Sucesso: boolean;
  Itk: string;
  Type: string;
  InstallmentCount: string;
  Brand: string;
  EntryMode: string;
  Atk: string;
  Pan: string;
  Plataforma: string;
  AuthorizationCode: string;
  AuthorizationDateTime: string;
  Data: string;
  Valor: number;
  ValorDeTroco: number;
};

export type PaymentProps = {
  HandleCondicaoPagamento: number;
  DescricaoCondicaoPagamento: string;
  ValorPagamento: number;
  TipoPagamento: "Crédito" | "Total";
  QuantidadePessoas: number;
  Data: string;
  ValorDesconto: number;
  ValorAcrescimo: number;
  ValorOutros: number;
  Usuario: string;
  ValorTroco: number;
  TotalRecebido: number;
  InformacoesPagamento: InfoPgmto;
  DesconsiderarTaxaGarcom: boolean;
};

export type RequiredProps = {
  HandlePedido: number;
  ListaPagamento: PaymentProps[];
};

export type ResponseProps = {
  IsValid: boolean;
  Msg: string;
  Data: null;
};

async function InsertPayment({ HandlePedido, ListaPagamento }: RequiredProps): Promise<ResponseProps | null> {
  try {
    // 🔍 Validação de parâmetros antes da requisição
    if (!HandlePedido || !Array.isArray(ListaPagamento) || ListaPagamento.length === 0) {
      return {
        IsValid: false,
        Msg: `Dados insuficientes para realizar o pagamento. HandlePedido: ${HandlePedido}, ListaPagamento: ${ListaPagamento.length}`,
        Data: null,
      };
    }

    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância

    // 🌐 Realiza a requisição para API
    const response = await API.post<ResponseProps>(`/api/Pagamento/Incluir`, {
      HandlePedido,
      ListaPagamento,
    });

    // ✅ Verifica se a requisição foi bem-sucedida
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    // ⚠️ Se houver erro, processa a resposta da API
    handleAPIError({ response });

    return null;
  } catch (error) {
    // ❌ Captura erros e retorna um erro estruturado
    handleAPIError(error);
    return null;
  }
}

export { InsertPayment };
