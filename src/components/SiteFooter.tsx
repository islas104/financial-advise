export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-2/40">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          <strong className="text-ink-soft">Educational only — not financial advice.</strong>{" "}
          financial·advise shows illustrative, general-information portfolios to help you learn. It
          is not a personal recommendation and is not provided by an FCA-authorised firm. Investing
          carries risk and you may get back less than you put in. Always do your own research and
          consider speaking to a regulated adviser before investing.
        </p>
        <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} financial·advise</p>
      </div>
    </footer>
  );
}
