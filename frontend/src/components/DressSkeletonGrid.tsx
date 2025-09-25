export default function DressSkeletonGrid({ count = 12, message = "Connecting to server…" }) {
  return (
    <div className="w-full">
      <p className="mb-4 text-sm text-white/70 animate-pulse">{message}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 p-3 bg-white/5">
            <div className="aspect-[3/4] rounded-xl bg-white/10 animate-pulse" />
            <div className="mt-3 h-4 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
