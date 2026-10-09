import { useState } from 'react';

export default function Lobby({ code, onLeave }) {
  const [copied, setCopied] = useState('');
  const link = `${window.location.origin}${import.meta.env.BASE_URL}?room=${code}`;

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hand Cricket', text: `Join my Hand Cricket game! Room code: ${code}`, url: link });
        return;
      } catch {
        /* cancelled — fall back to copying */
      }
    }
    copy(link, 'link');
  };

  return (
    <section className="screen center">
      <div className="card lobby">
        <p className="eyebrow">Your room code</p>
        <div className="room-code" aria-label={`Room code ${code.split('').join(' ')}`}>
          {code.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="lobby-actions">
          <button className="btn" onClick={() => copy(code, 'code')}>
            {copied === 'code' ? '✓ Copied' : 'Copy code'}
          </button>
          <button className="btn primary" onClick={share}>
            {copied === 'link' ? '✓ Link copied' : 'Share invite link'}
          </button>
        </div>
        <p className="waiting">
          Waiting for your opponent to join<span className="dots-anim" aria-hidden />
        </p>
        <button className="text-btn" onClick={onLeave}>
          Cancel
        </button>
      </div>
    </section>
  );
}
