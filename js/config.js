import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVURaHDAtvAwkyckgNEidpV2QouqVPEuc",
  authDomain: "etc-basic.firebaseapp.com",
  projectId: "etc-basic",
  storageBucket: "etc-basic.firebasestorage.app",
  messagingSenderId: "570513265064",
  appId: "1:570513265064:web:11418947fb51a4e3864d9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };