import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interface do estado da store
export interface PaymentCalculationState {
  totalAmountPaid: number;
  change: number;
  computedChange: number;
  pendingValue: number;
  selectedCondition: CondicaoPagamento | null;
  setTotalAmountPaid: (totalAmountPaid: number) => void;
  setChange: (change: number) => void;
  setComputedChange: (computedChange: number) => void;
  setPendingValue: (pendingValue: number) => void;
  setSelectedCondition: (condition: CondicaoPagamento) => void;
  clearSelectedCondition: () => void;
}

const roundToTwo = (value: number): number => Number(value.toFixed(2));

const usePaymentCalculationStore = create<PaymentCalculationState>()(
  persist(
    immer((set) => ({
      totalAmountPaid: 0,
      change: 0,
      computedChange: 0,
      pendingValue: 0, // Adicionado ao estado inicial
      selectedCondition: null,
      setTotalAmountPaid: (totalAmountPaid: number) => {
        set((state) => {
          state.totalAmountPaid = roundToTwo(totalAmountPaid);
        });
      },
      setChange: (change: number) => {
        set((state) => {
          state.change = roundToTwo(change);
        });
      },
      setComputedChange: (computedChange: number) => {
        set((state) => {
          state.computedChange = roundToTwo(computedChange);
        });
      },
      setPendingValue: (pendingValue: number) => {
        set((state) => {
          state.pendingValue = roundToTwo(pendingValue);
        });
      },
      setSelectedCondition: (condition: CondicaoPagamento) => {
        set((state) => {
          state.selectedCondition = condition;
        });
      },
      clearSelectedCondition: () => {
        set((state) => {
          state.selectedCondition = null;
        });
      },
    })),
    {
      name: "payment-calculation-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { usePaymentCalculationStore };
