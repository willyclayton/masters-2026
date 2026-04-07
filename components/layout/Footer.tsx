export function Footer() {
  return (
    <footer className="board-surface py-8">
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs text-white/40">
          For entertainment purposes only. AI predictions are probabilistic —
          that&apos;s what makes The Masters fun.
        </p>
        <p className="mt-2 text-xs text-white/40">
          Built with ⛳ by{" "}
          <a
            href="https://willyclayton.com"
            className="text-[#C8A951] hover:underline"
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
