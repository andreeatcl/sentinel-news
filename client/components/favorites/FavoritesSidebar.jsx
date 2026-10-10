import { Eyebrow } from "../ui/Field";
import NewGroupForm from "./NewGroupForm";
import SidebarItem from "./SidebarItem";

export default function FavoritesSidebar({
  groups,
  activeGroup,
  totalCount,
  groupCount,
  onSelect,
  onCreate,
}) {
  return (
    <nav className="p-2 space-y-0.5" aria-label="Favorite groups">
      <SidebarItem
        label="All favorites"
        count={totalCount}
        active={!activeGroup}
        onClick={() => onSelect(null)}
      />
      <Eyebrow className="px-3 pt-4 pb-1.5">Groups</Eyebrow>
      {groups.map((group) => (
        <SidebarItem
          key={group.id}
          label={group.name}
          count={groupCount(group)}
          active={activeGroup?.id === group.id}
          onClick={() => onSelect(group.id)}
        />
      ))}
      <NewGroupForm onCreate={onCreate} />
    </nav>
  );
}
