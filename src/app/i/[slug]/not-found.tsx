import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-blush p-6 text-center">
      <p className="text-5xl">💌</p>
      <h1 className="font-heading text-2xl font-bold">Invitation not found</h1>
      <p className="max-w-sm text-muted">This invitation link is not valid, or it hasn&apos;t been published yet.</p>
      <Link href="/" className="btn-coral rounded-full px-6 py-3 font-heading font-semibold text-white">
        Go to homepage
      </Link>
    </main>
  );
}
