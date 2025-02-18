import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface startTableProps {
  QtdItensMesa: number;
  QtdPessoasMesa: number;
  Observacao: null;
  PessoaNome: string;
  NumeroMesaCartao: number;
  ValorCreditoLiberado: number;
  VerificaLimiteCredito: boolean;
  TotalConsumido: number;
  Numero: string;
}

export interface ResponseTableProps {
  IsValid: boolean;
  Msg: string;
  Data: startTableProps;
}

export interface RequestTableProps {
  Numero: string;
  HandleGarcom: number;
}

async function startTable({ Numero, HandleGarcom }: RequestTableProps): Promise<ResponseTableProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.post<ResponseTableProps>("/api/mesa/iniciar", {
      Numero,
      HandleGarcom,
      Quantidade: "1",
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    // Se o status for diferente de sucesso, trata o erro
    handleAPIError({ response });

    return null;
  } catch (error) {
    handleAPIError(error);
    return null;
  }
}

export { startTable };
