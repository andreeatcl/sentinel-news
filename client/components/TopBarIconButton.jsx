export default function TopBarIconButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="pointer-events-auto flex items-center gap-2 bg-carbon-900/95 border border-carbon-600/60 rounded px-2.5 py-2 backdrop-blur-sm hover:border-signal-cyan/60 hover:bg-signal-cyan/5 transition-all group shrink-0"
    >
      {children}
    </button>
  );
}
