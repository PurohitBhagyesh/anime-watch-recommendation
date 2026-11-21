import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Check, Calculator } from 'lucide-react';

interface AuthCaptchaProps {
  onVerifyChange: (verified: boolean) => void;
  /** Increment to force a brand-new challenge (e.g., after a failed login/signup attempt) */
  resetTrigger?: number;
  disabled?: boolean;
}

const CHALLENGE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MIN_HUMAN_SOLVE_MS = 650; // Protects against instant script form-fillers

function cryptoRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

interface MathProblem {
  prompt: string;
  answer: string;
}

function generateMathProblem(): MathProblem {
  const opType = cryptoRandomInt(3); // 0 = addition, 1 = subtraction, 2 = multiplication

  if (opType === 0) {
    // Addition: a (5..25) + b (3..18)
    const a = 5 + cryptoRandomInt(21);
    const b = 3 + cryptoRandomInt(16);
    return { prompt: `${a} + ${b}`, answer: String(a + b) };
  } else if (opType === 1) {
    // Subtraction: a (12..35) - b (3..15) with a > b
    const b = 3 + cryptoRandomInt(13);
    const a = b + 4 + cryptoRandomInt(18);
    return { prompt: `${a} − ${b}`, answer: String(a - b) };
  } else {
    // Multiplication: a (2..9) × b (2..9)
    const a = 2 + cryptoRandomInt(8);
    const b = 2 + cryptoRandomInt(8);
    return { prompt: `${a} × ${b}`, answer: String(a * b) };
  }
}

export const AuthCaptcha: React.FC<AuthCaptchaProps> = ({
  onVerifyChange,
  resetTrigger = 0,
  disabled = false,
}) => {
  const [challenge, setChallenge] = useState<MathProblem>(() => generateMathProblem());
  const [userInput, setUserInput] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const issuedAtRef = useRef<number>(Date.now());

  const issueNewChallenge = useCallback(() => {
    issuedAtRef.current = Date.now();
    setUserInput('');
    setVerified(false);
    setFeedback(null);
    onVerifyChange(false);
    setChallenge(generateMathProblem());
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 350);
  }, [onVerifyChange]);

  // Reset challenge externally when parent increments resetTrigger
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
      setFeedback('Verification expired. Please solve the new question.');
    }, CHALLENGE_TTL_MS);
    return () => clearTimeout(timer);
  }, [verified, issueNewChallenge]);

  const validateAttempt = (rawVal: string) => {
    if (disabled) return;
    setFeedback(null);

    // Honeypot trap: automated bots fail silently
    if (honeypot.trim().length > 0) {
      issueNewChallenge();
      setFeedback('Automated submission detected. Please try again.');
      return;
    }

    const elapsed = Date.now() - issuedAtRef.current;
    if (elapsed > CHALLENGE_TTL_MS) {
      issueNewChallenge();
      setFeedback('Question expired. Please solve the new equation.');
      return;
    }

    const cleaned = rawVal.trim();
    if (cleaned === challenge.answer) {
      if (elapsed < MIN_HUMAN_SOLVE_MS) {
        setFeedback('Please wait a moment and try again.');
        return;
      }
      setVerified(true);
      setFeedback(null);
      onVerifyChange(true);
    } else {
      setVerified(false);
      onVerifyChange(false);
      setFeedback('Incorrect answer. Please solve the math check.');
    }
  };

  const handleInputChange = (val: string) => {
    // Only allow digits and negative sign if applicable
    const cleaned = val.replace(/[^0-9-]/g, '').slice(0, 4);
    setUserInput(cleaned);
    setFeedback(null);

    if (verified) {
      setVerified(false);
      onVerifyChange(false);
    }

    // Auto-verify seamlessly once user types the correct answer
    if (
      cleaned === challenge.answer &&
      honeypot.trim().length === 0 &&
      Date.now() - issuedAtRef.current >= MIN_HUMAN_SOLVE_MS
    ) {
      setVerified(true);
      onVerifyChange(true);
    }
  };

  return (
    <div className="rounded-2xl bg-[#121217] border border-[#23232b] p-3 sm:p-3.5 space-y-2.5">
      {/* Offscreen honeypot input invisible to human users */}
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

      {/* Header: Title & Refresh button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck
            aria-hidden="true"
            className={`w-4 h-4 flex-shrink-0 transition-colors ${
              verified ? 'text-emerald-400' : 'text-[#5360e6]'
            }`}
          />
          <span className="text-xs font-semibold text-[#f5f5f7] truncate">
            Human Verification
          </span>
        </div>

        <button
          type="button"
          disabled={disabled || verified}
          onClick={issueNewChallenge}
          title="Get a new math question"
          aria-label="Refresh math question"
          className="inline-flex items-center gap-1 text-[11px] text-[#9a9aa6] hover:text-[#f5f5f7] transition p-1 rounded-lg hover:bg-[#1a1a24] disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw
            aria-hidden="true"
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">New question</span>
        </button>
      </div>

      {/* Challenge / Answer Section */}
      {verified ? (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            </span>
            <span className="truncate">Human verification confirmed</span>
          </div>
          <button
            type="button"
            onClick={issueNewChallenge}
            className="text-[11px] text-[#9a9aa6] hover:text-white underline underline-offset-2 flex-shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Prominent Math Question Display */}
            <div
              aria-live="polite"
              aria-label={`Math question: ${challenge.prompt} equals what?`}
              className="flex items-center justify-center px-2.5 sm:px-3 py-2 rounded-xl bg-[#0c0c0f] border border-[#23232b] font-mono text-sm sm:text-base font-bold text-[#f5f5f7] tracking-wide select-none flex-shrink-0 text-center"
            >
              <Calculator aria-hidden="true" className="w-3.5 h-3.5 text-[#5360e6] mr-1.5" />
              <span>{challenge.prompt} = ?</span>
            </div>

            {/* Answer Input */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                spellCheck={false}
                disabled={disabled}
                aria-label="Enter math answer"
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    validateAttempt(userInput);
                  }
                }}
                placeholder="Answer"
                className="anilist-input w-full min-w-0 px-2.5 py-2 text-base sm:text-sm font-mono tracking-wider text-white placeholder:text-[#666672] text-center"
              />
              <button
                type="button"
                disabled={disabled || userInput.trim().length === 0}
                onClick={() => validateAttempt(userInput)}
                className="px-3 py-2 rounded-xl bg-[#5360e6] hover:bg-[#6470f2] text-white text-xs font-semibold transition flex-shrink-0 cursor-pointer disabled:opacity-40 min-h-[38px]"
              >
                Verify
              </button>
            </div>
          </div>

          {feedback && (
            <p className="text-[11px] text-rose-300 leading-snug animate-fadeIn" role="alert">
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthCaptcha;
