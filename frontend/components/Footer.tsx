import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>FIFA World Cup 2026 &mdash; Proyecto NoSQL</p>
        <p>Estados Unidos &middot; Mexico &middot; Canada</p>
      </div>
    </footer>
  );
}
