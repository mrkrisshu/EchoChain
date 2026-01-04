"use client";

import React from 'react';
import { motion } from "framer-motion";

// --- Types ---
interface Testimonial {
  text: string;
  name: string;
  role: string;
  image: string;
}

// --- EchoChain Testimonials Data ---
const testimonials: Testimonial[] = [
  {
    text: "Minted my voice in 2 minutes. Now I wake up to SOL in my wallet every time a developer uses it for their game characters.",
    name: "Marcus Chen",
    role: "Voice Artist",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  },
  {
    text: "The easiest passive income I've ever made. I just set my price per use, EchoChain handles the licensing, and I get paid instantly.",
    name: "Sarah Williams",
    role: "Podcast Host",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    text: "Finally, true ownership. No middlemen taking a cut. I see every single transaction on-chain and receive 100% of my royalties.",
    name: "David Park",
    role: "Narrator",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    text: "I was skeptical about AI, but EchoChain lets me control it. Only approved apps can generate my voice, and they pay upfront in SOL.",
    name: "Emma Rodriguez",
    role: "Voice Actor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    text: "The license enforcement is incredible. I can set exactly how many times my voice can be used and block AI training completely.",
    name: "Alex Turner",
    role: "Audio Creator",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
  {
    text: "Switched from traditional agencies to EchoChain. Now I earn 10x more per use with complete transparency on Solana.",
    name: "Maya Johnson",
    role: "Voiceover Artist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  },
  {
    text: "The Per-Use licensing model is genius. Every AI app that uses my voice pays me automatically. Zero friction.",
    name: "Chris Anderson",
    role: "Content Creator",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
  {
    text: "Love seeing my voice NFT on the marketplace. The license terms are clear, buyers know exactly what they're getting.",
    name: "Lisa Chen",
    role: "Streamer",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  },
  {
    text: "EchoChain solved the consent problem. My voice, my rules, my earnings. This is how AI should work.",
    name: "James Miller",
    role: "Audio Engineer",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, name, role, image }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.15)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-2xl border border-white/10 shadow-lg max-w-xs w-full bg-white/5 backdrop-blur-sm transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-gray-300 leading-relaxed font-normal m-0 text-sm">
                      "{text}"
                    </p>
                    <footer className="flex items-center gap-3 mt-5">
                      <img
                        src={image}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500/30"
                      />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-white">
                          {name}
                        </cite>
                        <span className="text-xs leading-5 tracking-tight text-gray-500 mt-0.5">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

// --- Main Testimonials Section ---
export default function TestimonialsV2() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-12 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="max-w-6xl px-6 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-cyan-500/30 py-1 px-4 rounded-full text-xs font-semibold tracking-wide uppercase text-cyan-400 bg-cyan-500/10">
              Testimonials
            </div>
          </div>

          <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-bold tracking-tight mt-6 text-center text-white">
            What creators say
          </h2>
          <p className="text-center mt-5 text-gray-400 text-lg leading-relaxed max-w-sm">
            Voice artists earning from AI with EchoChain
          </p>
        </div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  );
}
