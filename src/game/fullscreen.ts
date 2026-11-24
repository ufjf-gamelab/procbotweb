export function canFullscreen(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenEnabled;
}

export function isFullscreen(): boolean {
  return typeof document !== 'undefined' && !!document.fullscreenElement;
}

function isStandalone(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
}

function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

export async function enterFullscreen(): Promise<void> {
  if (!canFullscreen() || isFullscreen()) return;
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
  } catch {
    return;
  }
}

export async function exitFullscreen(): Promise<void> {
  if (!isFullscreen()) return;
  try {
    await document.exitFullscreen();
  } catch {
    return;
  }
}

export function enterFullscreenOnMobile(): void {
  if (isTouchDevice() && !isStandalone()) void enterFullscreen();
}
