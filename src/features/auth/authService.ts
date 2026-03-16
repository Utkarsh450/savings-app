import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/src/firebase/config";
import { AppUser } from "./types";

const mapFirebaseUser = (user: User): AppUser => ({
  id: user.uid,
  name: user.displayName?.trim() || user.email?.split("@")[0] || "User",
  email: user.email || "",
});

const waitForInitialAuthUser = () =>
  new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      () => {
        unsubscribe();
        resolve(null);
      }
    );
  });

const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const authError = error as Error & { code?: string };

  switch (authError.code) {
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled in Firebase Console. Enable Authentication > Sign-in method > Email/Password.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid credentials. Please try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with a different sign-in method for this email.";
    default:
      return authError.message;
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name.trim() });
    return mapFirebaseUser(credential.user);
  } catch (error) {
    console.error("Register error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(credential.user);
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser ?? (await waitForInitialAuthUser());
    return user ? mapFirebaseUser(user) : null;
  } catch {
    return null;
  }
};
