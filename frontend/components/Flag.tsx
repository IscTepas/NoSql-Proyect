import { getFlagUrl } from "@/lib/flags";

interface FlagProps {
  code: string;
  size?: number;
  className?: string;
  fill?: boolean;
}

export default function Flag({ code, size, className = "", fill }: FlagProps) {
  const src = getFlagUrl(code);
  if (!src) return null;

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={code}
        className={`w-full h-full rounded-sm shadow-sm ${className}`}
        style={{ objectFit: "fill" }}
        loading="lazy"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={code}
      width={size ?? 24}
      height={Math.round((size ?? 24) * 0.75)}
      className={`inline-block rounded-sm shadow-sm object-cover ${className}`}
      loading="lazy"
    />
  );
}
