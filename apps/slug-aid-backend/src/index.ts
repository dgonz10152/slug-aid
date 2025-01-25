require("dotenv").config({ path: `../../.env` });
import { initializeApp } from "firebase/app";
import {
	addDoc,
	collection,
	DocumentData,
	getDocs,
	getFirestore,
} from "firebase/firestore";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
import { Request, Response } from "express";
const express = require("express");
const cors = require("cors");

const app = express();
const apiKey = process.env.GOOGLE_API_KEY;

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const fireApp = initializeApp(firebaseConfig);
const storage = getStorage(fireApp);
const db = getFirestore(fireApp);

//uploads food labels to firebase
async function uploadLabels(location: string, labels: string[]) {
	console.log(location);
	try {
		await addDoc(collection(db, location), { labels: labels });
		console.log("Document added successfully!");
	} catch (error) {
		console.error("Error adding document:", error);
	}
}

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

//scans the pictures for labels and uploads the results to firebase
app.post("/scan-items", async (req: Request, res: Response) => {
	console.log("Request Body:", req.headers.body);
	try {
		const { GoogleAuth } = require("google-auth-library");
		const auth = new GoogleAuth({ apiKey });

		const vision = require("@google-cloud/vision");
		const client = new vision.ImageAnnotatorClient({
			keyFilename: "./vision-key.json",
		});

		const { url, location } = JSON.parse(req.headers.body as string);
		// Use await inside the async function
		const [result] = await client.objectLocalization(url);
		const labels = result.localizedObjectAnnotations;
		// Send the response with the detected labels

		uploadLabels(location, [
			...new Set(labels.map((item: any) => item.name)),
		] as string[]);

		res.json({ data: labels });
	} catch (error) {
		// Handle errors and send appropriate responses
		console.error(error);
		res
			.status(500)
			.json({ error: "An error occurred while processing your request." });
	}
});

let food: { [key: string]: string[] } = {};
let images: { [key: string]: string[] } = {};

async function fetchImages(location: string) {
	const folderRef = ref(storage, location);
	const result = await listAll(folderRef);
	const urlPromises = result.items.map((itemRef) => getDownloadURL(itemRef));

	// Wait for all download URLs to resolve
	const urls = await Promise.all(urlPromises);
	return urls;
}

async function fetchFood(location: string) {
	const foodArr: DocumentData = [];
	const querySnapshot = await getDocs(collection(db, location));
	querySnapshot.forEach((doc) => {
		foodArr.push(doc.data().labels);
	});

	return foodArr.flat();
}

setInterval(() => {
	const currentHour = new Date(Date.now()).getHours();
	if (currentHour > 9 && currentHour < 24) console.log("INTERVAL");
	for (const key in food) {
		console.log("Food:", key);
		fetchFood(key);
	}
	for (const key in images) {
		console.log("Images:", key);
		fetchImages(key);
	}
}, 1800000);

app.get("/images/:parameter", async (req: Request, res: Response) => {
	const location = req.params.parameter;

	if (location in images) {
		res.json({ urls: images[location] });
		return;
	}

	const data = await fetchImages(location);

	images[location] = data;
	res.json({ urls: data });
});

const now = Date.now();
const date = new Date(now);

console.log(date.getHours());

app.get("/food/:parameter", async (req: Request, res: Response) => {
	const location = req.params.parameter;
	if (location in food) {
		res.json({ food: food[location] });
		return;
	}

	const data = await fetchFood(location);

	food[location] = data;
	res.json({ food: data });
});

app.get("/all-food", async (req: Request, res: Response) => {
	const transformedFoodList = Object.entries(food).flatMap(([location, items]) =>
		items.filter(Boolean).map((item) => ({
			location,
			name: item,
		}))
	);
	res.json(transformedFoodList);
});

const PORT = process.env.EXPRESS_PORT || 5002;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
