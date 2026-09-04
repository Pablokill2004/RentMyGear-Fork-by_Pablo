"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Receipt, Loader2, ShieldCheck } from "lucide-react";
import { GearItem } from "@/lib/validation";
import {
  formatDate,
  formatPrice,
  calculateRentalPrice,
} from "@/lib/date-utils";
import {
  calculatePriceWithInsurance,
  getInsuranceRate,
} from "@/lib/insurance";
import type { RentalDates } from "./index";

interface PriceSummaryProps {
  item: GearItem;
  dates: RentalDates;
  insuranceSelected: boolean;
  onInsuranceChange: (selected: boolean) => void;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export function PriceSummary({
  item,
  dates,
  insuranceSelected,
  onInsuranceChange,
  onConfirm,
  onBack,
}: PriceSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  const rentalDays = calculateRentalPrice(
    item.dailyRate,
    dates.startDate,
    dates.endDate
  );

  const pricing = calculatePriceWithInsurance(
    item.dailyRate,
    rentalDays.days,
    item.category,
    insuranceSelected
  );

  const insuranceRate = getInsuranceRate(item.category);
  const insurancePercent = Math.round(insuranceRate * 100);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} disabled={isLoading}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Resumen de Renta
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Item details */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">{item.name}</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Período de Renta
          </h4>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Fecha inicio</span>
            <span className="font-medium">{formatDate(dates.startDate)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Fecha fin</span>
            <span className="font-medium">{formatDate(dates.endDate)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Duración</span>
            <span className="font-medium">
              {pricing.days} {pricing.days === 1 ? "día" : "días"}
            </span>
          </div>
        </div>

        {/* Insurance toggle */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Protección de Daños
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Cubre daños accidentales del equipo durante el período de renta.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={insuranceSelected}
                onChange={(e) => onInsuranceChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {insuranceSelected && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {insurancePercent}% de la tarifa diaria
            </p>
          )}
        </div>

        {/* Pricing breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Desglose de Precio
          </h4>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">
              Tarifa diaria
            </span>
            <span className="font-medium">{formatPrice(pricing.dailyRate)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">
              {formatPrice(pricing.dailyRate)} x {pricing.days} días
            </span>
            <span className="font-medium">{formatPrice(pricing.subtotal)}</span>
          </div>
          {insuranceSelected && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">
                Protección de Daños ({insurancePercent}%)
              </span>
              <span className="font-medium">{formatPrice(pricing.insuranceFee)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3 -mx-3">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-xl text-primary">
              {formatPrice(pricing.total)}
            </span>
          </div>
        </div>

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar Renta"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Al confirmar, aceptas los términos y condiciones del servicio de renta.
        </p>
      </CardContent>
    </Card>
  );
}
