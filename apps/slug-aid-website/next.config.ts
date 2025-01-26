import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ["firebasestorage.googleapis.com", "images.unsplash.com"], // Add Firebase Storage domain here
	},
};

export default nextConfig;
