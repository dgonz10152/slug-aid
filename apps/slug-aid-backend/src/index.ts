import { Request, Response } from "express";
import { json } from "stream/consumers";
require("dotenv").config({ path: `../../.env` });

const express = require("express");
const cors = require("cors");

const app = express();
const apiKey = process.env.GOOGLE_API_KEY;

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

app.post("/get-items", async (req: Request, res: Response) => {
	console.log("Request Body:", req.headers.body);
	try {
		const { GoogleAuth } = require("google-auth-library");
		const auth = new GoogleAuth({ apiKey });

		const vision = require("@google-cloud/vision");
		const client = new vision.ImageAnnotatorClient({
			keyFilename: "./vision-key.json",
		});

		const { url } = JSON.parse(req.headers.body as string);
		// Use await inside the async function
		const [result] = await client.labelDetection(url);
		const labels = result.labelAnnotations;

		// Send the response with the detected labels
		res.json({ data: labels });
	} catch (error) {
		// Handle errors and send appropriate responses
		console.error(error);
		res
			.status(500)
			.json({ error: "An error occurred while processing your request." });
	}
});

const PORT = process.env.EXPRESS_PORT || 5002;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
