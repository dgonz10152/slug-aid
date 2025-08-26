"use client";

import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
	AppBar,
	Box,
	createTheme,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	Toolbar,
	Typography,
} from "@mui/material";

import LocationData from "@/location-data.json";

import { ThemeProvider } from "@emotion/react";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState } from "react";

const theme = createTheme({
	palette: {
		primary: {
			main: "#f6c744",
		},
	},
});

function DrawerInfo() {
	return (
		<Box className="w-[80vw] md:w-[30vw] ">
			<Link href="/">
				<Typography variant="h5" className="flex justify-center p-5">
					Pantry Pal
				</Typography>
			</Link>

			<Divider />
			<List className="p-5 m-2">
				<ul>
					<ListItemButton href="/" className="text-black">
						<ListItemIcon>
							<HomeIcon />
						</ListItemIcon>
						HOME
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton href="/map" className="text-black">
						<ListItemIcon>
							<LocationOnIcon />
						</ListItemIcon>
						MAP
					</ListItemButton>
				</ul>
				{Object.entries(LocationData).map(([key, value]) => {
					return (
						<ul key={key}>
							<ListItemButton
								href={"/locations/" + value.dbName}
								className="text-black"
							>
								<ListItemIcon>
									<FoodBankIcon />
								</ListItemIcon>
								{value.name.toUpperCase()}
							</ListItemButton>
						</ul>
					);
				})}
				<ul>
					<ListItemButton href="/about" className="text-black">
						<ListItemIcon>
							<InfoIcon />
						</ListItemIcon>
						ABOUT US
					</ListItemButton>
				</ul>
			</List>
		</Box>
	);
}

export default function MenuBar() {
	const [open, setOpen] = useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};
	return (
		<>
			<ThemeProvider theme={theme}>
				<AppBar position="sticky" sx={{ background: "#f6c744" }}>
					<Toolbar>
						<IconButton sx={{ color: "white" }} onClick={toggleDrawer(true)}>
							<MenuIcon />
						</IconButton>
						<Link href="/">
							<Typography
								sx={{ color: "white", fontWeight: "bold", paddingRight: "8px" }}
							>
								PantryPal
							</Typography>
						</Link>
						<Box sx={{ display: "flex", flexDirection: "row", flexGrow: "1" }}>
							<SearchBar />
						</Box>
					</Toolbar>
				</AppBar>
			</ThemeProvider>
			<Drawer className="w-full" open={open} onClose={toggleDrawer(false)}>
				<DrawerInfo />
			</Drawer>
		</>
	);
}
