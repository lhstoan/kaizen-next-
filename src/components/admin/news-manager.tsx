"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, Newspaper, ImageIcon, GripVertical, X } from "lucide-react";
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

export type AdminNewsItem = {
  id: string;
  label_en: string;
  label_jp: string;
  title: string;
  link: string;
  image_url: string;
  featured: boolean;
  sort_order: number;
  active: boolean;
};

const newsSchema = z.object({
  label_en: z.string().min(1, "Required"),
  label_jp: z.string(),
  title: z.string(),
  link: z.string(),
  image_url: z.string(),
  featured: z.boolean(),
  active: z.boolean(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

const EMPTY_VALUES: NewsFormValues = {
  label_en: "Players",
  label_jp: "プレイヤー",
  title: "",
  link: "",
  image_url: "",
  featured: false,
  active: true,
};

function toFormValues(item: AdminNewsItem): NewsFormValues {
  return {
    label_en: item.label_en,
    label_jp: item.label_jp,
    title: item.title,
    link: item.link,
    image_url: item.image_url,
    featured: item.featured,
    active: item.active,
  };
}

export default function NewsManager({ initialItems }: { initialItems: AdminNewsItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminNewsItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickingImage, setPickingImage] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(item: AdminNewsItem) {
    setEditing(item);
    form.reset(toFormValues(item));
    setOpen(true);
  }

  async function onSubmit(values: NewsFormValues) {
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase.from("news").update(values).eq("id", editing.id).select().single();
      if (!error && data) {
        setItems((prev) => prev.map((i) => (i.id === editing.id ? (data as AdminNewsItem) : i)));
        setOpen(false);
        toast.success("News updated");
      } else {
        toast.error(error?.message ?? "Failed to update news");
      }
      return;
    }

    const { data, error } = await supabase
      .from("news")
      .insert({ ...values, sort_order: items.length })
      .select()
      .single();
    if (!error && data) {
      setItems((prev) => [...prev, data as AdminNewsItem]);
      setOpen(false);
      toast.success("News created");
    } else {
      toast.error(error?.message ?? "Failed to create news");
    }
  }

  async function onReorder(next: AdminNewsItem[]) {
    const previous = items;
    setItems(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((item, i) => supabase.from("news").update({ sort_order: i }).eq("id", item.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setItems(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setItems(next.map((item, i) => ({ ...item, sort_order: i })));
  }

  async function onToggleActive(item: AdminNewsItem) {
    const supabase = createClient();
    const active = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active } : i)));
    const { error } = await supabase.from("news").update({ active }).eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !active } : i)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this news card?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("News deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Hot News</h1>
          <p className="text-sm text-neutral-500">Cards in the hot news block on the homepage.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add card
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-3xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (pickingImage) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit card" : "Add card"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <section className="flex flex-col gap-2">
                  <SectionLabel>Card</SectionLabel>
                  <div className="flex gap-4">
                    <div className="group relative h-28 w-40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPickingImage(true)}
                        className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:border-[#e00327]"
                      >
                        {form.watch("image_url") ? (
                          <Image
                            src={form.watch("image_url")}
                            alt=""
                            width={160}
                            height={112}
                            className="size-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="size-4 text-neutral-400" />
                        )}
                      </button>
                      {form.watch("image_url") && (
                        <button
                          type="button"
                          onClick={() => form.setValue("image_url", "")}
                          className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-neutral-900 text-white group-hover:flex"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="label_en">Label (EN)</FieldLabel>
                        <Input id="label_en" className={fieldInput} {...form.register("label_en")} />
                        {form.formState.errors.label_en && (
                          <p className="text-xs text-red-400">{form.formState.errors.label_en.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="label_jp">Label (JP)</FieldLabel>
                        <Input id="label_jp" className={fieldInput} {...form.register("label_jp")} />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <FieldLabel htmlFor="title">Caption</FieldLabel>
                        <Input id="title" className={fieldInput} {...form.register("title")} />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <FieldLabel htmlFor="link">Link</FieldLabel>
                        <Input id="link" placeholder="https://..." className={fieldInput} {...form.register("link")} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Settings</SectionLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Size</FieldLabel>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => form.setValue("featured", false)}
                          className={!form.watch("featured") ? pillActive : pillInactive}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("featured", true)}
                          className={form.watch("featured") ? pillActive : pillInactive}
                        >
                          Wide
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
                  {editing ? "Save changes" : "Create card"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Newspaper className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No news yet</p>
            <p className="text-sm text-neutral-400">Add a card to fill the hot news block.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-20"></TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={items} onReorder={onReorder}>
              {items.map((item) => (
                <Reorder.Item key={item.id} value={item} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          width={64}
                          height={40}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">
                    {item.label_en} <span className="text-neutral-400">{item.label_jp}</span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-neutral-600">{item.title}</TableCell>
                  <TableCell className="text-neutral-600">{item.featured ? "Wide" : "Standard"}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(item)} className="cursor-pointer">
                      {item.active ? (
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
                      <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === item.id}
                        onClick={() => onDelete(item.id)}
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
        open={pickingImage}
        onOpenChange={setPickingImage}
        onSelect={(url) => form.setValue("image_url", url)}
      />
    </motion.div>
  );
}
