import { auth, googleProvider } from "@/utils/firebase-config";
import { signInWithPopup } from "firebase/auth";

function LoginScreen() {
	const handleGoogleLogin = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
			// No need to manually handle login; App.jsx will react to auth state
			window.location.reload();
		} catch (error) {
			console.error("Google Sign-In Error:", error);
			alert("Google Sign-In failed. Check console for details.");
		}
	};

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
