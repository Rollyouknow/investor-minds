// ════════════════════════════════════════════════
// CONTROLLO PIN — verifica se chi chiede l'accesso
// al Portfolio conosce il codice giusto.
// Il PIN vero NON è scritto qui: vive in un "segreto"
// su Vercel (Settings → Environment Variables → PORTFOLIO_PIN),
// invisibile a chiunque guardi il codice pubblico su GitHub.
// ════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }
  const { pin } = req.body || {};
  const correct = process.env.PORTFOLIO_PIN; // letto solo qui, mai inviato al browser

  if (!correct) {
    // Se non hai ancora impostato il PIN su Vercel, l'accesso resta bloccato
    // di default (più sicuro che lasciarlo aperto per errore).
    res.status(200).json({ ok: false, configurato: false });
    return;
  }

  res.status(200).json({ ok: pin === correct, configurato: true });
}
