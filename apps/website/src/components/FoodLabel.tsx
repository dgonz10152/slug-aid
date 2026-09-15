import FavoriteButton from "@/components/FavoriteButton";

type Availability = "in_stock" | "running_out" | "out_of_stock";

interface FoodLabelProps {
  label: string;
  availability: Availability;
  locationId?: string;
  foodId?: string;
  isFavorite?: boolean;
  onFavoriteChange?: (
    foodId: string,
    isFavorite: boolean,
  ) => void;
}

const availabilityStyles = {
  in_stock: {
    text: "In Stock",
    background: "#ecfdf5",
    color: "#166534",
    dot: "#16a34a",
  },
  running_out: {
    text: "Running Low",
    background: "#fffbeb",
    color: "#92400e",
    dot: "#d97706",
  },
  out_of_stock: {
    text: "Out of Stock",
    background: "#fef2f2",
    color: "#991b1b",
    dot: "#dc2626",
  },
};

export default function FoodLabel({
  label,
  availability,
  locationId,
  foodId,
  isFavorite = false,
  onFavoriteChange,
}: FoodLabelProps) {
  const status = availabilityStyles[availability];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        minWidth: 0,
        minHeight: 108,
        height: "100%",
        boxSizing: "border-box",
        padding: "16px",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
        textAlign: "left",
      }}
    >
      {locationId && foodId && onFavoriteChange && (
        <FavoriteButton
          locationId={locationId}
          foodId={foodId}
          isFavorite={isFavorite}
          onFavoriteChange={onFavoriteChange}
        />
      )}

      <p
        style={{
          margin: 0,
          paddingRight: 44,
          color: "#173b63",
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.4,
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </p>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 10px",
          borderRadius: 999,
          backgroundColor: status.background,
          color: status.color,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            flexShrink: 0,
            borderRadius: "50%",
            backgroundColor: status.dot,
          }}
        />

        {status.text}
      </span>
    </div>
  );
}