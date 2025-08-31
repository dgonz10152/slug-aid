"use client";

import React, { useEffect, useState } from "react";

import {
	AppBar,
	Toolbar,
	Typography,
	Container,
	Paper,
	List,
	ListItem,
	ListItemText,
	Card,
	CardMedia,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MenuBar from "@/components/MenuBar";
import Image from "next/image";

interface Config {
	name: string;
	image: string;
	about: string;
	hours: Record<string, string>;
	dbName: string;
}

interface PageTemplateProps {
	config: Config;
}

interface imageData {
	urls: string[];
}

interface foodData {
	food: Array<{
		id: string;
		labels: string[];
	}>;
}

function PageTemplate({ config }: PageTemplateProps) {
	const [foodList, setFoodList] = useState<
		Array<{ id: string; labels: string[] }>
	>([]);
	const [foodImages, setFoodImages] = useState<string[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`http://localhost:3001/food/${config.dbName}`);
				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}
				const data: foodData = await response.json();

				setFoodList(data.food);
			} catch (error) {
				console.error("Error fetching food:", error);
			}
		};

		const fetchImages = async () => {
			try {
				const response = await fetch(
					`http://localhost:3001/images/${config.dbName}`
				);

				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}
				const data: imageData = await response.json();

				console.log(data.urls);
				setFoodImages(data.urls ?? []);
			} catch (error) {
				console.error("Error fetching status:", error);
			}
		};

		fetchImages();
		fetchData();
	}, [config.dbName]);

	const foodsOffered = foodList.map((foodItem, index) => (
		<ListItem key={index} sx={{ padding: "0", marginBottom: "-8px" }}>
			<ListItemText primary={foodItem.labels.join(", ")} />
		</ListItem>
	));

	return (
		<div className="bg-white">
			<MenuBar />
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h4"
						style={{ flexGrow: 1 }}
						className="flex justify-center"
					>
						{config.name}
					</Typography>
				</Toolbar>
			</AppBar>

			<Container>
				<Grid container spacing={3} style={{ marginTop: "20px" }}>
					<Grid size={{ xs: 12 }}>
						<Paper style={{ padding: "20px" }}>
							<Card>
								<CardMedia
									component="img"
									alt={`${config.name} Logo`}
									height="300"
									image={config.image}
									title="Restaurant Logo"
								/>
							</Card>
						</Paper>
					</Grid>

					{/* Facility Info */}
					<Grid size={{ xs: 12 }}>
						<Paper style={{ padding: "20px" }}>
							<Typography variant="h5">About</Typography>
							<Typography>{config.about}</Typography>

							<Typography variant="h5" style={{ marginTop: "20px" }}>
								Facility Hours
							</Typography>
							<Typography>Monday: {config.hours.monday}</Typography>
							<Typography>Tuesday: {config.hours.tuesday}</Typography>
							<Typography>Wednesday: {config.hours.wednesday}</Typography>
							<Typography>Thursday: {config.hours.thursday}</Typography>
							<Typography>Friday: {config.hours.friday}</Typography>
							<Typography>Saturday: {config.hours.saturday}</Typography>
							<Typography>Sunday: {config.hours.sunday}</Typography>

							<Typography variant="h5" style={{ marginTop: "20px" }}>
								products Offered
							</Typography>
							<List>{foodsOffered}</List>
						</Paper>
					</Grid>
				</Grid>

				{/* Photos Section */}
				<Grid style={{ marginTop: "20px" }}>
					<Paper style={{ padding: "20px" }}>
						<Typography variant="h5">Current Food</Typography>
					</Paper>
					<Grid container spacing={3}>
						{foodImages.map((url) => (
							<Image
								width={200}
								height={200}
								key={url}
								src={url}
								alt="Failed to load"
							/>
						))}
					</Grid>
				</Grid>
			</Container>
		</div>
	);
}

export default PageTemplate;
