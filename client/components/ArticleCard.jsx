import { timeAgo } from "../utils/newsApi";
import FavoriteButton from "./FavoriteButton";

export function SkeletonCard() {
  return (
    <div className="p-4 border-b border-carbon-700/50 space-y-2">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export default function ArticleCard({ article, index }) {
  let domain = "";
  if (article.url) {
    try {
      domain = new URL(article.url).hostname.replace("www.", "");
    } catch {
      domain = "";
    }
  }
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border-b border-carbon-700/50 hover:bg-carbon-700/40 transition-colors group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Source + time */}
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 min-w-0 max-w-[60%]">
          <span className="text-[10px] font-mono font-bold text-signal-cyan uppercase tracking-wider truncate">
            {article.source?.name || domain}
          </span>
          {article._provider === "gdelt" && (
            <span className="text-[8px] font-mono font-bold text-signal-amber border border-signal-amber/40 bg-signal-amber/10 rounded px-1 py-0.5 uppercase tracking-wider shrink-0">
              GDELT
            </span>
          )}
          {article.language && !/^english$/i.test(article.language) && (
            <span className="text-[8px] font-mono text-carbon-500 border border-carbon-600/60 rounded px-1 py-0.5 uppercase tracking-wider shrink-0">
              {article.language.slice(0, 3)}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-carbon-500">
            {timeAgo(article.publishedAt)}
          </span>
          <FavoriteButton article={article} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-body font-medium text-white leading-snug mb-1 group-hover:text-signal-cyan transition-colors line-clamp-3">
        {article.title?.replace(" - " + (article.source?.name || ""), "")}
      </h3>

      {/* Description */}
      {article.description && (
        <p className="text-[11px] font-body text-carbon-500 leading-relaxed line-clamp-2 mt-1">
          {article.description}
        </p>
      )}

      {/* Arrow indicator */}
      <div className="flex justify-end mt-2">
        <span className="text-[10px] font-mono text-carbon-600 group-hover:text-signal-cyan transition-colors">
          READ →
        </span>
      </div>
    </a>
  );
}
