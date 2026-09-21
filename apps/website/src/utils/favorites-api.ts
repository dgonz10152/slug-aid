import { auth } from "@/utils/firebase-config";

interface FavoritesResponse {
    locationId: string;
    favoriteFoodIds: string[];
}

interface FavoriteMutationResponse {
    locationId: string;
    foodId: string;
    isFavorite: boolean;
}

function getApiUrl(path:string): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    return `${apiUrl.replace(/\/$/, "")}${path}`;
}

async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must sign in to manage favorites");
  }

  const token = await user.getIdToken();
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Request failed" }));

    throw new Error(
      errorData.error ?? `Request failed: ${response.status}`,
    );
  }

  return response;
}

export async function loadFavoriteFoodIds(
  locationId: string,
): Promise<Set<string>> {
  const response = await authenticatedFetch(
    `/favorites/${encodeURIComponent(locationId)}`,
  );

  const data = (await response.json()) as FavoritesResponse;

  return new Set(data.favoriteFoodIds);
}

export async function addFavorite(
  locationId: string,
  foodId: string,
): Promise<FavoriteMutationResponse> {
  const response = await authenticatedFetch(
    `/favorites/${encodeURIComponent(locationId)}/${encodeURIComponent(foodId)}`,
    {
      method: "PUT",
    },
  );

  return (await response.json()) as FavoriteMutationResponse;
}

export async function removeFavorite(
  locationId: string,
  foodId: string,
): Promise<FavoriteMutationResponse> {
  const response = await authenticatedFetch(
    `/favorites/${encodeURIComponent(locationId)}/${encodeURIComponent(foodId)}`,
    {
      method: "DELETE",
    },
  );

  return (await response.json()) as FavoriteMutationResponse;
}