"use client";

import { useState } from "react";
import { auth } from "../../utils/firebase-config";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { TextField, Button, Container, Typography, Paper } from "@mui/material";

export default function AuthPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState("");

	const handleAuth = async () => {
		try {
			if (isSignUp) {
				await createUserWithEmailAndPassword(auth, email, password);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch {
			setError("ERROR");
			console.log("NOOO");
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Paper elevation={3} sx={{ padding: 4, textAlign: "center", marginTop: 8 }}>
				<Typography variant="h5">{isSignUp ? "Sign Up" : "Login"}</Typography>
				{error && <Typography color="error">{error}</Typography>}
				<TextField
					fullWidth
					margin="normal"
					label="Email"
					variant="outlined"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<TextField
					fullWidth
					margin="normal"
					label="Password"
					type="password"
					variant="outlined"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Button
					variant="contained"
					color="primary"
					fullWidth
					onClick={handleAuth}
					sx={{ marginTop: 2 }}
				>
					{isSignUp ? "Sign Up" : "Login"}
				</Button>
				<Button onClick={() => setIsSignUp(!isSignUp)} sx={{ marginTop: 2 }}>
					{isSignUp
						? "Already have an account? Login"
						: "Don't have an account? Sign Up"}
				</Button>
			</Paper>
		</Container>
	);
}
