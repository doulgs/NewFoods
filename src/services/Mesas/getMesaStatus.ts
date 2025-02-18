import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

interface ResponseProps {
  IsValid: boolean;
  Msg: string;
  Data: string;
}

async function getMesaStatus(numero: number): Promise<boolean> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance();
    const response = await API.get<ResponseProps>("/api/Cartao/GetMesaStatus", {
      params: {
        numero,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      if (response.data.Data === "LIVRE") return true;

      return false;
    }

    // Se o status for diferente de sucesso, trata o erro
    handleAPIError({ response });

    return false;
  } catch (error) {
    handleAPIError(error);
    return false;
  }
}

export { getMesaStatus };
