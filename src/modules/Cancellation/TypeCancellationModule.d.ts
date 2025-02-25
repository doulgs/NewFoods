type RequestNativeCancellation = {
  amount: number;
  atk: string;
  editableAmount: boolean;
  return_scheme: string;
};

type NativeCancellation = {
  amount: string;
  atk: string;
  editableAmount: boolean;
  return_scheme: string;
};

type ResponseCancellationParams = {
  success: string;
  atk: string;
  canceledamount: string;
  paymenttype: string;
  transactionamount: string;
  orderid: string;
  authorizationcode: string;
  reason: string;
  responsecode: string;
};
