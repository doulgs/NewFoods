import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";
import { TempMesaCartao } from "@/stores/useTempMesaCartao";

export interface ResponseCardProps {
  IsValid: boolean;
  Msg: string;
  Data: TempMesaCartao[];
}

async function fetchCards(): Promise<ResponseCardProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.get<ResponseCardProps>("/api/Cartao/get");

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

export { fetchCards };
