"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, Users, ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ImagePickerDialog from "@/components/admin/image-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type AdminPartner = {
  id: string;
  name: string;
  logo_url: string;
  main_partner: boolean;
  international_partner: boolean;
  sort_order: number;
  active: boolean;
};

const partnerSchema = z.object({
  name: z.string().min(1, "Required"),
  logo_url: z.string().min(1, "Required"),
  main_partner: z.boolean(),
  international_partner: z.boolean(),
  sort_order: z.number().int().min(0),
  active: z.boolean(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

const EMPTY_VALUES: PartnerFormValues = {
  name: "",
  logo_url: "",
  main_partner: false,
  international_partner: false,
  sort_order: 0,
  active: true,
};

export default function PartnersManager({ initialPartners }: { initialPartners: AdminPartner[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(partner: AdminPartner) {
    setEditing(partner);
    form.reset(partner);
    setOpen(true);
  }

  async function onSubmit(values: PartnerFormValues) {
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase.from("partners").update(values).eq("id", editing.id).select().single();
      if (!error && data) {
        setPartners((prev) => prev.map((p) => (p.id === editing.id ? (data as AdminPartner) : p)));
        setOpen(false);
        toast.success("Partner updated");
      } else {
        toast.error(error?.message ?? "Failed to update partner");
      }
      return;
    }

    const { data, error } = await supabase.from("partners").insert(values).select().single();
    if (!error && data) {
      setPartners((prev) => [...prev, data as AdminPartner]);
      setOpen(false);
      toast.success("Partner created");
    } else {
      toast.error(error?.message ?? "Failed to create partner");
    }
  }

  async function onReorder(next: AdminPartner[]) {
    const previous = partners;
    setPartners(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((p, i) => supabase.from("partners").update({ sort_order: i }).eq("id", p.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setPartners(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setPartners(next.map((p, i) => ({ ...p, sort_order: i })));
  }

  async function onToggleActive(partner: AdminPartner) {
    const supabase = createClient();
    const active = !partner.active;
    setPartners((prev) => prev.map((p) => (p.id === partner.id ? { ...p, active } : p)));
    const { error } = await supabase.from("partners").update({ active }).eq("id", partner.id);
    if (error) {
      setPartners((prev) => prev.map((p) => (p.id === partner.id ? { ...p, active: !active } : p)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this partner?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("partners").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success("Partner deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Partners</h1>
          <p className="text-sm text-neutral-500">Sponsors shown in the site footer/partners section.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit partner" : "Add partner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Logo</Label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 hover:bg-neutral-50"
                >
                  <div className="flex size-28 items-center justify-center overflow-hidden rounded-md border bg-white">
                    {form.watch("logo_url") ? (
                      <Image
                        src={form.watch("logo_url")}
                        alt=""
                        width={112}
                        height={112}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="size-6 text-neutral-300" />
                    )}
                  </div>
                  {!form.watch("logo_url") && <p className="text-xs text-neutral-500">Choose an image</p>}
                </button>
                <input type="hidden" {...form.register("logo_url")} />
                {form.formState.errors.logo_url && (
                  <p className="text-sm text-red-600">{form.formState.errors.logo_url.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input id="sort_order" type="number" {...form.register("sort_order", { valueAsNumber: true })} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={form.watch("main_partner")}
                  onCheckedChange={(checked) => form.setValue("main_partner", checked === true)}
                />
                Main partner (Official Court Sponsors)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={form.watch("international_partner")}
                  onCheckedChange={(checked) => form.setValue("international_partner", checked === true)}
                />
                International partner
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={form.watch("active")}
                  onCheckedChange={(checked) => form.setValue("active", checked === true)}
                />
                Active (visible on site)
              </label>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#e00327] hover:bg-[#c40320]">
                {editing ? "Save changes" : "Create partner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No partners yet</p>
            <p className="text-sm text-neutral-400">Add your first sponsor to show it on the site.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={partners} onReorder={onReorder}>
              {partners.map((partner) => (
                <Reorder.Item key={partner.id} value={partner} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {partner.logo_url && (
                        <Image
                          src={partner.logo_url}
                          alt={partner.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">{partner.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {partner.main_partner && <Badge variant="secondary">Main</Badge>}
                      {partner.international_partner && <Badge variant="secondary">International</Badge>}
                      {!partner.main_partner && !partner.international_partner && (
                        <span className="text-sm text-neutral-400">Other</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(partner)} className="cursor-pointer">
                      {partner.active ? (
                        <Badge className="bg-[#e00327] hover:bg-[#c40320]">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-neutral-100">Hidden</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(partner)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === partner.id}
                        onClick={() => onDelete(partner.id)}
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
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => form.setValue("logo_url", url, { shouldValidate: true })}
        folder="partners"
      />
    </motion.div>
  );
}
