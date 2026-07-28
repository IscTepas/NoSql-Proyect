"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[var(--wc-gold)]/10 hover:-translate-y-0.5 border-[var(--wc-gold)]/10 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--wc-gold)]/[0.03] to-transparent" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[var(--wc-gold)]/[0.06] to-transparent rounded-bl-[40px]" />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-black/5",
              color || "bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)]"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">{title}</p>
            <p className="text-2xl font-black tracking-tight text-[var(--wc-black)]">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
