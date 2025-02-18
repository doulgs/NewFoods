// PaymentModuleController.ts
import { ToastAndroid } from "react-native";
import { PaymentModuleService } from "./PaymentModuleService";

// Função para converter um valor decimal em centavos (formato string)
const formatToCents = (value: number): string => {
  const cents = Math.round(value * 100);
  return cents.toString();
};

// Define a interface dos parâmetros do controlador (ajuste conforme sua necessidade)
export interface PaymentControllerProps {
  return_scheme?: string; // Esquema de retorno do deeplink
  amount: number | string; // Pode ser informado como número (decimal) ou string (centavos)
  editableAmount?: boolean;
  transactionType: "DEBIT" | "CREDIT" | "VOUCHER" | "INSTANT_PAYMENT" | "PIX" | string;
  installmentType?: "MERCHANT" | "ISSUER" | "NONE";
  installmentCount?: string;
  order_id?: number;
}

/**
 * Controlador responsável por iniciar o fluxo de pagamento com os parâmetros fornecidos.
 *
 * @param props - Parâmetros de configuração para abrir o app de pagamento.
 *
 * Observação: Se o valor for informado como número, ele será convertido para centavos (string).
 */
export const handlePaymentProcess = async (props: PaymentControllerProps): Promise<void> => {
  // Desestruturação com valores padrão
  const {
    return_scheme = "br.com.publisoft.quickfoods",
    amount,
    editableAmount = false,
    transactionType,
    installmentType = "NONE",
    installmentCount = "2",
    order_id,
  } = props;

  // Validação dos parâmetros obrigatórios
  if (amount === undefined || amount === null || amount === "") {
    ToastAndroid.show("Amount is required", ToastAndroid.LONG);
    return;
  }
  if (!transactionType) {
    ToastAndroid.show("Transaction type is required", ToastAndroid.LONG);
    return;
  }

  // Converte o valor para centavos se necessário (assumindo que se for número é decimal)
  const formattedAmount = typeof amount === "number" ? formatToCents(amount) : amount;

  try {
    switch (transactionType) {
      case "DEBIT":
        await PaymentModuleService({
          amount: formattedAmount,
          orderId: order_id?.toString() || "",
          editableAmount: editableAmount,
          transactionType: transactionType,
        });
        break;

      case "CREDIT":
        await PaymentModuleService({
          amount: formattedAmount,
          orderId: order_id?.toString() || "",
          editableAmount: editableAmount,
          transactionType: transactionType,
          installmentType: installmentType,
        });
        break;

      case "VOUCHER":
        ToastAndroid.show("O Tipo de transação VOUCHER não está disponível", ToastAndroid.LONG);
        break;

      case "INSTANT_PAYMENT":
        ToastAndroid.show("O Tipo de transação INSTANT_PAYMENT não está disponível", ToastAndroid.LONG);
        break;

      case "PIX":
        await PaymentModuleService({
          amount: formattedAmount,
          orderId: order_id?.toString() || "",
          editableAmount: editableAmount,
          transactionType: transactionType,
          installmentType: "NONE",
        });
        break;

      default:
        console.warn("Tipo de transação desconhecido:", transactionType);
        ToastAndroid.show("Tipo de transação desconhecido", ToastAndroid.LONG);
    }
  } catch (error) {
    console.error("Erro ao abrir o aplicativo de pagamento:", error);
    ToastAndroid.show(`Erro ao abrir o aplicativo de pagamento: ${error}`, ToastAndroid.LONG);
  }
};
