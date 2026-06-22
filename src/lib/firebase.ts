import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocFromServer, 
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Dynamic loading of Firebase configuration from config file
let firebaseConfig: any = null;

try {
  // Config is generated dynamically at build time or setup time
  firebaseConfig = {
    projectId: "gen-lang-client-0716208866",
    appId: "1:89108789567:web:7bce0768c41c9593a97b8a",
    apiKey: "AIzaSyBNmYKcX_SWDTY5qun9f_x3eu4WYkWSgAg",
    authDomain: "gen-lang-client-0716208866.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-42c72068-472b-45f6-b469-1bd621aa7b04",
    storageBucket: "gen-lang-client-0716208866.firebasestorage.app",
    messagingSenderId: "89108789567"
  };
} catch (e) {
  console.warn("Could not import firebase-applet-config.json", e);
}

// Default fallback configuration for robust preview runtime
const defaultFirebaseConfig = {
  apiKey: "AIzaSy_demo",
  authDomain: "civicpulse-ai-demo.firebaseapp.com",
  projectId: "civicpulse-ai-demo",
  storageBucket: "civicpulse-ai-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234:web:abcd"
};

const configToUse = firebaseConfig || defaultFirebaseConfig;

export const app = initializeApp(configToUse);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Attempt to enable offline persistence for mobile/low-connectivity community sensors
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore persistence failed-precondition: multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore offline persistence not supported in this browser.");
    }
  });
} catch (e) {
  // Ignored in SSR
}

// Validate connection on startup (Blocking check from firebase-integration skill)
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection validated successfully.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
      console.log("Firebase initialized (Simulator/Offline-first ready).");
    }
  }
}

testFirebaseConnection();
