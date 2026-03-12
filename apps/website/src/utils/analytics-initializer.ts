"use client";

import { useEffect } from "react";
import { analytics } from "@/utils/firebase-config";

export default function AnalyticsInitializer() {
	useEffect(() => {
		// Check if we're on the client-side (window is available)
		if (typeof window !== "undefined" && analytics) {
			console.log("Analytics Initialized on Client-Side");
		}
	}, []);
	return null;
}
