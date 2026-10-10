import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import CheckboxMark from "./CheckboxMark";

// add favorites into a group
export default function FavoriteGroupPicker({
  item,
  groups,
  onToggle,
  onCreate,
  onClose,
}) {
  const [newName, setNewName] = useState("");

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName, item.url);
    setNewName("");
  }

  return (
    <Modal
      onClose={onClose}
      width="sm"
      title="Add to group"
      subtitle={<span className="line-clamp-1">{item.title}</span>}
      footer={
        <Button size="sm" variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      {groups.length === 0 ? (
        <p className="px-5 pt-4 text-xs text-carbon-500">
          No groups yet — create one below.
        </p>
      ) : (
        <ul className="py-1.5">
          {groups.map((group) => {
            const checked = group.urls.includes(item.url);
            return (
              <li key={group.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggle(group.id, item.url, !checked)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm text-carbon-100 hover:bg-carbon-850 transition-colors"
                >
                  <CheckboxMark checked={checked} />
                  <span className="truncate">{group.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 px-5 py-4 border-t border-carbon-800 mt-1.5"
      >
        <Input
          size="sm"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New group name"
          aria-label="New group name"
          maxLength={40}
          className="flex-1"
        />
        <Button size="sm" type="submit" disabled={!newName.trim()}>
          Create & add
        </Button>
      </form>
    </Modal>
  );
}
