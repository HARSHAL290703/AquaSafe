import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB6SA5CcXV7LiBJs7BG1UItV1VhJXgDMSQ",
  authDomain: "esp32-db-1c02a.firebaseapp.com",
  databaseURL: "https://esp32-db-1c02a-default-rtdb.firebaseio.com",
  projectId: "esp32-db-1c02a",
  storageBucket: "esp32-db-1c02a.firebasestorage.app",
  messagingSenderId: "1005700315459",
  appId: "1:1005700315459:web:f8ec0425385e75316457f6"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);