import { Instagram } from "@mui/icons-material";
import XIcon from "@mui/icons-material/X";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { createTheme, TextField, ThemeProvider } from "@mui/material";
import Link from "next/link";

const theme = createTheme({
	palette: {
		primary: { main: "#eab308" },
		secondary: {
			main: "#eab308",
			dark: "#eab308",
			light: "#eab308",
		},
	},
});

const TikTokIcon = ({ color = "#000000" }) => {
	return (
		<svg
			fill={color}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 50 50"
			width="100%"
			height="100%"
		>
			<path d="M41,4H9C6.243,4,4,6.243,4,9v32c0,2.757,2.243,5,5,5h32c2.757,0,5-2.243,5-5V9C46,6.243,43.757,4,41,4z M37.006,22.323 c-0.227,0.021-0.457,0.035-0.69,0.035c-2.623,0-4.928-1.349-6.269-3.388c0,5.349,0,11.435,0,11.537c0,4.709-3.818,8.527-8.527,8.527 s-8.527-3.818-8.527-8.527s3.818-8.527,8.527-8.527c0.178,0,0.352,0.016,0.527,0.027v4.202c-0.175-0.021-0.347-0.053-0.527-0.053 c-2.404,0-4.352,1.948-4.352,4.352s1.948,4.352,4.352,4.352s4.527-1.894,4.527-4.298c0-0.095,0.042-19.594,0.042-19.594h4.016 c0.378,3.591,3.277,6.425,6.901,6.685V22.323z" />
		</svg>
	);
};

function EmailInput() {
	return (
		<div>
			<div className="font-bold text-3xl text-white mb-2">Get Updatades</div>
			<div className="font-bold text-sm text-neutral-300">
				Want to get the latest updates with the basic needs facilities? Enter your
				email bellow to recieve up to date information about what&apos;s happening
			</div>
			<div className="p-3 my-2 flex bg-white items-center rounded-md">
				<TextField className="grow" variant="filled" label="Email" size="small" />
				<div className="transition ease-in-out duration-300 ml-3 text-slugBlue hover:text-slugYellow hover:-translate-y-1">
					<MarkEmailReadIcon fontSize="large" sx={{ height: "100%" }} />
				</div>
			</div>
		</div>
	);
}

function LinkSection() {
	return (
		<div className="w-full h-full flex justify-evenly items-baseline rounded-md text-white">
			<div className="flex flex-col justify-center h-full p-3">
				<div className="py-3">
					<h1 className="text-xl font-bold">Quick Links</h1>
					<div className="text-neutral-300 flex flex-col">
						<Link href={"/map"} className="text-base underline font-bold">
							Map
						</Link>
						<Link href={"/"} className="text-base underline font-bold">
							About Us
						</Link>
						<Link href={"/"} className="text-base underline font-bold">
							Get Involved
						</Link>
						<Link href={"/"} className="text-base underline font-bold">
							Help
						</Link>
					</div>
				</div>
				<div className="py-3">
					<h1 className="text-xl font-bold">Social Media</h1>
					<div className="text-neutral-300 flex flex-col">
						<Link href={"/"} className="text-base underline font-bold">
							Instagram <Instagram sx={{ color: "white" }} />
						</Link>
						<Link href={"/"} className="text-base underline font-bold h-6 flex">
							TikTok
							<div className="w-7">
								<TikTokIcon color="white" />
							</div>
						</Link>
						<Link href={"/"} className="text-base underline font-bold">
							X<XIcon sx={{ color: "white", fontSize: 18 }} />
						</Link>
					</div>
				</div>
			</div>
			<div>
				<div className="py-3">
					<h1 className="text-xl font-bold">Contact Information</h1>
					<div className="text-neutral-300 flex flex-col">
						<Link href={"/"} className="text-base underline font-bold">
							basicnds@ucsc.edu
						</Link>
						<Link href={"/"} className="text-base underline font-bold">
							CEJA@ucsc.edu
						</Link>
						<Link href={"/"} className="text-base underline font-bold h-6 flex">
							831-459-4446
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
					<div className="flex h-full items-center md:w-1/2 p-10">
						<EmailInput />
					</div>
					<div className="flex h-full items-center md:w-1/2 px-10 md:p-5">
						<LinkSection />
					</div>
				</ThemeProvider>
			</div>
		</div>
	);
}
