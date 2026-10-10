import { useState } from "react";
import { Pill } from "../ui/FilterAccordion";
import { Input } from "../ui/Field";
import { PlusIcon } from "../ui/icons";

export default function NewGroupForm({ onCreate, compact = false }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  function submit(e) {
    e.preventDefault();
    if (name.trim()) onCreate(name);
    setName("");
    setEditing(false);
  }

  if (!editing) {
    return compact ? (
      <Pill onClick={() => setEditing(true)}>
        <PlusIcon className="w-3 h-3 mr-1" />
        New group
      </Pill>
    ) : (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-2 h-8 px-3 rounded-md text-xs text-carbon-400 hover:bg-carbon-850 hover:text-white transition-colors"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        New group
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? "flex gap-1.5 shrink-0" : "px-1 pt-1"}
    >
      <Input
        size="sm"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !name.trim() && setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            setName("");
            setEditing(false);
          }
        }}
        placeholder="Group name"
        aria-label="New group name"
        maxLength={40}
        className={compact ? "w-36" : "w-full"}
      />
    </form>
  );
}
