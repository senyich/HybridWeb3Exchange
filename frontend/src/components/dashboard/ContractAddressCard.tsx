import { ShieldCheck } from "lucide-react";
import { Card } from "../Card";

interface ContractAddressProps {
  label: string;
  address: `0x${string}`;
  color: "purple" | "crimson";
  showStatus?: boolean;
}

const ContractAddress = ({ label, address, color, showStatus = true }: ContractAddressProps) => {
  const colors = {
    purple: {
      text: "text-purple-200/90",
      bg: "bg-purple-900/20",
      border: "border-purple-500/20",
      hoverBorder: "border-purple-500/40",
      dot: "bg-green-500",
      shadow: "shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    },
    crimson: {
      text: "text-crimson-200/90",
      bg: "bg-crimson-blood/20",
      border: "border-crimson-neon/20",
      hoverBorder: "border-crimson-neon/40",
      dot: "bg-crimson-neon",
      shadow: "shadow-[0_0_8px_rgba(255,0,60,0.5)]",
    },
  };

  const currentColor = colors[color];

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest">
          {label}
        </div>
        {showStatus && (
          <div
            className={`w-1.5 h-1.5 rounded-full ${currentColor.dot} ${currentColor.shadow}`}
          />
        )}
      </div>
      <div
        className={`font-mono text-[11px] ${currentColor.text} truncate ${currentColor.bg} p-2.5 border ${currentColor.border} rounded-lg group-hover:${currentColor.hoverBorder} transition-all select-all`}
      >
        <a
          href={`https://sepolia.etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block truncate ${currentColor.text} hover:underline`}
        >
          {address}
        </a>
      </div>
    </div>
  );
};

interface ContractAddressCardProps {
  exchangeAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
}

export const ContractAddressCard = ({
  exchangeAddress,
  tokenAddress,
}: ContractAddressCardProps) => {
  return (
    <Card className="flex flex-col justify-center gap-6">
      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <ShieldCheck className="w-5 h-5 text-gray-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Contract Details
        </span>
      </div>
      <div className="space-y-5">
        <ContractAddress
          label="Exchange"
          address={exchangeAddress}
          color="purple"
        />
        <ContractAddress
          label="Token Asset"
          address={tokenAddress}
          color="crimson"
        />
      </div>
    </Card>
  );
};