/**
 * Hero background loop.
 *
 * The source is held in data-src and only attached once the element is close
 * to the viewport, so a 2.5MB video never blocks first paint. Playback runs at
 * quarter speed, as authored.
 */
const videos = document.querySelectorAll<HTMLVideoElement>('[data-hero-video]');

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

  if (reduced) {
    // Load a still frame rather than an animated loop.
    for (const video of videos) {
      if (video.dataset.src) {
        video.src = video.dataset.src;
        video.loop = false;
      }
    }
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
