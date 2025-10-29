// import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PaymentsSection from './components/home/PaymentsSection';
import AgentSection from './components/home/AgentSection';
import ServicesSection from './components/home/ServicesSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Subtle grain texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />
        
      {/* Top navbar disabled in favor of vertical navbar (now in layout.tsx) */}
      <Hero />
      <Features />
      <PaymentsSection />
      <AgentSection />
      <ServicesSection />
      <Footer />
    </div>
  );
}
