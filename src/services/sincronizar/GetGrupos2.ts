import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

export type ResponseGetGrupo2 = {
  IsValid: boolean;
  Msg: string;
  Data: {
    Grupos2: Grupo2[]; // Ajustado para corresponder ao formato da API
  };
};

async function fetchGrupo2(): Promise<ResponseGetGrupo2 | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGetGrupo2>("/api/sincronizar/getgrupos2");

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

export { fetchGrupo2 };
