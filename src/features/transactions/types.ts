export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  note: string;
  txDate: string;
  isRecurring: boolean;
  createdAt: string;
};

export type CreateTransactionInput = {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  note?: string;
  txDate: string;
  isRecurring: boolean;
};
