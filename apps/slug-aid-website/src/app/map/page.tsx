"use client";

import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import MenuBar from "../../components/MenuBar";
import locationData from "@/location-data.json";
import { useRouter } from "next/navigation";

type latLng = {
	lat: number;
	lng: number;
};

type locationData = {
	name: string;
	location: latLng;
	image: string;
	about: string;
};

type locations = keyof typeof locationData;

const App = () => {
	const router = useRouter();

	return (
		<>
			<MenuBar />
			<APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
				<Map
					mapId="b82c189db6599c48"
					style={{ width: "100vw", height: "100vh" }}
					defaultCenter={{ lat: 36.993959, lng: -122.060942 }}
					defaultZoom={15}
					gestureHandling={"greedy"}
					disableDefaultUI={true}
				>
					{Object.keys(locationData).map((key) => {
						const facility = locationData[key as locations];
						return (
							<AdvancedMarker
								key={facility.name}
								position={{ lat: facility.location.lat, lng: facility.location.lng }}
								title={facility.name}
								clickable={true}
								onClick={() => router.push(`/locations/${key}`)}
							/>
						);
					})}
				</Map>
			</APIProvider>
		</>
	);
};

export default App;
