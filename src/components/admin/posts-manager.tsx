"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, FileText, ImageIcon, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ImagePickerDialog from "@/components/admin/image-picker-dialog";
import RichTextEditor from "@/components/admin/rich-text-editor";
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

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_url: string;
  published_at: string;
  sort_order: number;
  active: boolean;
};

// The slug is the post's URL, so keep it to lowercase words joined by dashes.
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const postSchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required"),
  excerpt: z.string(),
  body: z.string(),
  cover_url: z.string(),
  published_at: z.string(),
  active: z.boolean(),
});

type PostFormValues = z.infer<typeof postSchema>;

const EMPTY_VALUES: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_url: "",
  published_at: "",
  active: true,
};

function toFormValues(post: AdminPost): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    cover_url: post.cover_url,
    published_at: post.published_at,
    active: post.active,
  };
}

export default function PostsManager({ initialPosts }: { initialPosts: AdminPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickingCover, setPickingCover] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOpen(true);
  }

  function openEdit(post: AdminPost) {
    setEditing(post);
    form.reset(toFormValues(post));
    setOpen(true);
  }

  async function onSubmit(values: PostFormValues) {
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase.from("kaizen_posts").update(values).eq("id", editing.id).select().single();
      if (!error && data) {
        setPosts((prev) => prev.map((p) => (p.id === editing.id ? (data as AdminPost) : p)));
        setOpen(false);
        toast.success("Post updated");
      } else {
        toast.error(error?.message ?? "Failed to update post");
      }
      return;
    }

    const { data, error } = await supabase
      .from("kaizen_posts")
      .insert({ ...values, sort_order: posts.length })
      .select()
      .single();
    if (!error && data) {
      setPosts((prev) => [...prev, data as AdminPost]);
      setOpen(false);
      toast.success("Post created");
    } else {
      toast.error(error?.message ?? "Failed to create post");
    }
  }

  async function onReorder(next: AdminPost[]) {
    const previous = posts;
    setPosts(next);
    const supabase = createClient();

    // supabase-js resolves with { error } instead of throwing, so a failed row
    // has to be detected here — otherwise the UI keeps an order the DB rejected.
    const results = await Promise.all(
      next.map((p, i) => supabase.from("kaizen_posts").update({ sort_order: i }).eq("id", p.id)),
    );
    const failed = results.find((r) => r.error);

    if (failed) {
      setPosts(previous);
      toast.error(failed.error?.message ?? "Failed to save order");
      return;
    }

    setPosts(next.map((p, i) => ({ ...p, sort_order: i })));
  }

  async function onToggleActive(post: AdminPost) {
    const supabase = createClient();
    const active = !post.active;
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, active } : p)));
    const { error } = await supabase.from("kaizen_posts").update({ active }).eq("id", post.id);
    if (error) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, active: !active } : p)));
      toast.error(error.message);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("kaizen_posts").delete().eq("id", id);
    setDeletingId(null);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
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
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Blogs</h1>
          <p className="text-sm text-neutral-500">Posts listed on /blogs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-1.5 bg-[#e00327] hover:bg-[#c40320]">
              <Plus className="size-4" />
              Add post
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-neutral-200 bg-white p-0 sm:max-w-3xl"
            style={{ maxHeight: "min(94vh, 880px)" }}
            onInteractOutside={(e) => {
              if (pickingCover) e.preventDefault();
            }}
          >
            <DialogHeader className="mx-0 mt-0 border-b border-neutral-200 px-5 py-3">
              <DialogTitle className="text-neutral-900">{editing ? "Edit post" : "Add post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <section className="flex flex-col gap-2">
                  <SectionLabel>Post</SectionLabel>
                  <div className="flex gap-4">
                    <div className="group relative h-28 w-40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPickingCover(true)}
                        className="flex size-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:border-[#e00327]"
                      >
                        {form.watch("cover_url") ? (
                          <Image
                            src={form.watch("cover_url")}
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
                      {form.watch("cover_url") && (
                        <button
                          type="button"
                          onClick={() => form.setValue("cover_url", "")}
                          className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-neutral-900 text-white group-hover:flex"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input
                          id="title"
                          className={fieldInput}
                          {...form.register("title", {
                            // Keep the slug in step with the title until it is edited by hand.
                            onChange: (e) => {
                              if (!editing && !form.formState.dirtyFields.slug) {
                                form.setValue("slug", slugify(e.target.value));
                              }
                            },
                          })}
                        />
                        {form.formState.errors.title && (
                          <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <FieldLabel htmlFor="slug">Slug</FieldLabel>
                          <Input id="slug" className={fieldInput} {...form.register("slug")} />
                          {form.formState.errors.slug && (
                            <p className="text-xs text-red-400">{form.formState.errors.slug.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <FieldLabel htmlFor="published_at">Date</FieldLabel>
                          <Input
                            id="published_at"
                            placeholder="17 Sept 2025"
                            className={fieldInput}
                            {...form.register("published_at")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <SectionLabel>Content</SectionLabel>
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
                    <Input id="excerpt" className={fieldInput} {...form.register("excerpt")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>Body</FieldLabel>
                    {/* Remounted per post so the editor picks up the loaded content. */}
                    <RichTextEditor
                      key={editing?.id ?? "new"}
                      value={form.getValues("body")}
                      onChange={(html) => form.setValue("body", html, { shouldDirty: true })}
                    />
                    <p className="text-xs text-neutral-400">
                      Formatting is saved as HTML and sanitised before it reaches the site, so only
                      the tags this toolbar produces survive.
                    </p>
                  </div>
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
                  {editing ? "Save changes" : "Create post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden py-0">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <FileText className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">No posts yet</p>
            <p className="text-sm text-neutral-400">Write one to fill the blogs page.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-20"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Reorder.Group as="tbody" axis="y" values={posts} onReorder={onReorder}>
              {posts.map((post) => (
                <Reorder.Item key={post.id} value={post} as="tr" className="border-b bg-white last:border-0">
                  <TableCell className="cursor-grab text-neutral-300 active:cursor-grabbing">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border bg-white">
                      {post.cover_url && (
                        <Image
                          src={post.cover_url}
                          alt={post.title}
                          width={64}
                          height={40}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium text-neutral-900">{post.title}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-neutral-500">/{post.slug}</TableCell>
                  <TableCell className="text-neutral-600">{post.published_at}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => onToggleActive(post)} className="cursor-pointer">
                      {post.active ? (
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
                      <Button variant="outline" size="icon" onClick={() => openEdit(post)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === post.id}
                        onClick={() => onDelete(post.id)}
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
        open={pickingCover}
        onOpenChange={setPickingCover}
        onSelect={(url) => form.setValue("cover_url", url)}
      />
    </motion.div>
  );
}
