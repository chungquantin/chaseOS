"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterProps = {
  phrases: string[];
  className?: string;
};

export function Typewriter({ phrases, className = "" }: TypewriterProps) {
  const stablePhrases = useMemo(() => phrases.filter(Boolean), [phrases]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(phrases[0]?.length ?? 0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (stablePhrases.length === 0) return;

    const phrase = stablePhrases[phraseIndex];
    const isComplete = !isDeleting && charIndex === phrase.length;
    const isEmpty = isDeleting && charIndex === 0;
    const delay = isComplete ? 1500 : isEmpty ? 320 : isDeleting ? 24 : 42;

    const timeout = window.setTimeout(() => {
      if (isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isEmpty) {
        setIsDeleting(false);
        setPhraseIndex((current) => (current + 1) % stablePhrases.length);
        return;
      }

      setCharIndex((current) => current + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, stablePhrases]);

  const text = stablePhrases[phraseIndex]?.slice(0, charIndex) ?? "";

  return (
    <span className={className} aria-label={stablePhrases[phraseIndex]}>
      {text}
      <span className="typewriter-caret" aria-hidden="true" />
    </span>
  );
}
