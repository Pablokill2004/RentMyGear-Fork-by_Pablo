"use client";

import { useState } from "react";
import { GearItem } from "@/lib/validation";
import { DateSelection } from "./DateSelection";
import { PriceSummary } from "./PriceSummary";
import { Confirmation } from "./Confirmation";

export type RentalFlowStep = "selecting" | "configuring" | "reviewing" | "confirmed";

interface RentalFlowProps {
  item: GearItem;
}

export interface RentalDates {
  startDate: Date;
  endDate: Date;
}

export function RentalFlow({ item }: RentalFlowProps) {
  const [step, setStep] = useState<RentalFlowStep>("selecting");
  const [dates, setDates] = useState<RentalDates | null>(null);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const handleDateSelect = (selectedDates: RentalDates) => {
    setDates(selectedDates);
    setStep("reviewing");
  };

  const handleBack = () => {
    if (step === "reviewing") {
      setStep("configuring");
    } else {
      setStep("selecting");
    }
  };

  const handleConfirm = async (rentalDates: RentalDates) => {
    try {
      const response = await fetch("/api/rental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gearId: item.id,
          startDate: rentalDates.startDate.toISOString(),
          endDate: rentalDates.endDate.toISOString(),
          insuranceSelected,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm rental");
      }

      const data = await response.json();
      setConfirmationId(data.id);
      setStep("confirmed");
    } catch (error) {
      console.error("Rental confirmation failed:", error);
      // TODO: Show error toast
    }
  };

  const handleReset = () => {
    setStep("selecting");
    setDates(null);
    setInsuranceSelected(false);
    setConfirmationId(null);
  };

  return (
    <div className="w-full">
      {step === "selecting" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rentar este equipo</h3>
          <p className="text-muted-foreground">
            Selecciona las fechas para tu renta y confirma tu reservación.
          </p>
          <button
            onClick={() => setStep("configuring")}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-lg font-medium transition-colors"
          >
            Seleccionar Fechas
          </button>
        </div>
      )}

      {step === "configuring" && (
        <DateSelection
          initialDates={dates}
          onSelect={handleDateSelect}
          onBack={handleBack}
        />
      )}

      {step === "reviewing" && dates && (
        <PriceSummary
          item={item}
          dates={dates}
          insuranceSelected={insuranceSelected}
          onInsuranceChange={setInsuranceSelected}
          onConfirm={() => handleConfirm(dates)}
          onBack={handleBack}
        />
      )}

      {step === "confirmed" && dates && (
        <Confirmation
          item={item}
          dates={dates}
          insuranceSelected={insuranceSelected}
          confirmationId={confirmationId}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
