import { useState, useEffect, useRef } from 'react';

export interface UseCanvasSequenceOptions {
  frameCount?: number;
  folderPath?: string;
  filePrefix?: string;
  fileExtension?: string;
  padDigits?: number;
}

export interface UseCanvasSequenceResult {
  images: HTMLImageElement[];
  isLoaded: boolean;
  progress: number; // 0 to 100
  loadedCount: number;
  totalCount: number;
}

/**
 * Custom React Hook to asynchronously preload and cache an image sequence for scroll-driven canvas rendering.
 */
export function useCanvasSequence({
  frameCount = 192,
  folderPath = '/hero-sequence',
  filePrefix = 'ezgif-frame-',
  fileExtension = '.jpg',
  padDigits = 3,
}: UseCanvasSequenceOptions = {}): UseCanvasSequenceResult {
  const [progress, setProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = new Array(frameCount);
    let count = 0;

    const pad = (num: number, size: number) => {
      let s = num + '';
      while (s.length < size) s = '0' + s;
      return s;
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const filename = `${filePrefix}${pad(i, padDigits)}${fileExtension}`;
      const src = `${folderPath}/${filename}`;

      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        count++;
        setLoadedCount(count);
        const pct = Math.floor((count / frameCount) * 100);
        setProgress(pct);

        if (count === frameCount) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        // Fallback for load errors
        count++;
        setLoadedCount(count);
        const pct = Math.floor((count / frameCount) * 100);
        setProgress(pct);

        if (count === frameCount) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
        }
      };

      loadedImages[i - 1] = img;
    }

    return () => {
      isCancelled = true;
    };
  }, [frameCount, folderPath, filePrefix, fileExtension, padDigits]);

  return {
    images: imagesRef.current,
    isLoaded,
    progress,
    loadedCount,
    totalCount: frameCount,
  };
}
