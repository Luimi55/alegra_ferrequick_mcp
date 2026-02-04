export interface OriginalPayment {
  id: string | null;
  prefix: string | null;
  number: string | null;
  date: string | null;
  amount: number | null;
  paymentMethod: string | null;
  observations: string | null;
  anotation: string | null;
  status: string | null;
}
