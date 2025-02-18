import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface RequestAccountProps {
  type: "cartao" | "mesa" | string;
  Numero: string;
  HandleGarcom: number;
}

export interface ResponseCardProps {
  IsValid: boolean;
  Msg: string;
  Data: null;
}

async function requestAccount({ type, Numero, HandleGarcom }: RequestAccountProps): Promise<ResponseCardProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.post<ResponseCardProps>(`/api/${type}/solicitarconta`, {
      Numero,
      HandleGarcom,
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

export { requestAccount };
