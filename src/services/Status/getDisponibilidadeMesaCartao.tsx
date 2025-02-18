import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

interface ResponseProps {
  IsValid: boolean;
  Msg: string;
  Data: string;
}

async function getDisponibilidadeMesaCartao({
  numero,
  tipo,
}: {
  numero: number;
  tipo: "mesa" | "cartao";
}): Promise<boolean> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance();

    // Define a URL com base no tipo (mesa ou cartão)
    const endpoint = tipo === "mesa" ? "/api/mesa/GetMesaStatus" : "/api/cartao/GetCartaoStatus";

    const response = await API.get<ResponseProps>(endpoint, {
      params: { numero },
    });

    if (response.status >= 200 && response.status < 300) {
      if (response.data.Data === "LIVRE") return true;
      return false;
    }

    handleAPIError({ response });
    return false;
  } catch (error) {
    handleAPIError(error);
    return false;
  }
}

export { getDisponibilidadeMesaCartao };
