// Sanitized, network-free generic OHLC fixture helper. No provider access.
export function aggregateClosedMinutes(rows, periodMinutes, cutoffIso) {
  if (![5, 15, 30].includes(periodMinutes)) throw new Error('INVALID_PERIOD');
  if (!Array.isArray(rows)) throw new Error('INVALID_ROWS');
  const cutoff = Date.parse(cutoffIso);
  if (!Number.isFinite(cutoff) || !/Z$/.test(cutoffIso)) throw new Error('INVALID_CUTOFF');
  const period = periodMinutes * 60000;
  const minute = 60000;
  const buckets = new Map();
  const seen = new Set();
  for (const r of rows) {
    if (!r || typeof r !== 'object' || typeof r.ts !== 'string' || !/Z$/.test(r.ts)) throw new Error('INVALID_TIME');
    const t = Date.parse(r.ts);
    if (!Number.isFinite(t) || t % minute !== 0) throw new Error('INVALID_GRID');
    if (seen.has(t)) throw new Error('DUPLICATE_MINUTE');
    seen.add(t);
    if (!['o', 'h', 'l', 'c'].every(k => typeof r[k] === 'number' && Number.isFinite(r[k]) && r[k] > 0)) throw new Error('INVALID_PRICE');
    if (!(r.l <= Math.min(r.o, r.c) && Math.max(r.o, r.c) <= r.h)) throw new Error('INVALID_ENVELOPE');
    if (t + minute > cutoff) continue; // ignore forming minute
    const start = Math.floor(t / period) * period;
    if (!buckets.has(start)) buckets.set(start, []);
    buckets.get(start).push({ ...r, time: t });
  }
  const out = [];
  for (const [start, bucket] of buckets) {
    if (start + period > cutoff) continue; // ignore forming aggregate
    bucket.sort((a,b) => a.time - b.time);
    if (bucket.length !== periodMinutes) continue;
    if (bucket.some((r,i) => r.time !== start + i * minute)) continue;
    out.push({ start_utc: new Date(start).toISOString(), end_utc: new Date(start+period).toISOString(),
      o: bucket[0].o, h: Math.max(...bucket.map(x => x.h)),
      l: Math.min(...bucket.map(x => x.l)), c: bucket.at(-1).c,
      complete: true, source: 'SYNTHETIC_ONLY' });
  }
  return out.sort((a,b) => a.start_utc.localeCompare(b.start_utc));
}
