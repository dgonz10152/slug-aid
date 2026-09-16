"use client"
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function LoginScreen() {
	const { signIn } = useAuth();
	const [errorMessage, setErrorMessage] = useState<string | null>(
		null,
	);

	async function handleGoogleLogin(): Promise<void> {
		try {
		setErrorMessage(null);
		await signIn();
		} catch (error) {
		console.error("Google Sign-In Error:", error);
		setErrorMessage("Google Sign-In failed. Please try again.");
		}
	}
	return (
		<div
			style={{
				padding: "2rem",
				maxWidth: "400px",
				margin: "auto",
				textAlign: "center",
			}}
		>
			<h2>Login</h2>
			<button
				onClick={handleGoogleLogin}
				style={{
					padding: "0.75rem 1.5rem",
					fontSize: "1rem",
					backgroundColor: "#4285F4",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
				}}
			>
				Sign in with Google
			</button>
		</div>
	);
}

export default LoginScreen;
