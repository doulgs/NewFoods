import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";
import { PedidoItem } from "@/storages/usePedidoStore";

export type ResponseSaveOrder = {
  IsValid: boolean;
  Msg: string;
  Data: null;
};

async function saveOrder(pedido: Omit<PedidoItem, "id">[]): Promise<ResponseSaveOrder | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.post<ResponseSaveOrder>("/api/pedido/salvar", pedido);

    if (response.status >= 200 && response.status < 300) {
      const data = response.data;

      if (data.IsValid) {
        return data;
      }
    }

    // Se o status for diferente de sucesso, trata o erro
    handleAPIError({ response });

    return null;
  } catch (error) {
    handleAPIError(error);
    return null;
  }
}

export { saveOrder };
