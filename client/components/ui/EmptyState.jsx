export default function EmptyState({ title, description, error = false }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-48 px-6 py-10 text-center">
      <p
        className={`text-sm font-medium ${
          error ? "text-signal-red" : "text-carbon-200"
        }`}
      >
        {title}
      </p>
      {description && (
        <p className="text-xs text-carbon-500 mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
