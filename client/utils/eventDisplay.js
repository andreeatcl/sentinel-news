import { timeAgo } from "./newsApi";

export { getDomain } from "./url";

export function fallbackHeadline(event) {
  return event.location
    ? `Reported event near ${event.location}`
    : "Event details unavailable";
}

export function validActorLabel(actor) {
  if (!actor || !actor.label) return null;
  return actor.label === actor.code ? null : actor.label;
}

function formatDay(day = "") {
  if (day.length !== 8) return day;
  return `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
}

export function eventTimeLabel(event) {
  return event.dateAdded ? timeAgo(event.dateAdded) : formatDay(event.day);
}
