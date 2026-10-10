export default function SidebarItem({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`w-full flex items-center justify-between gap-2 h-8 px-3 rounded-md text-left text-xs transition-colors ${
        active
          ? "bg-carbon-800 text-white font-medium"
          : "text-carbon-300 hover:bg-carbon-850 hover:text-white"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="text-2xs text-carbon-500 shrink-0">{count}</span>
    </button>
  );
}
