const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function UserAvatar({ name, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%",
      background: "#EEEDFE", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.38,
      fontWeight: 500, color: "#3C3489" }}>
      {getInitials(name)}
    </div>
  );
}