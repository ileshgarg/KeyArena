'use client';

import React from 'react';

export type KeyboardLayout = 'qwerty' | 'qwertz' | 'azerty' | 'dvorak' | 'colemak';

interface VirtualKeyboardProps {
  layout?: KeyboardLayout;
  activeKey?: string | null;
  errorKey?: string | null;
  heatmapData?: Record<string, { total: number; errors: number }>;
  showHeatmap?: boolean;
}

const LAYOUT_ROWS: Record<KeyboardLayout, string[][]> = {
  qwerty: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Space']
  ],
  qwertz: [
    ['^', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', '´', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', '+', '#'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'Enter'],
    ['Shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', 'Shift'],
    ['Space']
  ],
  azerty: [
    ['²', '&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '=', 'Backspace'],
    ['Tab', 'a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$', '*'],
    ['Caps', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù', 'Enter'],
    ['Shift', 'w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!', 'Shift'],
    ['Space']
  ],
  dvorak: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', 'Backspace'],
    ['Tab', "'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l', '/', '=', '\\'],
    ['Caps', 'a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's', '-', 'Enter'],
    ['Shift', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z', 'Shift'],
    ['Space']
  ],
  colemak: [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';', '[', ']', '\\'],
    ['Caps', 'a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/', 'Shift'],
    ['Space']
  ]
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layout = 'qwerty',
  activeKey = null,
  errorKey = null,
  heatmapData = {},
  showHeatmap = false
}) => {
  const rows = LAYOUT_ROWS[layout] || LAYOUT_ROWS.qwerty;

  // Max error rate calculation for heatmap normalization
  let maxErrorRate = 0;
  if (showHeatmap && heatmapData) {
    Object.values(heatmapData).forEach((v) => {
      if (v.total >= 3) {
        const rate = v.errors / v.total;
        if (rate > maxErrorRate) maxErrorRate = rate;
      }
    });
  }

  const getKeyWidthClass = (key: string) => {
    switch (key) {
      case 'Backspace':
        return 'w-16';
      case 'Tab':
        return 'w-12';
      case 'Caps':
        return 'w-14';
      case 'Enter':
        return 'w-16';
      case 'Shift':
        return 'w-20';
      case 'Space':
        return 'w-72';
      default:
        return 'w-8 sm:w-9';
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 bg-bg-surface/70 border border-border rounded-lg select-none font-mono text-xs">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1 items-center justify-center">
          {row.map((k, kIdx) => {
            const keyLower = k.toLowerCase();
            const isActive = activeKey && activeKey.toLowerCase() === keyLower;
            const isError = errorKey && errorKey.toLowerCase() === keyLower;

            let heatBg = '';
            let heatBorder = '';

            if (showHeatmap && heatmapData && heatmapData[keyLower] && heatmapData[keyLower].total >= 3) {
              const errRate = heatmapData[keyLower].errors / heatmapData[keyLower].total;
              if (errRate > 0.3) {
                heatBg = 'bg-red-950/80 text-red-300';
                heatBorder = 'border-red-600';
              } else if (errRate > 0.15) {
                heatBg = 'bg-amber-950/70 text-amber-300';
                heatBorder = 'border-amber-600';
              } else {
                heatBg = 'bg-emerald-950/50 text-emerald-300';
                heatBorder = 'border-emerald-700';
              }
            }

            return (
              <div
                key={kIdx}
                className={`h-8 sm:h-9 flex items-center justify-center rounded border transition-all duration-75 text-[11px] font-medium ${getKeyWidthClass(
                  k
                )} ${
                  isError
                    ? 'bg-red-900/80 border-red-500 text-white scale-95'
                    : isActive
                    ? 'bg-accent text-bg-primary border-accent font-bold scale-95 shadow-sm'
                    : heatBg || 'bg-bg-subtle/80 text-text-secondary border-border/80 hover:border-border'
                } ${heatBorder}`}
              >
                {k === 'Space' ? 'space' : k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
