/* import { handleAPIError } from "@/services/handleAPIError";
import { useApiSettings } from "../api";
import { ConfigData, useApiConfigStore } from "@/stores/useApiConfigStore";

export type ResponseGetConfig = {
  IsValid: boolean;
  Msg: string;
  Data: ConfigData;
};

async function getApiConfig(): Promise<ResponseGetConfig | null> {
  try {
    const { createAxiosInstance } = useApiSettings(); // Obtém as configurações do API
    const API = await createAxiosInstance(); // Cria a instância do Axios

    const response = await API.get<ResponseGetConfig>("/api/parametros");

    if (response.status >= 200 && response.status < 300) {
      const data = response.data;

      if (data.IsValid && data.Data) {
        // Salva os dados no Zustand, convertendo os booleanos para strings
        const { setConfig } = useApiConfigStore.getState();

        setConfig({
          ...data.Data,
          UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao:
            data.Data.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao.toString(),
          ObrigatorioNumeroMesaLancamentoCartao: data.Data.ObrigatorioNumeroMesaLancamentoCartao.toString(),
        });
      }

      return data;
    }

    // Se o status for diferente de sucesso, trata o erro
    handleAPIError({ response });

    return null;
  } catch (error) {
    handleAPIError(error);
    return null;
  }
}

export { getApiConfig };
 */
