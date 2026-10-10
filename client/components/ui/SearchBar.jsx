import Button from "./Button";

export default function SearchBar({ onSearch }) {
  return (
    <div className="shrink-0 px-4 py-2.5 border-b border-carbon-800">
      <Button variant="primary" size="sm" onClick={onSearch} className="w-full">
        Apply filters
      </Button>
    </div>
  );
}
