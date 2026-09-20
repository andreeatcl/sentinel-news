import { useState, useCallback, useRef } from "react";
import { fetchEvents } from "../utils/eventsApi";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const countryRef = useRef(null);
  const timeRangeRef = useRef("7d");

  const search = useCallback(async (country, timeRange = "7d") => {
    countryRef.current = country;
    timeRangeRef.current = timeRange;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents({ country, timeRange, offset: 0 });
      // ignore late responses from a country/range we've since moved on from
      if (countryRef.current !== country) return;
      setEvents(data.events || []);
      setHasMore(!!data.meta?.hasMore);
    } catch (err) {
      if (countryRef.current !== country) return;
      setError(err.message);
      setEvents([]);
      setHasMore(false);
    } finally {
      if (countryRef.current === country) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const country = countryRef.current;
    if (!country || loading || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchEvents({
        country,
        timeRange: timeRangeRef.current,
        offset: events.length,
      });
      if (countryRef.current !== country) return;
      setEvents((prev) => [...prev, ...(data.events || [])]);
      setHasMore(!!data.meta?.hasMore);
    } catch (err) {
      if (countryRef.current !== country) return;
      setError(err.message);
    } finally {
      if (countryRef.current === country) setLoadingMore(false);
    }
  }, [events.length, loading, loadingMore]);

  const clear = useCallback(() => {
    countryRef.current = null;
    setEvents([]);
    setError(null);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(false);
  }, []);

  return {
    events,
    loading,
    loadingMore,
    error,
    hasMore,
    search,
    loadMore,
    clear,
  };
}
