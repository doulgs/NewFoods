type NativePayment = {
  amount: string;
  orderId?: string;
  editableAmount?: boolean;
  transactionType: "DEBIT" | "CREDIT" | "VOUCHER" | "INSTANT_PAYMENT" | "PIX";
  installmentType?: "MERCHANT" | "ISSUER" | "NONE";
  installmentCount?: string;
};

// Interface para definir as propriedades esperadas no controller de pagamento
type PaymentControllerProps = {
  path?: string;
  scheme?: string;
  return_scheme?: string; // Esquema de retorno do deeplink. Deve ser o mesmo valor configurado no AndroidManifest.
  amount: string; // Valor do pagamento, em centavos. Aceita valores entre 0 e 999999999.
  editableAmount?: boolean; // Permite editar o valor do pagamento no app de pagamento. true ou false.
  transactionType: string; // Modalidade do pagamento. Aceita DEBIT, CREDIT, VOUCHER, INSTANT_PAYMENT e PIX. Pode ser nulo.
  installmentType?: "MERCHANT" | "ISSUER" | "NONE"; // Tipo de parcelamento: SEM JUROS, COM JUROS, ou À VISTA.
  installmentCount?: string; // Número de parcelas. Aceita valores de 2 a 99.
  orderId?: number; // ID do pedido. Valores até 9223372036854775807. Habilitar funcionalidade no app de Ajustes do POS.
};

interface DeepLinkUrlParams {
  amount: string;
  cardholder_name: string;
  itk: string;
  atk: string;
  authorization_date_time: string;
  brand: string;
  order_id: string;
  authorization_code: string;
  installment_count: string;
  pan: string;
  type: string;
  entry_mode: string;
  account_id: string;
  customer_wallet_provider_id: string;
  code: string;
  success: string;
  transaction_qualifier: string;
  message: string;
}
