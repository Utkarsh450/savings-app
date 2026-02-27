import { account } from "../../lib/appwrite";
import { ID } from "react-native-appwrite";

/**
 * Register new user
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // 🔥 STEP 4 GOES HERE
    await account.deleteSession("current").catch(() => {});

    await account.createEmailPasswordSession(email, password);

    const user = await account.get();
    return user;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};  

/**
 * Login existing user
 */
export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    // 🔥 Prevent session conflict
    await account.deleteSession("current").catch(() => {});

    await account.createEmailPasswordSession(email, password);

    const user = await account.get();
    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout current session
 */
export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Get currently logged user
 */
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};