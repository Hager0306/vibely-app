const PALETTE = ["#8b5cf6", "#ec4899", "#34d399", "#f59e0b", "#38bdf8"];

function hashToIndex(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PALETTE.length;
}

export default function Avatar({ name = "?", photo, size = 42 }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="avatar"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = name?.trim()?.[0]?.toUpperCase() || "?";
  const color = PALETTE[hashToIndex(name)];

  return (
    <div
      className="avatar avatar--fallback"
      style={{ width: size, height: size, color }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
