import { useApiSettings } from "@/services/api";
import { handleAPIError } from "../handleAPIError";

export type RequiredGarcomProps = {
  HandleGarcom: number;
  NomeLogin: string;
  Senha: string;
};

export type ResultGarcomProps = {
  Handle: number;
  Nome: string;
  Apelido: string;
};

export type ResponseGarcomProps = {
  IsValid: boolean;
  Msg: string;
  Data: ResultGarcomProps;
};

async function performAccess({
  HandleGarcom,
  NomeLogin,
  Senha,
}: RequiredGarcomProps): Promise<ResponseGarcomProps | null> {
  try {
    if (!HandleGarcom || !NomeLogin || !Senha) {
      throw Error("Dados insuficientes para realizar o acesso");
    }

    const { createAxiosInstance } = useApiSettings();
    const API = await createAxiosInstance(); // Aguarda a criação da instância

    const response = await API.post<ResponseGarcomProps>("/api/Garcom/Login", {
      HandleGarcom,
      NomeLogin,
      Senha,
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

export { performAccess };
