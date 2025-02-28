require("dotenv").config({ path: `../../.env` });
import { initializeApp } from "firebase/app";
import {
	addDoc,
	collection,
	doc,
	DocumentData,
	getDoc,
	getDocs,
	getFirestore,
	onSnapshot,
	setDoc,
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

const locations = [
	"the-cove",
	"womxns-center-food-pantry",
	"redwood-free-market",
	"cowell-coffee-shop",
	"produce-pop-up",
	"terry-freitas-cafe",
	"center-for-agroecology-farmstand",
	"ethnic-resource-centers-snack-pantry",
	"lionel-cantu-queer-center-food-pantry",
];

const fireApp = initializeApp(firebaseConfig);
const storage = getStorage(fireApp);
const db = getFirestore(fireApp);

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

let food: { [key: string]: string[] } = {};
let images: { [key: string]: string[] } = {};
let status: { [key: string]: string } = {};

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

//fetches the image list (urls) of any given location from firebase
async function fetchImages(location: string) {
	const folderRef = ref(storage, location);
	const result = await listAll(folderRef);
	const urlPromises = result.items.map((itemRef) => getDownloadURL(itemRef));

	// Wait for all download URLs to resolve
	const urls = await Promise.all(urlPromises);
	return urls;
}

//fetches the food list of given location from firebase
async function fetchFood(location: string) {
	const foodArr: DocumentData = [];
	const querySnapshot = await getDocs(collection(db, location));
	querySnapshot.forEach((doc) => {
		foodArr.push(doc.data().labels);
	});

	return foodArr.flat();
}

//fetches the status of any given location from firebase
async function fetchStatus(location: string) {
	let status = "";
	const queryDoc = await getDoc(doc(db, "status", location));

	if (queryDoc.exists()) {
		status = queryDoc.data().status;
	}
	return status;
}

//Updates the status cache on updated values
const statusChanged = onSnapshot(collection(db, "status"), async () => {
	const promises = locations.map(async (locationName) => {
		status[locationName] = await fetchStatus(locationName); // await the promise here
	});

	// Wait for all promises to resolve
	await Promise.all(promises);
});

//Updates the food cache on updated values
locations.forEach((location) => {
	const locationSnapshot = onSnapshot(collection(db, location), async () => {
		food[location] = await fetchFood(location);
	});
});

//gives a list of urls to the pictures for any given location
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

//gives a list of the food curently available at any given location
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

//gets the current status of any given location
app.get("/status/:parameter", async (req: Request, res: Response) => {
	const location = req.params.parameter;
	if (location in status) {
		res.json({ status: status[location] });
		return;
	}

	const data = await fetchStatus(location);

	status[location] = data;
	res.json({ status: data });
});

//gets a formatted list of all the available foods (used for the search bar)
app.get("/all-food", async (req: Request, res: Response) => {
	const transformedFoodList = Object.entries(food).flatMap(([location, items]) =>
		items.filter(Boolean).map((item) => ({
			location,
			name: item,
		}))
	);
	res.json(transformedFoodList);
});

//scans the pictures for labels and uploads the results to firebase
app.post("/scan-items", async (req: Request, res: Response) => {
	try {
		const visionKeyJson = Buffer.from(
			process.env.VISION_KEY_JSON ?? "",
			"base64"
		).toString("utf-8");
		const credentials = JSON.parse(visionKeyJson);

		const vision = require("@google-cloud/vision");
		const client = new vision.ImageAnnotatorClient({
			credentials,
		});

		const { url, location } = JSON.parse(req.headers.body as string);
		// Use await inside the async function
		const [result] = await client.objectLocalization(url);
		const labels = result.localizedObjectAnnotations;
		// Send the response with the detected labels
		uploadLabels(location, [
			...new Set(labels.map((item: any) => item.name)),
		] as string[]);

		//updates the cache to include the pictures
		images[location] = await fetchImages(location);

		res.json({ data: labels });
	} catch (error) {
		// Handle errors and send appropriate responses
		console.error(error);
		res
			.status(500)
			.json({ error: "An error occurred while processing your request." });
	}
});

app.put("/update-status/:parameter", async (req: Request, res: Response) => {
	try {
		const { message } = JSON.parse(req.headers.body as string);
		const location = req.params.parameter;
		console.log(location);
		await setDoc(doc(db, "status", location), { status: message });
		console.log("Document added/updated successfully!");
	} catch (error) {
		console.error("Error adding/updating document:", error);
	}
});

const PORT = process.env.EXPRESS_PORT || 5002;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
