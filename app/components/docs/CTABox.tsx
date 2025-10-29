interface CTABoxProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function CTABox({ title, description, buttonText, buttonHref }: CTABoxProps) {
  return (
    <div className="relative rounded-lg p-10 text-black overflow-hidden group">
      {/* Enhanced gradient background - black to green */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0a0a0a] via-[#1a1a1a] to-red-600" />
      
      {/* Heavy grain texture overlay - increased for more visibility */}
      <div 
        className="absolute inset-0 opacity-[0.2] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px'
        }}
      />
      
      <div className="relative z-10">
        <h3 className="text-3xl font-bold mb-4 tracking-wide">{title}</h3>
        <p className="text-base font-normal opacity-90 mb-8 leading-relaxed max-w-2xl">{description}</p>
        <a
          href={buttonHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-red-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all hover:gap-4"
        >
          {buttonText}
          <svg className="w-4 h-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
