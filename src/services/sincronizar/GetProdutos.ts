import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";

export type getProdutosOptions = {
  handleGrupo2?: number; // Parâmetros opcionais
  handleGrupo3?: number;
  searchNomeProduto?: string;
};

export type ResponseGetProdutos = {
  IsValid: boolean;
  Msg: string;
  Data: {
    Produtos: Produtos[];
    ProdutosExcecoes: ProdutosExcecoes[];
    ProdutoExcAuto: ProdutoExcAuto[];
    ComboItem: ComboItem[];
  };
};

async function getProdutos({
  handleGrupo2,
  handleGrupo3,
  searchNomeProduto,
}: getProdutosOptions): Promise<ResponseGetProdutos | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGetProdutos>("/api/sincronizar/getprodutos", {
      params: {
        handleGrupo2,
        handleGrupo3,
        searchNomeProduto,
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

export { getProdutos };
