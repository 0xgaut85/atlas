'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Enhanced animated text components
const AnimatedTitle = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 1, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
      style={{ color: '#000000' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedSubtitle = ({ children, className, delay = 0.3 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, rotateX: 90 }}
      whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={className}
      style={{ color: '#000000' }}
    >
      {children}
    </motion.div>
  );
};

const SplitText = ({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) => {
  const words = children.split(' ');
  
  return (
    <motion.div className={className} style={{ color: '#000000' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          viewport={{ once: true, margin: "-100px" }}
          className="inline-block"
          style={{ marginRight: '0.5em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const TypingText = ({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) => {
  const letters = children.split('');
  
  return (
    <motion.div className={className}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{
            duration: 0.05,
            delay: delay + i * 0.05,
            ease: "easeOut"
          }}
          viewport={{ once: true }}
          className="inline-block"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function ScrollExperience() {
  return (
    <div className="bg-white text-black">
      {/* Hero Section */}
      <section className="h-screen relative snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-7xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.75] tracking-tighter" style={{ color: '#000000' }}>
                The payment
              </h1>
              <div className="mt-16 text-right pr-12">
                <span className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic leading-[0.8]" style={{ color: '#000000' }}>
                  rail for the agent economy
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subheader */}
      <section className="h-screen relative bg-gradient-to-b from-white via-gray-50 to-white snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="max-w-6xl text-center mx-auto">
            <SplitText className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-tight mb-8">
              Per-request micropayments
            </SplitText>
            <AnimatedSubtitle className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic leading-tight">
              for APIs and AI agents
            </AnimatedSubtitle>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="h-screen relative bg-gradient-to-b from-gray-100 to-gray-50 snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="max-w-6xl text-center mx-auto">
            <AnimatedTitle className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] mb-8">
              The internet
            </AnimatedTitle>
            <AnimatedSubtitle className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic leading-tight" delay={0.5}>
              never shipped with native payments
            </AnimatedSubtitle>
          </div>
        </div>
      </section>

      {/* The Insight */}
      <section className="h-screen relative snap-start">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="flex h-full" style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '100vw' }}>
            {/* Left Side - Yellow Wheat Background, Black Text */}
            <div className="flex items-center justify-center" style={{ backgroundColor: '#EAB308', width: '50vw', height: '100%' }}>
              <motion.div 
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] text-center px-8"
                style={{ color: '#000000' }}
              >
                Agents don't subscribe
              </motion.div>
            </div>
            
            {/* Right Side - White Background, Black Text */}
            <div className="bg-white flex items-center justify-center" style={{ width: '50vw', height: '100%' }}>
              <motion.div 
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] text-center px-8"
                style={{ color: '#000000' }}
              >
                APIs shouldn't advertise
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="h-screen relative bg-white snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-6xl mx-auto">
            <SplitText className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] text-black mb-8">
              Every interaction
            </SplitText>
            <motion.div 
              className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic text-black leading-[0.9]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              becomes a <span className="text-yellow-500">transaction</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="h-screen relative bg-gradient-to-b from-gray-50 to-white snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-6xl mx-auto">
            <AnimatedTitle className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] text-black mb-8">
              Why it wins
            </AnimatedTitle>
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic leading-tight text-black"
            >
              Friction disappears
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="h-screen relative bg-gradient-to-br from-gray-50 via-white to-gray-100 snap-start">
        <div className="sticky top-0 h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-6xl mx-auto">
            <SplitText className="text-[6vw] sm:text-[8vw] md:text-[10vw] lg:text-[12vw] font-normal italic leading-[0.8] text-black mb-12">
              Who is it for?
            </SplitText>
            <div className="text-right pr-12">
              <AnimatedSubtitle className="text-[3vw] sm:text-[3vw] md:text-[2.5vw] lg:text-[2vw] font-normal italic leading-tight text-black" delay={0.6}>
                AI platforms and data providers
              </AnimatedSubtitle>
            </div>
          </div>
        </div>
      </section>

      {/* BSC Benefits */}
      <section className="h-screen relative bg-white snap-start">
        <div className="sticky top-0 h-screen relative">
          {/* Top Left - Built */}
          <motion.div 
            className="absolute top-8 left-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
          >
            <div className="text-[6vw] sm:text-[7vw] md:text-[9vw] lg:text-[11vw] font-normal italic leading-[0.8] text-black">
              Built
            </div>
          </motion.div>
          
          {/* Center - On */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
          >
            <div className="text-[6vw] sm:text-[7vw] md:text-[9vw] lg:text-[11vw] font-normal italic leading-[0.8] text-black">
              On
            </div>
          </motion.div>
          
          {/* Bottom Right - BSC */}
          <motion.div 
            className="absolute" 
            style={{ bottom: '2rem', right: '2rem' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
          >
            <div className="text-[6vw] sm:text-[7vw] md:text-[9vw] lg:text-[11vw] font-normal italic leading-[0.8] text-black">
              BSC
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-screen flex items-center justify-center px-8 bg-white relative snap-start">
        {/* Navigation Links */}
        <div 
          className="absolute z-50"
          style={{ 
            bottom: '32px', 
            left: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '80px'
          }}
        >
          <a 
            href="https://x.com/atlas402dotcom" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontWeight: 600, 
              fontStyle: 'italic', 
              fontSize: '20px', 
              color: '#000000', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            @nova402
          </a>
          
          <a 
            href="#docs" 
            style={{ 
              fontWeight: 600, 
              fontStyle: 'italic', 
              fontSize: '20px', 
              color: '#000000', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            docs
          </a>
          
          <a 
            href="https://github.com/nova402" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontWeight: 600, 
              fontStyle: 'italic', 
              fontSize: '20px', 
              color: '#000000', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            github
          </a>
          
          <a 
            href="#dapp" 
            style={{ 
              fontWeight: 600, 
              fontStyle: 'italic', 
              fontSize: '20px', 
              color: '#000000', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <img src="/logo.png" alt="dapp" width="26" height="26" style={{ objectFit: 'contain' }} />
            dapp
          </a>
          
          <a 
            href="https://explorer.nova402.com" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontWeight: 600, 
              fontStyle: 'italic', 
              fontSize: '20px', 
              color: '#000000', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            explorer
          </a>
        </div>

        {/* Back to Top Icon - Centered */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
            <path d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
        </motion.button>
      </footer>
    </div>
  );
}