import { Instagram } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material";
import Link from "next/link";

const theme = createTheme({
	palette: {
		primary: { main: "#ffffff" },
		secondary: {
			main: "#eab308",
			dark: "#eab308",
			light: "#eab308",
		},
	},
});

function LinkSection() {
	return (
		<div className="w-full h-full flex justify-evenly items-baseline rounded-md text-white">
			<div className="flex flex-col justify-center h-full p-3">
				<div className="py-3">
					<h1 className="text-xl font-bold">Quick Links</h1>
					<div className="text-neutral-300 flex flex-col">
						<Link href={"/"} className="text-base underline font-bold">
							Home
						</Link>
						<Link href={"/map"} className="text-base underline font-bold">
							Map
						</Link>
						<a
							target="_blank"
							href={"https://basicneeds.ucsc.edu"}
							className="text-base underline font-bold"
						>
							Basic Needs Website
						</a>
					</div>
				</div>
				<div className="py-3">
					<h1 className="text-xl font-bold">Social Media</h1>
					<div className="text-neutral-300 flex flex-col">
						<a
							target="_blank"
							href={"https://www.instagram.com/ucscbasicneeds"}
							className="text-base underline font-bold"
						>
							Instagram <Instagram sx={{ color: "white" }} />
						</a>
					</div>
				</div>
			</div>
			<div>
				<div className="py-3">
					<h1 className="text-xl font-bold">Contact Information</h1>
					<div className="text-neutral-300 flex flex-col">
						<Link
							href={"mailto:basicnds@ucsc.edu"}
							className="text-base underline font-bold"
						>
							basicnds@ucsc.edu
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Footer() {
	return (
		<div className="bg-slugBlue">
			<div className="w-full md:flex md:flex-row flex-col">
				<ThemeProvider theme={theme}>
					<div className="flex h-full items-center md:w-1/2 px-10 md:p-5">
						<LinkSection />
					</div>
				</ThemeProvider>
			</div>
		</div>
	);
}
