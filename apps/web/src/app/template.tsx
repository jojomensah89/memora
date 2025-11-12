"use client";

import { motion } from "framer-motion";

export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ y: 20, opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.75}}
    >
      {children}
    </motion.div>
  );
}
