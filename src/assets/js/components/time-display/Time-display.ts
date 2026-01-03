/* =========================
   Types
========================= */

interface TimeDisplayConfig {
  container: string;
  updateInterval: number;
}

/* =========================
   Default Config
========================= */

const TIME_DISPLAY_CONFIG: TimeDisplayConfig = {
  container: '#local-time-display',
  updateInterval: 60000,
};

/* =========================
   Time Display
========================= */

const TimeDisplay = (config: Partial<TimeDisplayConfig> = {}) => {
  const finalConfig = { ...TIME_DISPLAY_CONFIG, ...config };

  const formatTime = (): string => {
    const date = new Date();
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
  };

  const updateDisplay = (): void => {
    const timeElement = document.querySelector(
      `${finalConfig.container} [data-time]`
    );
    if (!timeElement) return;

    timeElement.textContent = formatTime();
    timeElement.classList.remove('loading');
  };

  updateDisplay();
  setInterval(updateDisplay, finalConfig.updateInterval);
};

/* =========================
   Exports
========================= */

export { TimeDisplay, TIME_DISPLAY_CONFIG };