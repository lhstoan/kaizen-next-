"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, Users, ImageIcon, GripVertical, X } from "lucide-react";
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

// Flag images live at /images/<code>.png, so the codes double as the file names.
const NATIONALITIES = [
  { value: "vn", label: "Vietnam" },
  { value: "mal", label: "Malaysia" },
  { value: "tha", label: "Thailand" },
];

const EVENTS = ["MS", "WS", "MD", "WD", "XD", "MX"];

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

export type AdminMember = {
  id: string;
  full_name: string;
  gender: "men" | "women";
  nationality: string;
  event: string[];
  photo_url: string;
  sort_order: number;
  active: boolean;
};

const memberSchema = z.object({
  full_name: z.string().min(1, "Required"),
  gender: z.enum(["men", "women"]),
  nationality: z.string().min(1, "Required"),
  event: z.array(z.string()),
  photo_url: z.string(),
  active: z.boolean(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const EMPTY_VALUES: MemberFormValues = {
  full_name: "",
  gender: "men",
  nationality: "vn",
  event: [],
  photo_url: "",
  active: true,
};

function toFormValues(member: AdminMember): MemberFormValues {
  return {
    full_name: member.full_name,
    gender: member.gender,
    nationality: member.nationality,
    event: member.event ?? [],
    photo_url: member.photo_url,
    active: member.active,
  };
}

export default function MembersManager({ initialMembers }: { initialMembers: AdminMember[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(member: AdminMember) {
    setEditing(member);
    form.reset(toFormValues(member));
    setOpen(true);
  }

  function toggleEvent(value: string) {
    const current = form.getValues("event");
    // Keep EVENTS order regardless of click order.
    form.setValue(
      "event",
      EVENTS.filter((e) => (e === value ? !current.includes(e) : current.includes(e))),
    );
  }

  async function onSubmit(values: MemberFormValues) {
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase.from("kaizen_members").update(values).eq("id", editing.id).select().single();
      if (!error && data) {
        setMembers((prev) => prev.map((m) => (m.id === editing.id ? (data as AdminMember) : m)));
        setOpen(false);
        toast.success("Member updated");
      } else {
        toast.error(error?.message ?? "Failed to update member");
      }
      return;
    }

    const { data, error } = await supabase
      .from("kaizen_members")
      .insert({ ...values, sort_order: members.length })
      .select()
      .single();
    if (!error && data) {
      setMembers((prev) => [...prev, data as AdminMember]);
      setOpen(false);
      toast.success("Member created");
    } else {
      toast.error(error?.message ?? "Failed to create member");
    }
  }

  async function onReorder(next: AdminMember[]) {
    const previous = members;
    setMembers(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((m, i) => supabase.from("kaizen_members").update({ sort_order: i }).eq("id", m.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setMembers(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setMembers(next.map((m, i) => ({ ...m, sort_order: i })));
  }

  async function onToggleActive(member: AdminMember) {
    const supabase = createClient();
    const active = !member.active;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, active } : m)));
    const { error } = await supabase.from("kaizen_members").update({ active }).eq("id", member.id);
    if (error) {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, active: !active } : m)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this member?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("kaizen_members").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Members</h1>
          <p className="text-sm text-neutral-500">Players on the homepage and the team member page.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add member
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-3xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (pickingPhoto) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit member" : "Add member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <section className="flex flex-col gap-2">
                  <SectionLabel>Player</SectionLabel>
                  <div className="flex gap-4">
                    <div className="group relative h-32 w-24 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPickingPhoto(true)}
                        className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:border-[#e00327]"
                      >
                        {form.watch("photo_url") ? (
                          <Image
                            src={form.watch("photo_url")}
                            alt=""
                            width={96}
                            height={128}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="size-4 text-neutral-400" />
                        )}
                      </button>
                      {form.watch("photo_url") && (
                        <button
                          type="button"
                          onClick={() => form.setValue("photo_url", "")}
                          className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-neutral-900 text-white group-hover:flex"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                        <Input id="full_name" className={fieldInput} {...form.register("full_name")} />
                        {form.formState.errors.full_name && (
                          <p className="text-xs text-red-400">{form.formState.errors.full_name.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <FieldLabel>Nationality</FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {NATIONALITIES.map((n) => (
                            <button
                              key={n.value}
                              type="button"
                              onClick={() => form.setValue("nationality", n.value)}
                              className={form.watch("nationality") === n.value ? pillActive : pillInactive}
                            >
                              {n.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <FieldLabel>Events</FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {EVENTS.map((event) => (
                            <button
                              key={event}
                              type="button"
                              onClick={() => toggleEvent(event)}
                              className={form.watch("event").includes(event) ? pillActive : pillInactive}
                            >
                              {event}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Settings</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Category</FieldLabel>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => form.setValue("gender", "men")}
                          className={form.watch("gender") === "men" ? pillActive : pillInactive}
                        >
                          Men
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("gender", "women")}
                          className={form.watch("gender") === "women" ? pillActive : pillInactive}
                        >
                          Women
                        </button>
                      </div>
                    </div>
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
                  {editing ? "Save changes" : "Create member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No members yet</p>
            <p className="text-sm text-neutral-400">Add a player to show them on the site.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={members} onReorder={onReorder}>
              {members.map((member) => (
                <Reorder.Item key={member.id} value={member} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex h-12 w-10 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {member.photo_url && (
                        <Image
                          src={member.photo_url}
                          alt={member.full_name}
                          width={40}
                          height={48}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">{member.full_name}</TableCell>
                  <TableCell className="capitalize text-neutral-600">{member.gender}</TableCell>
                  <TableCell className="text-neutral-600">{(member.event ?? []).join("/")}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(member)} className="cursor-pointer">
                      {member.active ? (
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
                      <Button variant="outline" size="icon" onClick={() => openEdit(member)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === member.id}
                        onClick={() => onDelete(member.id)}
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
        open={pickingPhoto}
        onOpenChange={setPickingPhoto}
        onSelect={(url) => form.setValue("photo_url", url)}
        folder="members"
      />
    </motion.div>
  );
}
