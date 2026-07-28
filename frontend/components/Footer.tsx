import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-[var(--wc-gold)]/10">
      <div className="h-1 bg-gradient-to-r from-transparent via-[var(--wc-gold)] to-transparent" />
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--wc-gold)] text-white shadow-sm">
            <span className="text-[10px] font-black tracking-tighter">26</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[var(--wc-gold-dark)] text-xs font-bold tracking-wider">FIFA WORLD CUP 2026</span>
            <span className="text-muted-foreground text-[10px] tracking-wide">Proyecto NoSQL</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span>Estados Unidos</span>
          <span className="text-[var(--wc-gold)]">&middot;</span>
          <span>Mexico</span>
          <span className="text-[var(--wc-gold)]">&middot;</span>
          <span>Canada</span>
        </div>
      </div>
      <Separator className="bg-[var(--wc-gold)]/10" />
      <div className="container mx-auto px-4 py-3 text-center">
        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
          48 Selecciones &middot; 16 Estadios &middot; 104 Partidos
        </p>
      </div>
    </footer>
  );
}
