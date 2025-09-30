export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="min-h-[40vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <span className="loading loading-spinner loading-lg" />
        <p className="text-sm opacity-70">{label}</p>
      </div>
    </div>
  );
}
