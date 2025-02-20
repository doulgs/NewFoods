import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

export type ResponseGetConfig = {
  IsValid: boolean;
  Msg: string;
  Data: ConfigData;
};

async function fetchConfig(): Promise<ConfigData | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGetConfig>("/api/parametros");

    if (response.status >= 200 && response.status < 300) {
      const data = response.data;

      if (data.IsValid && data.Data) {
        return data.Data;
      }

      return null;
    }

    // Se o status for diferente de sucesso, trata o erro
    handleAPIError({ response });

    return null;
  } catch (error) {
    handleAPIError(error);
    return null;
  }
}

export { fetchConfig };
