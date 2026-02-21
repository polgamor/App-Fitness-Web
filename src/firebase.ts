import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, writeBatch } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  applyActionCode
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBzX8TKYHoXc1x1AmrdA1tJLO5XuM_amJM",
  authDomain: "fitnessapp-cb7f1.firebaseapp.com",
  projectId: "fitnessapp-cb7f1",
  storageBucket: "fitnessapp-cb7f1.appspot.com",
  messagingSenderId: "526928917348",
  appId: "1:526928917348:web:f57e5dc743bcaa50320071"
};

const initializeFirebase = () => {
  try {
    const oldApp = initializeApp({}, 'oldApp');
    deleteApp(oldApp);
  } catch (e) {
    console.log("No hay instancias previas que limpiar");
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app); 

  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error configurando persistencia:", error);
    });

  return { app, auth, db, storage }; 
};

const actionCodeSettings = {
  // URL you want to redirect back to after verification
  url: '', // Replace with your production URL
  // This must be true for production apps
  handleCodeInApp: true,
};

const { app, auth, db, storage } = initializeFirebase();

export { 
  auth,
  db,
  storage, 
  writeBatch,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  applyActionCode,
  actionCodeSettings
};