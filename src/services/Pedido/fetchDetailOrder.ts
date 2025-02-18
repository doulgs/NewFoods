import { useApiSettings } from "@/services/api";
import { handleAPIError } from "@/services/handleAPIError";

export interface RequestProps {
  handleGarcom: number;
  numero: number;
  tipo: "cartao" | "mesa";
}

export interface ResponseProps {
  IsValid: boolean;
  Msg: string;
  Data: PedidoCompleto;
}

async function fetchDetailOrder({ handleGarcom, numero, tipo }: RequestProps): Promise<ResponseProps | null> {
  try {
    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Cria a instância do Axios

    // Faz a chamada para a API e obtém os dados do pedido porem n esquecer de desfazer o teste no caso apagar o numero 2 logo a baixo
    const response = await API.get<ResponseProps>("/api/pedido/getQuickFoods2", {
      params: {
        handleGarcom,
        numero,
        tipo,
      },
    });

    // Validação do status da resposta
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    // Caso o status da resposta não esteja entre 200 e 299
    console.error("Erro na resposta da API:", response.status);
    handleAPIError({ response });
    return null;
  } catch (error) {
    // Tratamento de erros no catch
    console.error("Erro ao buscar detalhes do pedido:", error);
    handleAPIError(error);
    return null;
  }
}

export { fetchDetailOrder };
