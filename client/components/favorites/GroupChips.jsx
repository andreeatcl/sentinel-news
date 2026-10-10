import { Pill } from "../ui/FilterAccordion";
import NewGroupForm from "./NewGroupForm";

export default function GroupChips({
  groups,
  activeGroup,
  totalCount,
  groupCount,
  onSelect,
  onCreate,
}) {
  return (
    <div className="sm:hidden flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-carbon-800">
      <Pill active={!activeGroup} onClick={() => onSelect(null)}>
        All · {totalCount}
      </Pill>
      {groups.map((group) => (
        <Pill
          key={group.id}
          active={activeGroup?.id === group.id}
          onClick={() => onSelect(group.id)}
        >
          {group.name} · {groupCount(group)}
        </Pill>
      ))}
      <NewGroupForm compact onCreate={onCreate} />
    </div>
  );
}
