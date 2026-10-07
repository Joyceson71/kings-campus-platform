export function Progress({ value, color = "#00ffe0" }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="chaos-progress">
      <div
        className="chaos-progress-bar"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          boxShadow: `0 0 8px ${color}60`
        }}
      />
    </div>
  );
}
