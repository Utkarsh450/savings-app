import { Client, Account } from "react-native-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // your region endpoint
  .setProject("6967e1860017c4b29885"); // your project ID

export const account = new Account(client);