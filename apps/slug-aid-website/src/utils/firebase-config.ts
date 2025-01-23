import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const dataBase = getFirestore(app);
const storage = getStorage(app);

// Analytics Initialization
let analytics: Analytics;
if (typeof window !== "undefined") {
	isSupported()
		.then((supported) => {
			if (supported) {
				analytics = getAnalytics(app);
				console.log("Firebase Analytics initialized");
			} else {
				console.warn("Firebase Analytics is not supported in this environment.");
			}
		})
		.catch((err) => {
			console.error("Error initializing Firebase Analytics:", err);
		});
}

export { dataBase, storage, analytics };
