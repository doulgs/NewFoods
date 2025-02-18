import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface ResponseConditionsProps {
  IsValid: boolean;
  Msg: string;
  Data: CondicaoPagamento[];
}

async function fetchConditions(): Promise<ResponseConditionsProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.get<ResponseConditionsProps>("/api/Condicao/get");

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

export { fetchConditions };
