"use client";

import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import MenuBar from "../../components/MenuBar";
import locationData from "@/location-data.json";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import Image from "next/image";

type locations = keyof typeof locationData;

interface LocationProps {
	open: boolean;
	onClose: (value: string) => void;
}

interface LocationInterface {
	location: keyof typeof locationData;
}

const App = () => {
	// const router = useRouter();
	const [open, setOpen] = useState(false);
	const [location, setLocation] =
		useState<keyof typeof locationData>("the-cove");

	function onClose() {
		setOpen(false);
	}

	function handleClick({ location }: LocationInterface) {
		setLocation(location);
		setOpen(true);
		console.log(location);
	}

	function LocationPopup({ open, onClose }: LocationProps) {
		const currentLocation = locationData[location];
		const router = useRouter();

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>{currentLocation.name as string}</DialogTitle>
				<Image
					src={currentLocation.image}
					width={10000}
					height={300}
					alt={currentLocation.name + " Picture"}
				/>
				<DialogContent>
					<Typography>{currentLocation.about}</Typography>
				</DialogContent>
				<Button
					sx={{ margin: 3, font: "lato" }}
					variant="contained"
					onClick={() => router.push(`/locations/${currentLocation.dbName}`)}
				>
					More
				</Button>
			</Dialog>
		);
	}

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
								onClick={() =>
									handleClick({ location: facility.dbName } as LocationInterface)
								}
							/>
						);
					})}
				</Map>
				<LocationPopup open={open} onClose={onClose} />
			</APIProvider>
		</>
	);
};

export default App;
