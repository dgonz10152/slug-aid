"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuBar from "@/components/MenuBar";
import { Box } from "@mui/system";

const BackgroundImage = () => {
	return (
		<Box
			sx={{
				height: "93vh",
				width: "100%",
				backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/acmhacks-2024.appspot.com/o/images%2FCenter%20for%20Agroecology%20Farmstand2.jpg?alt=media&token=9d0d22d6-8b08-47c4-8ed7-bfa39d44a6bb')`, // Replace with your image path
				backgroundSize: "cover",
				backgroundPosition: "center",
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.5)", // This adds a semi-transparent overlay
					zIndex: 1,
				},
			}}
		>
			{/* Content goes here */}
			<Box
				sx={{
					position: "relative",
					zIndex: 6,
					color: "white",
					textAlign: "center",
					paddingTop: "20px",
				}}
			>
				<Typography
					variant="h1"
					component="h1"
					sx={{ marginTop: "10px" }}
					className="p-30 pt-20 m-30 z-30"
				>
					PantryPal
				</Typography>
				<Typography variant="h5" component="p" sx={{ marginTop: "10px" }}>
					Simplifying essential services for Slugs, one step at a time.
				</Typography>
				<Typography
					variant="h1"
					component="h1"
					sx={{ marginTop: "10px" }}
					className="p-30 pt-20 m-30 z-30"
				></Typography>
				<Button variant="contained" href="/map" size="large">
					MAP
				</Button>
			</Box>
		</Box>
	);
};

export default function Home() {
	return (
		<>
			<div>
				<MenuBar />
				<BackgroundImage />
			</div>
		</>
	);
}
