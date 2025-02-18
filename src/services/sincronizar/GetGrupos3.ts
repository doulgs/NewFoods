import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

type RequestGetGrupo3 = {
  handleGrupo2: number;
};

export type ResponseGetGrupo3 = {
  IsValid: boolean;
  Msg: string;
  Data: {
    Grupos3: Grupo3[]; // Ajustado para corresponder ao formato da API
  };
};

async function fetchGrupo3({ handleGrupo2 }: RequestGetGrupo3): Promise<ResponseGetGrupo3 | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGetGrupo3>("/api/sincronizar/getgrupos3", {
      params: {
        handleGrupo2,
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

export { fetchGrupo3 };
