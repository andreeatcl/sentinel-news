import { useRef, useState } from "react";
import { exportData, importData } from "../../utils/storage";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="sm"
      title="Backup"
      subtitle="API keys, favorites and saved searches"
    >
      <div className="px-5 py-5 space-y-4">
        <p className="text-sm text-carbon-400 leading-relaxed">
          Everything is stored only in this browser. If you clear site data,
          switch devices, or the browser evicts storage, it's gone unless you've
          exported a backup.
        </p>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={handleExport} className="flex-1">
            Export backup
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            Import backup
          </Button>
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
            className={`text-xs ${
              status.type === "ok" ? "text-signal-green" : "text-signal-red"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </Modal>
  );
}
