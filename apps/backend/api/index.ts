require("dotenv").config({ path: `../../.env` });
import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import {
  FieldValue,
  getFirestore as getAdminFirestore,
} from "firebase-admin/firestore";

import {
  getStorage as getAdminStorage,
  getDownloadURL as getAdminDownloadURL,
} from "firebase-admin/storage";

declare global {
  namespace Express {
    interface Request {
      firebaseUid?: string;
    }
  }
}

// Initialize Firebase Admin SDK
const serviceAccountJson = Buffer.from(
	process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? "",
	"base64",
).toString("utf-8");

if (serviceAccountJson) {
	const serviceAccount = JSON.parse(serviceAccountJson);
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
} else {
	console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set — auth middleware will reject all requests");
}
const adminDb = getAdminFirestore();
// Parse allowed emails from env
const allowedEmailsByLocation: Record<string, string[]> = {
	"redwood-free-market": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_REDWOOD ?? "[]");
		} catch {
			return [];
		}
	})(),
	"cowell-coffee-shop": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_COWELL ?? "[]");
		} catch {
			return [];
		}
	})(),
	"produce-pop-up": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_PRODUCE ?? "[]");
		} catch {
			return [];
		}
	})(),
	"womxns-center-food-pantry": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_WOMXNS ?? "[]");
		} catch {
			return [];
		}
	})(),
	"center-for-agroecology-farmstand": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_AGROECOLOGY ?? "[]");
		} catch {
			return [];
		}
	})(),
	"lionel-cantu-queer-center-food-pantry": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_QUEER ?? "[]");
		} catch {
			return [];
		}
	})(),
	"ethnic-resource-centers-snack-pantry": (() => {
		try {
			return JSON.parse(
				process.env.ALLOWED_EMAILS_ETHNIC_RESOURCE_CENTERS ?? "[]",
			);
		} catch {
			return [];
		}
	})(),
	"terry-freitas-commons": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_TERRY_FREITAS ?? "[]");
		} catch {
			return [];
		}
	})(),
	"the-cove": (() => {
		try {
			return JSON.parse(process.env.ALLOWED_EMAILS_THE_COVE ?? "[]");
		} catch {
			return [];
		}
	})(),
};

const express = require("express");

const cors = require("cors");

const app = express();

const locations = [
	"the-cove",
	"womxns-center-food-pantry",
	"redwood-free-market",
	"cowell-coffee-shop",
	"produce-pop-up",
	"terry-freitas-commons",
	"center-for-agroecology-farmstand",
	"ethnic-resource-centers-snack-pantry",
	"lionel-cantu-queer-center-food-pantry",
];

// Provides runtime validation for the three inventory statuses accepted from API requests
const VALID_AVAILABILITY = new Set<Availability>([
	"in_stock",
	"running_out",
	"out_of_stock",
]);

app.use(
	cors({
		origin: [process.env.NEXT_PUBLIC_WEBSITE_URL, "http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], //added PATCH so it can change an existing item's availability
		credentials: true,
	}),
);

// Parse JSON request bodies
app.use(express.json());

// Auth middleware — verifies Firebase ID token and checks facility and email allowlist
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ error: "Missing or invalid Authorization header" });
		return;
	}

	

	const token = authHeader.split("Bearer ")[1];
	try {
		const decoded = await admin.auth().verifyIdToken(token);
		const email = decoded.email?.toLowerCase();
		const location = req.params.parameter || req.params.location;
		if (!location || !locations.includes(location)) {
			res.status(400).json({ error: `Invalid location: ${location}` });
			return;
		}

		const allowedEmails = allowedEmailsByLocation[location] ?? [];
		if (!email || !allowedEmails.includes(email)) {
			res.status(403).json({ error: "Forbidden access for facility"});
			return;
		}
		next();
	} catch (error) {
		console.error("Auth error:", error);
		res.status(401).json({ error: "Invalid or expired token" });
		return;
	}
}

// Add the new function here, after authMiddleware.
// 
async function userAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
	const decodedToken = await admin.auth().verifyIdToken(token);

	res.locals.firebaseUid = decodedToken.uid;

  } catch (error) {
    console.error("User authentication error:", error);

    res.status(401).json({
      error: "Invalid or expired authentication token",
    });
	return;
  }
  next();
}

// Location validation middleware — checks that the location param is valid
function validateLocation(req: Request, res: Response, next: NextFunction) {
	const location = req.params.parameter || req.params.location;
	if (!location || !locations.includes(location)) {
		res.status(400).json({ error: `Invalid location: ${location}` });
		return;
	}
	next();
}

//retricts availabilty to 3 statuses by the application
type Availability = "in_stock" | "running_out" | "out_of_stock";

//describes firestore food record with its doc ID, labels, and availability
interface FoodItem {
	id:string;
	labels: string[];
	availability: Availability;
}
let food: Record<string,FoodItem[]> = {};
let images: { [key: string]: string[] } = {};
let status: { [key: string]: { message: string; timestamp: string } } = {};

//uploads food labels to firebase
async function uploadLabels(
  location: string,
  labels: string[],
  availability: Availability = "in_stock",
): Promise<void> {
  if (!locations.includes(location)) {
    throw new Error("Invalid location");
  }

  const cleanedLabels = labels
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  if (cleanedLabels.length === 0) {
    throw new Error("At least one food label is required");
  }

  await adminDb.collection(location).add({
    labels: cleanedLabels,
    availability,
  });
}
//fetches the image list (urls) of any given location from firebase
async function fetchImages(location: string): Promise<string[]> {
  if (!locations.includes(location)) {
    throw new Error("Invalid location");
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    throw new Error("Firebase Storage bucket is not configured");
  }

  const bucket = getAdminStorage().bucket(bucketName);
  const prefix = `${location}/`;

  const [files] = await bucket.getFiles({
    prefix,
    delimiter: "/",
  });

  const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ]);

  const publicImages = files.filter((file) => {
    const relativeName = file.name.slice(prefix.length);

    return (
      relativeName.length > 0 &&
      !relativeName.includes("/") &&
      allowedImageTypes.has(file.metadata.contentType ?? "")
    );
  });

  return Promise.all(
    publicImages.map((file) => getAdminDownloadURL(file)),
  );
}

//fetches the food list with ids for a given location from firebase
async function fetchFoodWithIds(
  location: string,
): Promise<FoodItem[]> {
  // Protect this helper even when called outside a route.
  if (!locations.includes(location)) {
    throw new Error("Invalid location");
  }

  const snapshot = await adminDb.collection(location).get();

  return snapshot.docs.map((foodDoc): FoodItem => {
    const data = foodDoc.data();

    const labels: string[] = Array.isArray(data.labels)
      ? data.labels.filter(
          (label: unknown): label is string =>
            typeof label === "string",
        )
      : [];

    const availability: Availability =
      typeof data.availability === "string" &&
      VALID_AVAILABILITY.has(data.availability as Availability)
        ? (data.availability as Availability)
        : "in_stock";

    return {
      id: foodDoc.id,
      labels,
      availability,
    };
  });
}

//fetches the status of any given location from firebase
async function fetchStatus(
  location: string,
): Promise<{ message: string; timestamp: string }> {
  if (!locations.includes(location)) {
    throw new Error("Invalid location");
  }

  const snapshot = await adminDb
    .collection("status")
    .doc(location)
    .get();

  const data = snapshot.data();

  return {
    message: typeof data?.status === "string" ? data.status : "",
    timestamp:
      typeof data?.timestamp === "string" ? data.timestamp : "",
  };
}

// Refresh public status messages when their documents change.
const unsubscribeStatuses = adminDb
  .collection("status")
  .onSnapshot(
    (snapshot) => {
      const nextStatuses: typeof status = {};

      for (const statusDoc of snapshot.docs) {
        if (!locations.includes(statusDoc.id)) continue;

        const data = statusDoc.data();

        nextStatuses[statusDoc.id] = {
          message:
            typeof data.status === "string" ? data.status : "",
          timestamp:
            typeof data.timestamp === "string"
              ? data.timestamp
              : "",
        };
      }

      status = nextStatuses;
    },
    (error) => {
      console.error("Status listener failed:", error);
      status = {};
    },
  );

// Refresh each approved facility's inventory when it changes.
const unsubscribeFoods = locations.map((location) =>
  adminDb.collection(location).onSnapshot(
    (snapshot) => {
      food[location] = snapshot.docs.map((foodDoc): FoodItem => {
        const data = foodDoc.data();

        return {
          id: foodDoc.id,
          labels: Array.isArray(data.labels)
            ? data.labels.filter(
                (label: unknown): label is string =>
                  typeof label === "string",
              )
            : [],
          availability:
            typeof data.availability === "string" &&
            VALID_AVAILABILITY.has(
              data.availability as Availability,
            )
              ? (data.availability as Availability)
              : "in_stock",
        };
      });
    },
    (error) => {
      console.error(`Inventory listener failed for ${location}:`, error);
      delete food[location];
    },
  ),
);

//gives a list of urls to the pictures for any given location
app.get(
  "/images/:parameter",
  validateLocation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const urls = await fetchImages(req.params.parameter);

      res.status(200).json({ urls });
    } catch (error) {
      console.error("Failed to load inventory images:", error);

      res.status(500).json({
        error: "Failed to load inventory images",
      });
    }
  },
);

//gives a list of the food curently available at any given location
app.get("/food/:parameter", validateLocation, async (req: Request, res: Response) => {
	const location = req.params.parameter;
	if (location in food) {
		res.json({ food: food[location] });
		return;
	}

	const data = await fetchFoodWithIds(location);

	food[location] = data;
	res.json({ food: data });
});

//gives a list of the food with ids for a given location
app.get("/food-ids/:parameter", validateLocation, async (req: Request, res: Response) => {
	const location = req.params.parameter;
	const data = await fetchFoodWithIds(location);
	res.json({ food: data });
});

//gets the current status of any given location
app.get("/status/:parameter", validateLocation, async (req: Request, res: Response) => {
	const location = req.params.parameter;
	if (location in status) {
		res.json({ status: status[location] });
		return;
	}

	const data = await fetchStatus(location);

	status[location] = data;
	res.json({ status: data });
});

app.get("/debug-routes", async (req: Request, res: Response) => {
	res.status(200).json({ ok: true });
});

//gets a formatted list of all the available foods (used for the search bar)
app.get("/all-food", async (req: Request, res: Response) => {
	console.log(Object.keys(food).length === 0);

	if (Object.keys(food).length === 0) {
		// Fetch all locations in parallel and wait for them to complete
		await Promise.all(
			locations.map(async (location) => {
				food[location] = await fetchFoodWithIds(location);
			}),
		);
	}

	// Transform the food data into the expected response format
	const transformedFoodList = Object.entries(food).flatMap(([location, items]) =>
		items.filter(Boolean).map((item) => ({
			location,
			name: item,
		})),
	);

	res.json(transformedFoodList);
});

//scans the pictures for labels and uploads the results to firebase
app.post("/scan-items/:parameter", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	try {
		const visionKeyJson = Buffer.from(
			process.env.VISION_KEY_JSON ?? "",
			"base64",
		).toString("utf-8");
		const credentials = JSON.parse(visionKeyJson);

		const vision = require("@google-cloud/vision");
		const client = new vision.ImageAnnotatorClient({
			credentials,
		});
		const location = req.params.parameter;
		const url: unknown = req.body?.url;

		if (typeof url !== "string" || url.trim().length === 0) {
		res.status(400).json({ error: "An image URL is required." });
		return;
		}
		// Use await inside the async function
		const [result] = await client.objectLocalization(url);
		const labels = result.localizedObjectAnnotations;
		// Send the response with the detected labels
		await uploadLabels(location, [
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
app.post("/scan-pdf/:parameter", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	try {
		const location = req.params.parameter;
		const objectPath: unknown = req.body?.objectPath;
		const prefix = `${location}/pdfs/`;

		if (
		typeof objectPath !== "string" ||
		!objectPath.startsWith(prefix)
		) {
		res.status(400).json({ error: "Invalid PDF location." });
		return;
		}

		const filename = objectPath.slice(prefix.length);

		if (
		!filename ||
		filename.includes("/") ||
		filename.includes("\\") ||
		!filename.toLowerCase().endsWith(".pdf")
		) {
		res.status(400).json({ error: "Invalid PDF filename." });
		return;
		}

		const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

		if (!bucketName) {
		throw new Error("Firebase Storage bucket is not configured");
		}

		const pdfFile = getAdminStorage()
		.bucket(bucketName)
		.file(objectPath);

		const [metadata] = await pdfFile.getMetadata();

		// A chosen application limit; adjust later if necessary.
		const MAX_PDF_BYTES = 10 * 1024 * 1024;
		const size = Number(metadata.size);

		if (metadata.contentType !== "application/pdf") {
		res.status(400).json({ error: "The file must be a PDF." });
		return;
		}

		if (!Number.isFinite(size) || size <= 0 || size > MAX_PDF_BYTES) {
		res.status(413).json({ error: "PDF must be between 1 byte and 10 MB." });
		return;
		}

		// Enforce the limit while reading too, in case the file changes.
		const stream = pdfFile.createReadStream();
		const chunks: Buffer[] = [];
		let totalBytes = 0;

		const timeout = setTimeout(() => {
		stream.destroy(new Error("PDF download timed out"));
		}, 15_000);

		try {
		for await (const chunk of stream) {
			const buffer = Buffer.isBuffer(chunk)
			? chunk
			: Buffer.from(chunk);

			totalBytes += buffer.length;

			if (totalBytes > MAX_PDF_BYTES) {
			res.status(413).json({ error: "PDF exceeds 10 MB." });
			return;
			}

			chunks.push(buffer);
		}
		} finally {
		clearTimeout(timeout);
		stream.destroy();
		}

		const pdfBuffer = Buffer.concat(chunks);

		if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
		res.status(400).json({ error: "Invalid PDF file." });
		return;
		}
		console.log("PDF buffer size:", pdfBuffer.length);

		// Use pdf-parse to extract text content from the PDF
		const pdfParse = require("pdf-parse");
		const pdfData = await pdfParse(pdfBuffer);
		const text = pdfData.text;
		console.log("PDF text length:", text.length);

		// Split text into lines and clean them
		const lines = text
			.split("\n")
			.map((line: string) => line.trim())
			.filter((line: string) => line.length > 0);

		// Extract item descriptions using pattern matching
		const itemDescriptions = extractItemDescriptions(lines);

		console.log("Extracted item descriptions:", itemDescriptions);

		if (itemDescriptions.length === 0) {
			return res.status(200).json({
				message: "No food items found in PDF.",
				items: [],
			});
		}

		return res.json({
			items: itemDescriptions,
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: "An error occurred while processing the PDF." });
	}
});

function normalizeFoodName(name: string): string {
  return name
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

app.post("/scan-pdf-confirm/:parameter", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	try {
		const location = req.params.parameter;
		const items: unknown = req.body?.items;

      // Application limits: at most 100 names per submission.
      if (
        !Array.isArray(items) ||
        items.length === 0 ||
        items.length > 100
      ) {
        return res.status(400).json({
          error: "Submit between 1 and 100 food names.",
        });
      }

      const cleanedItems: string[] = [];

      for (const item of items) {
        if (typeof item !== "string") {
          return res.status(400).json({
            error: "Each food name must be text.",
          });
        }

        const name = item.trim().replace(/\s+/g, " ");

        if (!name || name.length > 300) {
          return res.status(400).json({
            error: "Food names must contain 1–300 characters.",
          });
        }

        cleanedItems.push(name);
      }

      const inventoryRef = adminDb.collection(location);

      // A private coordination document for this facility's PDF saves.
      const lockRef = adminDb
        .collection("_inventoryImportLocks")
        .doc(location);

      const result = await adminDb.runTransaction(async (transaction) => {
        // Perform all reads before writes.
        await transaction.get(lockRef);
        const inventory = await transaction.get(inventoryRef);

        const seenNames = new Set<string>();

        for (const document of inventory.docs) {
          const labels: unknown = document.data().labels;

          if (
            !Array.isArray(labels) ||
            !labels.every((label: unknown) => typeof label === "string")
          ) {
            throw new Error("Existing inventory has invalid labels.");
          }

          seenNames.add(normalizeFoodName(labels.join(", ")));
        }

        const added: string[] = [];
        const skipped: string[] = [];

        for (const name of cleanedItems) {
          const key = normalizeFoodName(name);

          if (seenNames.has(key)) {
            skipped.push(name);
            continue;
          }

          // Also prevents duplicates within this submission.
          seenNames.add(key);
          added.push(name);
        }

        // Every PDF confirmation coordinates through this document.
        transaction.set(lockRef, {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        for (const name of added) {
          transaction.create(inventoryRef.doc(), {
            labels: [name],
            availability: "in_stock",
          });
        }

        return { added, skipped };
      });

      // A cache-refresh failure must not report a successful save as failed.
      try {
        food[location] = await fetchFoodWithIds(location);
      } catch (cacheError) {
        delete food[location];
        console.error("Inventory saved, but cache refresh failed:", cacheError);
      }

      return res.status(200).json({
        uploaded: result.added.length,
        skipped: result.skipped.length,
        items: result.added,
        skippedItems: result.skipped,
      });
    } catch (error) {
      console.error("Error confirming PDF items:", error);
      return res.status(500).json({
        error: "Failed to save approved PDF items.",
      });
    }
  }
);

function extractItemDescriptions(lines: string[]): string[] {
  const descriptions: string[] = [];
  let parts: string[] = [];
  let readingDescription = false;

  const finishItem = () => {
    const description = parts
      .join(" ")
      // Remove packaging information, such as 24/4.5 oz.
      .replace(/\b\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\b.*$/, "")
      // Remove category prefixes only when they are whole words.
      .replace(/^(?:SC|Veg|Bevg|SS)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();

    if (description.length > 2) {
      descriptions.push(description);
    }

    parts = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Handles both "340011Chicken..." and "340011 Chicken...".
    const itemStart = line.match(/^(\d{6})(?=\D|$)\s*(.*)$/);

    let text: string;

    if (itemStart) {
      finishItem();
      readingDescription = true;
      text = itemStart[2];
    } else {
      if (!readingDescription) continue;
      text = line;
    }

    // The extracted PDF merges quantities and units:
    // "150LB..." or "60CASE...".
    const quantityColumn = text.search(
      /\d+(?:\.\d+)?\s*(?:CASE|LB|LBS|EACH)\b/i
    );

    if (quantityColumn !== -1) {
      const descriptionPart = text.slice(0, quantityColumn).trim();

      if (descriptionPart) {
        parts.push(descriptionPart);
      }

      readingDescription = false;
    } else {
      parts.push(text);
    }
  }

  finishItem();
  return descriptions;
}

function cleanDescription(rawDescription: string): string {
	let description = rawDescription;

	// First, remove any leading item numbers (6 digits)
	description = description.replace(/^\d{6}/, "").trim();

	// Remove common prefixes (without requiring space after)
	description = description
		.replace(/^(Veg|SC|Bevg|Bread|Raleys)/i, "") // Remove category prefixes
		.trim();

	// Stop at quantity indicators (numbers followed by units or slashes)
	const stopPatterns = [
		/\d+\/\d+/, // "12/16", "24/1"
		/\d+\s+(oz|lb|lbs|case|each)/i, // "16 oz", "1 lb"
		/\d+\s+\d+/, // "120 0"
		/\b(LB|CASE|EACH)\b/i, // Unit indicators
	];

	for (const pattern of stopPatterns) {
		const match = description.match(pattern);
		if (match) {
			description = description.substring(0, match.index).trim();
			break;
		}
	}

	// Remove trailing numbers and common suffixes
	description = description
		.replace(/\s+\d+$/, "") // Remove trailing numbers
		.replace(/\s+(dry|refrigerated|food)$/i, "") // Remove storage type
		.trim();

	// Normalize spacing and clean up
	description = description.replace(/\s+/g, " ").trim();

	// Handle specific cases where text got concatenated
	if (description.includes("Spagehtti")) {
		description = description.replace("Pasta Spagehtti", "Pasta Spaghetti");
	}

	return description;
}

function extractFoodItemsFallback(lines: string[]): string[] {
	const descriptions: string[] = [];

	// Food-related keywords for fallback detection
	const foodKeywords = [
		"kale",
		"cucumber",
		"peanut butter",
		"beans",
		"pasta",
		"spaghetti",
		"tomato",
		"sauce",
		"tuna",
		"onion",
		"potato",
		"turmeric",
		"lemonade",
		"bread",
		"chili",
		"rice",
		"green beans",
		"mushroom",
		"vegetable",
		"veg",
	];

	// Headers and non-food terms to exclude
	const excludeTerms = [
		"item",
		"description",
		"order",
		"qty",
		"accepted",
		"uom",
		"gross",
		"weight",
		"unit",
		"price",
		"packaging",
		"type",
		"pack",
		"size",
		"handling",
		"requirements",
		"shopping",
		"cart",
		"summary",
		"total",
		"due",
		"line",
		"items",
		"cube",
		"techbridge",
		"copyright",
		"terms",
		"condition",
		"privacy",
		"policy",
		"appointment",
		"reference",
		"number",
		"pickup",
		"delivery",
		"deliver",
		"date",
		"time",
		"comment",
		"agency",
		"express",
		"aws",
		"cloud",
		"https",
		"www",
		"agencyexpress",
	];

	for (const line of lines) {
		// Skip if line contains exclude terms
		if (
			excludeTerms.some((term) => line.toLowerCase().includes(term.toLowerCase()))
		) {
			continue;
		}

		// Skip if line is mostly numbers or currency
		if (/^\d+(\.\d{2})?$/.test(line) || /\$\d+\.\d{2}/.test(line)) {
			continue;
		}

		// Check if line contains food keywords
		if (
			foodKeywords.some((keyword) =>
				line.toLowerCase().includes(keyword.toLowerCase()),
			)
		) {
			const cleaned = cleanDescription(line);
			if (cleaned && cleaned.length > 2) {
				descriptions.push(cleaned);
			}
		}
	}

	return descriptions;
}

app.put(
  "/update-status/:parameter",
  authMiddleware,
  validateLocation,
  async (req: Request, res: Response): Promise<void> => {
    const message: unknown = req.body?.message;
    const location = req.params.parameter;

    if (typeof message !== "string") {
      res.status(400).json({
        error: "Status message must be text.",
      });
      return;
    }

    try {
      await adminDb.collection("status").doc(location).set({
        status: message.trim(),
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to update facility status:", error);

      res.status(500).json({
        error: "Failed to update facility status.",
      });
    }
  },
);

//rejects messy values before writing to Firestore
app.put("/update-food/:parameter", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	try {
		const { 
			message,
			availability = "in_stock", 
		}: {
			message?: unknown;
			availability?: unknown;
		} = req.body;
		console.log(message);
		const location = req.params.parameter;
		console.log(location);

		if (
			!Array.isArray(message) ||
			message.length === 0 ||
			!message.every(
				(label) =>
					typeof label === "string" &&
					label.trim().length > 0
			)
		) {
			return res.status(400).json({
				error: "At least one valid food label is required.",
			});
		}

		if (
			typeof availability !== "string" ||
			!VALID_AVAILABILITY.has(
				availability as Availability
			)
		) {
			return res.status(400).json({
				error: "Invalid availability value.",
			});
		}

		const labels = message.map((label: string) =>
		label.trim().replace(/\s+/g, " ")
		);

		// Match the displayed name, consistent with PDF duplicate checks.
		const normalizedName = normalizeFoodName(labels.join(", "));

		const inventoryRef = adminDb.collection(location);

		// Use the SAME coordination document as PDF confirmations.
		const lockRef = adminDb
		.collection("_inventoryImportLocks")
		.doc(location);

		const added = await adminDb.runTransaction(async (transaction) => {
		// Complete all reads before any writes.
		await transaction.get(lockRef);
		const inventory = await transaction.get(inventoryRef);

		let duplicate = false;

		for (const document of inventory.docs) {
			const existingLabels: unknown = document.data().labels;

			if (
			!Array.isArray(existingLabels) ||
			!existingLabels.every(
				(label: unknown) => typeof label === "string"
			)
			) {
			throw new Error("Existing inventory has invalid labels.");
			}

			const existingName = normalizeFoodName(
			existingLabels.join(", ")
			);

			if (existingName === normalizedName) {
			duplicate = true;
			}
		}

		transaction.set(lockRef, {
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		});

		if (duplicate) {
			return false;
		}

		transaction.create(inventoryRef.doc(), {
			labels,
			availability,
		});

		return true;
		});

		if (!added) {
		return res.status(409).json({
			success: false,
			error: "This food item already exists in this facility.",
		});
		}

		return res.status(200).json({
		success: true,
		message: "Food item added.",
		});
	} catch (error) {
		console.error("Error adding/updating document:", error);
		res.status(500).json({ error: "Failed to update food" });
	}
});

//updated only the availability of an existing authenticated food record
app.patch("/food/:location/:id/availability", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	try {
			const { location, id } = req.params;
			const {
				availability,
			}: {
				availability?: unknown;
			} = req.body;

			if (
				typeof availability !== "string" || !VALID_AVAILABILITY.has(availability as Availability
				)
			) {
				return res.status(400).json({
					error: "Invalid availability value.",
				});
			}
			const foodReference = adminDb.collection(location).doc(id);
			//prevents an uodated from accidentally creating a nonexistent food item
			const existingFood = await foodReference.get();
			if (!existingFood.exists) {
				return res.status(404).json({
					error: "Food item not found.",
				});
			}
			//merges the new availability into the document without replacing its existing labels
			await foodReference.update({ availability });

			return res.status(200).json({
				success: true,
				id,
				availability,
			});
		} catch (error) {
			console.error("Error updating food availability:", error);

			return res.status(500).json({
				error: "Failed to update food availability.",
			});
		}
	}
);

// DELETE a food document by id for a given location
app.delete("/food/:location/:id", authMiddleware, validateLocation, async (req: Request, res: Response) => {
	const { location, id } = req.params;
	try {
		await adminDb.collection(location).doc(id).delete();
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error deleting food document:", error);
		res.status(500).json({ error: "Failed to delete food documents" });
	}
});

// Ensures propper port usage
const PORT = process.env.EXPRESS_PORT || 3022;
app.put(
  "/favorites/:location/:foodId",
  userAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = res.locals.firebaseUid as string | undefined;
    const { location, foodId } = req.params;

    if (!firebaseUid) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!locations.includes(location)) {
      res.status(400).json({
        error: `Invalid location: ${location}`,
      });
      return;
    }

    try {
      // Confirm that the food item really exists.
      const foodReference = adminDb
        .collection(location)
        .doc(foodId);

      const foodSnapshot = await foodReference.get();

      if (!foodSnapshot.exists) {
        res.status(404).json({
          error: "Food item not found",
        });
        return;
      }

      const foodData = foodSnapshot.data();

      const labels = Array.isArray(foodData?.labels)
        ? foodData.labels.filter(
            (label): label is string =>
              typeof label === "string",
          )
        : [];

      // Location is included because Firestore IDs are scoped
      // to their collection.
      const favoriteId = `${location}__${foodId}`;

      const favoriteReference = adminDb
        .collection("users")
        .doc(firebaseUid)
        .collection("favorites")
        .doc(favoriteId);

      const existingFavorite =
        await favoriteReference.get();

      if (!existingFavorite.exists) {
        await favoriteReference.set({
          locationId: location,
          foodId,
          labels,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      res.status(200).json({
        locationId: location,
        foodId,
        isFavorite: true,
      });
    } catch (error) {
      console.error("Failed to save favorite:", error);

      res.status(500).json({
        error: "Failed to save favorite",
      });
    }
  },
);

app.delete(
  "/favorites/:location/:foodId",
  userAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = res.locals.firebaseUid as
      | string
      | undefined;

    const { location, foodId } = req.params;

    if (!firebaseUid) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!locations.includes(location)) {
      res.status(400).json({
        error: `Invalid location: ${location}`,
      });
      return;
    }

    try {
      const favoriteId = `${location}__${foodId}`;

      const favoriteReference = adminDb
        .collection("users")
        .doc(firebaseUid)
        .collection("favorites")
        .doc(favoriteId);

      await favoriteReference.delete();

      res.status(200).json({
        locationId: location,
        foodId,
        isFavorite: false,
      });
    } catch (error) {
      console.error("Failed to remove favorite:", error);

      res.status(500).json({
        error: "Failed to remove favorite",
      });
    }
  },
);

app.get(
  "/favorites/:location",
  userAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = res.locals.firebaseUid as
      | string
      | undefined;

    const { location } = req.params;

    if (!firebaseUid) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (!locations.includes(location)) {
      res.status(400).json({
        error: `Invalid location: ${location}`,
      });
      return;
    }

    try {
      const favoritesSnapshot = await adminDb
        .collection("users")
        .doc(firebaseUid)
        .collection("favorites")
        .where("locationId", "==", location)
        .get();

      const favoriteFoodIds = favoritesSnapshot.docs
        .map((favoriteDocument) => {
          const data = favoriteDocument.data();
          return typeof data.foodId === "string"
            ? data.foodId
            : null;
        })
        .filter(
          (foodId): foodId is string => foodId !== null,
        );

      res.status(200).json({
        locationId: location,
        favoriteFoodIds,
      });
    } catch (error) {
      console.error("Failed to load favorites:", error);

      res.status(500).json({
        error: "Failed to load favorites",
      });
    }
  },
);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;
