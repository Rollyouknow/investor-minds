// ════════════════════════════════════════════════
// MAGAZZINO SUL RETRO (funzione serverless)
// Gira sui server di Vercel, NON nel browser dell'utente.
// Nessuna chiave segreta usata qui per ora (Stooq + CoinGecko
// sono entrambi gratuiti e senza registrazione).
// ════════════════════════════════════════════════

const CRYPTO_MAP = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple" };

async function fetchStockYahoo(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    // Nessun proxy necessario: questa chiamata parte dal server (Vercel),
    // non dal browser dell'utente, quindi il blocco CORS non si applica qui.
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    const d = await r.json();
    const meta = d?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice > 0) {
      return { p: meta.regularMarketPrice, chg: meta.regularMarketChangePercent ?? null };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchStock(ticker) {
  // 1° tentativo: Yahoo (copre bene anche i ticker europei come RHM.DE, LDO.MI)
  const fromYahoo = await fetchStockYahoo(ticker);
  if (fromYahoo) return fromYahoo;

  // 2° tentativo (riserva): Stooq, solo se Yahoo non ha risposto
  try {
    const symbol = ticker.includes(".") ? ticker : `${ticker}.US`;
    const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlc&h&e=csv`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    const text = await r.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;
    const cols = lines[1].split(",");
    const open = parseFloat(cols[3]);
    const close = parseFloat(cols[6]);
    if (isNaN(close) || close <= 0) return null;
    const chg = !isNaN(open) && open > 0 ? ((close - open) / open) * 100 : null;
    return { p: close, chg };
  } catch {
    return null;
  }
}

async function fetchCryptoBatch(tickers) {
  const out = {};
  if (!tickers.length) return out;
  try {
    const ids = tickers.map(t => CRYPTO_MAP[t] || t).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return out;
    const d = await r.json();
    tickers.forEach(t => {
      const id = CRYPTO_MAP[t] || t;
      if (d[id]?.usd) out[t] = { p: d[id].usd, chg: d[id].usd_24h_change ?? null };
    });
  } catch {}
  return out;
}

export default async function handler(req, res) {
  const stocksParam = (req.query.stocks || "").toString();
  const cryptoParam = (req.query.crypto || "").toString();

  const stockTickers = stocksParam.split(",").map(s => s.trim()).filter(Boolean);
  const cryptoTickers = cryptoParam.split(",").map(s => s.trim()).filter(Boolean);

  const result = {};

  // Tutte insieme, ma con timeout corto per ognuna: il totale resta
  // sempre sotto i 10 secondi che Vercel concede gratuitamente
  await Promise.all(stockTickers.map(async ticker => {
    const data = await fetchStock(ticker);
    if (data) result[ticker] = data;
  }));

  // Prezzi crypto: una chiamata unica per tutte
  const cryptoData = await fetchCryptoBatch(cryptoTickers);
  Object.assign(result, cryptoData);

  // Cache di 60 secondi: se 10 persone visitano il sito nello stesso minuto,
  // Stooq/CoinGecko vengono interrogati una volta sola, non 10.
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  res.status(200).json(result);
}
