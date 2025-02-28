"use client";

import MenuBar from "@/components/MenuBar";
import Image from "next/image";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import { Dialog, DialogContent } from "@mui/material";

interface imageData {
	urls: string[];
}

interface foodData {
	food: string[];
}

interface statusData {
	status: string;
}

interface Config {
	config: {
		name: string;
		image: string;
		about: string;
		hours: Record<string, string>;
		dbName: string;
	};
}

export default function LocationTemplate({ config }: Config) {
	const [foodList, setFoodList] = useState<string[]>([""]);
	const [foodImages, setFoodImages] = useState<string[]>([]);
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`http://localhost:3001/food/${config.dbName}`);
				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}
				const data: foodData = await response.json();
				console.log(data.food);

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
				console.error("Error fetching images:", error);
			}
		};

		const fetchStatus = async () => {
			try {
				const response = await fetch(
					`http://localhost:3001/status/${config.dbName}`
				);

				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}
				const data: statusData = await response.json();

				console.log(data.status);
				setStatus(data.status);
			} catch (error) {
				console.error("Error fetching status:", error);
			}
		};

		fetchImages();
		fetchData();
		fetchStatus();
	}, [config.dbName]);

	function ImageCard({ src }: { src: string }) {
		const [imageOpen, setImageOpen] = useState(false);

		return (
			<div className="relative aspect-square rounded-xl overflow-hidden my-4 md:w-[41vw] md:h-[20vw] w-full h-[60vw]">
				<Image
					onClick={() => setImageOpen(true)}
					className="w-full h-full object-cover "
					alt="picture"
					fill
					src={src}
				/>
				{/* Dialog Popup */}
				<Dialog
					open={imageOpen}
					onClose={() => setImageOpen(false)}
					className="w-full h-full"
				>
					<DialogContent className="h-[50vh] aspect-[16/9]">
						<div>
							<Image
								className="w-full h-full object-fill"
								alt="picture"
								fill
								src={src}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	return (
		<>
			<MenuBar />
			<div className="text-[4.5rem] font-black flex justify-center p-4 bg-white text-slugBlue">
				<h1>{config.name}</h1>
			</div>
			{/* Warning bar */}
			{status && status != "" ? (
				<div className="text-white flex w-full py-1 bg-[#E56262] justify-center">
					<div className="w-10/12 flex justify-center text-xl font-black">
						<p>{status}</p>
					</div>
				</div>
			) : (
				<></>
			)}
			{/* Image */}
			<div>
				<div className="w-full aspect-square relative bg-slate-300 h-[100vw] md:h-[30vw]">
					<Image
						className="w-full h-full object-cover"
						alt="picture"
						fill
						src={config.image}
					/>
				</div>
			</div>
			{/* Product Labels */}
			<div className="bg-white flex justify-center pt-5">
				<div className="w-10/12">
					<h2 className="text-slugBlue text-3xl font-bold">Products Available</h2>
					<p className="text-slugSecondaryBlue font-semibold text-2xl">
						{foodList.join(", ")}
					</p>
				</div>
			</div>
			{/* Product Images */}
			<div className="bg-white flex justify-center pb-12">
				<div className="w-10/12 md:flex md:flex-row md:justify-between flex-wrap">
					{foodImages ? (
						foodImages.map((url) => <ImageCard key={url} src={url} />)
					) : (
						<></>
					)}
				</div>
			</div>
			{/* Facility Hours */}
			<div className="py-12">
				<div className="bg-white flex justify-center">
					<div className="w-10/12">
						<h2 className="text-slugBlue text-3xl font-bold">Facility Hours</h2>
					</div>
				</div>
				<div className="bg-white flex justify-center text-slugSecondaryBlue font-semibold">
					<div className="w-10/12 flex flex-row">
						<div className="text-2xl">
							<h3>Monday:</h3>
							<h3>Tuesday:</h3>
							<h3>Wednesday:</h3>
							<h3>Thursday:</h3>
							<h3>Friday:</h3>
							<h3>Saturday:</h3>
							<h3>Sunday:</h3>
						</div>
						<div className="flex flex-row-reverse md:flex-row md: px-10 flex-grow">
							<div className="text-right md:text-left text-2xl">
								<h3>{config.hours.monday}</h3>
								<h3>{config.hours.tuesday}</h3>
								<h3>{config.hours.wednesday}</h3>
								<h3>{config.hours.thursday}</h3>
								<h3>{config.hours.friday}</h3>
								<h3>{config.hours.saturday}</h3>
								<h3>{config.hours.sunday}</h3>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* About */}
			<div className="bg-white flex justify-center py-12">
				<div className="w-10/12">
					<h2 className="text-slugBlue text-3xl font-bold">About</h2>
					<h3 className="text-slugSecondaryBlue font-semibold text-2xl">
						{config.about}
					</h3>
				</div>
			</div>
			{/* Footer */}
			<div className="bg-slugBlue h-32">
				<div>
					<Footer />
				</div>
			</div>
		</>
	);
}
