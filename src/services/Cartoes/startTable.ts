import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface startCardProps {
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

export interface ResponseCardProps {
  IsValid: boolean;
  Msg: string;
  Data: startCardProps;
}

export interface RequestCardProps {
  Numero: string;
  HandleGarcom: number;
}

async function startCard({ Numero, HandleGarcom }: RequestCardProps): Promise<ResponseCardProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.post<ResponseCardProps>("/api/cartao/iniciar", {
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

export { startCard };
