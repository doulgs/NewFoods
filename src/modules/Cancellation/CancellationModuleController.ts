// CancellationModuleController.ts
import { ToastAndroid } from "react-native";
import { CancellationModuleService } from "./CancellationModuleService"; // ajuste o caminho conforme sua estrutura

// Função para converter um valor decimal em centavos (formato string)
const formatToCents = (value: number): string => {
  const cents = Math.round(value * 100);
  return cents.toString();
};

export const CancellationModuleController = async (
  cancellationData: Pick<RequestNativeCancellation, "amount" | "atk"> &
    Partial<Pick<RequestNativeCancellation, "editableAmount" | "return_scheme">>
): Promise<void> => {
  const { amount, atk, editableAmount = false, return_scheme = "br.com.publisoft.quickfoods" } = cancellationData;

  try {
    // Validação dos dados (opcional, adapte conforme necessário)
    if (!amount) {
      ToastAndroid.show("O valor (amount) é obrigatório para o cancelamento.", ToastAndroid.LONG);
      return;
    }
    if (!atk) {
      ToastAndroid.show("O campo atk é obrigatório para o cancelamento.", ToastAndroid.LONG);
      return;
    }

    // Converte o valor para centavos se necessário (assumindo que se for número é decimal)
    const formattedAmount = typeof amount === "number" ? formatToCents(amount) : amount;

    // Chama o service para realizar o cancelamento
    await CancellationModuleService({ amount: formattedAmount, atk, editableAmount, return_scheme });
  } catch (error) {
    console.error("Erro no CancellationModuleController:", error);
    ToastAndroid.show("Erro ao cancelar pagamento.", ToastAndroid.LONG);
  }
};
