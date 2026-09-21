"use client";

import { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { useAuth } from "@/components/AuthProvider";
import {
  addFavorite,
  removeFavorite,
} from "@/utils/favorites-api";

interface FavoriteButtonProps {
  locationId: string;
  foodId: string;
  isFavorite: boolean;
  onFavoriteChange: (
    foodId: string,
    isFavorite: boolean,
  ) => void;
}

export default function FavoriteButton({
  locationId,
  foodId,
  isFavorite,
  onFavoriteChange,
}: FavoriteButtonProps) {
  const { user, isLoading, signIn } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [showSignInDialog, setShowSignInDialog] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  async function updateFavorite(
    nextFavoriteState: boolean,
  ): Promise<void> {
    if (nextFavoriteState) {
      await addFavorite(locationId, foodId);
    } else {
      await removeFavorite(locationId, foodId);
    }

    onFavoriteChange(foodId, nextFavoriteState);
  }

  async function handleHeartClick(): Promise<void> {
    if (isLoading || isSaving) return;

    if (!user) {
      setShowSignInDialog(true);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateFavorite(!isFavorite);
    } catch (error) {
      console.error("Favorite operation failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update favorite",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignInAndFavorite(): Promise<void> {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await signIn();
      setShowSignInDialog(false);

      // The item that caused the sign-in is automatically saved.
      await updateFavorite(true);
    } catch (error) {
      console.error("Sign-in or favorite failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not sign in or save favorite",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const buttonLabel = user
    ? isFavorite
      ? "Remove from favorites"
      : "Add to favorites"
    : "Sign in to favorite this item";

  return (
    <>
        <Tooltip title={buttonLabel} followCursor placement="top">
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            display: "inline-flex",
          }}
        >
          <IconButton
            type="button"
            onClick={handleHeartClick}
            disabled={isLoading || isSaving}
            aria-label={buttonLabel}
            aria-pressed={isFavorite}
            sx={{
              color: isFavorite
                ? "error.main"
                : "text.secondary",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            {isSaving ? (
              <CircularProgress size={22} />
            ) : isFavorite ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={showSignInDialog}
        onClose={() => {
          if (!isSaving) {
            setShowSignInDialog(false);
          }
        }}
        aria-labelledby="favorite-sign-in-title"
      >
        <DialogTitle id="favorite-sign-in-title">
          Sign in to save this favorite?
        </DialogTitle>

        <DialogContent>
          Sign in with Google to save favorites and access them
          again on another device.
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowSignInDialog(false)}
            disabled={isSaving}
          >
            Not now
          </Button>

          <Button
            variant="contained"
            onClick={handleSignInAndFavorite}
            disabled={isSaving}
          >
            {isSaving ? "Signing in…" : "Continue with Google"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}