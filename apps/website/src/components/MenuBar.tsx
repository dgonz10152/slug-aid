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
import { useAuth } from "@/components/AuthProvider";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

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
				<ul key="home">
					<ListItemButton href="/" className="text-black">
						<ListItemIcon>
							<HomeIcon />
						</ListItemIcon>
						HOME
					</ListItemButton>
				</ul>
				<ul key="map">
					<ListItemButton href="/map" className="text-black">
						<ListItemIcon>
							<LocationOnIcon />
						</ListItemIcon>
						MAP
					</ListItemButton>
				</ul>
				{Object.entries(LocationData).map(([key, value]) => {
					// Temporarily remove all locations except RFM
					if (value.dbName !== "redwood-free-market" && value.dbName !== "terry-freitas-commons") {
						return null;
					}

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
				<ul key="about">
					<ListItemButton href="/about" className="text-black">
						<ListItemIcon>
							<InfoIcon />
						</ListItemIcon>
						ABOUT
					</ListItemButton>
				</ul>
			</List>
		</Box>
	);
}

export default function MenuBar() {
	const [open, setOpen] = useState(false);

	const { user, isLoading, signIn, signOut } = useAuth();
	const [isBusy, setIsBusy] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	async function handleAccountClick(): Promise<void> {
		if (isLoading || isBusy) return;

		setIsBusy(true);
		setAuthError(null);

		try {
			if (user) {
			await signOut();
			} else {
			await signIn();
			}
		} catch {
			setAuthError(
			user
				? "Could not sign out. Please try again."
				: "Could not sign in. Please try again.",
			);
		} finally {
			setIsBusy(false);
		}
	}

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
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								flexGrow: 1,
								minWidth: 0,
							}}
							>
							<SearchBar />
							</Box>

							<Button
							type="button"
							onClick={handleAccountClick}
							disabled={isLoading || isBusy}
							variant="outlined"
							sx={{
								ml: 1,
								flexShrink: 0,
								whiteSpace: "nowrap",
								color: "#1f2937",
								borderColor: "currentColor",
								textTransform: "none",
								fontWeight: 600,
								"&:hover": {
								borderColor: "currentColor",
								backgroundColor: "rgba(0, 0, 0, 0.06)",
								},
							}}
							>
							{isLoading
								? "Loading…"
								: isBusy
								? "Please wait…"
								: user
									? "Sign out"
									: "Sign in"}
							</Button>
					</Toolbar>
				</AppBar>
			</ThemeProvider>
			<Drawer className="w-full" open={open} onClose={toggleDrawer(false)}>
				<DrawerInfo />
			</Drawer>
			<Snackbar
				open={Boolean(authError)}
				autoHideDuration={6000}
				message={authError}
				onClose={() => setAuthError(null)}
			/>
		</>
	);
}
