import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RequestStatusStore {
  handleGarcom: number;
  numero: number;
  tipo: "mesa" | "cartao";

  setHandleGarcom: (handleGarcom: number) => void;
  setNumero: (numero: number) => void;
  setTipo: (tipo: "mesa" | "cartao") => void;
  setRequestData: (handleGarcom: number, numero: number, tipo: "mesa" | "cartao") => void;
  resetRequestStatus: () => void;
}

const useRequestStore = create<RequestStatusStore>()(
  persist(
    immer((set) => ({
      handleGarcom: 0,
      numero: 0,
      tipo: "mesa",

      setHandleGarcom: (handleGarcom) =>
        set((state) => {
          state.handleGarcom = handleGarcom;
        }),

      setNumero: (numero) =>
        set((state) => {
          state.numero = numero;
        }),

      setTipo: (tipo) =>
        set((state) => {
          state.tipo = tipo;
        }),

      setRequestData: (handleGarcom, numero, tipo) =>
        set((state) => {
          state.handleGarcom = handleGarcom;
          state.numero = numero;
          state.tipo = tipo;
        }),

      resetRequestStatus: () =>
        set((state) => {
          state.handleGarcom = 0;
          state.numero = 0;
          state.tipo = "mesa";
        }),
    })),
    {
      name: "request-status-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { useRequestStore };
