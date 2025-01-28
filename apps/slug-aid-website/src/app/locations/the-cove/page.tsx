"use client";
import LocationData from "@/location-data.json";
import LocationTemplate from "@/components/layouts/LocationTemplate";
import Head from "next/head";

const Home = () => {
	const config = LocationData["the-cove"];
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
};

export default Home;
