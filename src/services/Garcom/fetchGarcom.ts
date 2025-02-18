import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

export type GarcomProps = {
  Handle: number;
  Nome: string;
  Apelido: string;
};

export type ResponseGarcomProps = {
  IsValid: boolean;
  Msg: string;
  Data: GarcomProps[];
};

async function fetchGarcom(): Promise<ResponseGarcomProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGarcomProps>("/api/Garcom/get");

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

export { fetchGarcom };
