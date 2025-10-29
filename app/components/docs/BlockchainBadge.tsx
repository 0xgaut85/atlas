interface BlockchainBadgeProps {
  name: string;
  logo: string;
}

export default function BlockchainBadge({ name, logo }: BlockchainBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white backdrop-blur-sm hover:bg-black/90 rounded-lg border border-2 border-dashed border-black transition-all hover:border-red-600/30">
      <img src={logo} alt={name} className="w-5 h-5 rounded" />
      <span className="text-sm font-normal text-gray-300">{name}</span>
    </div>
  );
}
