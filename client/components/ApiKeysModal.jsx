import { useEffect, useState } from "react";
import { getApiKeys, setApiKeys } from "../utils/storage";
import { testApiKey } from "../utils/newsApi";

// Test status per field: "idle" | "testing" | "valid" | "invalid"
function KeyField({
  label,
  hint,
  value,
  onChange,
  status,
  message,
  onTest,
  active,
}) {
  const [visible, setVisible] = useState(false);

  const statusColor =
    status === "valid"
      ? "text-signal-green"
      : status === "invalid"
        ? "text-signal-red"
        : "text-carbon-500";
  const statusLabel =
    status === "testing"
      ? "Checking…"
      : status === "valid"
        ? "Working"
        : status === "invalid"
          ? "Not working"
          : "";

  return (
    <div className="bg-carbon-800/50 border border-carbon-700/60 rounded p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-body font-bold text-white">{label}</h3>
          <p className="text-[11px] font-body text-carbon-500 mt-0.5">{hint}</p>
        </div>
        {active && (
          <span className="text-[9px] font-mono text-signal-cyan border border-signal-cyan/40 rounded px-1.5 py-0.5 uppercase tracking-widest whitespace-nowrap">
            In use
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-carbon-900 border border-carbon-600/60 rounded overflow-hidden">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your NewsAPI key here"
            className="flex-1 bg-transparent text-white font-mono text-xs px-3 py-2 outline-none placeholder:text-carbon-600 min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="px-2 text-carbon-500 hover:text-white text-xs shrink-0"
            tabIndex={-1}
          >
            {visible ? "hide" : "show"}
          </button>
        </div>
        <button
          type="button"
          onClick={onTest}
          disabled={!value || status === "testing"}
          className="text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded border border-carbon-600/60 text-carbon-400 hover:border-signal-cyan/60 hover:text-signal-cyan transition-colors disabled:opacity-40 shrink-0"
        >
          Test
        </button>
      </div>

      {statusLabel && (
        <p className={`text-[10px] font-mono mt-1.5 ${statusColor}`}>
          {statusLabel}
          {status === "invalid" && message ? ` — ${message}` : ""}
        </p>
      )}
    </div>
  );
}

export default function ApiKeysModal({ isOpen, onClose }) {
  const [primary, setPrimary] = useState("");
  const [backup, setBackup] = useState("");
  const [lastGood, setLastGood] = useState("primary");
  const [primaryStatus, setPrimaryStatus] = useState("idle");
  const [backupStatus, setBackupStatus] = useState("idle");
  const [primaryMessage, setPrimaryMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const keys = getApiKeys();
    setPrimary(keys.primary);
    setBackup(keys.backup);
    setLastGood(keys.lastGood);
    setPrimaryStatus("idle");
    setBackupStatus("idle");
    setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleTest(key, setStatus, setMessage) {
    setStatus("testing");
    setMessage("");
    const result = await testApiKey(key);
    setStatus(result.valid ? "valid" : "invalid");
    setMessage(result.message || "");
  }

  function handleSave() {
    setApiKeys({ primary: primary.trim(), backup: backup.trim(), lastGood });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-carbon-900 border border-carbon-700/80 rounded-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700/70 shrink-0">
          <div>
            <h1 className="font-display text-white tracking-widest text-xl leading-none">
              API KEYS
            </h1>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              Stored only on this device
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <KeyField
            label="Main key"
            hint="Main key"
            value={primary}
            onChange={setPrimary}
            status={primaryStatus}
            message={primaryMessage}
            onTest={() =>
              handleTest(primary, setPrimaryStatus, setPrimaryMessage)
            }
            active={lastGood === "primary"}
          />

          <KeyField
            label="Backup key (optional)"
            hint="Only used if primary key runs out of API calls"
            value={backup}
            onChange={setBackup}
            status={backupStatus}
            message={backupMessage}
            onTest={() => handleTest(backup, setBackupStatus, setBackupMessage)}
            active={lastGood === "backup"}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-carbon-700/50 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          {saved && (
            <span className="text-[10px] font-mono text-signal-green uppercase tracking-widest">
              Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded bg-signal-cyan/15 border border-signal-cyan/50 text-signal-cyan hover:bg-signal-cyan/25 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
