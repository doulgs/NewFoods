// PaymentModuleService.ts
import { NativeModules } from "react-native";

interface NativePayment {
  amount: string;
  orderId?: string;
  editableAmount: boolean;
  transactionType: string;
  installmentType?: string;
  installmentCount?: string;
  returnScheme?: string;
}

// Extrai o módulo nativo e valida sua existência
const { PaymentModule } = NativeModules;

if (!PaymentModule || typeof PaymentModule.startPayment !== "function") {
  console.error("PaymentModule nativo não está disponível.");
}

/**
 * Função para processar o pagamento chamando o módulo nativo.
 * Recebe todos os parâmetros necessários e passa para o método startPayment.
 *
 * @param props - Objeto contendo os dados do pagamento.
 */
export const PaymentModuleService = async (props: NativePayment): Promise<void> => {
  if (!PaymentModule || typeof PaymentModule.startPayment !== "function") {
    console.error("PaymentModule nativo não está disponível.");
    return;
  }

  // Validação básica dos parâmetros obrigatórios
  if (!props.amount) {
    console.error("O parâmetro 'amount' é obrigatório.");
    return;
  }
  if (!props.transactionType) {
    console.error("O parâmetro 'transactionType' é obrigatório.");
    return;
  }

  // Define valores padrão para parâmetros opcionais
  const {
    amount,
    orderId = "",
    editableAmount,
    transactionType,
    installmentType = "",
    installmentCount = "",
    returnScheme = "br.com.publisoft.quickfoods",
  } = props;

  try {
    /*     console.warn("Iniciando pagamento com os seguintes parâmetros:", {
      amount,
      orderId,
      editableAmount,
      transactionType,
      installmentType,
      installmentCount,
      returnScheme,
    }); */

    // Chama o módulo nativo passando todos os parâmetros necessários.
    // Certifique-se de que o método startPayment no módulo nativo esteja preparado para receber todos estes parâmetros.
    await PaymentModule.startPayment(
      amount,
      orderId,
      editableAmount,
      transactionType,
      installmentType,
      installmentCount,
      returnScheme
    );
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    throw error;
  }
};
