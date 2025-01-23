import React from "react";

import {
	AppBar,
	Toolbar,
	Typography,
	Container,
	Paper,
	List,
	ListItem,
	ListItemText,
	Card,
	CardMedia,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MenuBar from "@/components/MenuBar";

interface Config {
	products: string[];
	name: string;
	image: string;
	about: string;
	hours: Record<string, string>;
}

interface PageTemplateProps {
	config: Config;
}

function PageTemplate({ config }: PageTemplateProps) {
	const foodList = Array.isArray(config.products) ? config.products : [];

	const foodsOffered = foodList.map((food: string, index: number) => (
		<ListItem key={index} sx={{ padding: "0", marginBottom: "-8px" }}>
			<ListItemText primary={food} />
		</ListItem>
	));

	return (
		<div className="bg-white">
			<MenuBar />
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h4"
						style={{ flexGrow: 1 }}
						className="flex justify-center"
					>
						{config.name}
					</Typography>
				</Toolbar>
			</AppBar>

			<Container>
				<Grid container spacing={3} style={{ marginTop: "20px" }}>
					<Grid size={{ xs: 12 }}>
						<Paper style={{ padding: "20px" }}>
							<Card>
								<CardMedia
									component="img"
									alt={`${config.name} Logo`}
									height="300"
									image={config.image}
									title="Restaurant Logo"
								/>
							</Card>
						</Paper>
					</Grid>

					{/* Facility Info */}
					<Grid size={{ xs: 12 }}>
						<Paper style={{ padding: "20px" }}>
							<Typography variant="h5">About</Typography>
							<Typography>{config.about}</Typography>

							<Typography variant="h5" style={{ marginTop: "20px" }}>
								Facility Hours
							</Typography>
							<Typography>Monday: {config.hours.monday}</Typography>
							<Typography>Tuesday: {config.hours.tuesday}</Typography>
							<Typography>Wednesday: {config.hours.wednesday}</Typography>
							<Typography>Thursday: {config.hours.thursday}</Typography>
							<Typography>Friday: {config.hours.friday}</Typography>
							<Typography>Saturday: {config.hours.saturday}</Typography>
							<Typography>Sunday: {config.hours.sunday}</Typography>

							<Typography variant="h5" style={{ marginTop: "20px" }}>
								products Offered
							</Typography>
							<List>{foodsOffered}</List>
						</Paper>
					</Grid>
				</Grid>

				{/* Photos Section */}
				<Grid style={{ marginTop: "20px" }}>
					<Paper style={{ padding: "20px" }}>
						<Typography variant="h5">Current Food</Typography>
					</Paper>
					<Grid container spacing={3}>
						<p>ITEM 1</p>
						<p>ITEM 2</p>
						<p>ITEM 3</p>
						<p>ITEM 4</p>
					</Grid>
				</Grid>
			</Container>
		</div>
	);
}

export default PageTemplate;
