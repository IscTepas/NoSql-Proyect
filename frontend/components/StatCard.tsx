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
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-black/5",
              color || "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
