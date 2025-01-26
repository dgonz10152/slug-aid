"use client";

import MenuBar from "@/components/MenuBar";
import Image from "next/image";

const config = {
	name: "The Cove",
	warning:
		"Lorem ipsum dolor sit amet consectetur. Enim posuere cras sollicitudin morbi aliquam.",
	image:
		"https://firebasestorage.googleapis.com/v0/b/slugaid-562a4.firebasestorage.app/o/images%2Ffruits_bagels.jpg?alt=media&token=8fe9fb3e-cf28-4d49-908a-2bfb662d760a",
	products:
		"Canned Beans, Carrots, Bell Peppers, Cucumbers, Canned Beef, Nutella, Cabbage",
	about:
		"Lorem ipsum dolor sit amet consectetur. Suscipit tristique cras tellus nisl tempus euismod id. Ante volutpat interdum est imperdiet morbi egestas est. Sed condimentum molestie sit ultricies libero. Aliquam dictum eleifend mi gravida. Arcu nisi adipiscing vel eget ultrices enim sed proin. Urna interdum turpis integer et convallis. Purus felis sit tristique odio odio condimentum ullamcorper lacus. Velit sodales lectus tempus ut donec lectus hac in ultrices. Ligula nunc sagittis hac porta.",
};

function ImageCard({ src }: { src: string }) {
	return (
		<div className="w-[100%] h-[100vw] relative rounded-xl overflow-hidden my-4">
			<Image src={src} fill objectFit="cover" alt="picture" />
		</div>
	);
}

export default function Home() {
	return (
		<>
			<MenuBar />
			<div className="text-[4.5rem] font-black flex justify-center bg-white text-[#3B82F6]">
				<h1>{config.name}</h1>
			</div>
			{/* Warning bar */}
			{config.warning != "" ? (
				<div className="text-white flex w-full py-1 bg-[#E56262] justify-center">
					<p className="w-10/12 flex justify-center text-xl font-black">
						{config.warning}
					</p>
				</div>
			) : (
				<></>
			)}
			{/* Image */}
			<div className="relative aspect-[4/3] w-full">
				<Image
					src={config.image}
					fill
					className="object-cover"
					alt="Location Picture"
				/>
			</div>
			{/* Product Labels */}
			<div className="bg-white flex justify-center pt-5">
				<div className="w-10/12">
					<h2 className="text-[#8a8a8d] text-3xl font-bold">Products Available</h2>
					<p className="text-[#c4c4c6] font-semibold text-2xl">{config.products}</p>
				</div>
			</div>
			{/* Product Images */}
			<div className="bg-white flex justify-center">
				<div className="w-10/12">
					<ImageCard src={config.image} />
					<ImageCard src={config.image} />
				</div>
			</div>
			{/* Facility Hours */}
			<div className="bg-white flex justify-center">
				<div className="w-10/12">
					<h2 className="text-[#8a8a8d] text-3xl font-bold">Facility Hours</h2>
				</div>
			</div>
			<div className="bg-white flex justify-center text-[#c4c4c6] font-semibold">
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
					<div className="flex flex-row-reverse flex-grow">
						<div className="text-right text-2xl">
							<h3>1am-11pm</h3>
							<h3>1am-11pm</h3>
							<h3>1am-11pm</h3>
							<h3>1am-11pm</h3>
							<h3>1am-11pm</h3>
							<h3>1am-11pm</h3>
							<h3>closed</h3>
						</div>
					</div>
				</div>
			</div>
			{/* About */}
			<div className="bg-white flex justify-center py-5">
				<div className="w-10/12">
					<h2 className="text-[#8a8a8d] text-3xl font-bold">About</h2>
					<h3 className="text-[#c4c4c6] font-semibold text-2xl">{config.about}</h3>
				</div>
			</div>
			{/* Footer */}
			<div className="bg-[#d8d8d8] h-14"></div>
		</>
	);
}
