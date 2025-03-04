"use client";

import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase-config";
import analyzeImage from "@/utils/cloud-vision";
import LocationData from "@/location-data.json";

import {
	Box,
	Button,
	CircularProgress,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";

async function updateStatus({
	message,
	location,
}: {
	message: string;
	location: string;
}) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/update-status/${location}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					body: JSON.stringify({ message: message }),
				},
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

export default function ImageUploader() {
	// Specify the type as `File | null`
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
	const [location, setLocation] = useState<string>("the-cove");
	const [statusText, setStatusText] = useState<string>("");

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setFile(event.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) return;
		if (!location) return;

		setUploading(true);
		const storageRef = ref(storage, `${location}/${file.name}`);

		try {
			await uploadBytes(storageRef, file);
			const url = await getDownloadURL(storageRef);
			analyzeImage({ url: url ?? "", location: location ?? "" });
			setUploadedUrl(url);
			console.log("File Uploaded Successfully");
		} catch (error) {
			console.error("Error uploading the file", error);
		} finally {
			setUploading(false);
		}
	};

	return (
		<Box sx={{ padding: 3, maxWidth: 500, margin: "auto", background: "white" }}>
			<FormControl fullWidth margin="normal">
				<InputLabel id="locations-label">Location</InputLabel>
				<Select
					labelId="locations-label"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					label="Location"
				>
					{Object.entries(LocationData).map(([key, location]) => (
						<MenuItem key={key} value={key}>
							{location.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<TextField
				type="file"
				fullWidth
				onChange={handleFileChange}
				margin="normal"
				variant="outlined"
				InputLabelProps={{ shrink: true }}
			/>

			<Button
				variant="contained"
				fullWidth
				color="primary"
				onClick={handleUpload}
				disabled={uploading}
				sx={{ marginTop: 2 }}
			>
				{uploading ? (
					<CircularProgress size={24} color="inherit" />
				) : (
					"Upload Image"
				)}
			</Button>

			{uploadedUrl && (
				<Box sx={{ marginTop: 3, textAlign: "center" }}>
					<p>Uploaded image:</p>
					<Image
						src={uploadedUrl}
						alt="Uploaded image"
						width={300}
						height={300}
						layout="responsive"
					/>
				</Box>
			)}

			<TextField
				label="Update Status"
				fullWidth
				value={statusText}
				onChange={(e) => setStatusText(e.target.value)}
				margin="normal"
				variant="outlined"
			/>

			<Button
				variant="contained"
				color="secondary"
				onClick={() => {
					updateStatus({ message: statusText, location: location });
				}}
				fullWidth
				sx={{ marginTop: 2 }}
			>
				Update Status
			</Button>
		</Box>
	);
}
