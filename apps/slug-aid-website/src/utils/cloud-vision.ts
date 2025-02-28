async function fetchData({ url, location }: { url: string; location: string }) {
	try {
		const response = await fetch(`/api/scan-items`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				body: JSON.stringify({ url: url, location: location }),
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

export default async function analyzeImage({
	url,
	location,
}: {
	url: string;
	location: string;
}) {
	console.log(await fetchData({ url: url, location: location }));
}
