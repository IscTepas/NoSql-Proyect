import { Separator } from "@/components/ui/separator";
import { Circle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 text-primary" fill="currentColor" />
          <p>FIFA World Cup 2026 &mdash; Proyecto NoSQL</p>
        </div>
        <p>Estados Unidos &middot; Mexico &middot; Canada</p>
      </div>
    </footer>
  );
}
