'use client';

interface ConceptCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function ConceptCard({ title, description, children }: ConceptCardProps) {
  return (
    <div className="relative bg-white backdrop-blur-sm rounded-lg p-10 border border-2 border-dashed border-black hover:border-red-600/40 transition-all duration-300 group overflow-visible">
      {/* Corner markers - matching landing page style */}
      <style jsx>{`
        .concept-card-wrapper {
          position: relative;
        }
        .concept-card-wrapper::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          width: 12px;
          height: 12px;
          border-top: 1px solid rgba(178, 169, 98, 0.3);
          border-left: 1px solid rgba(178, 169, 98, 0.3);
          z-index: 10;
          pointer-events: none;
        }
        .concept-card-wrapper::after {
          content: '';
          position: absolute;
          top: -1px;
          right: -1px;
          width: 12px;
          height: 12px;
          border-top: 1px solid rgba(178, 169, 98, 0.3);
          border-right: 1px solid rgba(178, 169, 98, 0.3);
          z-index: 10;
          pointer-events: none;
        }
        .corner-bottom-left-concept {
          position: absolute;
          bottom: -1px;
          left: -1px;
          width: 12px;
          height: 12px;
          border-bottom: 1px solid rgba(178, 169, 98, 0.3);
          border-left: 1px solid rgba(178, 169, 98, 0.3);
          pointer-events: none;
          z-index: 10;
        }
        .corner-bottom-right-concept {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 12px;
          height: 12px;
          border-bottom: 1px solid rgba(178, 169, 98, 0.3);
          border-right: 1px solid rgba(178, 169, 98, 0.3);
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
      
      <div className="concept-card-wrapper">
        <div className="corner-bottom-left-concept" />
        <div className="corner-bottom-right-concept" />
        
        <div className="mb-4 w-12 h-[2px] bg-red-600 group-hover:w-16 transition-all duration-300" />
        <h3 className="text-2xl font-bold text-black mb-4 tracking-wide">{title}</h3>
        <p className="text-base text-gray-700 font-normal leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}
