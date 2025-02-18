import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";
import { PagamentoRealizado } from "@/stores/useDetalhesPedidoStore";

interface RequestProps {
  handleGarcom: number;
  numero: number;
  tipo: "mesa" | "cartao";
}

interface RootObject {
  IsValid: boolean;
  Msg: string;
  Data: PagamentoRealizado[];
}

async function fetchProcessedPayments({ handleGarcom, numero, tipo }: RequestProps): Promise<RootObject | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância

    const response = await API.get<RootObject>("/api/Pagamento/get", {
      params: {
        handleGarcom,
        numero,
        tipo,
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

export { fetchProcessedPayments };
