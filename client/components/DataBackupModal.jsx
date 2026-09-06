import { useRef, useState } from "react";
import { exportData, importData } from "../utils/storage";

// download the export as a plain json file that the user can keep
function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sentinel-backup-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataBackupModal({ isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);

  function handleExport() {
    downloadJson(exportData());
    setStatus({ type: "ok", message: "Backup downloaded." });
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      importData(JSON.parse(text));
      setStatus({
        type: "ok",
        message: "Backup restored. Reload to see it everywhere.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Couldn't read that file.",
      });
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-carbon-900 border border-carbon-700/80 rounded-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700/70 shrink-0">
          <div>
            <h1 className="font-display text-white tracking-widest text-xl leading-none">
              BACKUP
            </h1>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              API keys, favorites & saved searches
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[11px] font-body text-carbon-500 leading-relaxed">
            Everything is stored only in this browser. If you clear site data,
            switch devices, or the browser evicts storage, it's gone unless
            you've exported a backup.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded bg-signal-cyan/15 border border-signal-cyan/50 text-signal-cyan hover:bg-signal-cyan/25 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded border border-carbon-600/60 text-carbon-300 hover:border-carbon-500 transition-colors"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          {status && (
            <p
              className={`text-[10px] font-mono ${
                status.type === "ok" ? "text-signal-green" : "text-signal-red"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
