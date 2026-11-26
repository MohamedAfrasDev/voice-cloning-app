// Hands text from one page to the text-to-speech form during a client-side
// navigation. Not the URL: that ends up in history, server logs and monitoring.
let draft: string | null = null;

export function setTtsDraft(text: string) {
  draft = text;
}

/** Returns the pending text once, then forgets it. */
export function takeTtsDraft() {
  const text = draft;
  draft = null;
  return text;
}
