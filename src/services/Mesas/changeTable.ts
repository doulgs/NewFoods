import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface ReqChangeTableProps {
  Numero: string;
  HandleGarcom: number;
  Quantidade: number;
  HandleMesaDestino: number;
  origem: "cartao" | "mesa";
}

export interface ResChangeTableProps {
  IsValid: boolean;
  Msg: string;
  Data: null;
}

async function changeTable({
  Numero,
  HandleGarcom,
  Quantidade,
  HandleMesaDestino,
  origem,
}: ReqChangeTableProps): Promise<ResChangeTableProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância

    const { data: result } = await API.get<ResChangeTableProps>("/api/pedido/get", {
      params: {
        handleGarcom: HandleGarcom,
        numero: Numero,
        tipo: origem,
      },
    });

    if (result.IsValid) {
      throw new Error(result.Msg);
    }

    const response = await API.post<ResChangeTableProps>("/api/mesa/trocarmesa", {
      Numero,
      HandleGarcom,
      Quantidade,
      HandleMesaDestino,
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

export { changeTable };
