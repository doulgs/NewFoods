import axios, { AxiosInstance } from "axios";
import { useUrlApiStore } from "@/storages/useUrlApiStorage";

export function useApiSettings() {
  /**
   * Cria uma instância do Axios configurada com a URL base obtida do AsyncStorage.
   *
   * @returns Uma instância configurada do Axios.
   * @throws Lança um erro se a URL base não for encontrada.
   */
  async function createAxiosInstance(): Promise<AxiosInstance> {
    try {
      // Atualiza o estado chamando a função que busca a URL do AsyncStorage
      await useUrlApiStore.getState().getUrl();

      // Acessa o estado atualizado para obter a URL
      const { url } = useUrlApiStore.getState();

      if (!url) {
        // Caso a URL não esteja disponível, lança um erro
        throw new Error("URL base não encontrada. Verifique as configurações da API.");
      }

      // Cria e retorna a instância do Axios utilizando a URL obtida
      return axios.create({
        baseURL: url,
        responseType: "json",
        withCredentials: true,
      });
    } catch (error) {
      console.warn("Erro ao criar instância do Axios:", error);
      throw new Error(`${error}`);
    }
  }

  return {
    createAxiosInstance,
  };
}
