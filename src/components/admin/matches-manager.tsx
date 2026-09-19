"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, Calendar, ImageIcon, GripVertical, X } from "lucide-react";
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

export type AdminMatch = {
  id: string;
  round: number;
  date: string;
  tournament_name: string;
  court_location: string;
  kaizen_is_home: boolean;
  opponent_name: string;
  opponent_logo_url: string;
  time_label: string;
  score_home: number | null;
  score_away: number | null;
  sort_order: number;
  active: boolean;
};

// Scores are kept as strings in the form so an empty box means "not played yet"
// rather than 0 — they only become numbers on save.
const matchSchema = z.object({
  round: z.number().int().min(1),
  date: z.string(),
  tournament_name: z.string(),
  court_location: z.string(),
  kaizen_is_home: z.boolean(),
  opponent_name: z.string().min(1, "Required"),
  opponent_logo_url: z.string(),
  time_label: z.string(),
  score_home: z.string(),
  score_away: z.string(),
  active: z.boolean(),
});

type MatchFormValues = z.infer<typeof matchSchema>;

const EMPTY_VALUES: MatchFormValues = {
  round: 1,
  date: "",
  tournament_name: "",
  court_location: "",
  kaizen_is_home: true,
  opponent_name: "",
  opponent_logo_url: "",
  time_label: "",
  score_home: "",
  score_away: "",
  active: true,
};

function toFormValues(match: AdminMatch): MatchFormValues {
  return {
    round: match.round,
    date: match.date,
    tournament_name: match.tournament_name,
    court_location: match.court_location,
    kaizen_is_home: match.kaizen_is_home,
    opponent_name: match.opponent_name,
    opponent_logo_url: match.opponent_logo_url,
    time_label: match.time_label,
    score_home: match.score_home === null ? "" : String(match.score_home),
    score_away: match.score_away === null ? "" : String(match.score_away),
    active: match.active,
  };
}

function toRow(values: MatchFormValues) {
  const { score_home, score_away, ...rest } = values;
  return {
    ...rest,
    score_home: score_home === "" ? null : Number(score_home),
    score_away: score_away === "" ? null : Number(score_away),
  };
}

export default function MatchesManager({ initialMatches }: { initialMatches: AdminMatch[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMatch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickingLogo, setPickingLogo] = useState(false);

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(match: AdminMatch) {
    setEditing(match);
    form.reset(toFormValues(match));
    setOpen(true);
  }

  async function onSubmit(values: MatchFormValues) {
    const supabase = createClient();
    const row = toRow(values);

    if (editing) {
      const { data, error } = await supabase.from("kaizen_matches").update(row).eq("id", editing.id).select().single();
      if (!error && data) {
        setMatches((prev) => prev.map((m) => (m.id === editing.id ? (data as AdminMatch) : m)));
        setOpen(false);
        toast.success("Match updated");
      } else {
        toast.error(error?.message ?? "Failed to update match");
      }
      return;
    }

    const { data, error } = await supabase
      .from("kaizen_matches")
      .insert({ ...row, sort_order: matches.length })
      .select()
      .single();
    if (!error && data) {
      setMatches((prev) => [...prev, data as AdminMatch]);
      setOpen(false);
      toast.success("Match created");
    } else {
      toast.error(error?.message ?? "Failed to create match");
    }
  }

  async function onReorder(next: AdminMatch[]) {
    const previous = matches;
    setMatches(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((m, i) => supabase.from("kaizen_matches").update({ sort_order: i }).eq("id", m.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setMatches(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setMatches(next.map((m, i) => ({ ...m, sort_order: i })));
  }

  async function onToggleActive(match: AdminMatch) {
    const supabase = createClient();
    const active = !match.active;
    setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, active } : m)));
    const { error } = await supabase.from("kaizen_matches").update({ active }).eq("id", match.id);
    if (error) {
      setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, active: !active } : m)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this match?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("kaizen_matches").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setMatches((prev) => prev.filter((m) => m.id !== id));
      toast.success("Match deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Matches</h1>
          <p className="text-sm text-neutral-500">Fixtures and results on the homepage and matches page.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add match
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-3xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (pickingLogo) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit match" : "Add match"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <section className="flex flex-col gap-2">
                  <SectionLabel>Fixture</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <FieldLabel htmlFor="round">Round</FieldLabel>
                      <Input
                        id="round"
                        type="number"
                        className={fieldInput}
                        {...form.register("round", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-3">
                      <FieldLabel htmlFor="date">Date</FieldLabel>
                      <Input id="date" placeholder="Wed 17 Sept 2025" className={fieldInput} {...form.register("date")} />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-4">
                      <FieldLabel htmlFor="tournament_name">Tournament</FieldLabel>
                      <Input id="tournament_name" className={fieldInput} {...form.register("tournament_name")} />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-4">
                      <FieldLabel htmlFor="court_location">Court</FieldLabel>
                      <Input id="court_location" className={fieldInput} {...form.register("court_location")} />
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Opponent</SectionLabel>
                  <div className="flex gap-4">
                    <div className="group relative size-24 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPickingLogo(true)}
                        className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-1 hover:border-[#e00327]"
                      >
                        {form.watch("opponent_logo_url") ? (
                          <Image
                            src={form.watch("opponent_logo_url")}
                            alt=""
                            width={96}
                            height={96}
                            className="size-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="size-4 text-neutral-400" />
                        )}
                      </button>
                      {form.watch("opponent_logo_url") && (
                        <button
                          type="button"
                          onClick={() => form.setValue("opponent_logo_url", "")}
                          className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-neutral-900 text-white group-hover:flex"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="opponent_name">Opponent name</FieldLabel>
                        <Input id="opponent_name" className={fieldInput} {...form.register("opponent_name")} />
                        {form.formState.errors.opponent_name && (
                          <p className="text-xs text-red-400">{form.formState.errors.opponent_name.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <FieldLabel>Kaizen side</FieldLabel>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => form.setValue("kaizen_is_home", true)}
                            className={form.watch("kaizen_is_home") ? pillActive : pillInactive}
                          >
                            Kaizen left
                          </button>
                          <button
                            type="button"
                            onClick={() => form.setValue("kaizen_is_home", false)}
                            className={!form.watch("kaizen_is_home") ? pillActive : pillInactive}
                          >
                            Kaizen right
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Result</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <FieldLabel htmlFor="score_home">Score (left)</FieldLabel>
                      <Input id="score_home" type="number" className={fieldInput} {...form.register("score_home")} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <FieldLabel htmlFor="score_away">Score (right)</FieldLabel>
                      <Input id="score_away" type="number" className={fieldInput} {...form.register("score_away")} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <FieldLabel htmlFor="time_label">Kick-off time</FieldLabel>
                      <Input id="time_label" placeholder="20:30" className={fieldInput} {...form.register("time_label")} />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Leave both scores empty for an upcoming match — the site shows the kick-off time instead.
                  </p>
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
                  {editing ? "Save changes" : "Create match"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Calendar className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No matches yet</p>
            <p className="text-sm text-neutral-400">Add a fixture to show it on the site.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={matches} onReorder={onReorder}>
              {matches.map((match) => (
                <Reorder.Item key={match.id} value={match} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {match.opponent_logo_url && (
                        <Image
                          src={match.opponent_logo_url}
                          alt={match.opponent_name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">{match.round}</TableCell>
                  <TableCell className="text-neutral-600">{match.opponent_name}</TableCell>
                  <TableCell className="text-neutral-600">{match.date}</TableCell>
                  <TableCell className="text-neutral-600">
                    {match.score_home === null || match.score_away === null
                      ? match.time_label || "—"
                      : `${match.score_home} : ${match.score_away}`}
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(match)} className="cursor-pointer">
                      {match.active ? (
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
                      <Button variant="outline" size="icon" onClick={() => openEdit(match)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === match.id}
                        onClick={() => onDelete(match.id)}
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
        open={pickingLogo}
        onOpenChange={setPickingLogo}
        onSelect={(url) => form.setValue("opponent_logo_url", url)}
        folder="partners"
      />
    </motion.div>
  );
}
