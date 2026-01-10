import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { TimeDisplay } from "./Time-display"

describe('TimeDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should render time on the page', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time class="loading"></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-01-15T14:05:00'));

    TimeDisplay();

    const timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toBeTruthy();
    expect(timeElement?.textContent).toContain('Jan 15');
    expect(timeElement?.textContent).toContain('2:05 PM');
  });

  it('should show time element with AM/PM format', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    
    // Test AM
    vi.setSystemTime(new Date('2024-03-20T09:15:00'));
    TimeDisplay();
    
    let timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('9:15 AM');

    // Test PM
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-03-20T15:45:00'));
    TimeDisplay();
    
    timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('3:45 PM');
  });

  it('should show short weekday format', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    
    // Monday
    vi.setSystemTime(new Date('2024-01-15T14:30:00'));
    TimeDisplay();
    
    let timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('Mon');

    // Friday
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-01-19T14:30:00'));
    TimeDisplay();
    
    timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('Fri');
  });

  it('should show zero-padded minutes', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-01-15T14:05:00'));

    TimeDisplay();

    const timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('2:05 PM');
  });

  it('should update display immediately on init', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time class="loading"></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-01-15T14:30:00'));

    const timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toBe('');
    expect(timeElement?.classList.contains('loading')).toBe(true);

    TimeDisplay();

    expect(timeElement?.textContent).toBeTruthy();
    expect(timeElement?.textContent).toContain('Jan 15');
    expect(timeElement?.textContent).toContain('2:30 PM');
    expect(timeElement?.classList.contains('loading')).toBe(false);
  });

  it('should handle missing container gracefully', () => {
    document.body.innerHTML = '<div></div>';

    expect(() => TimeDisplay()).not.toThrow();
  });

  it('should handle missing time element gracefully', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <div>No time element here</div>
      </div>
    `;

    expect(() => TimeDisplay()).not.toThrow();
  });

  it('should update at intervals', () => {
    document.body.innerHTML = `
      <div id="local-time-display">
        <time data-time></time>
      </div>
    `;
    vi.setSystemTime(new Date('2024-01-15T14:30:00'));

    TimeDisplay({ updateInterval: 60000 });
    
    const timeElement = document.querySelector('[data-time]');
    expect(timeElement?.textContent).toContain('2:30 PM');

    // Advance time by 1 minute
    vi.setSystemTime(new Date('2024-01-15T14:31:00'));
    vi.advanceTimersByTime(60000);

    expect(timeElement?.textContent).toContain('2:31 PM');
  });
});