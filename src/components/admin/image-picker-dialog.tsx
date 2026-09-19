"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  folder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  folder?: string;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || images.length > 0) return;
    setLoading(true);
    fetch("/api/admin/images")
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .finally(() => setLoading(false));
  }, [open, images.length]);

  const scoped = folder ? images.filter((src) => src.startsWith(`/images/${folder}/`)) : images;
  const filtered = scoped.filter((src) => src.toLowerCase().includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[75vh] overflow-y-auto rounded-lg bg-neutral-100 p-4">
          <div className="grid grid-cols-6 gap-3">
            {loading &&
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-neutral-200" />
              ))}

            {!loading && filtered.length === 0 && (
              <div className="col-span-6 flex flex-col items-center gap-2 py-16 text-center text-neutral-400">
                <ImageIcon className="size-8" />
                <p className="text-sm">No images found</p>
              </div>
            )}

            {!loading &&
              filtered.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    onSelect(src);
                    onOpenChange(false);
                  }}
                  title={src}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-[#e00327]"
                >
                  <div className="flex aspect-square items-center justify-center p-4">
                    <Image src={src} alt={src} width={300} height={300} className="object-contain" unoptimized />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
