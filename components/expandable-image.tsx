'use client';

import { useEffect, useState, useCallback } from 'react';
import { XIcon } from 'lucide-react';

export function ExpandableImage({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 w-full cursor-zoom-in overflow-hidden rounded"
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full max-h-72 object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8">
          <div
            className="absolute inset-0"
            onClick={close}
          />

          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <XIcon className="size-5" />
          </button>

          <div
            className={`relative z-10 ${zoomed ? 'max-h-[90vh] overflow-auto cursor-zoom-out' : 'flex items-center justify-center cursor-zoom-in'}`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
          >
            <img
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              className={`rounded transition-all duration-300 ${zoomed ? 'max-w-none w-auto' : 'max-h-[80vh] max-w-[85vw] object-contain'}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
