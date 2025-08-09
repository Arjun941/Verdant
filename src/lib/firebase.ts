import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBOEO0B-XRwcQuPUK1j9o6VjyjdWKFof2w",
  authDomain: "verdantview-fb36l.firebaseapp.com",
  projectId: "verdantview-fb36l",
  storageBucket: "verdantview-fb36l.appspot.com",
  messagingSenderId: "348170595700",
  appId: "1:348170595700:web:846390e76f3a2d6dc35021"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
