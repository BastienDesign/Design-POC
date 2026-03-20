"use client";

import { RiInformationLine } from "@remixicon/react";

interface ImageThumbnailProps {
  src: string;
  alt?: string;
  id?: string;
  /** Row index (0-based) — rows 0-1 anchor the viewer downward, others anchor upward */
  rowIndex?: number;
}

export function ImageThumbnail({ src, alt, id, rowIndex = 0 }: ImageThumbnailProps) {
  const hasImage = !!src;
  const isTopRow = rowIndex <= 1;

  return (
    <div className="group/thumb relative flex items-center justify-center">
      {/* The Small Thumbnail */}
      <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 cursor-zoom-in relative z-10 hover:border-neutral-900 transition-colors">
        {hasImage ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
        )}
      </div>

      {/* The Smart, Large Detail Viewer Panel */}
      <div
        className={`absolute left-[54px] z-50 pointer-events-none opacity-0 scale-95 group-hover/thumb:opacity-100 group-hover/thumb:scale-100 transition-all duration-200 ease-out ${
          isTopRow ? "top-0" : "bottom-0"
        }`}
      >
        <div className="relative w-[28rem] aspect-square bg-white rounded-xl border border-neutral-200 shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden p-1.5 flex flex-col">
          {/* Large, uncropped image area */}
          <div className="flex-1 w-full rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center p-2 border border-neutral-100">
            {hasImage ? (
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-sm text-neutral-400">No image available</span>
              </div>
            )}
          </div>

          {/* Detail label bar at bottom */}
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-neutral-100 mt-1 shrink-0">
            <div className="flex items-center gap-2">
              <RiInformationLine className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-900">HD Detail Viewer</span>
            </div>
            {id && (
              <span className="text-xs font-mono text-neutral-500">{id}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
