import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine } from "recharts";
import { NEWS, CONTENT_LAST_UPDATED, EVENTS, countdownText, dataOggiFormattata } from "./data/marketUpdate.js";

/* ════════════════════════════════════════════════
   PREZZI REALI — 15 GIUGNO 2026
   Fonte: Yahoo Finance, Investing.com, Schwab
════════════════════════════════════════════════ */
const PRICES = {
  SP500:7431, NASDAQ:25888, DOW:51202, VIX:17.68, GOLD:4238, OIL:84.88,
  AAPL:310, MSFT:428, NVDA:215, GOOGL:184, META:578, MRVL:198,
  SPCX:161, SNDK:1540, INTC:108, MU:238, AMD:470, AVGO:410, DELL:148,
  PLTR:27, CRWD:335, SNOW:180, KKR:138, JPM:218, BLK:1020, AXP:263,
  V:294, "BRK.B":471, MCO:458,
  OXY:55, CVX:156, CCJ:55, XOM:84, IAU:43.80, GLD:232, GDX:43,
  JNJ:164, NVO:107, LLY:858, ISRG:528, UNH:506,
  LMT:578, RTX:132, HEI:234, TDG:1315, AXON:545,
  "RHM.DE":1048, "LDO.MI":50.5, "BA.L":1955,
  CMG:59, KO:70, COST:930, VOO:510, QQQ:485, SMH:244, TLT:85,
  BTC:64081, ETH:2790, SOL:174, XRP:2.18, IBIT:39,
  CRML:10.91, NRGV:5.60,
  "ISP.MI":4.08, "ASML":842, "SAP":247,
};

/* ════════════════════════════════════════════════
   PORTAFOGLIO REALE RAUL
════════════════════════════════════════════════ */
const PORTFOLIO_DEFAULT = [
  { id:"p1", t:"NVDA",  q:1,    e:170,   n:"AI core — #1 market cap $5.2T",   a:"HOLD" },
  { id:"p2", t:"SNDK",  q:0.2,  e:700,   n:"Storage AI — oggi $1540 (-13% da ATH $1772)",  a:"HOLD" },
  { id:"p3", t:"CRML",  q:24,   e:11.50, n:"Biotech speculativo LT — piccola posizione", a:"HOLD" },
  { id:"p4", t:"NRGV",  q:2,    e:5.73,  n:"VENDERE SUBITO — libera €10, no thesis",  a:"SELL" },
];
const CASH = 326.77;
const EUR_USD = 1.09;

/* Le notizie ora vivono in src/data/marketUpdate.js — vedi import in alto al file */

/* ════════════════════════════════════════════════
   I 5 GRANDI INVESTITORI — PICKS REALI
════════════════════════════════════════════════ */
const INVESTORS = [
  {
    id:"buffett", name:"Warren Buffett", title:"Oracle of Omaha",
    emoji:"🎩", color:"#C8A456", accent:"#F0C060",
    bio:"Value investing, moat economico, FCF, gestione Abel. $330B cash da deployare.",
    thesis:"Buffett (Abel) ha già comprato $10B di GOOGL. Cerca aziende con moat inattaccabile a prezzi equi. In questo mercato overvalued (Shiller 42.78), mantiene molta cash. Le sue mosse: AXP, KO, OXY, GOOGL.",
    picks:[
      { t:"GOOGL",  v:"STRONG BUY", cv:9, e:182,   sl:168, t1:220, t2:255, why:"P/E ~21x = il più economico Mag7. Abel compra $10B private. Cloud +28% YoY. AI Overviews non ha cannibilizzato Search.", cat:"Moat" },
      { t:"AXP",    v:"STRONG BUY", cv:9, e:260,   sl:240, t1:300, t2:335, why:"Buffett possiede da 30 anni. ROE ~35%. Card premium anticiclica. OBBBA consumer boost. Moat closed-loop network.", cat:"Moat" },
      { t:"OXY",    v:"BUY",        cv:8, e:54,    sl:48,  t1:64,  t2:75,  why:"Abel ~28% e accumula. Q1 EPS +79%. FCF $1.7B +52% YoY. Debito da $20.8B→$13.3B. $55 = zona accumulo.", cat:"Value" },
      { t:"IAU",    v:"STRONG BUY", cv:9, e:43,    sl:39,  t1:52,  t2:62,  why:"$4.238 = dip da comprare. JPM target $6.300. Gold correlazione -0.05 con stocks. Hedge strutturale ALL WEATHER.", cat:"Hedge" },
      { t:"VOO",    v:"STRONG BUY", cv:9, e:508,   sl:460, t1:570, t2:640, why:"S&P 500 testa 50-day MA 7.230 = entry tecnica. CAGR 10.45% storico 30 anni. TER 0.03%. DCA mensile priorità.", cat:"Core" },
      { t:"KKR",    v:"BUY",        cv:8, e:133,   sl:120, t1:160, t2:185, why:"SpaceX IPO gain realizzato. AUM $550B→$1T. SPCX Nasdaq-100 inclusion = KKR NAV beneficia. Private credit boom.", cat:"Growth" },
      { t:"SPCX",   v:"HOLD",       cv:5, e:135,   sl:120, t1:185, t2:220, why:"Buffett NON comprerebbe: perde $8.7B in 15 mesi. Shiller-style: valutazione $2T vs fondamentali deboli. HOLD se hai IPO, non entrare ora.", cat:"Caution" },
    ],
  },
  {
    id:"burry", name:"Michael Burry", title:"The Big Short",
    emoji:"🔭", color:"#2D6A9F", accent:"#4A9FD4",
    bio:"Deep value contrarian. Ha già preso profit su INTC (+225%). Ora: FOMC trade, oro, e idee ignorate.",
    thesis:"Il mercato prezza la perfezione con Shiller P/E 42.78. SpaceX $2T su $18.7B revenue e -$8.7B lost = mania pura. Burry short i MEME, long gli asset reali. Cerca ciò che tutti odiano.",
    picks:[
      { t:"GLD",    v:"STRONG BUY", cv:9, e:230,   sl:210, t1:270, t2:310, why:"$4.238 (oro). Warsh hawkish non è bearish per gold: inflazione strutturale + $36T debito USA. BRICS CB comprano. JPM $6.300.", cat:"Contrarian" },
      { t:"TIP",    v:"STRONG BUY", cv:8, e:108,   sl:100, t1:120, t2:130, why:"PCE ai massimi da 3 anni. FOMC 17/6 mantiene tassi. Inflazione strutturale = TIPS proteggono il capitale in termini reali.", cat:"Macro" },
      { t:"GOOGL",  v:"BUY",        cv:8, e:180,   sl:165, t1:215, t2:250, why:"-4% su $80B raise = entry contrarian. Abel $10B = endorsement. P/E 21x = più economico tra mega-cap. AI Overviews paura esagerata.", cat:"Contrarian" },
      { t:"TEVA",   v:"BUY",        cv:8, e:17,    sl:14,  t1:22,  t2:28,  why:"Opioid settlement $4.35B risolto. Generic leader. P/E ~8x. Nessuno la guarda. Deleverage in corso. FCF yield 15%+.", cat:"Deep Value" },
      { t:"C",      v:"BUY",        cv:8, e:68,    sl:60,  t1:85,  t2:100, why:"P/B 0.7x vs JPM 2.1x. Fraser turnaround funziona. ROE target 11-12%. Il mercato la odia = Burry la compra.", cat:"Deep Value" },
      { t:"SH",     v:"TACTICAL",   cv:5, e:null,  sl:null,t1:null,t2:null, why:"Hedge tattico: Shiller 42.78, FOMC hawkish, BofA summer pullback. 5% del portafoglio come assicurazione. Non posizione core.", cat:"Hedge" },
      { t:"SNDK",   v:"BUY",        cv:8, e:1520,  sl:1380,t1:1780,t2:2100,why:"Rumor NVDA Rubin memory NON confermato ufficialmente. Revenue $5.95B, GM 65%+. -13% da ATH = entry contrarian. Stop $1.380.", cat:"Contrarian" },
    ],
  },
  {
    id:"lynch", name:"Peter Lynch", title:"Growth Hunter",
    emoji:"📈", color:"#2D8A4E", accent:"#3DB86A",
    bio:"GARP, tenbagger, PEG <1. 'Investi in quello che conosci'. Ama le storie semplici.",
    thesis:"Lynch cerca aziende che conosce. SpaceX: 'Elon manda razzi nello spazio, investo nel futuro'. Ma è overvalued. Meglio i proxy. Ama NVDA, CMG, le piattaforme che tutti usano ogni giorno.",
    picks:[
      { t:"SPCX",   v:"BUY",        cv:7, e:155,   sl:130, t1:200, t2:240, why:"Lynch: 'Ogni bambino vuole andare su Marte'. Nasdaq-100 inclusion fine giugno = $22-27B forced buying. Entry su pullback da ATH $176. Stop IPO price $130.", cat:"Event" },
      { t:"NVDA",   v:"STRONG BUY", cv:9, e:212,   sl:190, t1:255, t2:300, why:"Lynch: 'Ogni data center AI usa NVDA. Ogni azienda la cita negli earnings'. PEG <1 su EPS CAGR +40%. #1 market cap. AI capex supercycle.", cat:"Tenbagger" },
      { t:"MRVL",   v:"STRONG BUY", cv:9, e:195,   sl:178, t1:240, t2:290, why:"S&P 500 il 22 giugno = forced buying $4B. Jensen Huang: 'next trillion-dollar company'. 7 giorni alla scadenza. PEG <0.8x.", cat:"Event" },
      { t:"PLTR",   v:"BUY",        cv:8, e:26,    sl:22,  t1:35,  t2:45,  why:"AIP = Salesforce dell'AI. US commercial +55% YoY. Ogni agenzia governo USA usa Palantir. Lynch: 'governo + AI = vincente'.", cat:"GARP" },
      { t:"CMG",    v:"STRONG BUY", cv:8, e:58,    sl:52,  t1:72,  t2:88,  why:"Lynch classico: 'mangio Chipotle ogni settimana'. Chipotlane +35% aperture. 3000→7000 ristoranti. OBBBA consumer boost.", cat:"Consumer" },
      { t:"ISRG",   v:"STRONG BUY", cv:9, e:525,   sl:472, t1:630, t2:720, why:"Lynch: 'ogni ospedale ha Da Vinci, ne vuole un altro'. Da Vinci 5 appena lanciato. Razor-blade model. EPS CAGR +20%.", cat:"Tenbagger" },
      { t:"KKR",    v:"STRONG BUY", cv:9, e:133,   sl:120, t1:165, t2:195, why:"Lynch: 'comprano aziende, le migliorano, le rivendono'. SpaceX gain realizzato. AUM $550B→$1T. MSCI include SPCX = NAV KKR su.", cat:"Growth" },
    ],
  },
  {
    id:"dalio", name:"Ray Dalio", title:"Macro Architect",
    emoji:"🌐", color:"#7B3FA0", accent:"#A855D4",
    bio:"All Weather Portfolio. Cicli del debito. Diversificazione totale. FOMC è il tema di questa settimana.",
    thesis:"Dalio: siamo in late-cycle debt supercycle. Warsh hawkish = tassi alti a lungo = pressione su bonds e growth. Gold è il rifugio strutturale. FOMC 17/6 = evento chiave. Posizionarsi PRIMA.",
    picks:[
      { t:"IAU",    v:"STRONG BUY", cv:9, e:43,    sl:39,  t1:52,  t2:62,  why:"15-20% All Weather. Gold $4.238 = dip. FOMC hawkish 17/6 = breve pressione ma poi gold sale. $36T debito USA = long-term bullish.", cat:"All Weather" },
      { t:"GDX",    v:"STRONG BUY", cv:8, e:42.5,  sl:38,  t1:52,  t2:62,  why:"Leva 2-3x su oro. FCF miner enorme a $4.238. FOMC hawkish = breve pressure, poi re-rating. Disconnessione FCF vs prezzo.", cat:"Leva Gold" },
      { t:"VOO",    v:"STRONG BUY", cv:8, e:508,   sl:460, t1:565, t2:620, why:"50% All Weather equity. S&P testa 50-day MA = entry. DCA mensile senza timing. CAGR 10.45% storico 30 anni.", cat:"All Weather" },
      { t:"TLT",    v:"HOLD",       cv:4, e:null,  sl:null,t1:null,t2:null, why:"FOMC 17/6 Warsh mantiene tassi = TLT SOTTO PRESSIONE. Aspettare segnali recessione per entrare. Oggi: HOLD/UNDERWEIGHT.", cat:"Bond" },
      { t:"RHM.DE", v:"STRONG BUY", cv:9, e:1040,  sl:950, t1:1200,t2:1400,why:"Iran ceasefire fragile + NATO rearming decennale. CAGR revenue +40%. PEG <0.7x. Dalio: ciclo rearming = decenni di crescita.", cat:"Macro" },
      { t:"CCJ",    v:"BUY",        cv:8, e:54,    sl:47,  t1:68,  t2:82,  why:"Uranium supercycle + AI power demand + Iran nuclear deal = nucleare ancora più strategico. PEG <1 su EPS CAGR +50%.", cat:"Macro" },
      { t:"SPCX",   v:"HOLD",       cv:6, e:150,   sl:128, t1:190, t2:230, why:"Dalio monitora: MSCI inclusion annunciata (9/6). Nasdaq-100 fine giugno = $22-27B forced buying. HOLD se hai posizione. Altrimenti aspetta pullback.", cat:"Macro" },
    ],
  },
  {
    id:"druckenmiller", name:"Stan Druckenmiller", title:"The Macro Trader",
    emoji:"⚡", color:"#e11d48", accent:"#f43f5e",
    bio:"Ex-gestore Quantum Fund con Soros. 30 anni senza anno negativo. 'Concentra le scommesse, sii paziente, poi sii aggressivo quando hai ragione'.",
    thesis:"Druckenmiller punta sul momentum e sui macro catalyst. SPCX Nasdaq-100 inclusion, MRVL S&P 500, FOMC. Sa quando uscire. Non tiene posizioni che non si muovono. Oggi: tutto punta agli event catalyst di fine giugno.",
    picks:[
      { t:"SPCX",   v:"STRONG BUY", cv:9, e:155,   sl:132, t1:210, t2:260, why:"Druck: 'La più grande trade di momentum del decennio'. Nasdaq-100 ~15gg post-IPO = fine giugno. $22-27B forced buying meccanico. MSCI inclusion già annunciata (9/6). Entrare ORA, uscire dopo l'inclusion.", cat:"Momentum" },
      { t:"MRVL",   v:"STRONG BUY", cv:9, e:193,   sl:177, t1:245, t2:295, why:"S&P 500 il 22 giugno = forced buying $4B. Jensen Huang endorsement. 7 giorni alla scadenza. La finestra si sta chiudendo.", cat:"Event" },
      { t:"NVDA",   v:"STRONG BUY", cv:9, e:210,   sl:192, t1:258, t2:310, why:"Druck: 'Quando hai ragione su un tema, essere aggressivi'. AI capex supercycle intatto. #1 market cap. Nuova partnership Palantir+Samsung. PEG <1.", cat:"Momentum" },
      { t:"GLD",    v:"BUY",        cv:8, e:229,   sl:210, t1:270, t2:310, why:"FOMC 17/6 Warsh hawkish = tassi alti = inflazione persistente = gold sale strutturalmente. Druck è long gold da febbraio 2026.", cat:"Macro" },
      { t:"KKR",    v:"BUY",        cv:8, e:133,   sl:120, t1:165, t2:190, why:"SpaceX gain realizzato + MSCI/Nasdaq-100 rebalancing crea buying in tutto l'ecosistema. KKR = veicolo strutturale.", cat:"Event" },
      { t:"PLTR",   v:"BUY",        cv:7, e:26,    sl:22,  t1:36,  t2:48,  why:"AI government platform. AIP adoption +55% YoY commercial. Druck ama le piattaforme con network effect e moat istituzionale.", cat:"Growth" },
      { t:"QQQ",    v:"BUY",        cv:7, e:482,   sl:440, t1:540, t2:600, why:"SPCX entrerà nel Nasdaq-100 = QQQ DEVE comprare SPCX meccanicamente. Comprare QQQ ora = esposizione al flusso forzato.", cat:"Index Flow" },
    ],
  },
];

/* ════════════════════════════════════════════════
   SCAN ENTRY — titoli appetibili con livelli precisi
════════════════════════════════════════════════ */
const ENTRIES = [
  {
    urgency:"🔴 OGGI",
    group:"Event Trade — S&P 500 22 giugno",
    trades:[
      { t:"MRVL", entry:"$193-200", stop:"$177 (-9%)", t1:"$245 (+26%)", t2:"$295 (+51%)", rr:"3.8:1", tf:"7 giorni", note:"Finestra di ingresso si chiude. S&P forced buying $4B il 22/6." },
      { t:"KKR",  entry:"$133-138", stop:"$120 (-10%)",t1:"$163 (+22%)", t2:"$192 (+45%)", rr:"3.1:1", tf:"14 giorni", note:"SpaceX gain + SPCX Nasdaq-100 flow. AUM verso $1T." },
    ],
  },
  {
    urgency:"🟡 QUESTA SETTIMANA",
    group:"FOMC Trade — 17 giugno Warsh hawkish",
    trades:[
      { t:"IAU", entry:"$42.80-43.80",stop:"$39.50 (-10%)",t1:"$52 (+21%)",t2:"$61 (+42%)", rr:"2.8:1", tf:"4-8 settimane", note:"FOMC hawkish = inflazione strutturale = oro sale. Gold JPM target $6.300." },
      { t:"GDX", entry:"$42-43.5",   stop:"$38 (-11%)", t1:"$52 (+23%)", t2:"$62 (+48%)", rr:"2.9:1", tf:"4-8 settimane", note:"Leva 2-3x su oro. FCF miner enorme a $4.238." },
      { t:"GLD", entry:"$229-233",   stop:"$210 (-9%)", t1:"$268 (+18%)",t2:"$310 (+37%)", rr:"2.7:1", tf:"6-10 settimane", note:"Alternative a IAU. Più liquido per taglie maggiori." },
    ],
  },
  {
    urgency:"🟡 SETTIMANA PROSSIMA",
    group:"SPCX Nasdaq-100 Inclusion Flow (fine giugno)",
    trades:[
      { t:"SPCX", entry:"$150-162",  stop:"$130 (-14%)",t1:"$200 (+27%)",t2:"$240 (+56%)", rr:"2.4:1", tf:"2-3 settimane", note:"Nasdaq-100 ~15gg post-IPO (fine giugno) = $22-27B forced buying meccanico. Entrare prima del flow." },
      { t:"QQQ",  entry:"$481-488",  stop:"$455 (-7%)", t1:"$535 (+11%)",t2:"$580 (+20%)", rr:"1.8:1", tf:"3-4 settimane", note:"QQQ DEVE comprare SPCX meccanicamente = QQQ sale. Trade indiretto più sicuro." },
    ],
  },
  {
    urgency:"🟢 ACCUMULO GRADUALE",
    group:"DCA Core — Portafoglio Definitivo",
    trades:[
      { t:"VOO",  entry:"$505-514",  stop:"$460 (-11%)",t1:"$580 (+15%)",t2:"$650 (+29%)", rr:"2.1:1", tf:"12-24 mesi",  note:"S&P 500 testa 50-day MA 7.230 = zona accumulo tecnica. DCA mensile priorità assoluta." },
      { t:"NVDA", entry:"$210-218",  stop:"$192 (-9%)", t1:"$258 (+22%)",t2:"$310 (+47%)", rr:"2.9:1", tf:"6-18 mesi",   note:"AI supercycle PEG <1. Partnership PLTR+Samsung nuove. Ogni -10% = DCA." },
      { t:"GOOGL",entry:"$180-186",  stop:"$165 (-10%)",t1:"$218 (+21%)",t2:"$255 (+41%)", rr:"2.7:1", tf:"12-18 mesi",  note:"P/E 21x più economico Mag7. Abel $10B private. Cloud +28%. DOJ risolto." },
    ],
  },
  {
    urgency:"🔵 SPECULATIVE",
    group:"Alto Rischio / Alto Upside",
    trades:[
      { t:"SNDK", entry:"$1.500-1.580",stop:"$1.380 (-10%)",t1:"$1.780 (+15%)",t2:"$2.100 (+39%)", rr:"2.4:1", tf:"3-6 settimane", note:"Rumor NVDA Rubin memory -11% non confermato ufficialmente. Revenue $5.95B, GM 65%+. Se rumor smentito → snap-back." },
      { t:"CCJ",  entry:"$53-56",    stop:"$47 (-14%)", t1:"$68 (+26%)", t2:"$82 (+54%)", rr:"2.4:1", tf:"3-6 mesi",   note:"Uranium supercycle + AI power + Iran nuclear. PEG <1. ETF URA flussi record." },
      { t:"PLTR", entry:"$25.5-27",  stop:"$22 (-18%)", t1:"$36 (+38%)", t2:"$48 (+83%)", rr:"2.8:1", tf:"6-12 mesi",  note:"AIP platform. US commercial +55% YoY. NATO + DoD contracts. PEG compresso." },
    ],
  },
];

/* ════════════════════════════════════════════════
   DCA SIMULATOR
════════════════════════════════════════════════ */
function buildDCA(monthly, years, rate) {
  const start = 1054;
  return Array.from({ length: years + 1 }, (_, y) => {
    const val = y === 0 ? start : undefined;
    if (y === 0) return { y: `A0`, v: start, inv: start };
    let v = start, inv = start;
    for (let i = 0; i < y * 12; i++) { v = v * (1 + rate / 12) + monthly; inv = start + monthly * (i + 1); }
    return { y: `A${y}`, v: Math.round(v), inv: Math.round(inv) };
  });
}

/* ════════════════════════════════════════════════
   PRICE FETCHING
════════════════════════════════════════════════ */
// Una sola chiamata al NOSTRO 'magazzino sul retro' (/api/prices),
// che internamente prende i prezzi da Stooq (azioni) e CoinGecko (crypto).
// Nessun proxy esterno instabile, nessuna chiave da proteggere qui.
async function fetchAllPrices(stockTickers, cryptoTickers) {
  try {
    const params = new URLSearchParams({
      stocks: stockTickers.join(","),
      crypto: cryptoTickers.join(","),
    });
    const r = await fetch(`/api/prices?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return {};
    return await r.json(); // es: { NVDA: {p:215.3, chg:1.2}, BTC: {p:64000, chg:0.5}, ... }
  } catch {
    return {};
  }
}

const sGet = async k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const sSet = async (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ════════════════════════════════════════════════
   CLAUDE API — risposte di riserva (vedi funzione fallback)
   La chiamata AI live viene aggiunta in futuro con /api/ask
════════════════════════════════════════════════ */
async function askClaude(q, a) {
  return null; // usa sempre il fallback: risposte ricche già scritte sotto
}

function fallback(topic, ans) {
  const a = ans.toLowerCase();
  const si = ["sì","si","ok","fatto","tengo","comprato","accumulo"].some(w=>a.includes(w));
  const no = ["no","non","venduto","ridotto","niente","ancora no"].some(w=>a.includes(w));

  if (topic==="SPCX") {
    const cd = countdownText(EVENTS.spcxNasdaq, "Nasdaq-100 inclusion", "Nasdaq-100 inclusion", "Nasdaq-100 inclusion avvenuta");
    return si
      ? `Bene, hai già posizione su SPCX. ${cd} — la finestra di forced-buying ($22-27B meccanici da fondi indicizzati) è il vero catalyst, non i fondamentali (l'azienda perde ancora $8.7B). Mantieni con stop a $130 (prezzo IPO), valuta di vendere parzialmente subito dopo l'inclusione effettiva nell'indice (sell the news classico).`
      : `Non sei ancora entrato: ${cd}. Se vuoi entrare, fascia ragionevole $150-162, stop netto a $130 (sotto il prezzo IPO = stop loss della tesi). Non è un investimento da tenere a lungo: è un trade sull'evento meccanico, non sui fondamentali.`;
  }

  if (topic==="MRVL") {
    const cd = countdownText(EVENTS.mrvlSP500, "Entrata S&P 500", "Entrata S&P 500", "Entrata S&P 500 avvenuta");
    return si
      ? `Ottimo, MRVL ${cd}: il forced buying da ~$4B dei fondi indicizzati dovrebbe già essere in corso o concluso. Se l'evento è già passato, valuta di vendere (sell the news) — il catalyst principale si è già consumato.`
      : `${cd}. Se l'evento è ancora futuro, fascia di entry $193-200, stop $177, target $245. Se l'evento è già passato, il trade ha perso la sua ragione principale: meglio aspettare il prossimo catalyst piuttosto che entrare "in ritardo".`;
  }

  if (topic==="FOMC") {
    const cd = countdownText(EVENTS.fomc, "FOMC", "FOMC", "FOMC già avvenuta");
    return `${cd}. Impatto tipico di un FOMC hawkish (tassi fermi, nessun taglio): Gold tende a salire (inflazione percepita come più persistente), TLT (bond lunghi) sotto pressione, growth stocks più volatili nelle 48h successive. Se l'evento è già passato: guarda come hanno reagito IAU e TLT nei giorni successivi per capire se il mercato ha già "digerito" la decisione o se c'è ancora movimento in corso.`;
  }

  if (topic==="Portfolio") {
    return si
      ? "Bene, hai liberato la liquidità da NRGV. Priorità per il cash disponibile, in ordine: 1) Gold (IAU) come hedge strutturale — non è mai un errore averne una base, 2) una posizione piccola su un evento con catalyst chiaro e data precisa (es. MRVL/SPCX se i tempi sono ancora favorevoli), 3) il resto in riserva per occasioni (es. SNDK se scende sotto stop)."
      : "Se non hai ancora venduto NRGV: fallo appena puoi, non c'è motivo per tenerla — libera capitale che oggi non lavora per te. Con la liquidità libera, evita di metterla tutta su un solo titolo: dividi tra un hedge (oro) e una piccola posizione tattica con stop chiaro.";
  }

  if (topic==="Gold") {
    return si
      ? "Accumulare oro qui ha senso strutturale: è -19% dal massimo storico di febbraio 2026, e storicamente l'oro fa da contrappeso quando i tassi restano alti più a lungo (scenario FOMC hawkish). Mantieni una view di lungo periodo: l'oro raramente premia chi entra e esce velocemente."
      : "Se non hai ancora oro in portafoglio, è la lacuna più importante da chiudere: è l'unico asset che storicamente si muove in modo opposto (o indipendente) dalle azioni nei momenti di stress. Anche una posizione piccola (10-15% del portafoglio) cambia molto la resilienza complessiva.";
  }

  if (topic==="BTC") {
    return si
      ? "Bene che tieni traccia delle posizioni crypto. Regola generale: su un asset con questa volatilità, uno stop mentale (un prezzo sotto il quale rivedi la posizione, anche solo riducendola) è più importante del prezzo di entrata. Se non l'hai già fatto, definisci ORA un livello sotto il quale ridurresti l'esposizione, prima che lo decida il panico."
      : "Se non hai stop impostati su BTC/XRP/SOL, è il primo punto da sistemare: non serve azzeccare il prezzo perfetto, serve avere già deciso PRIMA cosa faresti in caso di un -20% improvviso. Deciderlo a freddo oggi è molto meglio che deciderlo durante un crollo.";
  }

  if (topic==="SNDK") {
    return si
      ? "Tenere tutta la posizione con un gain così ampio è una scelta legittima se la tesi di fondo (storage per l'AI) resta intatta. Ma considera: più un gain è grande, più ha senso avere ALMENO un trailing stop (uno stop che si alza seguendo il prezzo) per proteggere quanto già guadagnato, anche senza vendere nulla oggi."
      : "Se non hai un trailing stop impostato su una posizione fortemente in gain, è il rischio più grande che stai correndo: non perdere il capitale investito, ma restituire al mercato un gain che avevi già ottenuto. Vale la pena definirlo, anche solo mentalmente, oggi stesso.";
  }

  if (topic==="Obiettivo") {
    return "L'obiettivo finale (importo + anni) è quello che decide TUTTO il resto: quanto rischio puoi permetterti, quanto contante tenere fermo, quanto concentrare vs diversificare. Senza un numero e una scadenza, ogni scelta di portafoglio resta un po' arbitraria. Anche una stima approssimativa (es. 'raddoppiare in 10 anni') è già abbastanza per calibrare il piano.";
  }

  return `Su ${topic}: senza un collegamento diretto a un'IA in tempo reale, questa è una risposta basata su principi generali, non su dati aggiornati al minuto. Per decisioni importanti, verifica sempre i prezzi e le date correnti nella dashboard sopra, che invece SONO live.`;
}

/* ════════════════════════════════════════════════
   UI COMPONENTS
════════════════════════════════════════════════ */
const Chip = ({ text, color="#6366f1", size=9 }) => (
  <span style={{ fontSize:size,fontWeight:700,padding:"2px 8px",borderRadius:12,background:`${color}18`,color,border:`1px solid ${color}33`,whiteSpace:"nowrap" }}>{text}</span>
);

const VerdictBadge = ({ v }) => {
  const cfg = {
    "STRONG BUY":["#091a09","#16a34a","#4ade80"],
    "BUY":       ["#0f1f12","#22c55e","#86efac"],
    "HOLD":      ["#1c1808","#ca8a04","#fbbf24"],
    "TACTICAL":  ["#0f1525","#3b82f6","#93c5fd"],
    "SELL":      ["#200a0a","#dc2626","#fca5a5"],
  }[v] || ["#1a1a2e","#6b7280","#9ca3af"];
  return <span style={{ fontSize:9,fontWeight:800,padding:"2px 9px",borderRadius:20,background:cfg[0],border:`1px solid ${cfg[1]}`,color:cfg[2],letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap" }}>{v}</span>;
};

function PriceTag({ ticker, live }) {
  const lv = live[ticker];
  const base = PRICES[ticker];
  const val = lv?.p || base;
  const isLive = !!lv?.p;
  const chg = lv?.chg ?? (lv?.p && base ? (lv.p-base)/base*100 : null);
  if (!val) return null;
  const isCrypto = ["BTC","ETH","SOL","XRP"].includes(ticker);
  const sym = ticker.includes(".")?"€":"$";
  const fmt = v => isCrypto ? sym+Number(v).toLocaleString("it",{maximumFractionDigits:0}) : sym+Number(v).toLocaleString("it",{minimumFractionDigits:2,maximumFractionDigits:2});
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4 }}>
      <span style={{ fontSize:12,fontWeight:700,color:isLive?"#4ade80":"rgba(255,255,255,.8)" }}>{fmt(val)}</span>
      {chg!=null && <span style={{ fontSize:9,color:chg>=0?"#4ade80":"#fca5a5" }}>{chg>=0?"+":""}{Number(chg).toFixed(1)}%</span>}
      {isLive && <span style={{ width:4,height:4,borderRadius:"50%",background:"#16a34a",display:"inline-block" }}/>}
    </span>
  );
}

/* ════════════════════════════════════════════════
   INVESTOR CARD
════════════════════════════════════════════════ */
function InvestorSection({ inv, live }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ background:`linear-gradient(135deg,${inv.color}0d,rgba(255,255,255,.02))`,border:`1px solid ${inv.color}33`,borderRadius:14,overflow:"hidden" }}>
      <div style={{ padding:"14px 16px",borderBottom:`1px solid ${inv.color}22` }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap" }}>
          <span style={{ fontSize:30 }}>{inv.emoji}</span>
          <div>
            <div style={{ fontSize:15,fontWeight:800,color:inv.accent,fontFamily:"'Playfair Display',serif" }}>{inv.name}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,.4)" }}>{inv.title}</div>
          </div>
        </div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6,marginBottom:6 }}>{inv.thesis}</div>
      </div>
      <div style={{ padding:"12px 16px",display:"grid",gap:8 }}>
        {inv.picks.map(p => {
          const base = PRICES[p.t];
          const curPrice = live[p.t]?.p || base;
          const isOpen = open === p.t;
          const rr = p.t1 && p.sl && curPrice ? ((p.t1-curPrice)/Math.abs(curPrice-p.sl)).toFixed(1) : null;
          const sym = p.t.includes(".")?"€":"$";
          return (
            <div key={p.t} style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderLeft:`3px solid ${inv.color}50`,borderRadius:10,overflow:"hidden" }}>
              <div onClick={()=>setOpen(isOpen?null:p.t)} style={{ padding:"10px 13px",cursor:"pointer",display:"flex",gap:10,alignItems:"center" }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginBottom:4 }}>
                    <span style={{ fontSize:13,fontWeight:800,color:"#fff" }}>{p.t}</span>
                    <PriceTag ticker={p.t} live={live}/>
                    <Chip text={p.cat} color={inv.accent} size={8}/>
                  </div>
                  <div style={{ height:4,background:"rgba(255,255,255,.08)",borderRadius:2,overflow:"hidden" }}>
                    <div style={{ width:`${p.cv*10}%`,height:"100%",background:`linear-gradient(90deg,${inv.color}88,${inv.color})`,borderRadius:2 }}/>
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:7,flexShrink:0 }}>
                  <VerdictBadge v={p.v}/>
                  <span style={{ color:"rgba(255,255,255,.25)",fontSize:13,transform:isOpen?"rotate(180deg)":"none",transition:"transform .25s" }}>▾</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding:"0 13px 13px",borderTop:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 11px",marginTop:8,marginBottom:8 }}>
                    <div style={{ fontSize:9,fontWeight:700,color:inv.accent,marginBottom:3,textTransform:"uppercase",letterSpacing:".5px" }}>📌 Tesi</div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,.72)",lineHeight:1.6 }}>{p.why}</div>
                  </div>
                  {p.entry && p.sl && (
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:8 }}>
                      {[
                        ["🟢 Entry",`${sym}${p.e}`,"#4ade80"],
                        ["🔴 Stop",`${sym}${p.sl}`,"#f87171"],
                        ["🎯 Target 1",`${sym}${p.t1}`+` (+${p.t1&&curPrice?Math.round((p.t1-curPrice)/curPrice*100):0}%)`,inv.accent],
                        ["🚀 Target 2",`${sym}${p.t2}`+` (+${p.t2&&curPrice?Math.round((p.t2-curPrice)/curPrice*100):0}%)`,inv.accent],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{ background:"rgba(255,255,255,.04)",borderRadius:7,padding:"7px 9px" }}>
                          <div style={{ fontSize:8,color:"rgba(255,255,255,.35)",marginBottom:2 }}>{l}</div>
                          <div style={{ fontSize:11,fontWeight:700,color:c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {rr && <div style={{ fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:6 }}>⚖️ Risk/Reward: <strong style={{color:Number(rr)>=2?"#4ade80":"#fbbf24"}}>{rr}:1</strong></div>}
                  <a href={`https://www.tradingview.com/chart/?symbol=${p.t.includes(".")?p.t:("NASDAQ:"+p.t)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:9,color:"rgba(100,180,255,.55)" }}>📊 Grafico TradingView ↗</a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ENTRY SCAN
════════════════════════════════════════════════ */
function ScanTab({ live }) {
  const [openG, setOpenG] = useState(null);
  return (
    <div>
      <div style={{ background:"rgba(99,102,241,.06)",border:"1px solid rgba(99,102,241,.25)",borderRadius:12,padding:"12px 16px",marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:800,color:"#a5b4fc",marginBottom:6 }}>🔍 Scan di Mercato</div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6 }}>
          3 catalyst IMMINENTI definiscono questa settimana: <strong style={{color:"#ef4444"}}>FOMC 17/6</strong> (Warsh hawkish → gold up), <strong style={{color:"#fbbf24"}}>MRVL S&P 500 22/6</strong> (forced $4B), <strong style={{color:"#a5b4fc"}}>SPCX Nasdaq-100 fine giugno</strong> ($22-27B meccanico). Posizionarsi ORA prima che la massa si accorga.
        </div>
      </div>
      {ENTRIES.map((g, gi) => (
        <div key={gi} style={{ marginBottom:10 }}>
          <div onClick={()=>setOpenG(openG===gi?null:gi)} style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:2 }}>
                <span style={{ fontSize:12,fontWeight:700,color:"#fff" }}>{g.group}</span>
                <span style={{ fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:10,background:g.urgency.startsWith("🔴")?"rgba(239,68,68,.2)":g.urgency.startsWith("🟡")?"rgba(234,179,8,.15)":g.urgency.startsWith("🟢")?"rgba(34,197,94,.12)":"rgba(99,102,241,.15)",color:g.urgency.startsWith("🔴")?"#fca5a5":g.urgency.startsWith("🟡")?"#fbbf24":g.urgency.startsWith("🟢")?"#4ade80":"#a5b4fc" }}>{g.urgency}</span>
              </div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,.4)" }}>{g.trades.length} trade • clicca per espandere</div>
            </div>
            <span style={{ color:"rgba(255,255,255,.25)",fontSize:16,transform:openG===gi?"rotate(180deg)":"none",transition:"transform .25s" }}>▾</span>
          </div>
          {openG===gi && (
            <div style={{ background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.08)",borderTop:"none",borderRadius:"0 0 10px 10px",padding:"12px 14px" }}>
              <div style={{ display:"grid",gap:8 }}>
                {g.trades.map(tr => (
                  <div key={tr.t} style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"10px 13px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                      <span style={{ fontSize:13,fontWeight:800,color:"#fff" }}>{tr.t}</span>
                      <PriceTag ticker={tr.t} live={live}/>
                      <Chip text={`R:R ${tr.rr}`} color="#22c55e" size={8}/>
                      <Chip text={tr.tf} color="rgba(255,255,255,.4)" size={8}/>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:5,marginBottom:6 }}>
                      {[["🟢 Entry",tr.entry,"#4ade80"],["🔴 Stop",tr.stop,"#f87171"],["🎯 T1",tr.t1,"#a5b4fc"],["🚀 T2",tr.t2,"#c084fc"]].map(([l,v,c])=>(
                        <div key={l} style={{ background:"rgba(255,255,255,.04)",borderRadius:6,padding:"5px 8px" }}>
                          <div style={{ fontSize:8,color:"rgba(255,255,255,.35)",marginBottom:1 }}>{l}</div>
                          <div style={{ fontSize:10,fontWeight:700,color:c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,.58)",lineHeight:1.5,marginBottom:4 }}>{tr.note}</div>
                    <a href={`https://www.tradingview.com/chart/?symbol=NASDAQ:${tr.t}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:9,color:"rgba(100,180,255,.5)" }}>📊 TradingView ↗</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   PORTFOLIO TRACKER
════════════════════════════════════════════════ */
function PortfolioTab({ live }) {
  const [pos, setPos] = useState(PORTFOLIO_DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [np, setNp] = useState({ t:"",q:"",e:"",n:"" });

  useEffect(()=>{ sGet("pf_v5").then(s=>{ if(s?.length)setPos(s); setLoaded(true); }); },[]);
  useEffect(()=>{ if(loaded)sSet("pf_v5",pos); },[pos,loaded]);

  const gP = t => live[t]?.p || PRICES[t] || 0;
  const toE = usd => usd/EUR_USD;
  const fE = v => "€"+(Math.abs(v)>=1000?(v/1000).toFixed(1)+"K":Math.abs(v).toFixed(0));
  const fP = v => (v>=0?"+":"")+v.toFixed(1)+"%";
  const ACT = { HOLD:"#22c55e", HOLD_MONITOR:"#f59e0b", SELL:"#ef4444" };
  const ALB = { HOLD:"HOLD", HOLD_MONITOR:"MONITOR", SELL:"VENDI ORA" };
  const INP = { background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.18)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",width:"100%" };

  const rows = pos.map(p=>{ const cur=gP(p.t),pnl=(cur-p.e)*p.q; return{...p,cur,pnl,pnlPct:p.e>0?pnl/p.e/p.q*100:0,curE:toE(cur*p.q),pnlE:toE(pnl)}; });
  const totE = rows.reduce((s,r)=>s+r.curE,0)+CASH;
  const totPnl = rows.reduce((s,r)=>s+r.pnlE,0);
  const totInv = rows.reduce((s,r)=>s+toE(r.e*r.q),0);

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:14 }}>
        {[["💰 Totale",`€${totE.toFixed(0)}`,"#fff"],["📈 P&L",fE(totPnl),totPnl>=0?"#4ade80":"#fca5a5"],["📊 P&L %",fP(totInv>0?totPnl/totInv*100:0),totPnl>=0?"#4ade80":"#fca5a5"],["💵 Cash",`€${CASH.toFixed(0)}`,"#22c55e"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:"9px 11px" }}>
            <div style={{ fontSize:9,color:"rgba(255,255,255,.38)",marginBottom:3 }}>{l}</div>
            <div style={{ fontSize:16,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gap:8,marginBottom:10 }}>
        {rows.map(r=>(
          <div key={r.id} style={{ background:"rgba(255,255,255,.03)",border:`1px solid ${r.pnl>=0?"rgba(34,197,94,.2)":"rgba(239,68,68,.18)"}`,borderLeft:`3px solid ${ACT[r.a]||"#6b7280"}`,borderRadius:10,padding:"11px 13px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3 }}>
              <span style={{ fontSize:14,fontWeight:800,color:"#fff" }}>{r.t}</span>
              <span style={{ fontSize:10,color:"rgba(255,255,255,.4)" }}>{r.q}sh@${r.e}</span>
              <PriceTag ticker={r.t} live={live}/>
              <Chip text={ALB[r.a]||"HOLD"} color={ACT[r.a]||"#6b7280"} size={8}/>
              <button onClick={()=>setPos(p=>p.filter(x=>x.id!==r.id))} style={{ marginLeft:"auto",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:5,padding:"2px 7px",color:"#fca5a5",cursor:"pointer",fontSize:10,fontFamily:"inherit" }}>✕</button>
            </div>
            <div style={{ display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
              <span style={{ fontSize:14,fontWeight:800,color:r.pnl>=0?"#4ade80":"#fca5a5" }}>{fP(r.pnlPct)}</span>
              <span style={{ fontSize:11,color:r.pnl>=0?"#4ade80":"#fca5a5" }}>{fE(r.pnlE)}</span>
              <span style={{ fontSize:10,color:"rgba(255,255,255,.35)" }}>Val: {fE(r.curE)}</span>
            </div>
            {r.n && <div style={{ fontSize:9,color:"rgba(255,255,255,.28)",marginTop:4 }}>📌 {r.n}</div>}
            <a href={`https://www.tradingview.com/chart/?symbol=NASDAQ:${r.t}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:9,color:"rgba(100,180,255,.5)",display:"inline-block",marginTop:4 }}>📊 TradingView ↗</a>
          </div>
        ))}
        <div style={{ background:"rgba(34,197,94,.04)",border:"1px solid rgba(34,197,94,.2)",borderLeft:"3px solid #22c55e",borderRadius:10,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div><div style={{ fontSize:12,fontWeight:700,color:"#fff" }}>EUR Cash</div><div style={{ fontSize:9,color:"rgba(255,255,255,.35)",marginTop:2 }}>Consiglio: 7×IAU (~€305) + KKR leggero (~€20)</div></div>
          <span style={{ fontSize:16,fontWeight:800,color:"#4ade80" }}>€{CASH.toFixed(2)}</span>
        </div>
      </div>
      {!adding
        ? <button onClick={()=>setAdding(true)} style={{ width:"100%",padding:"9px",borderRadius:9,border:"1px dashed rgba(255,255,255,.2)",background:"transparent",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:12,fontFamily:"inherit" }}>+ Aggiungi posizione</button>
        : <div style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"13px" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
              {[["TICKER","t","NVDA"],["QUANTITÀ","q","1"],["PREZZO $","e","210"],["NOTA","n","descrizione"]].map(([l,k,ph])=>(
                <div key={k}><div style={{ fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:4 }}>{l}</div>
                <input value={np[k]} onChange={e=>setNp(p=>({...p,[k]:k==="t"?e.target.value.toUpperCase():e.target.value}))} placeholder={ph} type={["q","e"].includes(k)?"number":"text"} style={INP}/></div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>{ if(!np.t||!np.q||!np.e)return; setPos(p=>[...p,{id:"p"+Date.now(),t:np.t,q:parseFloat(np.q),e:parseFloat(np.e),n:np.n,a:"HOLD"}]); setNp({t:"",q:"",e:"",n:""}); setAdding(false); }} style={{ flex:1,padding:"8px",borderRadius:8,border:"1px solid #22c55e",background:"rgba(34,197,94,.15)",color:"#4ade80",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>✓ Aggiungi</button>
              <button onClick={()=>setAdding(false)} style={{ flex:1,padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:12,fontFamily:"inherit" }}>✕</button>
            </div>
          </div>}
    </div>
  );
}

/* ════════════════════════════════════════════════
   DCA TAB
════════════════════════════════════════════════ */
function DCATab() {
  const [monthly, setMonthly] = useState(300);
  const [years, setYears] = useState(10);
  const scenarios = [
    { l:"All Weather 7.45%", r:0.0745, c:"#22c55e" },
    { l:"S&P 10.45%", r:0.1045, c:"#6366f1" },
    { l:"Ottimistico 13%", r:0.13, c:"#f59e0b" },
  ];
  const lines = scenarios.map(s=>buildDCA(monthly,years,s.r));
  const chartData = lines[0].map((_,i)=>{
    const o={y:lines[0][i].y,inv:lines[0][i].inv};
    scenarios.forEach((s,j)=>{ o[j]=lines[j][i].v; });
    return o;
  });
  return (
    <div>
      <div style={{ background:"rgba(99,102,241,.06)",border:"1px solid rgba(99,102,241,.25)",borderRadius:12,padding:"14px 16px",marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:800,color:"#a5b4fc",marginBottom:8 }}>📊 Simulatore DCA — Prove matematiche</div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.6 }}>
          Partendo da <strong style={{color:"#fff"}}>€1.054</strong> (portafoglio attuale) + DCA mensile su VOO/IAU/VWCE.
          Il compounding è la forza più potente in finanza: <strong style={{color:"#4ade80"}}>€300/mese × 10 anni = €58K+ a 10.45% CAGR</strong>.
        </div>
      </div>
      <div style={{ display:"flex",gap:14,marginBottom:14,flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:6 }}>€/MESE</div>
          <div style={{ display:"flex",gap:5 }}>
            {[100,200,300,500].map(v=>(
              <button key={v} onClick={()=>setMonthly(v)} style={{ padding:"5px 12px",borderRadius:8,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",background:monthly===v?"rgba(99,102,241,.3)":"rgba(255,255,255,.04)",borderColor:monthly===v?"#6366f1":"rgba(255,255,255,.1)",color:monthly===v?"#a5b4fc":"rgba(255,255,255,.5)" }}>€{v}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:6 }}>ANNI</div>
          <div style={{ display:"flex",gap:5 }}>
            {[5,10,15,20].map(v=>(
              <button key={v} onClick={()=>setYears(v)} style={{ padding:"5px 12px",borderRadius:8,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",background:years===v?"rgba(99,102,241,.3)":"rgba(255,255,255,.04)",borderColor:years===v?"#6366f1":"rgba(255,255,255,.1)",color:years===v?"#a5b4fc":"rgba(255,255,255,.5)" }}>{v}Y</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:14 }}>
        {scenarios.map((s,j)=>{
          const fin=lines[j][years]; const inv=1054+monthly*12*years;
          return(
            <div key={s.l} style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:"10px 12px" }}>
              <div style={{ fontSize:9,color:"rgba(255,255,255,.38)",marginBottom:3 }}>{s.l}</div>
              <div style={{ fontSize:16,fontWeight:800,color:s.c }}>€{fin.v.toLocaleString("it")}</div>
              <div style={{ fontSize:9,color:"#4ade80",marginTop:2 }}>+€{(fin.v-inv).toLocaleString("it")}</div>
              <div style={{ fontSize:8,color:"rgba(255,255,255,.25)",marginTop:2 }}>Inv: €{inv.toLocaleString("it")}</div>
            </div>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top:0,right:0,bottom:0,left:-15 }}>
          <defs>
            {scenarios.map(s=>(
              <linearGradient key={s.l} id={`g${s.c.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.c} stopOpacity={0.2}/><stop offset="95%" stopColor={s.c} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="y" tick={{fill:"rgba(255,255,255,.4)",fontSize:9}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"rgba(255,255,255,.4)",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`€${(v/1000).toFixed(0)}K`:`€${v}`}/>
          <Tooltip contentStyle={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,fontSize:10}} formatter={v=>[`€${Number(v).toLocaleString("it")}`]}/>
          <Area type="monotone" dataKey="inv" stroke="rgba(255,255,255,.2)" strokeWidth={1} fill="rgba(255,255,255,.03)" strokeDasharray="4 4" name="Investito"/>
          {scenarios.map((s,j)=>(
            <Area key={s.l} type="monotone" dataKey={j} stroke={s.c} strokeWidth={2} fill={`url(#g${s.c.replace("#","")})`} dot={false} name={s.l}/>
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ fontSize:9,color:"rgba(255,255,255,.22)",marginTop:6,textAlign:"center" }}>Partendo da €1.054. La linea tratteggiata = capitale investito. Dati storici, non garanzia futura.</div>

      {/* Allocation breakdown */}
      <div style={{ marginTop:14,background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:"12px 14px" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#4ade80",marginBottom:8 }}>🎯 Allocazione Consigliata del DCA Mensile</div>
        {[["40%","VOO","S&P 500 backbone — CAGR 10.45% storico 30 anni"],["20%","VWCE","World equity — diversificazione geografica 50 paesi"],["15%","IAU","Gold hedge — correlazione -0.05 con stocks"],["15%","NVDA","AI core — mantieni e accumula su ogni -10%"],["10%","Speculativo","SPCX, MRVL, PLTR — event-driven, dimensioni piccole"]].map(([pct,t,d])=>(
          <div key={t} style={{ display:"flex",gap:10,marginBottom:6,alignItems:"flex-start" }}>
            <span style={{ fontSize:12,fontWeight:800,color:"#4ade80",minWidth:36,flexShrink:0 }}>{pct}</span>
            <span style={{ fontSize:11,fontWeight:700,color:"#fff",minWidth:55,flexShrink:0 }}>{t}</span>
            <span style={{ fontSize:10,color:"rgba(255,255,255,.5)",lineHeight:1.5 }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Q&A CHAT
════════════════════════════════════════════════ */
const QA_Q = [
  {id:"q1",e:"🚀",t:"SPCX",q:"SpaceX SPCX: sei riuscito ad acquistarla da IBKR? Stai pianificando di entrare su un pullback?"},
  {id:"q2",e:"📊",t:"MRVL",q:"MRVL con S&P 500 inclusion in arrivo. Sei entrato? La finestra si chiude presto."},
  {id:"q3",e:"🏛️",t:"FOMC",q:"FOMC: Warsh mantiene tassi. Come ti posizioni? Stai comprando IAU/GDX prima dell'evento?"},
  {id:"q4",e:"💼",t:"Portfolio",q:"Hai già venduto NRGV? E i €326.77 di cash: qual è il piano di deploy questa settimana?"},
  {id:"q5",e:"🪙",t:"Gold",q:"Gold giù dal massimo storico di febbraio 2026. IAU = entry interessante? Quante shares comprare con il cash disponibile?"},
  {id:"q6",e:"₿",t:"BTC",q:"BTC: su Crypto.com hai ancora BTC, XRP, SOL? Come stanno performando? Stop-loss impostati?"},
  {id:"q7",e:"⚡",t:"SNDK",q:"SNDK (+120% da $700). Stai tenendo tutta la posizione? Trailing stop impostato?"},
  {id:"q8",e:"🎯",t:"Obiettivo",q:"Obiettivo finale del portafoglio: importo e anni? Serve per calibrare il DCA e le scelte di rischio."},
];

function QATab() {
  const [msgs,setMsgs]=useState([]);
  const [aq,setAq]=useState(null);
  const [val,setVal]=useState("");
  const [loading,setLoading]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const ref=useRef(null);
  const fmt=ts=>new Date(ts).toLocaleTimeString("it",{hour:"2-digit",minute:"2-digit"});

  useEffect(()=>{ sGet("qa_v8").then(s=>{ if(s?.length)setMsgs(s); setLoaded(true); }); },[]);
  useEffect(()=>{ if(loaded)sSet("qa_v8",msgs.slice(-60)); },[msgs,loaded]);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=async()=>{
    if(!val.trim()||!aq)return;
    const q=QA_Q.find(x=>x.id===aq);
    const ans=val.trim();
    setMsgs(m=>[...m,{type:"q",text:q.q,emoji:q.e,topic:q.t,ts:Date.now()},{type:"a",text:ans,ts:Date.now()},{type:"thinking",ts:Date.now()}]);
    setVal(""); setAq(null); setLoading(true);
    const ai=await askClaude(q.q,ans);
    setLoading(false);
    setMsgs(m=>[...m.filter(x=>x.type!=="thinking"),{type:"analysis",text:ai||fallback(q.t,ans),topic:q.t,ts:Date.now()}]);
  };

  return (
    <div style={{ background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,overflow:"hidden" }}>
      <div style={{ background:"rgba(255,255,255,.04)",padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>🧠 Dialogo AI</div>
          <div style={{ fontSize:10,color:"rgba(255,255,255,.35)",marginTop:2 }}>Rispondimi. Ogni risposta personalizza l'analisi con dati reali. · {msgs.length} messaggi</div>
        </div>
        {msgs.length>0&&<button onClick={()=>{setMsgs([]);sSet("qa_v8",[]);}} style={{fontSize:10,color:"rgba(255,255,255,.3)",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>🗑</button>}
      </div>
      <div style={{ padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:6,marginBottom:aq?10:0 }}>
          {QA_Q.map(q=>(
            <button key={q.id} onClick={()=>setAq(q.id===aq?null:q.id)} style={{ background:aq===q.id?"rgba(168,85,247,.2)":"rgba(255,255,255,.04)",border:`1px solid ${aq===q.id?"rgba(168,85,247,.6)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"7px 9px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all .2s" }}>
              <div style={{ fontSize:14,marginBottom:2 }}>{q.e}</div>
              <div style={{ fontSize:9,fontWeight:700,color:aq===q.id?"#c084fc":"rgba(255,255,255,.65)" }}>{q.t}</div>
            </button>
          ))}
        </div>
        {aq&&(
          <div style={{ background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.2)",borderRadius:8,padding:"10px 12px" }}>
            <div style={{ fontSize:11,color:"rgba(200,160,255,.9)",marginBottom:8,lineHeight:1.5 }}>{QA_Q.find(q=>q.id===aq)?.e} {QA_Q.find(q=>q.id===aq)?.q}</div>
            <div style={{ display:"flex",gap:8 }}>
              <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Scrivi qui..." style={{ flex:1,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit" }}/>
              <button onClick={send} disabled={!val.trim()||loading} style={{ background:val.trim()&&!loading?"rgba(168,85,247,.4)":"rgba(255,255,255,.06)",border:"1px solid rgba(168,85,247,.4)",borderRadius:8,padding:"8px 14px",color:"#c084fc",cursor:val.trim()&&!loading?"pointer":"not-allowed",fontSize:12,fontWeight:700,fontFamily:"inherit",flexShrink:0 }}>{loading?"...":"→"}</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ maxHeight:300,overflowY:"auto",padding:"10px 14px" }}>
        {msgs.length===0&&<div style={{ textAlign:"center",padding:"20px 0",color:"rgba(255,255,255,.2)",fontSize:12 }}>Seleziona una domanda e rispondimi.</div>}
        {msgs.map((m,i)=>(
          <div key={i} style={{ marginBottom:10 }}>
            {m.type==="q"&&<div style={{ display:"flex",gap:8 }}><span style={{ fontSize:16,flexShrink:0 }}>{m.emoji}</span><div style={{ background:"rgba(255,255,255,.06)",borderRadius:"12px 12px 12px 4px",padding:"8px 12px",maxWidth:"85%" }}><div style={{ fontSize:9,color:"rgba(255,255,255,.3)",marginBottom:3 }}>CLAUDE · {fmt(m.ts)}</div><div style={{ fontSize:11,color:"rgba(255,255,255,.72)",lineHeight:1.55 }}>{m.text}</div></div></div>}
            {m.type==="a"&&<div style={{ display:"flex",justifyContent:"flex-end" }}><div style={{ background:"rgba(99,102,241,.25)",border:"1px solid rgba(99,102,241,.3)",borderRadius:"12px 12px 4px 12px",padding:"8px 12px",maxWidth:"85%" }}><div style={{ fontSize:9,color:"rgba(200,200,255,.4)",marginBottom:3 }}>TU · {fmt(m.ts)}</div><div style={{ fontSize:12,color:"rgba(255,255,255,.85)" }}>{m.text}</div></div></div>}
            {m.type==="thinking"&&<div style={{ display:"flex",gap:8,alignItems:"center" }}><span style={{ fontSize:16 }}>🧠</span><div style={{ background:"rgba(255,255,255,.04)",borderRadius:"12px 12px 12px 4px",padding:"8px 12px" }}><div style={{ display:"flex",gap:4 }}>{[0,1,2].map(j=><span key={j} style={{ width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,.4)",display:"inline-block",animation:"pulse 1.2s infinite",animationDelay:`${j*.2}s` }}/>)}</div></div></div>}
            {m.type==="analysis"&&<div style={{ display:"flex",gap:8,alignItems:"flex-start" }}><span style={{ fontSize:16,flexShrink:0 }}>⚡</span><div style={{ background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:"12px 12px 12px 4px",padding:"10px 13px",maxWidth:"92%" }}><div style={{ fontSize:9,color:"rgba(100,255,150,.4)",marginBottom:4 }}>ANALISI AI · {fmt(m.ts)}</div><div style={{ fontSize:12,color:"rgba(255,255,255,.82)",lineHeight:1.65 }}>{m.text}</div></div></div>}
          </div>
        ))}
        {loading&&<div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:10 }}><span style={{ fontSize:16 }}>🧠</span><div style={{ background:"rgba(255,255,255,.04)",borderRadius:"12px 12px 12px 4px",padding:"8px 12px" }}><div style={{ display:"flex",gap:4 }}>{[0,1,2].map(j=><span key={j} style={{ width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,.4)",display:"inline-block",animation:"pulse 1.2s infinite",animationDelay:`${j*.2}s` }}/>)}</div></div></div>}
        <div ref={ref}/>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════
   LUCCHETTO PIN — protegge il Portfolio
   da chi entra per caso nel sito (è pubblico).
════════════════════════════════════════════════ */
function PinGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pf_unlocked") === "1") setUnlocked(true);
  }, []);

  const check = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const d = await r.json();
      if (d.ok) {
        setUnlocked(true);
        sessionStorage.setItem("pf_unlocked", "1"); // resta sbloccato solo per questa visita
      } else if (d.configurato === false) {
        setError("PIN non configurato su Vercel. Impostalo in Settings → Environment Variables.");
      } else {
        setError("PIN errato. Riprova.");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    }
    setLoading(false);
  };

  if (unlocked) return children;

  return (
    <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:"40px 24px",textAlign:"center",maxWidth:320,margin:"40px auto" }}>
      <div style={{ fontSize:32,marginBottom:10 }}>🔒</div>
      <div style={{ fontSize:14,fontWeight:700,color:"#fff",marginBottom:6 }}>Area Protetta</div>
      <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:16 }}>Inserisci il PIN per vedere il portafoglio</div>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
        onKeyDown={e => e.key === "Enter" && check()}
        placeholder="••••"
        style={{ width:"100%",textAlign:"center",fontSize:20,letterSpacing:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,padding:"10px",color:"#fff",marginBottom:12,fontFamily:"inherit" }}
      />
      <button onClick={check} disabled={loading || pin.length < 4} style={{ width:"100%",padding:"10px",borderRadius:8,border:"1px solid #6366f1",background:"rgba(99,102,241,.25)",color:"#a5b4fc",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>
        {loading ? "Verifica…" : "Entra"}
      </button>
      {error && <div style={{ fontSize:10,color:"#fca5a5",marginTop:10 }}>{error}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("scan");
  const [live, setLive] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpd, setLastUpd] = useState(null);
  const [ni, setNi] = useState(0);
  const [invTab, setInvTab] = useState("buffett");

  useEffect(()=>{ const t=setInterval(()=>setNi(i=>(i+1)%NEWS.length),5000); return()=>clearInterval(t); },[]);

  const refresh = useCallback(async()=>{
    setRefreshing(true);
    const tickers=["AAPL","MSFT","NVDA","GOOGL","META","MRVL","SPCX","SNDK","INTC","MU","DELL","PLTR","CRWD","V","AXP","JPM","KKR","BLK","OXY","CVX","CCJ","IAU","GLD","GDX","JNJ","NVO","LLY","ISRG","LMT","RTX","HEI","RHM.DE","LDO.MI","CMG","KO","VOO","QQQ","SMH","BRK.B","TLT","IBIT","CRML","NRGV","TEVA","C","AXON","ASML"];
    const cryptoTickers=["BTC","ETH","SOL","XRP"];
    const upd = await fetchAllPrices(tickers, cryptoTickers);
    if(Object.keys(upd).length) setLive(p=>({...p,...upd}));
    setLastUpd(Date.now()); setRefreshing(false);
  },[]);

  useEffect(()=>{ refresh(); const i=setInterval(refresh,5*60*1000); return()=>clearInterval(i); },[refresh]);

  const TABS=[["scan","🔍 Scan"],["investitori","🎩 Investitori"],["portfolio","💼 Portfolio"],["dca","📈 DCA"],["qa","🧠 Q&A"]];

  const gP=t=>live[t]?.p||PRICES[t]||0;
  const fP=v=>v>=1000?`$${(v/1000).toFixed(1)}K`:`$${Number(v).toLocaleString("it",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  return (
    <div style={{ minHeight:"100vh",background:"#06060f",color:"#fff",fontFamily:"'DM Sans',system-ui,sans-serif",backgroundImage:"radial-gradient(ellipse at 10% 40%,rgba(20,10,60,.4) 0%,transparent 55%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes slideL{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
        input:focus{outline:none}a{text-decoration:none}
      `}</style>

      {/* News ticker */}
      <div style={{ background:"rgba(99,102,241,.08)",borderBottom:"1px solid rgba(99,102,241,.2)",padding:"7px 14px",display:"flex",gap:10,alignItems:"center" }}>
        <span style={{ fontSize:9,fontWeight:800,color:"#a5b4fc",letterSpacing:1.5,textTransform:"uppercase",flexShrink:0,background:"rgba(99,102,241,.2)",padding:"2px 7px",borderRadius:4 }}>📰 contenuti del {CONTENT_LAST_UPDATED}</span>
        <div key={ni} style={{ fontSize:11,color:"rgba(255,255,255,.78)",animation:"slideL .4s ease",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{NEWS[ni]}</div>
        <button onClick={refresh} disabled={refreshing} style={{ flexShrink:0,fontSize:10,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,padding:"3px 9px",color:"rgba(255,255,255,.5)",cursor:refreshing?"not-allowed":"pointer",fontFamily:"inherit" }}>{refreshing?"↻…":"↻"}</button>
      </div>

      {/* Live prices ticker */}
      <div style={{ background:"rgba(255,255,255,.02)",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"6px 14px",display:"flex",gap:12,overflowX:"auto",alignItems:"center" }}>
        {[
          {l:"S&P",v:gP("SP500")||7431,fx:v=>v.toLocaleString("it"),c:"#4ade80",d:"-0.63%"},
          {l:"DOW",v:gP("DOW")||51202,fx:v=>v.toLocaleString("it"),c:"#4ade80",d:"+0.07%"},
          {l:"VIX",v:17.68,fx:v=>v,c:"#f59e0b",d:"+1.65%"},
          {l:"Gold",v:4238,fx:v=>"$"+v.toLocaleString("it"),c:"#fbbf24",d:"+3.03%"},
          {l:"BTC",t:"BTC"},{l:"SPCX🚀",t:"SPCX"},{l:"NVDA",t:"NVDA"},
          {l:"MRVL⚡",t:"MRVL"},{l:"IAU",t:"IAU"},{l:"VOO",t:"VOO"},
          {l:"KKR",t:"KKR"},{l:"RHM",t:"RHM.DE"},{l:"SNDK",t:"SNDK"},
        ].map((tk,i)=>{
          const lv=tk.t?live[tk.t]:null;
          const val=lv?.p||tk.v;
          const base=tk.t?PRICES[tk.t]:null;
          const isLive=!!lv?.p;
          const chg=lv?.chg??(lv?.p&&base?(lv.p-base)/base*100:null);
          const isCrypto=["BTC","ETH","SOL"].includes(tk.t);
          const fmt=tk.fx??(v=>isCrypto?"$"+Number(v).toLocaleString("it",{maximumFractionDigits:0}):tk.t?.includes(".")?"€"+Number(v).toFixed(2):"$"+Number(v).toLocaleString("it",{minimumFractionDigits:2,maximumFractionDigits:2}));
          return(
            <div key={i} style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0 }}>
              <span style={{ fontSize:9,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:.3 }}>{tk.l}</span>
              <span style={{ fontSize:10,fontWeight:700,color:isLive?"#4ade80":tk.c||"rgba(255,255,255,.78)" }}>{val?fmt(val):"—"}</span>
              {(chg??tk.d!=null)&&<span style={{ fontSize:9,color:Number(chg||(tk.d||"0").replace(/[^0-9.-]/g,""))>=0?"#4ade80":"#fca5a5" }}>{chg!=null?(chg>=0?"+":"")+chg.toFixed(1)+"%":tk.d}</span>}
              {isLive&&<span style={{ width:4,height:4,borderRadius:"50%",background:"#16a34a",display:"inline-block" }}/>}
            </div>
          );
        })}
        {lastUpd&&!refreshing&&<span style={{ marginLeft:"auto",flexShrink:0,fontSize:9,color:"rgba(255,255,255,.2)" }}>upd {new Date(lastUpd).toLocaleTimeString("it",{hour:"2-digit",minute:"2-digit"})}</span>}
      </div>

      {/* Header */}
      <div style={{ padding:"14px 16px 0",textAlign:"center",maxWidth:960,margin:"0 auto" }}>
        <h1 style={{ fontSize:"clamp(18px,5vw,34px)",fontWeight:800,fontFamily:"'Playfair Display',serif",margin:"0 0 3px",background:"linear-gradient(135deg,#fff,rgba(255,255,255,.45))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
          Investor Minds PRO
        </h1>
        <p style={{ color:"rgba(255,255,255,.3)",fontSize:11,margin:"0 0 12px" }}>
          Aggiornato al {dataOggiFormattata()} · SPCX · MRVL S&P · FOMC · Buffett, Burry, Lynch, Dalio, Druckenmiller
        </p>

        {/* FOMC countdown banner */}
        <div style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",borderRadius:10,padding:"8px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"center" }}>
          <span style={{ fontSize:11,fontWeight:700,color:"#fca5a5" }}>🏛️ {countdownText(EVENTS.fomc, "FOMC Decision", "FOMC Decision", "FOMC Decision: avvenuta")}</span>
          <span style={{ fontSize:10,color:"rgba(255,200,200,.6)" }}>Warsh hawkish atteso → Gold up, TLT down → Comprare IAU PRIMA dell'evento</span>
        </div>

        <div style={{ display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",marginBottom:14 }}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:"7px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .2s",background:tab===k?"rgba(255,255,255,.15)":"rgba(255,255,255,.04)",borderColor:tab===k?"rgba(255,255,255,.4)":"rgba(255,255,255,.1)",color:tab===k?"#fff":"rgba(255,255,255,.45)" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:960,margin:"0 auto",padding:"0 14px 44px",animation:"fadeUp .35s ease" }}>
        {tab==="scan" && <ScanTab live={live}/>}

        {tab==="investitori" && (
          <div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
              {INVESTORS.map(inv=>(
                <button key={inv.id} onClick={()=>setInvTab(inv.id)} style={{ padding:"7px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .2s",background:invTab===inv.id?`${inv.color}33`:"rgba(255,255,255,.04)",borderColor:invTab===inv.id?inv.color:"rgba(255,255,255,.1)",color:invTab===inv.id?inv.accent:"rgba(255,255,255,.45)" }}>
                  {inv.emoji} {inv.name}
                </button>
              ))}
            </div>
            {INVESTORS.filter(inv=>inv.id===invTab).map(inv=>(
              <InvestorSection key={inv.id} inv={inv} live={live}/>
            ))}
          </div>
        )}

        {tab==="portfolio" && (
          <PinGate>
          <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:18 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
              <div>
                <div style={{ fontSize:14,fontWeight:800,color:"#fff" }}>💼 Portafoglio IBKR — Raul</div>
                <div style={{ fontSize:10,color:"rgba(255,255,255,.35)" }}>Prezzi live · P&L aggiornato</div>
              </div>
              <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ fontSize:10,color:"rgba(100,180,255,.7)",background:"rgba(99,150,255,.08)",border:"1px solid rgba(99,150,255,.2)",borderRadius:8,padding:"5px 10px" }}>📊 TradingView ↗</a>
            </div>
            <PortfolioTab live={live}/>
          </div>
          </PinGate>
        )}

        {tab==="dca" && <DCATab/>}
        {tab==="qa"  && <QATab/>}
      </div>
    </div>
  );
}
