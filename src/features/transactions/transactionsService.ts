import { db } from "@/src/firebase/config";
import { addDoc, collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { CreateTransactionInput, Transaction } from "./types";

const transactionsCollection = collection(db, "transactions");

const mapDocToTransaction = (id: string, fields: Record<string, unknown>): Transaction => ({
  id,
  userId: String(fields.userId ?? ""),
  title: String(fields.title ?? ""),
  amount: Number(fields.amount ?? 0),
  type: fields.type === "income" ? "income" : "expense",
  category: String(fields.category ?? "Other"),
  paymentMethod: String(fields.paymentMethod ?? "Unknown"),
  note: String(fields.note ?? ""),
  txDate: String(fields.txDate ?? fields.createdAt ?? new Date().toISOString()),
  isRecurring: Boolean(fields.isRecurring),
  createdAt: String(fields.createdAt ?? new Date().toISOString()),
});

export const listTransactions = async (userId: string, maxItems = 100) => {
  const snapshot = await getDocs(
    query(transactionsCollection, where("userId", "==", userId), limit(maxItems))
  );

  return snapshot.docs
    .map((doc) => mapDocToTransaction(doc.id, doc.data()))
    .sort((a, b) => new Date(b.txDate).getTime() - new Date(a.txDate).getTime());
};

export const createTransaction = async (userId: string, payload: CreateTransactionInput) => {
  const createdAt = new Date().toISOString();
  const docPayload = {
    userId,
    title: payload.title.trim(),
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    paymentMethod: payload.paymentMethod,
    note: payload.note?.trim() ?? "",
    txDate: payload.txDate,
    isRecurring: payload.isRecurring,
    createdAt,
  };

  const doc = await addDoc(transactionsCollection, docPayload);
  return mapDocToTransaction(doc.id, docPayload);
};

export const updateTransaction = async (
  transactionId: string,
  payload: Partial<CreateTransactionInput>
) => {
  const docRef = doc(db, "transactions", transactionId);
  const nextPayload: Record<string, unknown> = {};

  if (payload.title !== undefined) {
    nextPayload.title = payload.title.trim();
  }
  if (payload.amount !== undefined) {
    nextPayload.amount = payload.amount;
  }
  if (payload.type !== undefined) {
    nextPayload.type = payload.type;
  }
  if (payload.category !== undefined) {
    nextPayload.category = payload.category;
  }
  if (payload.paymentMethod !== undefined) {
    nextPayload.paymentMethod = payload.paymentMethod;
  }
  if (payload.note !== undefined) {
    nextPayload.note = payload.note.trim();
  }
  if (payload.txDate !== undefined) {
    nextPayload.txDate = payload.txDate;
  }
  if (payload.isRecurring !== undefined) {
    nextPayload.isRecurring = payload.isRecurring;
  }

  await updateDoc(docRef, nextPayload);

  const refreshedSnapshot = await getDocs(
    query(transactionsCollection, where("__name__", "==", transactionId), limit(1))
  );
  const updatedDoc = refreshedSnapshot.docs[0];

  if (!updatedDoc) {
    throw new Error("Transaction not found after update.");
  }

  return mapDocToTransaction(updatedDoc.id, updatedDoc.data());
};

export const deleteTransaction = async (transactionId: string) => {
  await deleteDoc(doc(db, "transactions", transactionId));
};
