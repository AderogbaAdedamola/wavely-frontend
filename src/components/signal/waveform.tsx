"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WaveMode } from "@/lib/wa-state";

interface WaveConfig {
  amplitude: number;
  periods: number;
  duration: number;
  color: string;
  strokeWidth: number;
  /** Optional second, fainter wave layered behind for "live". */
  echo?: { amplitude: number; periods: number; phase: number };
  animated: boolean;
}

const VIEW_W = 1200;

function configFor(mode: WaveMode, h: number): WaveConfig {
  const mid = h / 2;
  switch (mode) {
    case "live":
      return {
        amplitude: mid * 0.62,
        periods: 4,
        duration: 7,
        color: "var(--signal)",
        strokeWidth: 2.5,
        echo: { amplitude: mid * 0.34, periods: 6, phase: Math.PI / 3 },
        animated: true,
      };
    case "idle":
      return {
        amplitude: mid * 0.32,
        periods: 3,
        duration: 15,
        color: "var(--aqua)",
        strokeWidth: 2,
        animated: true,
      };
    case "flat":
    default:
      return {
        amplitude: 2.5,
        periods: 5,
        duration: 0,
        color: "var(--standby)",
        strokeWidth: 2,
        animated: false,
      };
  }
}

/** Sine polyline across the full view width. Integer `periods` => seamless tile. */
function wavePath(h: number, amplitude: number, periods: number, phase: number) {
  const steps = periods * 28;
  const mid = h / 2;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * VIEW_W;
    const y = mid + amplitude * Math.sin((i / steps) * periods * 2 * Math.PI + phase);
    d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(2)}` : ` L${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return d;
}

interface WaveformProps {
  mode: WaveMode;
  height?: number;
  className?: string;
}

/**
 * The console's signature: a scrolling signal waveform whose shape reflects the
 * live WhatsApp connection. Amber + tall when transmitting, aqua + gentle when
 * listening, a near-flat grey line when offline.
 */
export function Waveform({ mode, height = 96, className }: WaveformProps) {
  const cfg = useMemo(() => configFor(mode, height), [mode, height]);

  const mainPath = useMemo(
    () => wavePath(height, cfg.amplitude, cfg.periods, 0),
    [height, cfg.amplitude, cfg.periods],
  );
  const echoPath = useMemo(
    () =>
      cfg.echo
        ? wavePath(height, cfg.echo.amplitude, cfg.echo.periods, cfg.echo.phase)
        : null,
    [height, cfg.echo],
  );

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        height,
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ color: cfg.color }}
      >
        {/* baseline */}
        <line
          x1="0"
          y1={height / 2}
          x2={VIEW_W}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <g
          className={cfg.animated ? "wave-scroll" : undefined}
          style={
            cfg.animated
              ? ({ "--wave-duration": `${cfg.duration}s` } as React.CSSProperties)
              : undefined
          }
        >
          {[0, VIEW_W].map((offset) => (
            <g key={offset} transform={`translate(${offset} 0)`}>
              {echoPath && (
                <path
                  d={echoPath}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={cfg.strokeWidth}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <path
                d={mainPath}
                fill="none"
                stroke="currentColor"
                strokeWidth={cfg.strokeWidth}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
