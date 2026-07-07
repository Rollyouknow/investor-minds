// ════════════════════════════════════════════════
// /api/market-brief.js — Notizie dinamiche dai prezzi live
// Chiamata ogni volta che il sito viene aperto.
// Genera le notizie basandosi sui prezzi REALI di quel momento.
// Nessun robot, nessun cron job, nessun token extra necessario.
// Cache 6 ore per non sovraccaricare i provider dati.
// ════════════════════════════════════════════════

const KEY_TICKERS = ["NVDA","AAPL","SNDK","MRVL","IAU","VOO","LMT","KKR","GLD"];

async function fetchPrice(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    const d = await r.json();
    const m = d?.chart?.result?.[0]?.meta;
    if (!m?.regularMarketPrice) return null;
    return {
      p:   m.regularMarketPrice,
      chg: m.regularMarketChangePercent ?? 0,
    };
  } catch { return null; }
}

async function fetchCrypto() {
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
      { signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) return {};
    return await r.json();
  } catch { return {}; }
}

function fmt(n, dec = 2) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function sign(n) { return Number(n) >= 0 ? "+" : ""; }

function emoji(chg) { return Number(chg) >= 0 ? "📈" : "📉"; }

export default async function handler(req, res) {
  // Fetch tutto in parallelo per velocità massima
  const [stocks, crypto] = await Promise.all([
    Promise.all(KEY_TICKERS.map(async t => [t, await fetchPrice(t)])),
    fetchCrypto(),
  ]);

  const P = Object.fromEntries(stocks.filter(([, v]) => v));
  const BTC = crypto["bitcoin"];
  const ETH = crypto["ethereum"];
  const SOL = crypto["solana"];

  const dateIT = new Date().toLocaleDateString("it-IT", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });

  // Genera notizie dinamiche basate sui prezzi reali
  const news = [
    // Titolo del giorno con data vera
    `"📅 ${dateIT} — Mercati in tempo reale"`,

    // NVDA
    P.NVDA ? `"${emoji(P.NVDA.chg)} NVDA $${fmt(P.NVDA.p)} (${sign(P.NVDA.chg)}${fmt(P.NVDA.chg)}%) — AI core #1 market cap mondiale. CUDA moat. Burry ha shortato il 30/6 ma Buffett direbbe: moat reale."` : null,

    // AAPL
    P.AAPL ? `"${emoji(P.AAPL.chg)} AAPL $${fmt(P.AAPL.p)} (${sign(P.AAPL.chg)}${fmt(P.AAPL.chg)}%) — Ternus CEO. Apple Intelligence 2.0. Sourcing chip cinesi = bearish SNDK. BofA target $380."` : null,

    // SNDK — warning se scende
    P.SNDK ? `"${Number(P.SNDK.chg) < -3 ? "🔴" : emoji(P.SNDK.chg)} SNDK $${fmt(P.SNDK.p)} (${sign(P.SNDK.chg)}${fmt(P.SNDK.chg)}%)${Number(P.SNDK.chg) < -3 ? " ⚠️ ATTENZIONE — verifica stop-loss a $1.300!" : " — Storage AI. Stop-loss $1.300 impostato?"}"` : null,

    // BTC
    BTC ? `"${emoji(BTC.bitcoin?.usd_24h_change ?? 0)} BTC $${fmt(BTC.usd ?? BTC, 0)} (${sign(BTC.usd_24h_change)}${fmt(BTC.usd_24h_change ?? 0)}%) — Jobs deboli = Fed meno aggressiva = BTC beneficia. Target $70K se Fed taglia."` : null,

    // Gold/IAU
    P.IAU ? `"🥇 IAU $${fmt(P.IAU.p)} (${sign(P.IAU.chg)}${fmt(P.IAU.chg)}%) — Gold ETF. JPM target $6.300/oz. Dalio: 15% portafoglio Always. Compra su ogni calo."` : null,

    // VOO
    P.VOO ? `"${emoji(P.VOO.chg)} VOO $${fmt(P.VOO.p)} (${sign(P.VOO.chg)}${fmt(P.VOO.chg)}%) — S&P 500 ETF. DCA mensile. CAGR storico 10.45% su 30 anni. Non fare timing."` : null,

    // MRVL
    P.MRVL ? `"${emoji(P.MRVL.chg)} MRVL $${fmt(P.MRVL.p)} (${sign(P.MRVL.chg)}${fmt(P.MRVL.chg)}%) — Custom silicon AI. Jensen Huang: next trillion-dollar company."` : null,

    // KKR
    P.KKR ? `"${emoji(P.KKR.chg)} KKR $${fmt(P.KKR.p)} (${sign(P.KKR.chg)}${fmt(P.KKR.chg)}%) — SpaceX investor. AUM verso $1T. Private credit boom."` : null,

    // Consigli azione fissi (sempre utili)
    `"⚡ PIANO RAUL: Vendi NRGV | Vendi 50% SNDK | Compra IAU | Stop SNDK $1.300 | DCA VOO mensile"`,
    `"🧠 Consensus Buffett+Burry+Lynch+Dalio+Druckenmiller+Soros: IAU è la priorità. SNDK ridurre. NVDA tenere."`,
  ].filter(Boolean);

  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=3600"); // 6h cache
  res.status(200).json({ news, date: new Date().toISOString() });
}
