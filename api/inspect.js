export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({error:'POST only'}); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(503).json({error:'AI inspection is not configured on this server.'}); return; }

  const { image } = req.body || {};
  if (!image || typeof image !== 'string') { res.status(400).json({error:'Missing image data.'}); return; }
  if (image.length > 4_000_000) { res.status(413).json({error:'Image too large.'}); return; }

  const prompt = 'This image is the front of one Pokémon Trading Card Game card, already cropped and straightened from a photo. Do two jobs: identify the card from its printed text, and inspect its physical condition the way a strict PSA grader would.\n\n'
    + 'Reply with only one JSON object with these keys:\n'
    + '{"is_pokemon_card": boolean, "name": string or null, "card_number": string or null, "set_name": string or null, "rarity": string or null, "finish": string or null, "language": string or null, "hp": number or null, "confidence": "high" | "medium" | "low", "notes": string, "condition": {"max_psa": integer from 1 to 10, "summary": string, "defects": [{"where": string, "type": string, "severity": "minor" | "moderate" | "major"}], "photo_limits": string}}\n\n'
    + 'Identification rules: card_number is exactly as printed, for example "125/197". Use null for anything you cannot read or are not sure of. Do not guess the set from the artwork alone: if the number or set symbol is unreadable, set set_name to null and lower the confidence. finish is one of "holo", "reverse holo", "non-holo", "full art", "unknown". notes is one short sentence on what was hard to read. If the image is not a Pokémon card, set is_pokemon_card to false.\n\n'
    + 'Condition rules: look at the corners, the edges, the border and the whole printed face. Report only defects you can actually see: whitening, chipping or rounding on corners and edges; creases, dents and bends; scratches, scuffs and print lines; dirt, grime, smudges, stains, ink marks, water damage or yellowing; cracked foil. Do not assume the card is clean. A photo can hide defects but cannot add them. "where" is short, such as "bottom edge, centre" or "text box, lower right". List the most important defects first, at most 8. max_psa is the highest PSA grade this card could plausibly receive on condition alone, ignoring centering. Anchors: 10 means no flaw you can see; 9 allows one or two very faint flaws; 8 allows light whitening on a few corners or edges, or faint scuffing; 7 means minor but obvious wear; 6 and 5 mean clear wear on corners and edges, or noticeable scuffs, dirt or a light crease; 4 or lower means creases, heavy dirt, stains or heavy edge wear. summary is one short sentence. photo_limits is one short sentence on anything that stopped you judging well (glare, blur, low resolution), or an empty string.';

  try {
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + key,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inlineData: { mimeType: 'image/jpeg', data: image } },
            { text: prompt }
          ]}],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.2 }
        })
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const msg = (err.error && err.error.message) || 'Gemini API error ' + resp.status;
      res.status(resp.status === 429 ? 429 : 502).json({ error: msg });
      return;
    }

    const data = await resp.json();
    const text = (data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
      && data.candidates[0].content.parts[0].text) || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) { res.status(502).json({ error: 'No JSON in AI response.' }); return; }

    res.status(200).json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}
