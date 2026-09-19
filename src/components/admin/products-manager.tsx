"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import { Pencil, Trash2, Plus, ShoppingBag, ImageIcon, GripVertical, X, ChevronLeft, ChevronRight } from "lucide-react";
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
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES, type ProductCategory } from "@/types/product";

// Section divider inside the Add/Edit product modal — underline instead of a
// nested card/border per group, so groups stay distinct without stacking boxes.
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

// Main image + synced thumbnail strip (Swiper Thumbs module) for the descriptive
// shots that aren't tied to a colorway.
function ImageGallery({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const mainHeight = "h-56";
  const mainImageSize = 220;

  if (images.length === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`flex h-28 items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 text-xs font-medium text-neutral-500 hover:border-neutral-500 hover:bg-neutral-200 hover:text-neutral-900`}
      >
        <ImageIcon className="size-4" />
        Add an extra image
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Swiper
          modules={[Thumbs]}
          // Emptying a color drops both Swipers while thumbsSwiper still points at
          // the destroyed instance — Thumbs then reads slides off it and blows up.
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onSwiper={setMainSwiper}
          className={`gallery-main ${mainHeight} overflow-hidden rounded-lg bg-neutral-100`}
        >
          {images.map((url, i) => (
            <SwiperSlide key={i}>
              <div className="group relative flex h-full w-full items-center justify-center">
                <Image
                  src={url}
                  alt=""
                  width={mainImageSize}
                  height={mainImageSize}
                  className="object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mainSwiper?.slidePrev()}
              className="absolute left-1 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => mainSwiper?.slideNext()}
              className="absolute right-1 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Swiper
          onSwiper={setThumbsSwiper}
          slidesPerView={6}
          spaceBetween={4}
          watchSlidesProgress
          className="thumb-strip flex-1"
        >
          {images.map((url, i) => (
            <SwiperSlide key={i}>
              <button
                type="button"
                onClick={() => mainSwiper?.slideTo(i)}
                className="size-12 shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100 opacity-60 [.swiper-slide-thumb-active_&]:border-[#e00327] [.swiper-slide-thumb-active_&]:opacity-100"
              >
                <Image src={url} alt="" width={48} height={48} className="size-full object-contain" unoptimized />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          onClick={onAdd}
          className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export type AdminProduct = {
  id: string;
  title: string;
  category: ProductCategory;
  sizes: string[];
  is_new: boolean;
  image_url: string;
  colors: { name: string; code: string; image: string }[];
  gallery: string[];
  sort_order: number;
  active: boolean;
};

const colorSchema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  image: z.string(),
});

const productSchema = z.object({
  title: z.string().min(1, "Required"),
  category: z.enum(["shirt", "shorts", "cap", "socks", "other"]),
  sizes: z.array(z.string()),
  is_new: z.boolean(),
  colors: z.array(colorSchema),
  gallery: z.array(z.string()),
  active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EMPTY_VALUES: ProductFormValues = {
  title: "",
  category: "shirt",
  sizes: [],
  is_new: false,
  colors: [],
  gallery: [],
  active: true,
};

function toFormValues(product: AdminProduct): ProductFormValues {
  return {
    title: product.title,
    category: product.category,
    sizes: product.sizes,
    is_new: product.is_new,
    colors: product.colors,
    gallery: product.gallery ?? [],
    active: product.active,
  };
}

// Cover image = the first colorway that actually has an image, same rule the legacy
// theme used for $defaultImage. Stored as image_url for the admin table thumbnail.
function toRow(values: ProductFormValues) {
  return {
    ...values,
    image_url: values.colors.find((c) => c.image)?.image ?? "",
  };
}

export default function ProductsManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Which slot the image picker is filling: one colorway's single image, or the
  // shared descriptive gallery.
  const [imageTarget, setImageTarget] = useState<{ kind: "color"; index: number } | { kind: "gallery" } | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });
  const colorFields = useFieldArray({ control: form.control, name: "colors" });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditing(product);
    form.reset(toFormValues(product));
    setOpen(true);
  }

  async function onSubmit(values: ProductFormValues) {
    const supabase = createClient();
    const row = toRow(values);

    if (editing) {
      const { data, error } = await supabase.from("products").update(row).eq("id", editing.id).select().single();
      if (!error && data) {
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? (data as AdminProduct) : p)));
        setOpen(false);
        toast.success("Product updated");
      } else {
        toast.error(error?.message ?? "Failed to update product");
      }
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ ...row, sort_order: products.length })
      .select()
      .single();
    if (!error && data) {
      setProducts((prev) => [...prev, data as AdminProduct]);
      setOpen(false);
      toast.success("Product created");
    } else {
      toast.error(error?.message ?? "Failed to create product");
    }
  }

  async function onReorder(next: AdminProduct[]) {
    const previous = products;
    setProducts(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((p, i) => supabase.from("products").update({ sort_order: i }).eq("id", p.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setProducts(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setProducts(next.map((p, i) => ({ ...p, sort_order: i })));
  }

  async function onToggleActive(product: AdminProduct) {
    const supabase = createClient();
    const active = !product.active;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active } : p)));
    const { error } = await supabase.from("products").update({ active }).eq("id", product.id);
    if (error) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: !active } : p)));
      toast.error(error.message);
    }
  }

  function onPickImage(url: string) {
    if (!imageTarget) return;
    if (imageTarget.kind === "color") {
      form.setValue(`colors.${imageTarget.index}.image`, url);
      return;
    }
    form.setValue("gallery", [...form.getValues("gallery"), url]);
  }

  function removeGalleryImage(index: number) {
    form.setValue(
      "gallery",
      form.getValues("gallery").filter((_, i) => i !== index),
    );
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500">Collection shown on the products page.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add product
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-5xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (imageTarget !== null) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-3">
                <div className="grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                  <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <SectionLabel>Colorways</SectionLabel>
                      {/* Fixed Black/White/Navy/Red set, one image each — clicking a
                          swatch opens the picker for that color straight away. */}
                      <div className="flex items-center gap-1">
                        {PRODUCT_COLORS.map((preset) => {
                          const index = form.watch("colors").findIndex((c) => c.name === preset.name);
                          const added = index !== -1;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              title={preset.name}
                              onClick={() => {
                                if (added) {
                                  setImageTarget({ kind: "color", index });
                                  return;
                                }
                                colorFields.append({ name: preset.name, code: preset.code, image: "" });
                                setImageTarget({ kind: "color", index: colorFields.fields.length });
                              }}
                              className={`size-9 rounded-full border-2 transition-transform hover:scale-110 ${
                                added ? "border-[#e00327]" : "border-neutral-300"
                              }`}
                              style={{ backgroundColor: preset.code }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {colorFields.fields.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-500">
                        No colorway yet — pick a swatch above to add one.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        {colorFields.fields.map((field, index) => {
                          const image = form.watch(`colors.${index}.image`);
                          return (
                            <div key={field.id} className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => setImageTarget({ kind: "color", index })}
                                className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-1 hover:border-[#e00327]"
                              >
                                {image ? (
                                  <Image
                                    src={image}
                                    alt={form.watch(`colors.${index}.name`)}
                                    width={120}
                                    height={120}
                                    className="size-full object-contain"
                                    unoptimized
                                  />
                                ) : (
                                  <ImageIcon className="size-4 text-neutral-400" />
                                )}
                              </button>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                                <span
                                  className="size-3.5 shrink-0 rounded-full border border-neutral-300"
                                  style={{ backgroundColor: form.watch(`colors.${index}.code`) }}
                                />
                                <span className="truncate">{form.watch(`colors.${index}.name`)}</span>
                                <button
                                  type="button"
                                  onClick={() => colorFields.remove(index)}
                                  className="ml-auto p-1 text-neutral-400 hover:text-neutral-900"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <SectionLabel>Extra images</SectionLabel>
                    <ImageGallery
                      images={form.watch("gallery")}
                      onAdd={() => setImageTarget({ kind: "gallery" })}
                      onRemove={removeGalleryImage}
                    />
                  </section>

                  <div className="flex flex-col gap-4">
                  <section className="flex flex-col gap-2">
                    <SectionLabel>Product info</SectionLabel>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input id="title" className={fieldInput} {...form.register("title")} />
                        {form.formState.errors.title && (
                          <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <FieldLabel>Category</FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {PRODUCT_CATEGORIES.map((c) => {
                            const active = form.watch("category") === c.value;
                            return (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => form.setValue("category", c.value)}
                                className={active ? pillActive : pillInactive}
                              >
                                {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col gap-2">
                    <SectionLabel>Settings</SectionLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="col-span-2 flex flex-col gap-1">
                        <FieldLabel>Sizes</FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {PRODUCT_SIZES.map((size) => {
                            const selected = form.watch("sizes").includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  const current = form.getValues("sizes");
                                  // Keep PRODUCT_SIZES order regardless of click order.
                                  form.setValue(
                                    "sizes",
                                    PRODUCT_SIZES.filter((s) =>
                                      s === size ? !current.includes(s) : current.includes(s),
                                    ),
                                  );
                                }}
                                className={selected ? pillActive : pillInactive}
                              >
                                {size}
                              </button>
                            );
                          })}
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

                      <div className="flex flex-col gap-1">
                        <FieldLabel>New arrival</FieldLabel>
                        <button
                          type="button"
                          onClick={() => form.setValue("is_new", !form.watch("is_new"))}
                          className={form.watch("is_new") ? pillActive : `w-fit ${pillInactive}`}
                        >
                          {form.watch("is_new") ? "Yes, new arrival" : "Not new arrival"}
                        </button>
                      </div>
                    </div>
                  </section>
                  </div>
                </div>
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
                  {editing ? "Save changes" : "Create product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ShoppingBag className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No products yet</p>
            <p className="text-sm text-neutral-400">Add your first item to show it on the site.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={products} onReorder={onReorder}>
              {products.map((product) => (
                <Reorder.Item key={product.id} value={product} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">
                    {product.title}
                    {product.is_new && (
                      <Badge variant="secondary" className="ml-2">
                        New
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-neutral-600">{product.category}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(product)} className="cursor-pointer">
                      {product.active ? (
                        <Badge className="bg-[#e00327] hover:bg-[#c40320]">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-neutral-100">Hidden</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === product.id}
                        onClick={() => onDelete(product.id)}
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
        folder="products"
      />
    </motion.div>
  );
}
