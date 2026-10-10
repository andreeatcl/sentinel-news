import { useMemo } from "react";
import { Eyebrow } from "../ui/Field";
import FavoriteRow from "./FavoriteRow";

export default function FavoritesList({
  sections,
  groups,
  activeGroup,
  groupedUrls,
  showTopic,
  onOpen,
  onRemove,
  onPickGroups,
}) {
  // url -> names of the custom groups it's in (except for the active group)
  const groupNamesByUrl = useMemo(() => {
    const map = new Map();
    for (const group of groups) {
      if (group.id === activeGroup?.id) continue;
      for (const url of group.urls) {
        map.set(url, [...(map.get(url) || []), group.name]);
      }
    }
    return map;
  }, [groups, activeGroup]);

  return sections.map((section) => (
    <section key={section.key}>
      {section.label && (
        <div className="flex items-center justify-between px-5 pt-4 pb-1.5 border-b border-carbon-800">
          <Eyebrow>{section.label}</Eyebrow>
          <span className="text-2xs text-carbon-500">
            {section.items.length}
          </span>
        </div>
      )}
      {section.items.map((item) => (
        <FavoriteRow
          key={item.url}
          item={item}
          showTopic={showTopic}
          inGroup={groupedUrls.has(item.url)}
          groupNames={groupNamesByUrl.get(item.url) || []}
          onOpen={() => onOpen(item)}
          onRemove={() => onRemove(item)}
          onPickGroups={() => onPickGroups(item)}
        />
      ))}
    </section>
  ));
}
