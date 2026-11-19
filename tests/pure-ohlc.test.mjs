import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateClosedMinutes } from '../src/pure-ohlc.mjs';

const base = Date.parse('2026-01-06T00:00:00Z');
const make = (i) => {
  const p = 100 + i / 100; // fictitious values; never taken from a market
  return { ts: new Date(base + i * 60000).toISOString(), o:p, h:p+0.02, l:p-0.02, c:p+0.01 };
};
test('five synthetic closed minutes become one closed five-minute bar', () => {
  const result = aggregateClosedMinutes(Array.from({ length:5 }, (_,i)=>make(i)),5,'2026-01-06T00:05:00Z');
  assert.equal(result.length,1);
  assert.equal(result[0].o,100);
  assert.ok(Math.abs(result[0].c - 100.05) < 1e-10);
  assert.equal(result[0].source,'SYNTHETIC_ONLY');
});
test('no aggregation when a source minute is missing', () => {
  const b=[make(0),make(1),make(3),make(4)];
  assert.equal(aggregateClosedMinutes(b,5,'2026-01-06T00:05:00Z').length,0);
});
test('do not treat an open aggregate as a closed bar', () => {
  assert.equal(aggregateClosedMinutes(Array.from({length:5},(_,i)=>make(i)),5,'2026-01-06T00:04:00Z').length,0);
});
test('reject duplicate minutes without silent overwrites', () => {
  assert.throws(()=>aggregateClosedMinutes([make(0),make(0)],5,'2026-01-06T00:05:00Z'),/DUPLICATE_MINUTE/);
});
test('reject non-minute alignment and invalid OHLC envelope', () => {
  const broken={...make(0),ts:'2026-01-06T00:00:15Z'};
  assert.throws(()=>aggregateClosedMinutes([broken],5,'2026-01-06T00:05:00Z'),/INVALID_GRID/);
  assert.throws(()=>aggregateClosedMinutes([{...make(0),l:200}],5,'2026-01-06T00:05:00Z'),/INVALID_ENVELOPE/);
});
test('reject invalid window size and non-UTC cutoff', () => {
  assert.throws(()=>aggregateClosedMinutes([],1,'2026-01-06T00:05:00Z'),/INVALID_PERIOD/);
  assert.throws(()=>aggregateClosedMinutes([],5,'2026-01-06T00:05:00+09:00'),/INVALID_CUTOFF/);
});
