# USDJPY DEBUG — Synthetic OHLC tests

This independent **public DEBUG sandbox** tests generic candlestick aggregation using only fictitious prices and timestamps.

## Scope
- `src/pure-ohlc.mjs`: pure OHLC aggregation (no network access)
- `tests/pure-ohlc.test.mjs`: six synthetic offline tests
- `.github/workflows/debug-offline.yml`: read-only checkout and local Node.js tests

Run: `node --test tests/pure-ohlc.test.mjs`

## Security and limitations
- **No real market data**, API keys, Cloudflare deployment code, production forecasts, or private Git history.
- No connections to Twelve Data, Cloudflare, brokerage or other live data providers.
- **No trading and no automatic deployment.**
- Successful public CI does not verify equivalence to the private production implementation or authorize release.
- Keep integration tests, production data, deployment credentials and release decisions in private repositories.

This repository is a clean-room fixture test, not a copy of the production USDJPY analytics system.
