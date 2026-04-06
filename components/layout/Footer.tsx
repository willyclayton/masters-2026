export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          For entertainment purposes only. AI predictions are probabilistic —
          that&apos;s what makes The Masters fun.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Built with ⛳ by{" "}
          <a
            href="https://willyclayton.com"
            className="text-masters-green hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Will Clayton
          </a>
        </p>
      </div>
    </footer>
  );
}
