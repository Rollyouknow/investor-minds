// ════════════════════════════════════════════════
// ROBOT AGGIORNAMENTO GIORNALIERO
// Gira ogni mattina su GitHub Actions.
// Scarica prezzi reali e aggiorna marketUpdate.js
// automaticamente — nessun intervento manuale.
// ════════════════════════════════════════════════

const https = require("https");
const fs    = require("fs");

// Ticker da monitorare ogni giorno
const STOCKS  = ["NVDA","AAPL","MSFT","SNDK","MRVL","IAU","VOO","GLD","LMT","KKR"];
const CRYPTO  = "bitcoin,ethereum,solana,ripple";

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    }).on("error", reject);
  });
}

async function fetchStockPrice(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const raw = await get(url);
    const d   = JSON.parse(raw);
    const meta = d?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice > 0) {
      return {
        price : meta.regularMarketPrice,
        change: meta.regularMarketChangePercent?.toFixed(2) ?? "0.00",
      };
    }
  } catch {}
  return null;
}

async function fetchCryptoPrices() {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO}&vs_currencies=usd&include_24hr_change=true`;
    const raw = await get(url);
    return JSON.parse(raw);
  } catch {}
  return {};
}

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function sign(n) { return Number(n) >= 0 ? "+" : ""; }

async function main() {
  console.log("🚀 Avvio aggiornamento mercati...");

  // Scarica tutti i prezzi in parallelo
  const [stockResults, crypto] = await Promise.all([
    Promise.all(STOCKS.map(async t => ({ ticker: t, ...(await fetchStockPrice(t)) }))),
    fetchCryptoPrices(),
  ]);

  const prices = {};
  stockResults.forEach(r => { if (r.price) prices[r.ticker] = r; });

  const btc = crypto["bitcoin"];
  const eth = crypto["ethereum"];
  const sol = crypto["solana"];

  const NVDA  = prices["NVDA"];
  const AAPL  = prices["AAPL"];
  const SNDK  = prices["SNDK"];
  const IAU   = prices["IAU"];
  const VOO   = prices["VOO"];
  const MRVL  = prices["MRVL"];
  const LMT   = prices["LMT"];
  const KKR   = prices["KKR"];

  const today = new Date().toISOString().slice(0, 10);
  const dateIT = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  // Costruisce le notizie dinamiche basate sui prezzi reali
  const newsLines = [
    NVDA  ? `"🖥️ NVDA $${fmt(NVDA.price)} (${sign(NVDA.change)}${NVDA.change}%) — AI core #1 market cap mondiale. CUDA moat intatto."` : null,
    AAPL  ? `"🍎 AAPL $${fmt(AAPL.price)} (${sign(AAPL.change)}${AAPL.change}%) — Tim Cook OUT, Ternus CEO. WWDC Apple Intelligence 2.0. BofA target $380."` : null,
    SNDK  ? `"💾 SNDK $${fmt(SNDK.price)} (${sign(SNDK.change)}${SNDK.change}%) — Storage AI. Apple cerca chip cinesi alternativi. Stop TASSATIVO: $1.300."` : null,
    btc   ? `"🪙 BTC $${fmt(btc.usd, 0)} (${sign(btc.usd_24h_change)}${btc.usd_24h_change?.toFixed(1)}%) — Store of value. Correlazione crescente con oro."` : null,
    IAU   ? `"🥇 IAU $${fmt(IAU.price)} (${sign(IAU.change)}${IAU.change}%) — Gold ETF. JPM target $6.300/oz. Hedge strutturale portafoglio."` : null,
    VOO   ? `"📊 VOO $${fmt(VOO.price)} (${sign(VOO.change)}${VOO.change}%) — S&P 500. DCA mensile priorità. CAGR storico 10.45%/30 anni."` : null,
    MRVL  ? `"⚡ MRVL $${fmt(MRVL.price)} (${sign(MRVL.change)}${MRVL.change}%) — Custom silicon AI. Jensen Huang: 'next trillion-dollar company'."` : null,
    LMT   ? `"🛡️ LMT $${fmt(LMT.price)} (${sign(LMT.change)}${LMT.change}%) — Lockheed Martin. Iran ceasefire fragile. Difesa strutturalmente long."` : null,
    KKR   ? `"🏦 KKR $${fmt(KKR.price)} (${sign(KKR.change)}${KKR.change}%) — SpaceX investor. AUM verso $1T. Private credit boom."` : null,
    sol   ? `"🌊 SOL $${fmt(sol.usd)} (${sign(sol.usd_24h_change)}${sol.usd_24h_change?.toFixed(1)}%) — Solana. Chain principale per stablecoin USD1 (World Liberty Trump)."` : null,
    `"📅 Aggiornamento automatico del ${dateIT} — prezzi live, analisi investitori, portafoglio Raul."`,
    `"⚡ PROSSIME MOSSE: Vendi NRGV | Vendi 50% SNDK | Compra IAU | Stop SNDK $1.300 | DCA VOO mensile."`,
  ].filter(Boolean).join(",\n  ");

  // Scrive il file aggiornato
  const content = `// AUTO-GENERATO — NON MODIFICARE MANUALMENTE
// Aggiornato da GitHub Actions il ${today}
// Per cambiare l'analisi degli investitori: modifica INVESTORS_ANALYSIS sotto.

export const CONTENT_LAST_UPDATED = "${today}";

export const EVENTS = {
  fomc:      new Date("2026-07-29T00:00:00"),
  earnings:  new Date("2026-07-15T00:00:00"),
  reopening: new Date("2026-07-06T15:30:00"),
};

export function countdownText(date, f, o, p) {
  const d = Math.ceil((date - new Date()) / 86400000);
  return d > 1 ? \`\${f} tra \${d} giorni\` : d === 1 ? \`\${f} domani\` : d === 0 ? \`\${o} oggi\` : \`\${p} (\${Math.abs(d)}gg fa)\`;
}

export function dataOggiFormattata() {
  return new Date().toLocaleDateString("it-IT", { day:"numeric", month:"long", year:"numeric" });
}

export const NEWS = [
  ${newsLines}
];

// ── ANALISI INVESTITORI (aggiornata periodicamente da Claude) ──
export const INVESTORS_ANALYSIS = [
  {
    id:"buffett", name:"Warren Buffett", emoji:"🎩", color:"#C8A456",
    mindset:"Cash è re. Jobs deboli = aspetta. IAU con il cash disponibile ora.",
    on_sndk:"VENDI 50%. La memoria è ciclica. Apple cerca chip cinesi = cliente principale guarda altrove.",
    on_nvda:"HOLD. CUDA è un moat reale. Non vendere nel panic selling.",
    on_cash:"IAU SUBITO. Hedge strutturale. Jobs deboli + potenziale Fed pivot = oro sale.",
    top_pick:"IAU — Gold ETF. 7-8 shares con i €326 disponibili.",
    avoid:"SNDK oltre la metà. Business ciclico senza moat durevole.",
    conviction:9,
  },
  {
    id:"burry", name:"Michael Burry", emoji:"🔭", color:"#2D6A9F",
    mindset:"Ha shortato NVDA, Tesla e CAT il 30/6. Bolla AI in corso.",
    on_sndk:"VENDI 70-80%. +750% H1 su bolla memory AI. Apple sourcing alternativo. Ciclo girato.",
    on_nvda:"SHORT (ha già scommesso contro). Pattern testa-spalla. Ma con 1 sola share: stop mentale $190.",
    on_cash:"GLD + TIPS. Inflazione strutturale + $36T debito USA. Gold è la protezione giusta.",
    top_pick:"GLD + TEVA (P/E 8x) + C (Citigroup P/B 0.7x)",
    avoid:"Tutto ciò che è salito sull'hype AI puro. Specialmente memoria.",
    conviction:10,
  },
  {
    id:"lynch", name:"Peter Lynch", emoji:"📈", color:"#2D8A4E",
    mindset:"Segui i soldi: escono da chip AI, entrano in AAPL, Visa, Walmart.",
    on_sndk:"RIDUCI 50%. La storia sta cambiando. Ma Lynch non venderebbe tutto se il business è solido.",
    on_nvda:"HOLD con convinzione. CUDA moat. Il secondo capitolo dell'AI è NVDA.",
    on_cash:"IAU per il gold. Ma guarda anche CCJ (Uranium) — AI power demand = tenbagger.",
    top_pick:"CCJ (Cameco) — Uranium AI power + nucleare. PEG <1.",
    avoid:"Inseguire SNDK dopo +750%. Il primo che vende guadagna, l'ultimo paga.",
    conviction:8,
  },
  {
    id:"dalio", name:"Ray Dalio", emoji:"🌐", color:"#7B3FA0",
    mindset:"Portfolio 100% tech = il rischio più grande. Diversificare ADESSO.",
    on_sndk:"RIDUCI per concentrazione, non solo per il prezzo.",
    on_nvda:"HOLD ma massimo 10% del portafoglio totale in All Weather.",
    on_cash:"IAU (15% target) → TLT (bonds, 40% target) → VWCE (equity globale). In questo ordine.",
    top_pick:"IAU + TLT + VWCE — triangolo All Weather. Jobs deboli = tutti e tre beneficiano.",
    avoid:"Concentrazione settoriale. Zero diversificazione = zero protezione.",
    conviction:9,
  },
  {
    id:"druckenmiller", name:"Stan Druckenmiller", emoji:"⚡", color:"#e11d48",
    mindset:"Quando hai ragione, sii aggressivo. Jobs 57K = Fed pivot = macro trade chiaro.",
    on_sndk:"VENDI TUTTO o quasi. Quando il ciclo gira, gira in fretta.",
    on_nvda:"Neutro. Pattern tecnico preoccupante. Stop mentale $190.",
    on_cash:"TLT aggressivamente. Fed pivot = bond lunghi 20Y +20-30%.",
    top_pick:"TLT (bond lunghi) + IAU + BTC (rate cut = BTC $70K+).",
    avoid:"Chip memoria senza stop. Non tagliare le perdite è il peccato capitale.",
    conviction:9,
  },
  {
    id:"soros", name:"George Soros", emoji:"♟️", color:"#6366f1",
    mindset:"La narrativa AI si sta incrinando. Quando si rompe, si rompe in fretta.",
    on_sndk:"Punto di inflexione. La narrativa 'AI ha bisogno di memoria infinita' si sta rompendo.",
    on_nvda:"Aspettare che la polvere si depositi. NVDA ha moat reale ma sentiment cambiato.",
    on_cash:"Gold e difensivi. Quando le narrative crollano, gli asset reali vincono.",
    top_pick:"IAU + posizione difensiva. Sopravvivere è più importante di vincere.",
    avoid:"SNDK senza stop. Posizioni aggressive in un mercato che sta cambiando regime.",
    conviction:8,
  },
];

export const PORTFOLIO_ACTIONS = [
  { time:"Lunedì 15:31", action:"Vendi NRGV (2 shares)", ticker:"NRGV", borsa:"NYSE", priority:"🔴 URGENTE" },
  { time:"Lunedì 15:32", action:"Vendi SNDK (0.1 shares — metà posizione)", ticker:"SNDK", borsa:"NASDAQ", priority:"🔴 URGENTE" },
  { time:"Lunedì 15:35", action:"Compra IAU (7-8 shares)", ticker:"IAU", borsa:"ARCA", priority:"🟡 IMPORTANTE" },
  { time:"Subito su IBKR", action:"Imposta Stop-Loss SNDK a $1.300", ticker:"SNDK", borsa:"NASDAQ", priority:"🔴 URGENTE" },
];
`;

  fs.writeFileSync("src/data/marketUpdate.js", content, "utf8");
  console.log(`✅ marketUpdate.js aggiornato con prezzi reali del ${today}`);

  // Stampa un riepilogo
  console.log("\n📊 Prezzi scaricati:");
  stockResults.forEach(r => { if (r.price) console.log(`  ${r.ticker}: $${fmt(r.price)} (${sign(r.change)}${r.change}%)`); });
  if (btc) console.log(`  BTC: $${fmt(btc.usd, 0)} (${sign(btc.usd_24h_change)}${btc.usd_24h_change?.toFixed(1)}%)`);
}

main().catch(e => { console.error("❌ Errore:", e.message); process.exit(1); });
