"use client";

import { cn } from "@/lib/utils";
import { Check, Clock, ChefHat, Package } from "lucide-react";

interface StatusStep {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const steps: StatusStep[] = [
  { key: "PENDING", label: "Order Received", icon: <Clock className="w-5 h-5" /> },
  { key: "CONFIRMED", label: "Confirmed", icon: <Check className="w-5 h-5" /> },
  { key: "PREPARING", label: "Being Prepared", icon: <ChefHat className="w-5 h-5" /> },
  { key: "READY", label: "Ready for Pickup", icon: <Package className="w-5 h-5" /> },
];

const statusOrder = ["PENDING", "CONFIRMED", "PREPARING", "READY", "PICKED_UP"];

interface StatusTimelineProps {
  currentStatus: string;
  className?: string;
}

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";
  const isExpired = currentStatus === "EXPIRED";
  const isPickedUp = currentStatus === "PICKED_UP";

  if (isCancelled || isExpired) {
    return (
      <div className={cn("flex flex-col items-center gap-4 py-8", className)}>
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            isCancelled ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400"
          )}
        >
          <Clock className="w-8 h-8" />
        </div>
        <p className={cn("text-lg font-semibold", isCancelled ? "text-red-400" : "text-gray-400")}>
          Order {isCancelled ? "Cancelled" : "Expired"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between w-full max-w-lg mx-auto", className)}>
      {steps.map((step, index) => {
        const isCompleted = currentIndex > index || isPickedUp;
        const isCurrent = currentIndex === index && !isPickedUp;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-emerald-500 text-white shadow-glow",
                  isCurrent && "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500 animate-pulse-glow",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center whitespace-nowrap",
                  isCompleted && "text-emerald-400",
                  isCurrent && "text-emerald-300",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mt-[-1.5rem]">
                <div
                  className={cn(
                    "h-0.5 w-full rounded transition-all duration-500",
                    currentIndex > index ? "bg-emerald-500" : "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
