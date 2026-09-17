"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/partners");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 p-4">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 0%, rgba(224,3,39,0.4) 0%, rgba(224,3,39,0) 70%), radial-gradient(35% 35% at 100% 100%, rgba(224,3,39,0.18) 0%, rgba(224,3,39,0) 70%), radial-gradient(35% 35% at 0% 100%, rgba(224,3,39,0.12) 0%, rgba(224,3,39,0) 70%)",
        }}
      />
      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 90%)",
        }}
      />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        {/* logo badge, half-overlapping the card */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative z-10 -mb-14 flex flex-col items-center"
        >
          <motion.div
            className="absolute size-44 rounded-full bg-[#e00327]/30 blur-3xl"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex size-28 items-center justify-center rounded-full bg-white shadow-[0_0_50px_rgba(224,3,39,0.55)] ring-4 ring-neutral-950">
            <Image src="/images/logo.png" alt="Kaizen Badminton" width={92} height={92} priority />
          </div>
        </motion.div>

        {/* card with gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="w-full rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-transparent p-px shadow-2xl"
        >
          <div className="rounded-2xl bg-neutral-900/80 px-8 pb-8 pt-20 backdrop-blur-xl">
            <div className="mb-6 text-center">
              <h1 className="text-lg font-semibold tracking-tight text-white">Kaizen Badminton Admin</h1>
              <p className="mt-1 text-sm text-neutral-400">Sign in to manage the site</p>
            </div>

            <motion.form
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
              }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-1.5"
              >
                <Label htmlFor="email" className="text-neutral-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500 transition-colors peer-focus:text-[#e00327]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="peer h-11 rounded-xl border-white/10 bg-white/[0.06] pl-10 text-white shadow-inner shadow-black/20 placeholder:text-neutral-500 focus-visible:border-[#e00327]/60 focus-visible:bg-white/[0.08] focus-visible:ring-[3px] focus-visible:ring-[#e00327]/25"
                    placeholder="you@kaizenbadminton.com"
                  />
                </div>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-1.5"
              >
                <Label htmlFor="password" className="text-neutral-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/10 bg-white/[0.06] pl-10 pr-10 text-white shadow-inner shadow-black/20 placeholder:text-neutral-500 focus-visible:border-[#e00327]/60 focus-visible:bg-white/[0.08] focus-visible:ring-[3px] focus-visible:ring-[#e00327]/25"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </motion.div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="group mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-[#e00327] to-[#ff2d55] text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(224,3,39,0.4)] transition-shadow hover:shadow-[0_10px_32px_rgba(224,3,39,0.55)] disabled:opacity-80"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="size-4 animate-spin" />
                          Signing in...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Sign in
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>

        <p className="mt-6 text-xs text-neutral-600">© 2025 Kaizen Badminton</p>
      </div>
    </div>
  );
}
