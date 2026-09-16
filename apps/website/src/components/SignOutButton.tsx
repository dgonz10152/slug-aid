"use client"

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider"

export default function SignOutButton() {
    const { user, isLoading, signOut } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSignOut(): Promise<void> {
        setIsSigningOut(true);
        setError(null);

        try {
            await signOut();
        } catch {
            setError("Could not sign out. Please try again.")
        } finally {
            setIsSigningOut(false);
        }
    }

    if (isLoading || !user) return null;

    return (
        <div>
            <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-md border px-4 py-2
                        focus-visible:outline focus-visible:outline-2
                        disabled:opacity-50"
            >
                {isSigningOut ? "Signing out…" : "Sign out"}
            </button>

            {error && <p role="alert">{error}</p>}
        </div>
    );
}