/**
 * Hero background loop.
 *
 * The source is held in data-src and only attached once the element is near
 * the viewport, so the 1MB video never blocks first paint. Playback runs at
 * quarter speed, as authored.
 *
 * The loop is skipped entirely for visitors who have asked for reduced motion
 * or turned on Data Saver, and on 2g connections. In every one of those cases
 * the hero still renders its full composition — the tint and vignette sit over
 * the same near-black plate — so nothing is hidden, only the motion is.
 */
const videos = document.querySelectorAll<HTMLVideoElement>('[data-hero-video]');

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
const frugal = Boolean(
  connection?.saveData ||
  (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType))
);

const start = (video: HTMLVideoElement) => {
  if (!video.getAttribute('src') && video.dataset.src) {
    video.src = video.dataset.src;
  }
  video.muted = true;
  // Keeps a silent decorative loop out of AirPlay/Cast pickers.
  video.disableRemotePlayback = true;
  const rate = Number(video.dataset.rate);
  if (rate) video.playbackRate = rate;
  // Autoplay can still be refused (low power mode); the vignette stands alone.
  void video.play().catch(() => {});
};

if (videos.length) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || frugal) {
    // Leave the source unattached: nothing is downloaded, and the hero keeps
    // its tint, vignette and type over the near-black plate.
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start(entry.target as HTMLVideoElement);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '400px 0px' }
    );
    for (const video of videos) io.observe(video);
  } else {
    for (const video of videos) start(video);
  }
}
