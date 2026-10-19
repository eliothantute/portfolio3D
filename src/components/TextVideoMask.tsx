import React, { useEffect, useId, useRef, useState } from 'react';

interface LineMetrics {
  text: string;
  x: number;
  y: number;
  width: number;
}

interface TextVideoMaskProps {
  lines: string[];
  textClassName: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// Renders the real, accessible text (solid colour — also the visual
// fallback) and overlays `children` (a video, canvas, animation…) clipped to
// an SVG mask built from actual measured <text> elements, one per line, so
// whatever is passed only shows through the glyph shapes. Browsers do not
// rasterize HTML/foreignObject content inside an SVG <mask>, so this uses
// native SVG <text> with the exact same font/size/weight/letter-spacing as
// the real heading, plus `textLength` as a safety net against any residual
// SVG/CSS font-metric drift.
export const TextVideoMask: React.FC<TextVideoMaskProps> = ({ lines, textClassName, style, children }) => {
  const maskId = `text-video-mask-${useId().replace(/:/g, '')}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [lineMetrics, setLineMetrics] = useState<LineMetrics[]>([]);
  const [fontStyle, setFontStyle] = useState<{ fontFamily: string; fontWeight: string; letterSpacing: string }>({
    fontFamily: 'sans-serif',
    fontWeight: '900',
    letterSpacing: 'normal',
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const containerRect = el.getBoundingClientRect();
      setContainerSize({ width: containerRect.width, height: containerRect.height });

      const metrics = lineRefs.current
        .filter((span): span is HTMLSpanElement => !!span)
        .map((span) => {
          // `span` is a block element (stretched to the container's full
          // width), so its own rect isn't the glyphs' tight box — measure
          // the actual text node with a Range instead.
          const textNode = span.firstChild;
          let rect = span.getBoundingClientRect();
          if (textNode) {
            const range = document.createRange();
            range.selectNodeContents(textNode);
            const textRect = range.getBoundingClientRect();
            if (textRect.width > 0) rect = textRect;
          }
          const cs = getComputedStyle(span);
          const fontSize = parseFloat(cs.fontSize);
          return {
            text: (span.textContent ?? '').toUpperCase(),
            x: rect.left - containerRect.left,
            // Anchor to the vertical centre of the measured glyph box with a
            // "central" SVG baseline — symmetric, so any small mismatch
            // between the real (very tight leading) line box and the mask's
            // text metrics is split evenly top/bottom instead of entirely
            // missing one side.
            y: rect.top - containerRect.top + rect.height / 2,
            width: rect.width,
          };
        });
      setLineMetrics(metrics);

      if (lineRefs.current[0]) {
        const cs = getComputedStyle(lineRefs.current[0]);
        setFontStyle({ fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing });
      }
    };

    let cancelled = false;
    const runMeasure = () => {
      if (!cancelled) measure();
    };
    // Wait for webfonts so the mask's <text> uses real metrics, not a
    // fallback font, on first paint.
    if (document.fonts?.ready) {
      document.fonts.ready.then(runMeasure);
    } else {
      runMeasure();
    }

    const ro = new ResizeObserver(runMeasure);
    ro.observe(el);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [lines]);

  const isReady = containerSize.width > 0 && lineMetrics.length === lines.length;

  return (
    <div ref={containerRef} className="relative">
      <h1 className={textClassName} style={style}>
        {lines.map((line, i) => (
          <span
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className="block"
          >
            {line}
          </span>
        ))}
      </h1>

      {isReady && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              WebkitMaskImage: `url(#${maskId})`,
              maskImage: `url(#${maskId})`,
              filter:
                'drop-shadow(0 0 18px rgba(56,189,248,0.55)) drop-shadow(0 0 36px rgba(217,70,239,0.35)) drop-shadow(0 0 60px rgba(250,204,21,0.2))',
            }}
          >
            {children}
          </div>

          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={containerSize.width} height={containerSize.height}>
                {lineMetrics.map((line, i) => (
                  <text
                    key={i}
                    x={line.x}
                    y={line.y}
                    textLength={line.width}
                    lengthAdjust="spacingAndGlyphs"
                    dominantBaseline="central"
                    fill="#ffffff"
                    style={{ fontSize: style?.fontSize, ...fontStyle }}
                  >
                    {line.text}
                  </text>
                ))}
              </mask>
            </defs>
          </svg>
        </>
      )}
    </div>
  );
};
