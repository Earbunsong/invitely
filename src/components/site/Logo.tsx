import { site } from "@/config/site";

/** Placeholder wordmark — replace with your own logo. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 font-heading text-2xl font-extrabold tracking-tight">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
        <path d="M5 10 L16 18 L27 10" fill="none" stroke="#e07a5f" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="4" y="8" width="24" height="17" rx="3" fill="none" stroke={light ? "#fff" : "#6b8f71"} strokeWidth="2.4" />
        <path d="M16 4.5c-1.2-1.6-4-1-4 1.1 0 2 4 4.4 4 4.4s4-2.4 4-4.4c0-2.1-2.8-2.7-4-1.1z" fill="#e07a5f" />
      </svg>
      <span className={light ? "text-white" : "text-sage"}>{site.name.slice(0, Math.ceil(site.name.length / 2))}</span>
      <span className="-ml-1.5 text-coral">{site.name.slice(Math.ceil(site.name.length / 2))}</span>
    </span>
  );
}
