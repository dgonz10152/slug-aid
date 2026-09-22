import { auth } from "./firebase-config";

async function fetchData({ url, location }: { url: string; location: string }) {
	try {
		const token = await auth.currentUser?.getIdToken();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/scan-items/${encodeURIComponent(location)}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify({ url }),
			}
		);

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

export default async function analyzeImage({
	url,
	location,
}: {
	url: string;
	location: string;
}) {
	console.log(await fetchData({ url, location }));
}
