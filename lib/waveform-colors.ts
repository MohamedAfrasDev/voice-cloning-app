/** Current theme colors for canvas drawing, which can't resolve CSS variables. */
export function getWaveformColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  const progress = read("--waveform-progress");

  return {
    waveColor: read("--waveform"),
    progressColor: progress,
    cursorColor: progress,
  };
}
