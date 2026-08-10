import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasSequence } from '../hooks/useCanvasSequence';

export interface CanvasHeroProps {
  frameCount?: number;
  folderPath?: string;
  onExploreClick?: () => void;
  onSignInClick?: () => void;
}

export const CanvasHero: React.FC<CanvasHeroProps> = ({
  frameCount = 192,
  folderPath = '/hero-sequence',
  onExploreClick,
  onSignInClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const currentFrameRef = useRef<number>(1);
  const animationFrameIdRef = useRef<number | null>(null);

  const { images, isLoaded, progress: loadProgress } = useCanvasSequence({
    frameCount,
    folderPath,
    filePrefix: 'ezgif-frame-',
    fileExtension: '.jpg',
    padDigits: 3,
  });

  // Responsive object-fit: cover math for 2D canvas draw call
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = displayWidth / displayHeight;

    let renderWidth = displayWidth;
    let renderHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      renderHeight = displayWidth / imgAspect;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      renderWidth = displayHeight * imgAspect;
      offsetX = (displayWidth - renderWidth) / 2;
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();
  }, [images]);

  // Handle Scroll to Frame calculation (0.0 to 1.0 mapped to 1..192)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalHeight = rect.height - window.innerHeight;
    if (totalHeight <= 0) return;

    const scrollY = -rect.top;
    const fraction = Math.min(Math.max(scrollY / totalHeight, 0), 1);
    setScrollProgress(fraction);

    const targetFrame = Math.min(
      Math.max(Math.floor(fraction * (frameCount - 1)) + 1, 1),
      frameCount
    );

    if (targetFrame !== currentFrameRef.current) {
      currentFrameRef.current = targetFrame;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      animationFrameIdRef.current = requestAnimationFrame(() => {
        drawFrame(targetFrame);
      });
    }
  }, [frameCount, drawFrame]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handleScroll]);

  // Draw initial frame once loaded
  useEffect(() => {
    if (isLoaded) {
      drawFrame(currentFrameRef.current);
    }
  }, [isLoaded, drawFrame]);

  // Dynamic opacity fade out calculation as user scrolls past 50%
  const textOpacity = Math.max(1 - scrollProgress * 1.8, 0);
  const textTranslateY = scrollProgress * -80;

  return (
    <div ref={containerRef} className="relative h-[350vh] bg-[#09090b] text-[#f4f4f5] select-none">
      {/* Sticky Canvas Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Preloader Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-[#0f62fe] border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs text-[#a1a1aa] tracking-widest uppercase">
                INITIALIZING TELEMETRY... [{loadProgress}%]
              </span>
            </div>
            <div className="w-64 h-1.5 bg-[#27272a] overflow-hidden rounded-full">
              <div
                className="h-full bg-[#0f62fe] transition-all duration-150 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* HTML5 Canvas Frame Player */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Dark Vignette & Gradient Mask Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] pointer-events-none" />

        {/* Hero UI Overlay Content */}
        <div
          className="relative z-10 max-w-5xl mx-auto px-6 text-center transition-transform duration-75 ease-out"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          {/* Release Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#27272a] bg-[#121215]/80 backdrop-blur-md mb-6 pointer-events-auto cursor-pointer hover:border-[#0f62fe] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#24a148] animate-pulse" />
            <span className="font-mono text-xs text-[#a1a1aa] tracking-wide">
              v2.4 Released — Real-time token telemetry & budget caps ➜
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#f4f4f5] max-w-4xl mx-auto leading-tight mb-6">
            Enterprise AI Spend Control &amp; Governance
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
            Eliminate surprise API billing spikes. Monitor live token consumption across OpenAI,
            Gemini, Anthropic, and ElevenLabs with real-time budget guardrails.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 pointer-events-auto">
            <button
              onClick={onSignInClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium text-sm transition-all duration-150 shadow-lg shadow-[#0f62fe]/25"
            >
              Sign in with Google
            </button>
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#121215] hover:bg-[#27272a] border border-[#3f3f46] text-[#f4f4f5] font-mono text-xs transition-colors"
            >
              View Demo ⌘K
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto pt-6 border-t border-[#27272a]">
            <div>
              <div className="font-mono text-xl md:text-2xl font-bold text-[#f4f4f5]">15+</div>
              <div className="font-mono text-[11px] text-[#71717a] uppercase tracking-wider mt-1">
                AI Providers
              </div>
            </div>
            <div>
              <div className="font-mono text-xl md:text-2xl font-bold text-[#24a148]">45%</div>
              <div className="font-mono text-[11px] text-[#71717a] uppercase tracking-wider mt-1">
                Avg Spend Reduced
              </div>
            </div>
            <div>
              <div className="font-mono text-xl md:text-2xl font-bold text-[#38bdf8]">₹17.8L</div>
              <div className="font-mono text-[11px] text-[#71717a] uppercase tracking-wider mt-1">
                Monthly Managed
              </div>
            </div>
          </div>

          {/* Supported LLMs Marquee */}
          <div className="mt-10 pt-4 flex items-center justify-center space-x-6 overflow-hidden opacity-60 text-xs font-mono text-[#a1a1aa]">
            <span>OpenAI</span>
            <span>•</span>
            <span>Anthropic</span>
            <span>•</span>
            <span>Google Gemini</span>
            <span>•</span>
            <span>ElevenLabs</span>
            <span>•</span>
            <span>Meta Llama</span>
            <span>•</span>
            <span>Cohere</span>
          </div>
        </div>
      </div>
    </div>
  );
};
