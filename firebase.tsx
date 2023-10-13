/**************************************************************

FirebaseのSDK(Sofrware Development Kit)
...Firebaseのさまざまな機能やサービス(AutherntificationやCloudFirebase)を使うための初期化

・ここではAutherntificationとCloudFirestoreを使うが、他のFirebaseのサービスを
使うなら、必要なSDKを追加していく

注意....firebase/firestore/liteは軽量版みたいなので、必ずfirebase/firestoreからインポートする

***************************************************************/
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STRAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// 初期化
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Google Analyticsの初期化

// 各機能を初期化していく
export const db = getFirestore(app); // Cloud Firestoreの初期化
export const auth = getAuth(app);    // Firestore Authentificationの初期化
