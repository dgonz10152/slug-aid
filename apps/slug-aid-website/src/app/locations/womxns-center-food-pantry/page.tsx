import { Metadata } from "next";
import PageTemplate from "@/components/layouts/PageTemplate";
import LocationData from "@/location-data.json";

export const metadata: Metadata = {
	title: "Testing Page",
	description: "TESTING",
};

const Home = () => {
	const config = LocationData["womxns-center-food-pantry"];
	return (
		<>
			<PageTemplate config={config} />
		</>
	);
};

export default Home;
