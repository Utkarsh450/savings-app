import { Account, Client, Databases } from "react-native-appwrite";
import { ENV } from "../config/env";

const client = new Client()
  .setEndpoint(ENV.APPWRITE_ENDPOINT)
  .setProject(ENV.APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
