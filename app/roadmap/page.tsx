'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { roadmapData } from './roadmap-data';
import Link from 'next/link';
import GlitchText from '../components/motion/GlitchText';
import MagneticButton from '../components/motion/MagneticButton';

const AtlasStatue = dynamic(() => import('../components/AtlasStatue'), { ssr: false });

export default function RoadmapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const allItems = roadmapData.flatMap(phase => phase.items);
  const stats = {
    total: allItems.length,
    completed: allItems.filter(item => item.status === 'completed').length,
    inProgress: allItems.filter(item => item.status === 'in-progress').length,
    planned: allItems.filter(item => item.status === 'planned').length,
  };

  const completionPercentage = Math.round((stats.completed / stats.total) * 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Subtle grain texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />

      {/* Back Button - Top Right */}
        <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg"
        >
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
        </motion.div>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Three.js Atlas Statue Background - Centered */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          <AtlasStatue />
        </div>

        {/* Subtle overlay for text readability */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%)',
          }}
        />

        <div className="relative flex flex-col md:flex-row w-full min-h-screen z-10">
          {/* Left Half - Giant Title */}
          <div className="flex-1 bg-white/20 backdrop-blur-[2px] relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0">
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="text-sm sm:text-base tracking-[0.3em] uppercase text-gray-500 font-light mb-6" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
                  Atlas402
                </div>
                <h1 className="text-[clamp(3rem,10vw,12rem)] font-bold leading-[0.9] text-black mb-6 font-title tracking-tight" style={{ textShadow: '0 2px 20px rgba(255,255,255,0.9)' }}>
                  <GlitchText text="Road" delay={400} replayOnView inViewThreshold={0.6} />
                  <br />
                  <span className="text-red-600"><GlitchText text="map" delay={800} replayOnView inViewThreshold={0.6} /></span>
                </h1>
              </motion.div>
            </div>
          </div>

          {/* Right Half - Stats & Description */}
          <div className="flex-1 bg-gray-50/30 backdrop-blur-[2px] relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0">
            <div className="w-full max-w-lg">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-xl md:text-2xl text-gray-800 mb-10 leading-relaxed font-medium" style={{ textShadow: '0 1px 10px rgba(255,255,255,0.8)' }}>
                  Building the infrastructure for decentralized micropayments. Every API call becomes an instant payment.
                </p>

                {/* Stats Cards */}
                <div className="space-y-4 mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="bg-white p-6 border-2 border-dashed border-black"
                  >
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Progress</div>
                    <div className="text-4xl font-bold text-red-600 mb-2 font-title">
                      <GlitchText text={`${completionPercentage}%`} delay={1000} replayOnView inViewThreshold={0.5} />
                    </div>
                    <div className="text-gray-600 mb-3">Completed</div>
                    <div className="h-2 bg-gray-200 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                        className="h-full bg-red-600"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="bg-white p-6 border-2 border-dashed border-black"
                  >
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-black font-title">{stats.completed}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Done</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-black font-title">{stats.inProgress}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-400 font-title">{stats.planned}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Planned</div>
                  </div>
                  </div>
                  </motion.div>
                </div>

                {/* CTA */}
                <MagneticButton>
                  <a 
                    href="https://github.com/atlas402"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <span>View on GitHub</span>
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </MagneticButton>
              </motion.div>
                </div>
              </div>
        </div>
      </section>

      {/* Roadmap Phases - Premium Scroll Sections */}
      {roadmapData.map((phase, phaseIndex) => {
        const isEven = phaseIndex % 2 === 0;
        
        return (
          <section key={phase.id} className="relative py-20 md:py-28 lg:py-36 overflow-hidden border-t border-black/10">
            <div className="relative flex flex-col md:flex-row min-h-[600px]">
              {/* Left Side - Giant Phase Title */}
              <div className={`flex-1 bg-white relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0 ${!isEven ? 'md:order-2' : ''}`}>
                <div className="w-full max-w-2xl">
          <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Phase Number - Watermark */}
                    <div className="text-[clamp(8rem,20vw,18rem)] font-bold text-black/[0.03] leading-none font-title mb-[-4rem]">
                      {String(phaseIndex + 1).padStart(2, '0')}
                    </div>

                    {/* Phase Title */}
                    <h2 className="text-[clamp(2.5rem,8vw,8rem)] font-bold leading-[0.9] text-black mb-6 font-title tracking-tight">
                      <GlitchText text={phase.title.split(' ')[0]} delay={300 + phaseIndex * 200} replayOnView inViewThreshold={0.4} />
                      <br />
                      {phase.title.split(' ').length > 1 && (
                        <span className="text-red-600">
                          <GlitchText text={phase.title.split(' ').slice(1).join(' ')} delay={600 + phaseIndex * 200} replayOnView inViewThreshold={0.4} />
                        </span>
                      )}
                    </h2>

                    {/* Period with underline animation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="relative inline-block"
                    >
                      <div className="text-xl md:text-2xl text-gray-500 mb-4">{phase.period}</div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-[2px] bg-red-600"
                      />
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-lg text-gray-600 mt-6 leading-relaxed"
                    >
                      {phase.description}
                    </motion.p>
                  </motion.div>
                </div>
              </div>

              {/* Center Divider Line - Red */}
              <div className="hidden md:block w-[2px] bg-red-600 absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10" />

              {/* Right Side - Items */}
              <div className={`flex-1 bg-gray-50 relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0 ${!isEven ? 'md:order-1' : ''}`}>
                <div className="w-full max-w-lg space-y-4">
                  {phase.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: itemIndex * 0.1 }}
                      className="bg-white p-6 border-2 border-dashed border-black relative group hover:border-red-600 transition-all duration-300"
                    >
                      {/* Red accent line */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '40px' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.1 + 0.3 }}
                        className="h-[2px] bg-red-600 mb-4"
                      />

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-red-600 animate-pulse' :
                          item.status === 'in-progress' ? 'bg-black animate-pulse' :
                          'bg-gray-400'
                        }`} />
                        <span className={`text-xs uppercase tracking-wider font-medium ${
                          item.status === 'completed' ? 'text-red-600' :
                          item.status === 'in-progress' ? 'text-black' :
                          'text-gray-500'
                        }`}>
                          {item.status === 'completed' ? 'Completed' :
                           item.status === 'in-progress' ? 'In Progress' :
                           'Planned'}
                        </span>
                    </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-black mb-2 leading-tight group-hover:text-red-600 transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed font-light">
                        {item.description}
                      </p>

                      {/* Features - Compact List */}
                      {item.features && item.features.length > 0 && (
                        <ul className="space-y-1 border-t border-gray-200 pt-3">
                          {item.features.slice(0, 3).map((feature, featureIndex) => (
                            <motion.li
                              key={featureIndex}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: itemIndex * 0.1 + featureIndex * 0.05 }}
                              className="flex items-start gap-2 text-xs text-gray-500 font-light"
                            >
                              <span className="text-red-600 mt-0.5 flex-shrink-0">—</span>
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                          {item.features.length > 3 && (
                            <li className="text-xs text-gray-400 italic">
                              +{item.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section - Split Layout */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden border-t border-black/10 bg-black text-white">
        {/* Grain texture on dark background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        />

        <div className="relative flex flex-col md:flex-row min-h-[500px]">
          {/* Left Side - Giant CTA Title */}
          <div className="flex-1 relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0">
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-[clamp(2.5rem,8vw,8rem)] font-bold leading-[0.9] text-white mb-6 font-title tracking-tight">
                  <GlitchText text="Join" delay={300} replayOnView inViewThreshold={0.4} />
                  <br />
                  <span className="text-red-600"><GlitchText text="the" delay={600} replayOnView inViewThreshold={0.4} /></span>
                  <br />
                  <GlitchText text="Revolution" delay={900} replayOnView inViewThreshold={0.4} />
                </h2>
              </motion.div>
            </div>
          </div>

          {/* Center Divider Line - Red */}
          <div className="hidden md:block w-[2px] bg-red-600 absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10" />

          {/* Right Side - CTA Content */}
          <div className="flex-1 relative flex items-center justify-center px-6 sm:px-8 md:px-12 py-20 md:py-0">
            <div className="w-full max-w-lg">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Building x402 in the open. Contribute, collaborate, create the future of micropayments.
          </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <MagneticButton>
            <a
              href="https://github.com/atlas402"
              target="_blank"
              rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <span>View on GitHub</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
                  </MagneticButton>
                  <MagneticButton>
            <Link
              href="/docs"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-lg hover:scale-[1.02]"
            >
                      <span>Documentation</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
