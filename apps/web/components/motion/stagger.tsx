"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useMotionPreference } from "../motion-preference";

const containerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const { reduce } = useMotionPreference();
  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={reduce ? undefined : containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const { reduce } = useMotionPreference();
  return (
    <motion.div className={cn(className)} variants={reduce ? undefined : itemVariants}>
      {children}
    </motion.div>
  );
}
