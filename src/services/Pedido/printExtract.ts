import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface RequestAccountProps {
  HandleGarcom: number;
  numeroCartao?: string;
  numeroMesa?: string;
}

export interface ResponseCardProps {
  IsValid: boolean;
  Msg: string;
  Data: null;
}

async function printExtract({
  HandleGarcom,
  numeroCartao,
  numeroMesa,
}: RequestAccountProps): Promise<ResponseCardProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.get<ResponseCardProps>(`/api/pedido/extrato`, {
      params: {
        handleGarcom: HandleGarcom,
        numeroCartao,
        numeroMesa,
      },
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

export { printExtract };
