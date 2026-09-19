"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ImagePickerDialog from "@/components/admin/image-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { SiteSettings } from "@/lib/settings";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-neutral-200 pb-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
      {children}
    </p>
  );
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-neutral-600">
      {children}
    </Label>
  );
}

const fieldInput =
  "h-10 border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-[#e00327] focus-visible:ring-[#e00327]/30";

const settingsSchema = z.object({
  banner_pc: z.string(),
  banner_sp: z.string(),
  facebook_url: z.string(),
  tiktok_url: z.string(),
  youtube_url: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// Wide banner preview: the desktop artwork is a 16:9-ish strip, the phone one taller.
function BannerSlot({
  url,
  ratio,
  onPick,
  onClear,
}: {
  url: string;
  ratio: string;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onPick}
        style={{ aspectRatio: ratio }}
        className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:border-[#e00327]"
      >
        {url ? (
          <Image src={url} alt="" width={640} height={360} className="size-full object-cover" unoptimized />
        ) : (
          <ImageIcon className="size-5 text-neutral-400" />
        )}
      </button>
      {url && (
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-neutral-900 text-white group-hover:flex"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

export default function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [pickingBanner, setPickingBanner] = useState<"banner_pc" | "banner_sp" | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  async function onSubmit(values: SettingsFormValues) {
    const supabase = createClient();
    const rows = Object.entries(values).map(([key, value]) => ({ key, value }));

    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });

    if (error) {
      toast.error(error.message);
      return;
    }

    form.reset(values);
    toast.success("Settings saved");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Site settings</h1>
        <p className="text-sm text-neutral-500">Homepage banner and the social links in the footer.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-5">
          <SectionLabel>Main banner</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Desktop</FieldLabel>
              <BannerSlot
                url={form.watch("banner_pc")}
                ratio="16 / 7"
                onPick={() => setPickingBanner("banner_pc")}
                onClear={() => form.setValue("banner_pc", "", { shouldDirty: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Mobile</FieldLabel>
              <BannerSlot
                url={form.watch("banner_sp")}
                ratio="3 / 4"
                onPick={() => setPickingBanner("banner_sp")}
                onClear={() => form.setValue("banner_sp", "", { shouldDirty: true })}
              />
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            Leave a banner empty to fall back to the image the site shipped with.
          </p>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <SectionLabel>Social links</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="facebook_url">Facebook</FieldLabel>
              <Input id="facebook_url" className={fieldInput} {...form.register("facebook_url")} />
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="tiktok_url">TikTok</FieldLabel>
              <Input id="tiktok_url" className={fieldInput} {...form.register("tiktok_url")} />
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="youtube_url">YouTube</FieldLabel>
              <Input id="youtube_url" className={fieldInput} {...form.register("youtube_url")} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            className="bg-[#e00327] hover:bg-[#c40320]"
          >
            Save changes
          </Button>
        </div>
      </form>

      <ImagePickerDialog
        open={pickingBanner !== null}
        onOpenChange={(v) => !v && setPickingBanner(null)}
        onSelect={(url) => {
          if (pickingBanner) form.setValue(pickingBanner, url, { shouldDirty: true });
        }}
      />
    </motion.div>
  );
}
