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
	deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage";
import { Request, Response } from "express";

const express = require("express");

const cors = require("cors");

const app = express();

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

// Parse JSON request bodies
app.use(express.json());

let food: { [key: string]: { id: string; labels: string[] }[] } = {};
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

//fetches the food list with ids for a given location from firebase
async function fetchFoodWithIds(location: string) {
	const foodArr: { id: string; labels: string[] }[] = [];
	const querySnapshot = await getDocs(collection(db, location));
	querySnapshot.forEach((doc) => {
		foodArr.push({ id: doc.id, labels: doc.data().labels });
	});
	return foodArr;
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
		food[location] = await fetchFoodWithIds(location);
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

//gives a list of the food with ids for a given location
app.get("/food-ids/:parameter", async (req: Request, res: Response) => {
	const location = req.params.parameter;
	const data = await fetchFoodWithIds(location);
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
	console.log(Object.keys(food).length === 0);

	if (Object.keys(food).length === 0) {
		// Fetch all locations in parallel and wait for them to complete
		const results = await Promise.all(
			locations.map(async (location) => {
				const data = await fetchFood(location);
				food[location] = data;
				return { location, data };
			})
		);
	}

	// Transform the food data into the expected response format
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

//scans a PDF for item descriptions and uploads them to firebase
app.post("/scan-pdf", async (req: Request, res: Response) => {
	try {
		const { url, location } = req.body;
		if (!url || !location) {
			return res.status(400).json({ error: "Missing url or location" });
		}

		// Download the PDF file
		const axios = require("axios");
		const pdfBuffer = (await axios.get(url, { responseType: "arraybuffer" }))
			.data;
		console.log("PDF buffer size:", pdfBuffer.length);

		// Use @pomgui/pdf-tables-parser to extract tables from the PDF
		const { PdfDocument } = require("@pomgui/pdf-tables-parser");
		const pdfDoc = new PdfDocument();
		await pdfDoc.load(pdfBuffer);
		// Extract all rows from all tables on all pages
		const rows: any[][] = [];
		for (const page of pdfDoc.pages) {
			for (const table of page.tables) {
				rows.push(...table.data);
			}
		}

		// Find the index of the Description column and the header row index
		let descriptionColIndex = -1;
		let headerRowIndex = -1;
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const idx = row.findIndex(
				(cell: any) => typeof cell === "string" && /description/i.test(cell)
			);
			if (idx !== -1) {
				descriptionColIndex = idx;
				headerRowIndex = i;
				break;
			}
		}

		if (descriptionColIndex === -1) {
			return res
				.status(200)
				.json({ message: "No Description column found in PDF." });
		}

		// List of keywords/phrases to exclude if found anywhere in the description
		const excludeKeywords = [
			"techbridge",
			"copyright",
			"terms",
			"condition",
			"privacy",
			"policy",
		];

		// Extract the Description column from each row *after* the header row
		const itemDescriptions = rows
			.slice(headerRowIndex + 1)
			.map((row: any[]) => {
				const cell = row[descriptionColIndex];
				return typeof cell === "string" ? cell : undefined;
			})
			.filter(
				(desc: string | undefined): desc is string =>
					!!desc &&
					desc.length > 2 &&
					!excludeKeywords.some((word) => desc.toLowerCase().includes(word))
			);

		// Clean descriptions: remove whitespace unless the next character is a capital letter
		const cleanedDescriptions = itemDescriptions.map((desc) =>
			desc.replace(/\s+(?![A-Z])/g, "")
		);

		console.log("Extracted Description column:", cleanedDescriptions);

		if (cleanedDescriptions.length === 0) {
			return res.status(200).json({ message: "No items found in PDF." });
		}

		for (const desc of cleanedDescriptions) {
			await uploadLabels(location, [desc]);
		}

		food[location] = await fetchFoodWithIds(location);

		res.json({
			uploaded: cleanedDescriptions.length,
			items: cleanedDescriptions,
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: "An error occurred while processing the PDF." });
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
	res.status(200).json({ success: true });
});

app.put("/update-food/:parameter", async (req: Request, res: Response) => {
	try {
		const { message } = req.body;
		console.log(message);
		const location = req.params.parameter;
		console.log(location);
		await addDoc(collection(db, location), { labels: message });
		console.log("Document added/updated successfully!");
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error adding/updating document:", error);
		res.status(500).json({ error: "Failed to update food" });
	}
});

// DELETE a food document by id for a given location
app.delete("/food/:location/:id", async (req: Request, res: Response) => {
	const { location, id } = req.params;
	try {
		await deleteDoc(doc(db, location, id));
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error deleting food document:", error);
		res.status(500).json({ error: "Failed to delete food document" });
	}
});

module.exports = app;
