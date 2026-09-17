"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type AdminPartner = {
  id: string;
  name: string;
  logo_url: string;
  main_partner: boolean;
  international_partner: boolean;
  sort_order: number;
};

const partnerSchema = z.object({
  name: z.string().min(1, "Required"),
  logo_url: z.string().min(1, "Required"),
  main_partner: z.boolean(),
  international_partner: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

const EMPTY_VALUES: PartnerFormValues = {
  name: "",
  logo_url: "",
  main_partner: false,
  international_partner: false,
  sort_order: 0,
};

export default function PartnersManager({ initialPartners }: { initialPartners: AdminPartner[] }) {
  const [partners, setPartners] = useState(initialPartners);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPartner | null>(null);

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
      }
      return;
    }

    const { data, error } = await supabase.from("partners").insert(values).select().single();
    if (!error && data) {
      setPartners((prev) => [...prev, data as AdminPartner]);
      setOpen(false);
    }
  }

  async function onDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (!error) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Partners</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add partner</Button>
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
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input id="logo_url" {...form.register("logo_url")} placeholder="/images/logo.png" />
                {form.formState.errors.logo_url && (
                  <p className="text-sm text-red-600">{form.formState.errors.logo_url.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input id="sort_order" type="number" {...form.register("sort_order")} />
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={form.watch("main_partner")}
                  onCheckedChange={(checked) => form.setValue("main_partner", checked === true)}
                />
                Main partner (Official Court Sponsors)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <Checkbox
                  checked={form.watch("international_partner")}
                  onCheckedChange={(checked) => form.setValue("international_partner", checked === true)}
                />
                International partner
              </label>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {editing ? "Save" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Logo</TableHead>
            <TableHead>Main</TableHead>
            <TableHead>International</TableHead>
            <TableHead>Order</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell>{partner.name}</TableCell>
              <TableCell className="max-w-[240px] truncate text-neutral-500">{partner.logo_url}</TableCell>
              <TableCell>{partner.main_partner ? "Yes" : ""}</TableCell>
              <TableCell>{partner.international_partner ? "Yes" : ""}</TableCell>
              <TableCell>{partner.sort_order}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(partner)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(partner.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
