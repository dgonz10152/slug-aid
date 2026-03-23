"use client";
import LocationData from "@/location-data.json";
import LocationTemplate from "@/components/layouts/LocationTemplate";
import Head from "next/head";
import { useParams } from "next/navigation";

export default function Page() {
	const params = useParams();
	const id = params.id;
	const locationKey = Array.isArray(id) ? id[0] : id;

	if (!locationKey || !(locationKey in LocationData)) {
		return <p>Location not found</p>;
	}

	const config = LocationData[locationKey as keyof typeof LocationData];

	console.log(config.hours.monday);
	return (
		<>
			<Head>
				<title>The Cove</title>
				<meta name="description" content={config.about} />
			</Head>
			{config ? <LocationTemplate config={config} /> : <></>}
		</>
	);
}
