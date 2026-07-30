"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/media";
import { SITE, whatsappUrl } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 18, ease: "easeOut" }}
        >
          <Image
            src={HERO_IMAGE}
            alt={`${SITE.name} patio dining`}
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(215,1,2,0.25),_transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-32 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 text-xs uppercase tracking-[0.45em] text-white/70"
        >
          Luxury Dining · Bole, Addis Ababa
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-heading text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {SITE.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg"
        >
          Where Ethiopian heritage meets international cuisine, craft cocktails,
          and nights designed to be remembered.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/reservations">Book Table</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              Order Now
            </a>
          </Button>
        </motion.div>
      </div>

      <a
        href="#stats"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70 transition hover:text-white"
        aria-label="Scroll to content"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </a>
    </section>
  );
}
