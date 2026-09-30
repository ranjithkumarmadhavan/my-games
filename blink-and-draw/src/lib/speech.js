export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

let voice = null;

function chooseVoice() {
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => /^en[-_]/i.test(v.lang) && /google/i.test(v.name)) ||
    voices.find((v) => /^en[-_](US|GB|IN|AU)/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
}

if (canSpeak) {
  chooseVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', chooseVoice);
}

export function speak(text, { rate = 1 } = {}) {
  if (!canSpeak) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || 'en-US';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

// Mobile Chrome only allows speech that starts from a user gesture, so a silent
// utterance is queued from the tap that starts the round.
export function primeSpeech() {
  if (!canSpeak) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}
