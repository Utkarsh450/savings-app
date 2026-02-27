import { ENV } from "@/src/config/env";
import { databases } from "@/src/lib/appwrite";
import { ID, Models, Query } from "react-native-appwrite";
import { CreateTransactionInput, Transaction } from "./types";

const getCollectionConfig = () => {
  const databaseId = ENV.APPWRITE_DATABASE_ID;
  const collectionId = ENV.APPWRITE_TRANSACTIONS_COLLECTION_ID;

  if (!databaseId || !collectionId) {
    throw new Error(
      "Missing Appwrite config. Set EXPO_PUBLIC_APPWRITE_DATABASE_ID and EXPO_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID in .env."
    );
  }

  return { databaseId, collectionId };
};

const mapDocToTransaction = (doc: Models.Document): Transaction => {
  const fields = doc as Models.Document & Record<string, unknown>;

  return {
    id: doc.$id,
    userId: String(fields.userId ?? ""),
    title: String(fields.title ?? ""),
    amount: Number(fields.amount ?? 0),
    type: (fields.type === "income" ? "income" : "expense"),
    category: String(fields.category ?? "Other"),
    paymentMethod: String(fields.paymentMethod ?? "Unknown"),
    note: String(fields.note ?? ""),
    txDate: String(fields.txDate ?? doc.$createdAt),
    isRecurring: Boolean(fields.isRecurring),
    createdAt: doc.$createdAt,
  };
};

export const listTransactions = async (userId: string, limit = 100) => {
  const { databaseId, collectionId } = getCollectionConfig();

  const response = await databases.listDocuments(databaseId, collectionId, [
    Query.equal("userId", userId),
    Query.orderDesc("txDate"),
    Query.limit(limit),
  ]);

  return response.documents.map(mapDocToTransaction);
};

export const createTransaction = async (userId: string, payload: CreateTransactionInput) => {
  const { databaseId, collectionId } = getCollectionConfig();

  const doc = await databases.createDocument(databaseId, collectionId, ID.unique(), {
    userId,
    title: payload.title.trim(),
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    paymentMethod: payload.paymentMethod,
    note: payload.note?.trim() ?? "",
    txDate: payload.txDate,
    isRecurring: payload.isRecurring,
  });

  return mapDocToTransaction(doc);
};
