"use client";

import MenuBar from "@/components/MenuBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";

export default function About() {
	return (
		<>
			<MenuBar />

			{/* Hero */}
			<div className="bg-slugBlue text-white flex justify-center py-16 px-6">
				<div className="w-10/12 max-w-3xl text-center">
					<h1 className="text-5xl font-black mb-4">About PantryPal</h1>
					<p className="text-xl text-neutral-300">
						Simplifying essential services for Slugs, one step at a time.
					</p>
				</div>
			</div>

			{/* Mission */}
			<div className="bg-white flex justify-center py-14 px-6">
				<div className="w-10/12 max-w-3xl">
					<h2 className="text-slugBlue text-3xl font-bold pb-3">Our Mission</h2>
					<p className="text-slugSecondaryBlue text-xl font-semibold leading-relaxed">
						PantryPal is a student-built tool designed to help UC Santa Cruz students
						quickly find and access free food resources on campus. We centralize
						real-time inventory and availability information across multiple campus
						pantries and food distribution programs.
					</p>
				</div>
			</div>

			{/* What We Do */}
			<div className="bg-neutral-50 flex justify-center py-14 px-6">
				<div className="w-10/12 max-w-3xl">
					<h2 className="text-slugBlue text-3xl font-bold pb-6">What We Do</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
							<MapIcon className="text-slugBlue mb-3" sx={{ fontSize: 40 }} />
							<h3 className="text-slugBlue text-xl font-bold mb-2">Campus Map</h3>
							<p className="text-slugSecondaryBlue font-semibold">
								Locate every food resource on campus at a glance with our interactive
								map.
							</p>
						</div>
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
							<SearchIcon className="text-slugBlue mb-3" sx={{ fontSize: 40 }} />
							<h3 className="text-slugBlue text-xl font-bold mb-2">Food Search</h3>
							<p className="text-slugSecondaryBlue font-semibold">
								Search for specific items across all locations to find exactly what you
								need.
							</p>
						</div>
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
							<InventoryIcon className="text-slugBlue mb-3" sx={{ fontSize: 40 }} />
							<h3 className="text-slugBlue text-xl font-bold mb-2">Live Inventory</h3>
							<p className="text-slugSecondaryBlue font-semibold">
								See up-to-date product availability and pantry status before you make
								the trip.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* CTA */}
			<div className="bg-white flex justify-center py-14 px-6">
				<div className="w-10/12 max-w-3xl text-center">
					<h2 className="text-slugBlue text-3xl font-bold pb-4">Get Started</h2>
					<p className="text-slugSecondaryBlue text-xl font-semibold mb-8">
						Browse the map to find a pantry near you, or search for a specific food
						item.
					</p>
					<Link
						href="/map"
						className="bg-slugYellow text-white font-black text-lg px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
					>
						View the Map
					</Link>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-slugBlue h-32">
				<Footer />
			</div>
		</>
	);
}
