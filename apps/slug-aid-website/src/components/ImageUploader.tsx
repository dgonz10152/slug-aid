"use client";

import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../utils/firebase-config";
import analyzeImage from "@/utils/cloud-vision";

export default function ImageUploader() {
	// Specify the type as `File | null`
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
	const [location, setLocation] = useState<string>("the-cove");

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
			setUploadedUrl(url);
			console.log("File Uploaded Successfully");
		} catch (error) {
			console.error("Error uploading the file", error);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div>
			<input type="file" onChange={handleFileChange} />

			<button onClick={handleUpload} disabled={uploading}>
				{uploading ? "Uploading..." : "Upload Image"}
			</button>

			<select
				name="locations"
				id="locations"
				onChange={(e) => setLocation(e.target.value)}
			>
				<option value="the-cove">the-cove</option>
				<option value="womxns-center-food-pantry">womxns-center-food-pantry</option>
			</select>

			{uploadedUrl && (
				<button
					className="p-4"
					onClick={() => {
						console.log(location);
						analyzeImage({ url: uploadedUrl ?? "", location: location ?? "" });
					}}
				>
					CheckTypes
				</button>
			)}

			{uploadedUrl && (
				<div>
					<p>Uploaded image:</p>
					<Image
						src={uploadedUrl}
						alt="Uploaded image"
						width={300}
						height={300}
						layout="responsive"
					/>
				</div>
			)}
		</div>
	);
}
