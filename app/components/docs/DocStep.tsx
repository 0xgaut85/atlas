interface DocStepProps {
  number: number;
  title: string;
  description: string;
}

export default function DocStep({ number, title, description }: DocStepProps) {
  return (
    <div className="bg-white backdrop-blur-sm rounded-lg p-6 border border-2 border-dashed border-black">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <h3 className="text-base font-bold text-black m-0">{title}</h3>
      </div>
      <p className="text-sm text-gray-700 font-normal m-0 pl-11 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

