import { create } from "zustand";

interface StorageState {
  grupo2: Grupo2[];
  grupo3: Grupo3[];
  produtos: Produtos[];
  produtosExcecoes: ProdutosExcecoes[];
  produtoExcAuto: ProdutoExcAuto[];
  comboItems: ComboItem[];

  // Métodos para setar e limpar os arrays
  setGrupo2: (grupo2: Grupo2[]) => void;
  setGrupo3: (grupo3: Grupo3[]) => void;
  setProdutos: (produtos: Produtos[]) => void;
  setProdutosExcecoes: (produtosExcecoes: ProdutosExcecoes[]) => void;
  setProdutoExcAuto: (produtoExcAuto: ProdutoExcAuto[]) => void;
  setComboItems: (comboItems: ComboItem[]) => void;

  clearStorage: () => void;
}

const useProdutoStorage = create<StorageState>((set) => ({
  grupo2: [],
  grupo3: [],
  produtos: [],
  produtosExcecoes: [],
  produtoExcAuto: [],
  comboItems: [],

  // Métodos para setar e limpar `Grupo2`
  setGrupo2: (grupo2) => set({ grupo2 }),

  // Métodos para setar e limpar `Grupo2`
  setGrupo3: (grupo3) => set({ grupo3 }),

  // Métodos para setar e limpar `Produtos`
  setProdutos: (produtos) => set({ produtos }),

  // Métodos para setar e limpar `ProdutosExcecoes`
  setProdutosExcecoes: (produtosExcecoes) => set({ produtosExcecoes }),

  // Métodos para setar e limpar `ProdutoExcAuto`
  setProdutoExcAuto: (produtoExcAuto) => set({ produtoExcAuto }),

  // Métodos para setar e limpar `ComboItem`
  setComboItems: (comboItems) => set({ comboItems }),

  // Método para limpar todos os arrays de produto
  clearStorage: () =>
    set({ grupo2: [], grupo3: [], produtos: [], produtosExcecoes: [], produtoExcAuto: [], comboItems: [] }),
}));

export { useProdutoStorage };
