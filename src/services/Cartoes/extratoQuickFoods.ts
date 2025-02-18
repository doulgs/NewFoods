import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

export interface RequestPrintCardProps {
  Numero: number;
  HandleGarcom: number;
}

export interface ResponsePrintCardProps {
  IsValid: boolean;
  Msg: string;
  Data: string;
}

async function extratoQuickFoodsCards({
  Numero,
  HandleGarcom,
}: RequestPrintCardProps): Promise<ResponsePrintCardProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância
    const response = await API.post<ResponsePrintCardProps>("/api/cartao/extratoquickfoods", {
      Numero,
      HandleGarcom,
      ImprimirExtraoPOS: true,
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

export { extratoQuickFoodsCards };
