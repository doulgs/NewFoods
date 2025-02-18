import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";
import { TempMesaCartao } from "@/stores/useTempMesaCartao";

export interface ResponseTableProps {
  IsValid: boolean;
  Msg: string;
  Data: TempMesaCartao[];
}

async function fetchTables(): Promise<ResponseTableProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.get<ResponseTableProps>("/api/mesa/Get");

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

export { fetchTables };
