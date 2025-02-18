import { useApiSettings } from "@/services/api";
import { handleAPIError } from "../handleAPIError";

export type RequiredProps = {
  type: "cartao" | "mesa";
  Numero: string;
  HandleGarcom: number;
  Quantidade: number;
};

export type ResponseProps = {
  IsValid: boolean;
  Msg: string;
  Data: null;
};

async function alterQuantity({ type, Numero, HandleGarcom, Quantidade }: RequiredProps): Promise<ResponseProps | null> {
  try {
    if (!Numero || !HandleGarcom || !Quantidade) {
      throw Error(
        `Dados insuficientes para realizar o Processo do type${type} Numero${Numero} HandleGarcom${HandleGarcom} Quantidade${Quantidade}`
      );
    }

    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância

    const response = await API.post<ResponseProps>(`/api/${type}/alterarquantidade`, {
      Numero,
      HandleGarcom,
      Quantidade,
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

export { alterQuantity };
