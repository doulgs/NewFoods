import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";
import { usePedidoStore } from "@/storages/usePedidoStore";

export type DefaultResponse<T = any> = {
  IsValid: boolean;
  Msg: string;
  Data: T;
};

interface SearchPessoaProps {
  filtroPesquisa: string;
}

export interface PessoaProps {
  Handle: number;
  Codigo: number;
  Nome: string;
  CgcCpf: string;
  Cep: string;
  Endereco: string;
  Numero: number;
  Complemento: string;
  CidNome: string;
  Bairro: string;
  Telefone: string;
  Ativo: number;
}

interface InsertPessoaProps {
  Nome: string;
  CgcCpf: string;
  Telefone: string;
  Cep?: string;
  Endereco?: string;
  Numero?: number;
  Complemento?: string;
  CidNome?: string;
  Bairro?: string;
}

interface UpdatePessoaProps {
  Handle: number;
  Codigo: number;
  Nome: string;
  CgcCpf: string;
  Cep: string | null;
  Endereco: string | null;
  Numero: number | null;
  Complemento: string | null;
  CidNome: string;
  Bairro: string;
  Telefone: string;
  Ativo: number;
}

export interface PessoaResultProps {
  Tabela: string;
  Handle: number;
  Codigo: number;
  Nome: string;
  CgcCpf: string;
  Telefone: string;
  Cep: string | null;
  Endereco: string | null;
  Numero: number | null;
  Complemento: string | null;
  CidNome: string;
  Bairro: string;
  Ativo: number;
}

function pessoaController() {
  const { updateSelectedPessoa } = usePedidoStore();

  async function getPessoa({ filtroPesquisa }: SearchPessoaProps): Promise<DefaultResponse<PessoaProps[]> | null> {
    try {
      const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
      const API = await createAxiosInstance(); // Cria a instância do Axios

      const response = await API.get<DefaultResponse<PessoaProps[]>>("/api/pessoa", {
        params: { filtroPesquisa },
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      handleAPIError({ response });
      return null;
    } catch (error) {
      handleAPIError(error);
      return null;
    }
  }

  async function insertPessoa(data: InsertPessoaProps): Promise<DefaultResponse<PessoaResultProps> | null> {
    try {
      const { createAxiosInstance } = useApiSettings();
      const API = await createAxiosInstance();

      const response = await API.post<DefaultResponse<PessoaResultProps>>("/api/pessoa/incluir", data);

      if (response.status >= 200 && response.status < 300) {
        updateSelectedPessoa({
          Handle: response.data.Data.Handle,
          Codigo: response.data.Data.Codigo,
          Nome: response.data.Data.Nome,
          CgcCpf: response.data.Data.CgcCpf,
        });
        return response.data;
      }

      handleAPIError({ response });
      return null;
    } catch (error) {
      handleAPIError(error);
      return null;
    }
  }

  async function updatePessoa(data: UpdatePessoaProps): Promise<DefaultResponse<PessoaResultProps> | null> {
    try {
      const { createAxiosInstance } = useApiSettings();
      const API = await createAxiosInstance();

      const response = await API.post<DefaultResponse<PessoaResultProps>>("/api/pessoa/alterar", data);

      if (response.status >= 200 && response.status < 300) {
        updateSelectedPessoa({
          Handle: response.data.Data.Handle,
          Codigo: response.data.Data.Codigo,
          Nome: response.data.Data.Nome,
          CgcCpf: response.data.Data.CgcCpf,
        });
        return response.data;
      }

      handleAPIError({ response });
      return null;
    } catch (error) {
      handleAPIError(error);
      return null;
    }
  }

  return {
    getPessoa,
    insertPessoa,
    updatePessoa,
  };
}

export { pessoaController };
