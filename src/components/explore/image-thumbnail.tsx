"use client";

import { RiInformationLine } from "@remixicon/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ImageThumbnailProps {
  src: string;
  alt?: string;
  id?: string;
  rowIndex?: number;
}

export function ImageThumbnail({ src, alt, id }: ImageThumbnailProps) {
  const hasImage = !!src;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="w-10 h-10 mx-auto rounded-md bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 cursor-crosshair hover:border-neutral-900 transition-colors flex items-center justify-center">
          {hasImage ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
          )}
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        align="start"
        sideOffset={16}
        className="z-[100] w-auto max-w-[400px] p-0 overflow-hidden shadow-2xl border-neutral-200 bg-white"
      >
        <div className="flex flex-col">
          <div className="w-full max-h-[50vh] flex items-center justify-center bg-neutral-50 p-2">
            {hasImage ? (
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[50vh] object-contain"
              />
            ) : (
              <div className="flex items-center justify-center w-[380px] h-[300px]">
                <span className="text-sm text-neutral-400">No image available</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-neutral-100 shrink-0">
            <div className="flex items-center gap-2 text-neutral-500">
              <RiInformationLine className="w-4 h-4" />
              <span className="text-xs font-medium">HD Detail Viewer</span>
            </div>
            {id && (
              <span className="text-xs font-bold text-neutral-400">ID: {id}</span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
