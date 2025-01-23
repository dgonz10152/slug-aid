// import * as vision from "@google-cloud/vision";

// const CONFIG = {
// 	credentials: {
// 		private_key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
// 		client_email: process.env.NEXT_PUBLIC_CLOUD_EMAIL,
// 	},
// };
async function fetchData(url: string) {
	try {
		const response = await fetch(`http://localhost:3001/get-items`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				body: JSON.stringify({ url: url }),
			},
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

export default async function analyzeImage() {
	// const client = new vision.ImageAnnotatorClient(CONFIG);
	// const [result] = await client.labelDetection("public/betrfood.png");
	// const labels = result.labelAnnotations;
	// console.log(labels);
	console.log(
		await fetchData(
			"https://cdn.britannica.com/79/232779-050-6B0411D7/German-Shepherd-dog-Alsatian.jpg"
		)
	);
}
