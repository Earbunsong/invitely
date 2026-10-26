"use client";

import { motion } from "framer-motion";

/** iPhone-style frame that runs a live invitation inside an iframe. */
export function PhoneMockup({ src, className = "" }: { src: string; className?: string }) {
  const W = 390;
  const H = 844;
  const scale = 0.72;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className={`relative mx-auto rounded-[3rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ${className}`}
      style={{ width: W * scale + 20, height: H * scale + 20 }}
    >
      <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="h-full w-full overflow-hidden rounded-[2.3rem] bg-white">
        <iframe
          src={src}
          title="Live invitation demo"
          className="origin-top-left border-0"
          style={{ width: W, height: H, transform: `scale(${scale})` }}
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
