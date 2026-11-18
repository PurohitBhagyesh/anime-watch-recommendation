import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Check, Calculator, Eye } from 'lucide-react';

interface AuthCaptchaProps {
  onVerifyChange: (verified: boolean) => void;
  /** Increment to force a brand-new challenge (e.g., after a failed login/signup attempt) */
  resetTrigger?: number;
  disabled?: boolean;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MIN_HUMAN_SOLVE_MS = 850; // Deterring instant script form-fillers

function cryptoRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function generateVisualCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CHARS[cryptoRandomInt(CHARS.length)];
  }
  return out;
}

function generateMathChallenge(): { prompt: string; answer: string } {
  const a = 6 + cryptoRandomInt(19); // 6..24
  const b = 3 + cryptoRandomInt(15); // 3..17
  const subtract = cryptoRandomInt(2) === 1 && a > b;
  if (subtract) {
    return { prompt: `${a} − ${b} = ?`, answer: String(a - b) };
  }
  return { prompt: `${a} + ${b} = ?`, answer: String(a + b) };
}

function drawCaptchaCanvas(canvas: HTMLCanvasElement, code: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Obsidian Luxury background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f0f15');
  grad.addColorStop(1, '#171722');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric noise lines
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(83, 96, 230, 0.34)' : 'rgba(245, 245, 247, 0.14)';
    ctx.lineWidth = 1.1 + (cryptoRandomInt(10) / 10);
    ctx.moveTo(cryptoRandomInt(width * 0.25), cryptoRandomInt(height));
    ctx.bezierCurveTo(
      width * 0.3 + cryptoRandomInt(width * 0.2),
      cryptoRandomInt(height),
      width * 0.6 + cryptoRandomInt(width * 0.2),
      cryptoRandomInt(height),
      width - cryptoRandomInt(width * 0.2),
      cryptoRandomInt(height)
    );
    ctx.stroke();
  }

  // Random speckle dots
  for (let i = 0; i < 42; i++) {
    ctx.fillStyle =
      i % 3 === 0 ? 'rgba(117, 130, 255, 0.28)' : 'rgba(154, 154, 166, 0.22)';
    ctx.beginPath();
    ctx.arc(
      cryptoRandomInt(width),
      cryptoRandomInt(height),
      0.8 + (cryptoRandomInt(12) / 10),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Render distorted characters with per-glyph jitter & rotation
  const stepX = (width - 36) / code.length;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const x = 22 + i * stepX + (cryptoRandomInt(6) - 3);
    const y = height / 2 + 8 + (cryptoRandomInt(10) - 5);
    const angle = ((cryptoRandomInt(34) - 17) * Math.PI) / 180;
    const fontSize = 23 + cryptoRandomInt(5);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.fillStyle = i % 3 === 0 ? '#9aa5ff' : '#f5f5f7';
    ctx.shadowColor = 'rgba(83, 96, 230, 0.35)';
    ctx.shadowBlur = 4;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }
}

export const AuthCaptcha: React.FC<AuthCaptchaProps> = ({
  onVerifyChange,
  resetTrigger = 0,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'visual' | 'math'>('visual');
  const [visualCode, setVisualCode] = useState<string>(() => generateVisualCode());
  const [mathChallenge, setMathChallenge] = useState(() => generateMathChallenge());
  const [userInput, setUserInput] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const issuedAtRef = useRef<number>(Date.now());

  const issueNewChallenge = useCallback(
    (nextMode?: 'visual' | 'math') => {
      const targetMode = nextMode ?? mode;
      issuedAtRef.current = Date.now();
      setUserInput('');
      setVerified(false);
      setFeedback(null);
      onVerifyChange(false);
      if (targetMode === 'visual') {
        setVisualCode(generateVisualCode());
      } else {
        setMathChallenge(generateMathChallenge());
      }
    },
    [mode, onVerifyChange]
  );

  // Redraw canvas whenever visual code or mode changes
  useEffect(() => {
    if (mode === 'visual' && canvasRef.current) {
      drawCaptchaCanvas(canvasRef.current, visualCode);
    }
  }, [mode, visualCode]);

  // Reset challenge externally when parent increments resetTrigger (e.g., failed auth or tab switch)
  useEffect(() => {
    if (resetTrigger > 0) {
      issueNewChallenge();
    }
  }, [resetTrigger, issueNewChallenge]);

  // Expire verified state after TTL
  useEffect(() => {
    if (!verified) return;
    const timer = setTimeout(() => {
      issueNewChallenge();
      setFeedback('Security check expired. Please verify again.');
    }, CHALLENGE_TTL_MS);
    return () => clearTimeout(timer);
  }, [verified, issueNewChallenge]);

  const validateAttempt = (rawVal: string) => {
    if (disabled) return;
    setFeedback(null);

    // Honeypot trap: bots autofilling hidden fields fail silently
    if (honeypot.trim().length > 0) {
      issueNewChallenge();
      setFeedback('Automated submission detected. Please try again.');
      return;
    }

    const elapsed = Date.now() - issuedAtRef.current;
    if (elapsed > CHALLENGE_TTL_MS) {
      issueNewChallenge();
      setFeedback('Challenge expired. Enter the new code.');
      return;
    }

    const cleaned = rawVal.replace(/\s+/g, '').toUpperCase();
    const expected = mode === 'visual' ? visualCode : mathChallenge.answer;

    if (cleaned === expected) {
      if (elapsed < MIN_HUMAN_SOLVE_MS) {
        setFeedback('Please wait a moment and click Verify.');
        return;
      }
      setVerified(true);
      setFeedback(null);
      onVerifyChange(true);
    } else {
      setVerified(false);
      onVerifyChange(false);
      setFeedback(
        mode === 'visual'
          ? 'Code does not match. Check the characters and try again.'
          : 'Incorrect answer. Please solve the math check.'
      );
    }
  };

  const handleInputChange = (val: string) => {
    const cleaned =
      mode === 'visual'
        ? val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
        : val.replace(/[^0-9-]/g, '').slice(0, 4);

    setUserInput(cleaned);
    setFeedback(null);

    if (verified) {
      setVerified(false);
      onVerifyChange(false);
    }

    // Auto-verify seamlessly once the user types the exact expected visual code or math result
    const expected = mode === 'visual' ? visualCode : mathChallenge.answer;
    if (
      cleaned.length === expected.length &&
      cleaned === expected &&
      honeypot.trim().length === 0 &&
      Date.now() - issuedAtRef.current >= MIN_HUMAN_SOLVE_MS
    ) {
      setVerified(true);
      onVerifyChange(true);
    }
  };

  return (
    <div className="rounded-2xl bg-[#121217] border border-[#23232b] p-3.5 space-y-2.5">
      {/* Offscreen honeypot input invisible to humans */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="as-hp-website">Website</label>
        <input
          id="as-hp-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck
            aria-hidden="true"
            className={`w-3.5 h-3.5 flex-shrink-0 ${verified ? 'text-emerald-400' : 'text-[#7582ff]'}`}
          />
          <span className="text-[11px] font-semibold text-[#d2d2dc] truncate">
            Human Verification
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const nextMode = mode === 'visual' ? 'math' : 'visual';
              setMode(nextMode);
              issueNewChallenge(nextMode);
            }}
            title={mode === 'visual' ? 'Switch to accessible math challenge' : 'Switch to visual code'}
            aria-label={mode === 'visual' ? 'Switch to math verification' : 'Switch to visual code'}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#191922] hover:bg-[#22222d] border border-[#282834] text-[10px] font-medium text-[#9a9aa6] hover:text-[#f5f5f7] transition cursor-pointer disabled:opacity-45"
          >
            {mode === 'visual' ? (
              <>
                <Calculator aria-hidden="true" className="w-3 h-3" />
                <span>Math</span>
              </>
            ) : (
              <>
                <Eye aria-hidden="true" className="w-3 h-3" />
                <span>Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => issueNewChallenge()}
            title="Generate new challenge"
            aria-label="Generate new CAPTCHA challenge"
            className="p-1.5 rounded-lg bg-[#191922] hover:bg-[#22222d] border border-[#282834] text-[#9a9aa6] hover:text-[#f5f5f7] transition cursor-pointer disabled:opacity-45"
          >
            <RefreshCw aria-hidden="true" className="w-3 h-3" />
          </button>
        </div>
      </div>

      {verified ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
          <span className="inline-flex items-center gap-2">
            <Check aria-hidden="true" className="w-4 h-4 text-emerald-400" />
            <span>Verified human</span>
          </span>
          <button
            type="button"
            onClick={() => issueNewChallenge()}
            className="text-[11px] text-[#9a9aa6] hover:text-white transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            {mode === 'visual' ? (
              <canvas
                ref={canvasRef}
                width={176}
                height={48}
                aria-label="Security verification image code"
                className="rounded-xl border border-[#2a2a36] flex-shrink-0 select-none"
              />
            ) : (
              <div
                aria-live="polite"
                className="h-12 px-3.5 rounded-xl bg-[#0f0f15] border border-[#2a2a36] flex items-center justify-center font-mono text-sm font-bold text-[#f5f5f7] tracking-wide flex-shrink-0 min-w-[120px] select-none"
              >
                {mathChallenge.prompt}
              </div>
            )}

            <div className="flex-1 min-w-0 flex gap-1.5">
              <input
                type="text"
                inputMode={mode === 'math' ? 'numeric' : 'text'}
                autoComplete="off"
                spellCheck={false}
                disabled={disabled}
                aria-label={mode === 'visual' ? 'Enter the 6-character security code' : 'Enter math answer'}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    validateAttempt(userInput);
                  }
                }}
                placeholder={mode === 'visual' ? 'Enter code' : 'Answer'}
                className="anilist-input w-full min-w-0 px-3 py-2 text-sm font-mono tracking-wider text-white placeholder:text-[#666672] uppercase"
              />
              <button
                type="button"
                disabled={disabled || userInput.length === 0}
                onClick={() => validateAttempt(userInput)}
                className="px-3 py-2 rounded-xl bg-[#5360e6] hover:bg-[#6470f2] text-white text-xs font-semibold transition flex-shrink-0 cursor-pointer disabled:opacity-40"
              >
                Verify
              </button>
            </div>
          </div>

          {feedback && (
            <p className="text-[11px] text-rose-300 leading-snug" role="alert">
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
