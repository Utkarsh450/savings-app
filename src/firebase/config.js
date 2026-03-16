import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWpnVydiCx8XvAorgWy27jqlSmpgIO22k",
  authDomain: "saving-app-a0391.firebaseapp.com",
  projectId: "saving-app-a0391",
  storageBucket: "saving-app-a0391.firebasestorage.app",
  messagingSenderId: "790446106127",
  appId: "1:790446106127:web:d4ef118f1ee7535a9be57a",
};

const app = initializeApp(firebaseConfig);
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
export default app;
