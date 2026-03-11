import type { Config } from "tailwindcss";

export default {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				slugBlue: "#163b68",
				slugSecondaryBlue: "#354e74",
				slugYellow: "#eab308",
			},
		},
	},
	plugins: [],
} satisfies Config;
