'use client';

interface PaymentSuccessModalProps {
  txHash: string;
  onClose: () => void;
}

export function PaymentSuccessModal({ txHash, onClose }: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="relative bg-black border border-red-600/30 rounded-lg max-w-md w-full p-8">
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none rounded-lg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        />

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-lg" />

        <div className="relative z-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-light text-white text-center mb-3">Payment Successful!</h3>
          
          {/* Description */}
          <p className="text-gray-400 text-center mb-6 font-light">
            Your transaction has been confirmed on-chain
          </p>

          {/* Transaction Hash */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
            <p className="text-xs text-gray-500 mb-2 font-light">Transaction Hash</p>
            <p className="text-sm text-white font-mono break-all font-light">{txHash}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-center text-sm font-light"
            >
              View on Explorer
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm font-light border border-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


