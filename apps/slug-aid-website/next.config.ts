import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: [
			"firebasestorage.googleapis.com",
			"images.unsplash.com",
			"i0.wp.com",
		], // Add Firebase Storage domain here
	},
	distDir: "build",
};

export default nextConfig;
