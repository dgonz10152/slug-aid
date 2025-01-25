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

import { ThemeProvider } from "@emotion/react";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState } from "react";

const theme = createTheme({
	palette: {
		primary: {
			main: "#eab308",
		},
	},
});

function DrawerInfo() {
	return (
		<Box className="w-[80vw] md:w-[30vw] ">
			<Link href="/">
				<Typography variant="h5" className="flex justify-center p-5">
					SlugAid
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
				<ul>
					<ListItemButton href="/locations/the-cove" className="text-black">
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						THE COVE
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/womxns-center-food-pantry"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						WOMXNS CENTER FOOD PANTRY
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/terry-freitas-commons"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						TERRY FREITAS COMMON
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/redwood-free-market"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						REDWOOD FREE MARKET
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton href="/locations/produce-pop-up" className="text-black">
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						PRODUCE POP UP
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/lionel-cantu-queer-center-food-pantry"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						LIONEL CANTU QUEER CENTER FOOD PANTRY
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/ethnic-resource-centers-snack-pantry"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						ETHNIC RESOURCE CENTERS SNACK PANTRY
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/cowell-coffee-shop"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						COWELL COFFEE SHOP
					</ListItemButton>
				</ul>
				<ul>
					<ListItemButton
						href="/locations/center-for-agroecology-farmstand"
						className="text-black"
					>
						<ListItemIcon>
							<FoodBankIcon />
						</ListItemIcon>
						CENTER FOR AGROECOLOGY FARMSTAND
					</ListItemButton>
				</ul>
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
				<AppBar position="sticky" color="primary">
					<Toolbar>
						<IconButton onClick={toggleDrawer(true)}>
							<MenuIcon />
						</IconButton>
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
