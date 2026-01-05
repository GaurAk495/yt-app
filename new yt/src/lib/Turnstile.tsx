import { useEffect, useRef } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.turnstile || !ref.current) return;

    const widgetId = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token);
      },
      theme: "light",
      appearance: "interaction-only",
      size: "normal",
    });

    return () => {
      if (window.turnstile && widgetId) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onVerify]);

  return (
    <div className="rounded-2xl overflow-hidden">
      <div ref={ref} />
    </div>
  );
}
