import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import { PlusIcon } from "../ui/icons";

// title row for a custom group
export default function GroupHeader({
  group,
  count,
  onAdd,
  onRename,
  onDelete,
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(group.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setRenaming(false);
    setConfirmingDelete(false);
    setDraft(group.name);
  }, [group.id, group.name]);

  function submitRename(e) {
    e.preventDefault();
    if (draft.trim()) onRename(draft);
    setRenaming(false);
  }

  return (
    <div className="flex items-center gap-2 px-4 h-11 border-b border-carbon-800">
      {renaming ? (
        <form onSubmit={submitRename} className="flex-1 flex gap-1.5">
          <Input
            size="sm"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setRenaming(false);
              }
            }}
            maxLength={40}
            aria-label="Group name"
            className="flex-1"
          />
          <Button size="sm" type="submit">
            Save
          </Button>
        </form>
      ) : (
        <>
          <p className="flex-1 min-w-0 truncate text-sm font-medium text-white">
            {group.name}
            <span className="ml-1.5 text-xs font-normal text-carbon-500">
              {count}
            </span>
          </p>
          {confirmingDelete ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={onDelete}>
                Delete group
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={onAdd}>
                <PlusIcon className="w-3.5 h-3.5" />
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRenaming(true)}
              >
                Rename
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
