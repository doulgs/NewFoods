import { create } from "zustand";

// Interface do store para gerenciar um array de TempMesaCartao
interface TempMesaCartaoStore {
  tempMesaCartao: TempMesaCartao[];
  // Substitui todo o array de objetos
  setTempMesaCartao: (data: TempMesaCartao[]) => void;
  // limpar todo o array
  clearTempMesaCartao: () => void;
}

// Criação do store com Zustand
const useTempMesaCartao = create<TempMesaCartaoStore>((set, get) => ({
  tempMesaCartao: [],

  setTempMesaCartao: (data: TempMesaCartao[]) => set({ tempMesaCartao: data }),

  clearTempMesaCartao: () => set({ tempMesaCartao: [] }),
}));

export { useTempMesaCartao };
