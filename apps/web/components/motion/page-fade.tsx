"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionPreference } from "../motion-preference";

export function PageFade({ children }: { children: ReactNode }) {
  const { reduce } = useMotionPreference();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.24, ease: [0.2, 0.7, 0.1, 1] }}
      className="flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}
