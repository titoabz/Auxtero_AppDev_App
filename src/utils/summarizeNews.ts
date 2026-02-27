function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => cleanText(part))
    .filter(Boolean);
}

export function summarizeNews(title: string, body: string, maxLength = 180) {
  const normalizedTitle = cleanText(title);
  const normalizedBody = cleanText(body);

  if (!normalizedBody) {
    return `${normalizedTitle}. Read full details in the source link.`;
  }

  const sentences = splitSentences(normalizedBody);
  const firstSentence = sentences[0] || normalizedBody;
  const secondSentence = sentences[1] || '';

  const combined = cleanText(`${firstSentence} ${secondSentence}`);
  const baseSummary = combined.length > 0 ? combined : normalizedBody;

  if (baseSummary.length <= maxLength) {
    return baseSummary;
  }

  return `${baseSummary.slice(0, maxLength - 1).trimEnd()}…`;
}
