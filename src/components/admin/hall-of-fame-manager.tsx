"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, Trophy, ImageIcon, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ImagePickerDialog from "@/components/admin/image-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const pillActive = "rounded-full bg-[#e00327] px-4 py-2 text-sm font-semibold text-white";
const pillInactive =
  "rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-900";

// Square logo slot: click to pick, hover to clear. Used for both the champion's
// flag logo and each top scorer's badge.
function LogoSlot({ url, alt, onPick, onClear }: { url: string; alt: string; onPick: () => void; onClear?: () => void }) {
  return (
    <div className="group relative size-20 shrink-0">
      <button
        type="button"
        onClick={onPick}
        className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-1 hover:border-[#e00327]"
      >
        {url ? (
          <Image src={url} alt={alt} width={80} height={80} className="size-full object-contain" unoptimized />
        ) : (
          <ImageIcon className="size-4 text-neutral-400" />
        )}
      </button>
      {url && onClear && (
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

export type AdminHallOfFameEntry = {
  id: string;
  year: number;
  rank: string;
  champion_name: string;
  champion_logo_url: string;
  top_scorers: { name: string; logo_url: string }[];
  sort_order: number;
  active: boolean;
};

const scorerSchema = z.object({
  name: z.string(),
  logo_url: z.string(),
});

const entrySchema = z.object({
  year: z.number().int().min(1900).max(2999),
  rank: z.string().min(1, "Required"),
  champion_name: z.string().min(1, "Required"),
  champion_logo_url: z.string(),
  top_scorers: z.array(scorerSchema),
  active: z.boolean(),
});

type EntryFormValues = z.infer<typeof entrySchema>;

const EMPTY_VALUES: EntryFormValues = {
  year: new Date().getFullYear(),
  rank: "1st",
  champion_name: "",
  champion_logo_url: "",
  top_scorers: [],
  active: true,
};

function toFormValues(entry: AdminHallOfFameEntry): EntryFormValues {
  return {
    year: entry.year,
    rank: entry.rank,
    champion_name: entry.champion_name,
    champion_logo_url: entry.champion_logo_url,
    top_scorers: entry.top_scorers ?? [],
    active: entry.active,
  };
}

export default function HallOfFameManager({ initialEntries }: { initialEntries: AdminHallOfFameEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminHallOfFameEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Which logo slot the picker is filling: the champion's, or one scorer's.
  const [imageTarget, setImageTarget] = useState<{ kind: "champion" } | { kind: "scorer"; index: number } | null>(null);

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: EMPTY_VALUES,
  });
  const scorerFields = useFieldArray({ control: form.control, name: "top_scorers" });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(entry: AdminHallOfFameEntry) {
    setEditing(entry);
    form.reset(toFormValues(entry));
    setOpen(true);
  }

  function onPickImage(url: string) {
    if (!imageTarget) return;
    if (imageTarget.kind === "champion") {
      form.setValue("champion_logo_url", url);
      return;
    }
    form.setValue(`top_scorers.${imageTarget.index}.logo_url`, url);
  }

  async function onSubmit(values: EntryFormValues) {
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase
        .from("hall_of_fame")
        .update(values)
        .eq("id", editing.id)
        .select()
        .single();
      if (!error && data) {
        setEntries((prev) => prev.map((e) => (e.id === editing.id ? (data as AdminHallOfFameEntry) : e)));
        setOpen(false);
        toast.success("Entry updated");
      } else {
        toast.error(error?.message ?? "Failed to update entry");
      }
      return;
    }

    const { data, error } = await supabase
      .from("hall_of_fame")
      .insert({ ...values, sort_order: entries.length })
      .select()
      .single();
    if (!error && data) {
      setEntries((prev) => [...prev, data as AdminHallOfFameEntry]);
      setOpen(false);
      toast.success("Entry created");
    } else {
      toast.error(error?.message ?? "Failed to create entry");
    }
  }

  async function onReorder(next: AdminHallOfFameEntry[]) {
    const previous = entries;
    setEntries(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((e, i) => supabase.from("hall_of_fame").update({ sort_order: i }).eq("id", e.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setEntries(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setEntries(next.map((e, i) => ({ ...e, sort_order: i })));
  }

  async function onToggleActive(entry: AdminHallOfFameEntry) {
    const supabase = createClient();
    const active = !entry.active;
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, active } : e)));
    const { error } = await supabase.from("hall_of_fame").update({ active }).eq("id", entry.id);
    if (error) {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, active: !active } : e)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("hall_of_fame").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } else {
      toast.error(error.message);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Hall of Fame</h1>
          <p className="text-sm text-neutral-500">Champions and top scorers by season.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add entry
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-3xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (imageTarget !== null) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit entry" : "Add entry"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <section className="flex flex-col gap-2">
                  <SectionLabel>Champion</SectionLabel>
                  <div className="flex gap-4">
                    <LogoSlot
                      url={form.watch("champion_logo_url")}
                      alt={form.watch("champion_name")}
                      onPick={() => setImageTarget({ kind: "champion" })}
                      onClear={() => form.setValue("champion_logo_url", "")}
                    />
                    <div className="grid flex-1 gap-3 sm:grid-cols-3">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="year">Year</FieldLabel>
                        <Input id="year" type="number" className={fieldInput} {...form.register("year", { valueAsNumber: true })} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="rank">Rank</FieldLabel>
                        <Input id="rank" placeholder="1st" className={fieldInput} {...form.register("rank")} />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <FieldLabel htmlFor="champion_name">Champion name</FieldLabel>
                        <Input id="champion_name" className={fieldInput} {...form.register("champion_name")} />
                        {form.formState.errors.champion_name && (
                          <p className="text-xs text-red-400">{form.formState.errors.champion_name.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Top scorers</SectionLabel>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => scorerFields.append({ name: "", logo_url: "" })}
                      className="bg-[#e00327] hover:bg-[#c40320]"
                    >
                      <Plus className="size-3.5" />
                      Add scorer
                    </Button>
                  </div>

                  {scorerFields.fields.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-500">
                      No top scorer yet — add one to fill the right-hand column.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {scorerFields.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2">
                          <LogoSlot
                            url={form.watch(`top_scorers.${index}.logo_url`)}
                            alt={form.watch(`top_scorers.${index}.name`)}
                            onPick={() => setImageTarget({ kind: "scorer", index })}
                            onClear={() => form.setValue(`top_scorers.${index}.logo_url`, "")}
                          />
                          <div className="flex flex-1 flex-col gap-1">
                            <FieldLabel>Name</FieldLabel>
                            <Input className={fieldInput} {...form.register(`top_scorers.${index}.name`)} />
                          </div>
                          <button
                            type="button"
                            onClick={() => scorerFields.remove(index)}
                            className="self-start p-1 text-neutral-400 hover:text-neutral-900"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Settings</SectionLabel>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => form.setValue("active", true)}
                        className={form.watch("active") ? pillActive : pillInactive}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => form.setValue("active", false)}
                        className={!form.watch("active") ? pillActive : pillInactive}
                      >
                        Hidden
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-200 bg-white px-5 py-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#e00327] hover:bg-[#c40320]">
                  {editing ? "Save changes" : "Create entry"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Trophy className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No entries yet</p>
            <p className="text-sm text-neutral-400">Add a season to show it on the hall of fame page.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Champion</TableHead>
                <TableHead>Top scorers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={entries} onReorder={onReorder}>
              {entries.map((entry) => (
                <Reorder.Item key={entry.id} value={entry} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {entry.champion_logo_url && (
                        <Image
                          src={entry.champion_logo_url}
                          alt={entry.champion_name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">{entry.year}</TableCell>
                  <TableCell className="text-neutral-600">
                    <span className="uppercase text-neutral-400">{entry.rank}</span> {entry.champion_name}
                  </TableCell>
                  <TableCell className="text-neutral-600">{entry.top_scorers?.length ?? 0}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(entry)} className="cursor-pointer">
                      {entry.active ? (
                        <Badge className="bg-[#e00327] hover:bg-[#c40320]">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-neutral-100">
                          Hidden
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(entry)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === entry.id}
                        onClick={() => onDelete(entry.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Table>
        )}
      </Card>

      <ImagePickerDialog
        open={imageTarget !== null}
        onOpenChange={(v) => !v && setImageTarget(null)}
        onSelect={onPickImage}
      />
    </motion.div>
  );
}
