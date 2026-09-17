"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AdminLoading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          className="absolute size-28 rounded-full bg-[#e00327]/25 blur-2xl"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex size-16 items-center justify-center rounded-full bg-white shadow-[0_0_30px_rgba(224,3,39,0.45)]">
          <Image src="/images/logo.png" alt="Kaizen Badminton" width={44} height={44} />
          <motion.span
            className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-[#e00327]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p
          className="text-sm font-medium text-neutral-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
