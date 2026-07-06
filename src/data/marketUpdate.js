export const CONTENT_LAST_UPDATED = "2026-07-04";

export const EVENTS = {
  fomc:      new Date("2026-07-29T00:00:00"),
  earnings:  new Date("2026-07-15T00:00:00"),
  reopening: new Date("2026-07-06T15:30:00"),
};

export function countdownText(date, f, o, p) {
  const d = Math.ceil((date - new Date()) / 86400000);
  return d > 1 ? `${f} tra ${d} giorni` : d === 1 ? `${f} domani` : d === 0 ? `${o} oggi` : `${p} (${Math.abs(d)}gg fa)`;
}

export function dataOggiFormattata() {
  return new Date().toLocaleDateString("it-IT", { day:"numeric", month:"long", year:"numeric" });
}

export const NEWS = [
  "🔴 AI CHIP SELL-OFF: SNDK -10%, MU -10%, AMD -4.3%, MRVL -9% | SOX -6.7% | Apple +4.8% (sourcing chip cinesi più economici — bearish SNDK)",
  "📊 DOW 52.900 ATH | S&P 7.483 | Nasdaq -0.8% | Mercati CHIUSI oggi e ieri (Independence Day) | Riaprono lunedì 6/7 h15:30 CET",
  "💼 Jobs giugno: 57.000 vs 115.000 attesi | Disoccupazione 4.2% | Fed meno hawkish | Probabilità rialzo luglio scende sotto 20%",
  "🥇 Gold sale su jobs deboli | Brent $72 (Iran peace hopes) | BTC $61.800 +2.5% | TLT beneficia da potenziale pivot Fed",
  "🔭 BURRY (confermato 30/6): ha shortato NVDA, Tesla e Caterpillar | 'Bolla AI in corso'",
  "🍎 Apple tratta con CXMT e YMTC (chip cinesi) per ridurre costi memoria — BEARISH per SNDK e MU strutturalmente",
  "📉 Meta (-5%): vende capacità AI in eccesso — segnale che ha sovra-investito | OpenAI vende 5% al governo USA",
  "🚀 SNDK +750% H1 2026 | MU +260% H1 2026 | 'Great Rotation': da tech AI a Blue Chip (DOW +8.9% H1, meglio dal 2021)",
  "🏦 FOMC minutes: 8 luglio | PepsiCo earnings: 9 luglio | ISM Services PMI: 6 luglio",
  "🛡️ LMT upgradato a BUY da Citi (target $582, +14%) | Difesa EU strutturalmente long | RHM.DE mantiene momentum",
  "📈 Bending Spoons (italiana) IPO Nasdaq: +42% primo giorno | Russell 2000 +22% H1 2026 (best dal 1991)",
  "⚡ Lunedì 6/7: 4 mosse concrete sul portafoglio | Vendi NRGV | Vendi 50% SNDK | Compra IAU | Stop SNDK $1.300",
];

export const PORTFOLIO_RAUL = {
  positions: [
    { t:"NVDA",  q:1,    e:170,   verdict:"HOLD", reason:"AI moat reale (CUDA). PEG <1. Ma Burry è short — non aggiungere ora." },
    { t:"SNDK",  q:0.2,  e:700,   verdict:"RIDUCI 50%", reason:"Apple sourcing chip cinesi = cliente principale cerca alternative. +750% H1 = ciclo maturo. Vendi 0.1 shares lunedì." },
    { t:"CRML",  q:24,   e:11.50, verdict:"HOLD", reason:"Posizione piccola. Tesis biotech LT intatta. Non toccare." },
    { t:"NRGV",  q:2,    e:5.73,  verdict:"VENDI ORA", reason:"Zero tesi. Zero moat. Zero catalyst. Libera €10." },
  ],
  cash: 326.77,
  actions: [
    { time:"Lunedì 15:31", action:"Vendi NRGV (2 shares)", ticker:"NRGV", borsa:"NYSE" },
    { time:"Lunedì 15:32", action:"Vendi SNDK (0.1 shares — metà posizione)", ticker:"SNDK", borsa:"NASDAQ" },
    { time:"Lunedì 15:35", action:"Compra IAU (7-8 shares con tutto il cash + proventi SNDK)", ticker:"IAU", borsa:"ARCA" },
    { time:"Subito", action:"Imposta Stop-Loss SNDK a $1.300 su IBKR", ticker:"SNDK", borsa:"NASDAQ" },
  ],
};

export const INVESTORS_ANALYSIS = [
  {
    id:"buffett", name:"Warren Buffett", emoji:"🎩", color:"#C8A456",
    mindset:"'Il prezzo è quello che paghi. Il valore è quello che ottieni.' Con il DOW ai massimi storici e jobs deboli, Buffett accumula pazientemente difensivi e oro.",
    on_sndk:"VENDI 50%. La memoria è un business ciclico senza moat durevole. Apple cerca chip cinesi più economici — il migliore cliente di SNDK sta guardando altrove. +750% in 6 mesi non è sostenibile.",
    on_nvda:"HOLD. CUDA è un moat reale. Abel ha comprato $10B di GOOGL — capisce il valore dell'AI infrastruttura. Non vendere nel panico del sell-off.",
    on_cash:"IAU SUBITO. Non perché ami l'oro — ma perché con tassi potenzialmente in calo e inflazione sticky, l'oro protegge il capitale. Lunedì 7-8 shares.",
    top_pick:"IAU — Gold. Hedge strutturale. Jobs deboli + Fed meno hawkish = oro sale.",
    avoid:"SNDK oltre la metà della posizione. La narrativa sta cambiando.",
    conviction:9,
  },
  {
    id:"burry", name:"Michael Burry", emoji:"🔭", color:"#2D6A9F",
    mindset:"'Ho shortato NVDA, Tesla e Caterpillar il 30 giugno.' La bolla AI è reale. Meta vende compute in eccesso. OpenAI vende equity al governo. Il castello di carta sta cedendo.",
    on_sndk:"VENDI 70-80%. Non il 50% — il 70-80%. +750% in 6 mesi su un business ciclico della memoria mentre il cliente principale (Apple) cerca alternative più economiche. Questo non è un dip, è un ciclo che gira.",
    on_nvda:"ATTENZIONE. Burry è short. Pattern tecnico di testa-spalla confermato. Topping pattern sotto la trend line. Se non fosse un'unica share, venderebbe. Con 1 share — hold ma con stop mentale $190.",
    on_cash:"GLD + TIPS. Inflazione strutturale + $36T debito USA. La Fed non può davvero tagliare senza far esplodere l'inflazione. Gold è la protezione giusta.",
    top_pick:"GLD (oro) + TEVA (P/E 8x, opioid settlement risolto) + C (Citigroup P/B 0.7x)",
    avoid:"Tutto ciò che è salito sul hype AI. Specialmente memoria (SNDK, MU).",
    conviction:10,
  },
  {
    id:"lynch", name:"Peter Lynch", emoji:"📈", color:"#2D8A4E",
    mindset:"'Segui i soldi.' Il DOW sale su Apple, McDonald's, Disney. I consumatori reali usano queste aziende ogni giorno. La rotazione da chip AI a Blue Chip è il segnale più importante della settimana.",
    on_sndk:"RIDUCI 50%. La storia sta cambiando — Apple sourcing chip cinesi. Ma Lynch non venderebbe tutto: 'La storia non è morta, solo il capitolo facile è finito.' Tieni 0.1 shares con stop.",
    on_nvda:"HOLD con convinzione. 'Se la tesi è intatta, il sell-off è un'opportunità.' CUDA moat, Blackwell ramp, AI capex non è finito — solo il primo capitolo sì. NVDA guiderà il secondo capitolo.",
    on_cash:"IAU per il gold. Ma guarda anche CCJ (Cameco/Uranium) — AI data center power demand + nuclear renaissance = il prossimo tenbagger che nessuno sta guardando.",
    top_pick:"CCJ (Cameco) — Uranium. AI power demand + nucleare. PEG <1. Tenbagger potenziale.",
    avoid:"Inseguire SNDK dopo +750%. Il primo che vende guadagna, l'ultimo paga.",
    conviction:8,
  },
  {
    id:"dalio", name:"Ray Dalio", emoji:"🌐", color:"#7B3FA0",
    mindset:"'La diversificazione è l'unico pasto gratis in finanza.' Il tuo portafoglio è 100% tech USA. In qualsiasi scenario di stress — recessione, inflazione, crisi geopolitica — non hai protezione.",
    on_sndk:"RIDUCI. Non per il prezzo — per la concentrazione. Hai troppo rischio settoriale in un business ciclico. La diversificazione non è opzionale.",
    on_nvda:"HOLD ma considera il profilo di rischio complessivo. NVDA in un All Weather è al massimo il 10% del portafoglio totale.",
    on_cash:"IAU (15% target All Weather) è la priorità assoluta. Poi TLT (bonds) quando hai più liquidità. Poi VWCE per diversificazione globale. In questo ordine.",
    top_pick:"IAU + TLT + VWCE — il triangolo dell'All Weather. Jobs deboli + potential Fed pivot = tutti e tre beneficiano.",
    avoid:"Concentrazione settoriale. 100% tech = il rischio più grande che stai correndo.",
    conviction:9,
  },
  {
    id:"druckenmiller", name:"Stan Druckenmiller", emoji:"⚡", color:"#e11d48",
    mindset:"'Quando hai ragione, sii aggressivo.' Il macro trade più chiaro del momento: jobs deboli + Fed meno hawkish + chip sell-off = LONG oro, LONG bonds, LONG BTC. SHORT semis.",
    on_sndk:"VENDI TUTTO o quasi. Druckenmiller è un macro trader — quando il ciclo gira, gira in fretta. -10% in un giorno su un titolo +750% YTD non è una correzione: è l'inizio del bear market specifico.",
    on_nvda:"Neutro/negativo. Il pattern tecnico è preoccupante. Ma con solo 1 share l'impatto è limitato. Stop mentale $190.",
    on_cash:"TLT aggressivamente. Se la Fed inizia a tagliare (scenario plausibile con jobs 57K), i bond lunghi 20Y possono salire del 20-30%. È il trade macro più pulito disponibile ora.",
    top_pick:"TLT (bond lunghi 20Y) — Fed pivot play. + IAU. + BTC (se Fed taglia, BTC $70K+).",
    avoid:"Chip memoria senza stop. Druckenmiller: 'La cosa più costosa in finanza è non tagliare le perdite.'",
    conviction:9,
  },
  {
    id:"soros", name:"George Soros", emoji:"♟️", color:"#6366f1",
    mindset:"'I mercati sono sempre in uno stato di incertezza e flusso.' La narrativa AI si sta incrinando. Meta vende AI in eccesso. OpenAI cerca soldi. Apple cerca chip più economici. Quando una narrativa cede, cede in fretta.",
    on_sndk:"Questo è il punto di inflexione. Soros entra e esce veloce quando le narrative cambiano. SNDK era la narrativa 'AI ha bisogno di memoria infinita.' Apple sta cercando alternative più economiche — la narrativa si sta rompendo.",
    on_nvda:"Più difficile. NVDA ha un moat reale (CUDA). Ma il sentiment è cambiato. Soros aspetterebbe la polvere si depositasse prima di aggiungere.",
    on_cash:"Gold e commodities. In un mondo di narrativa che si rompe, gli asset reali vincono.",
    top_pick:"IAU + posizione difensiva. Aspettare che la rotazione si stabilizzi prima di fare mosse aggressive.",
    avoid:"SNDK senza stop. 'Sopravvivere è più importante di vincere.'",
    conviction:8,
  },
];
