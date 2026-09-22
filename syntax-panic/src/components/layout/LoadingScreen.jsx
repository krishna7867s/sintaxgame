const BOOT_LINES = [
  '> SYNTAX ENGINE v2.4 BOOTING...',
  '> LOADING ROM: campus_night_run.bin',
  '> MOUNT: /images/syntax_panic_logo.png',
  '> WEBHOOK BRIDGE [N8N] HANDSHAKE...',
  '> ALL SYSTEMS NOMINAL.',
];

export function LoadingScreen({ done }) {
  return (
    <div className={`loading-screen${done ? ' loading-screen--done' : ''}`}>
      <img
        src="/images/logo_animado.svg"
        alt="SYNTAX PANIC logo"
        className="loading-logo"
        style={{ animation: 'none', width: '200px', height: 'auto' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="loading-title">SYNTAX PANIC</div>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
      <div className="loading-sub mono">PRESS START TO BEGIN // {BOOT_LINES[3]}</div>
      <div className="mono tiny text-dim">v1.4 · ARCADE RUNNER BUILD</div>
    </div>
  );
}