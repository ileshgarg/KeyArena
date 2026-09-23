export interface KeystrokeSample {
  key: string;
  timeMs: number;
}

export interface AntiCheatResult {
  isValid: boolean;
  scoreConfidence: number; // 0 to 100
  flags: string[];
}

export function validateTypingRun(
  keystrokes: KeystrokeSample[],
  wpm: number,
  elapsedMs: number,
  totalChars: number
): AntiCheatResult {
  const flags: string[] = [];
  let scoreConfidence = 100;

  // Rule 1: Max realistic human typing speed ceiling (world record burst is ~300 WPM)
  if (wpm > 320) {
    flags.push(`WPM ${wpm} exceeds physical human limits (>320 WPM)`);
    scoreConfidence -= 90;
  } else if (wpm > 250) {
    flags.push(`Extremely high WPM ${wpm} (>250 WPM)`);
    scoreConfidence -= 25;
  }

  // Rule 2: Minimum elapsed time
  if (elapsedMs < 1000 && totalChars > 20) {
    flags.push(`Elapsed time ${elapsedMs}ms impossibly short for ${totalChars} chars`);
    scoreConfidence -= 90;
  }

  // Rule 3: Keystroke timeline analysis
  if (keystrokes.length >= 10) {
    const intervals: number[] = [];
    for (let i = 1; i < keystrokes.length; i++) {
      const diff = keystrokes[i].timeMs - keystrokes[i - 1].timeMs;
      if (diff >= 0) {
        intervals.push(diff);
      }
    }

    if (intervals.length >= 10) {
      // Sub-human interval check (< 20ms)
      const ultraFastCount = intervals.filter((dt) => dt < 20).length;
      const ultraFastRatio = ultraFastCount / intervals.length;
      if (ultraFastRatio > 0.3) {
        flags.push(`Suspiciously fast keypress intervals (<20ms in ${Math.round(ultraFastRatio * 100)}% of keys)`);
        scoreConfidence -= 60;
      }

      // Macro uniformity check (standard deviation of intervals)
      const mean = intervals.reduce((acc, v) => acc + v, 0) / intervals.length;
      const variance = intervals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      // Human keystrokes naturally have significant interval variance (typically > 15ms)
      if (stdDev < 5 && intervals.length > 25) {
        flags.push(`Unnatural keystroke uniformity (stdDev ${stdDev.toFixed(2)}ms indicates bot/macro)`);
        scoreConfidence -= 75;
      }
    }
  }

  return {
    isValid: scoreConfidence >= 50 && flags.length === 0,
    scoreConfidence: Math.max(0, Math.min(100, scoreConfidence)),
    flags
  };
}
