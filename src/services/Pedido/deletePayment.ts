import { useApiSettings } from "@/services/api";
import { handleAPIError } from "../handleAPIError";

// Tipagens das propriedades
type PaymentProps = {
  Handle: number; // Alterado para "Handle" para coincidir com o payload necessário
  TipoPagamento: string;
};

type RequiredProps = {
  HandlePedido: number;
  ListaPagamento: PaymentProps[];
};

type ResponseProps = {
  IsValid: boolean;
  Msg: string;
  Data: null;
};

type RequestProps = {
  HandlePedido: number;
  Handle: number; // Alterado para "Handle"
  TipoPagamento: string;
};

// Função auxiliar para criar o objeto simplificado de pagamento
function createSimplifiedPayment(handle: number, tipoPagamento: string): PaymentProps[] {
  return [
    {
      Handle: handle, // Alterado para "Handle"
      TipoPagamento: tipoPagamento,
    },
  ];
}

// Função auxiliar para validação dos dados
function validateRequestData({ HandlePedido, Handle }: RequestProps) {
  if (!HandlePedido || !Handle) {
    throw new Error(
      `Dados insuficientes para realizar o processo de exclusão do pagamento. HandlePedido: ${HandlePedido}, Handle: ${Handle}`
    );
  }
}

// Função principal para exclusão de pagamento
async function DeletePayment({ HandlePedido, Handle, TipoPagamento }: RequestProps): Promise<ResponseProps> {
  try {
    // Validação dos dados de entrada
    validateRequestData({ HandlePedido, Handle, TipoPagamento });

    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance();

    // Criação do objeto de requisição
    const paymentData: RequiredProps = {
      HandlePedido,
      ListaPagamento: createSimplifiedPayment(Handle, TipoPagamento),
    };

    // Envio da requisição para exclusão de pagamento
    const response = await API.post<ResponseProps[]>(`/api/Pagamento/Excluir`, paymentData);

    //console.log("DeletePayment", response.data);

    // Retorna apenas o primeiro objeto do array
    const firstResponse = response.data[0];

    return firstResponse;
  } catch (error) {
    // Tratamento de erro para exceções
    handleAPIError(error);
    throw new Error("ERRO NA FUNCAO DeletePayment");
  }
}

export { DeletePayment };
