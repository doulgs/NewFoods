import { Alert } from "react-native";

let isAlertShown = false; // 🔹 Variável para evitar múltiplos alertas em requisições concorrentes

interface HandleAPIErrorOptions {
  silent?: boolean; // 🔹 Permite desativar alertas em chamadas específicas
}

/**
 * Trata erros genéricos de requisição da API.
 *
 * @param error - O erro capturado pela requisição Axios.
 * @param options - Opções para personalizar o tratamento do erro.
 */
function handleAPIError(error: any, options: HandleAPIErrorOptions = {}) {
  if (options.silent) return; // 🔹 Se `silent` for true, não exibe alertas.

  let message = "Ocorreu um erro inesperado.";

  if (error.response) {
    // 🔹 O servidor respondeu com um erro HTTP
    const { status, data } = error.response;
    message = data?.Msg || data?.message || data?.error || `Erro ${status}: Ocorreu um problema na requisição.`;

    if (status >= 400 && status < 500) {
      showAlert("Erro de Solicitação", message);
    } else if (status >= 500) {
      showAlert("Erro no Servidor", message);
    }
  } else if (error.request) {
    // 🔹 A requisição foi feita, mas não houve resposta (problema de rede, timeout, servidor offline)
    if (error.code === "ECONNABORTED") {
      message = "A solicitação expirou. Tente novamente.";
    } else if (error.message.includes("Network Error")) {
      message = "Erro de conexão. Verifique sua internet, a URL da empresa e as configurações da API.";
    } else {
      message = "O servidor não respondeu. Tente novamente mais tarde.";
    }

    showAlert("Erro de Conexão", message);
  } else if (error.message) {
    // 🔹 Erros internos do JavaScript, como problemas de configuração do Axios
    if (error.message === "canceled") {
      console.warn("Requisição cancelada pelo usuário.");
      return;
    }

    showAlert("Erro Desconhecido", error.message);
  } else {
    // 🔹 Erro inesperado
    showAlert("Erro", "Algo deu errado. Por favor, tente novamente.");
  }
}

/**
 * Exibe um alerta de erro, garantindo que não haja múltiplos alertas simultâneos.
 */
function showAlert(title: string, message: string) {
  if (!isAlertShown) {
    isAlertShown = true;
    Alert.alert(title, message, [{ text: "OK", onPress: () => (isAlertShown = false) }]);
  }
}

export { handleAPIError };
