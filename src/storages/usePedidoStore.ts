import { create } from "zustand";

export interface ListaExcecoes {
  HandleExcecao: number;
  Quantidade: number;
  Valor: number;
  EhExcComposicao: boolean;
}

export interface PedidoItem {
  id: string;
  NumeroMesa: string;
  NumeroMesaCartao: number | null;
  NumeroCartao: string | null;
  HandleMesa: number | null;
  HandleCartao: number | null;
  HandleGarcom: number;
  NomeGarcom: string | null;
  HandleItem: number;
  HandleCombo: number | null;
  Quantidade: number;
  QuantidadePessoas: number;
  Valor: number;
  Total: number;
  ListaExcecoes: ListaExcecoes[];
  ListaExcecoesInt: any[] | null;
  ListaComposicao: any[];
  HandleOrigem: number | null;
  DescricaoItem: string;
  DescricaoExcecoes: string | null;
  DescricaoComposicao: string | null;
  NomeGrupo: string;
  NomeSabor: string;
  ObservacaoExcecao: string;
  ObservacaoPedido: string | null;
  DetalheItem: string | null;
  HandlePessoa: number | null;
  HandlePessoaComplemento: number | null;
  PessoaNome: string | null;
  ValorAcrescimo: number;
  ValorOutros: number;
  ValorDesconto: number;
}

export interface Pedido {
  QtdItensMesa: number;
  QtdPessoasMesa: number;
  Observacao: string | null;
  PessoaNome: string;
  NumeroMesaCartao: number;
  ValorCreditoLiberado: number;
  VerificaLimiteCredito: boolean;
  TotalConsumido: number;
  Numero: string;
  tipoLancamento: "mesa" | "cartao";
}

export interface PessoaProps {
  Handle: number;
  Codigo: number;
  Nome: string;
  CgcCpf: string;
  Cep: string;
  Endereco: string;
  Numero: number;
  Complemento: string;
  CidNome: string;
  Bairro: string;
  Telefone: string;
  Ativo: number;
}

interface PedidoStore {
  pedido: Pedido;
  pedidoItens: PedidoItem[];
  setPedido: (novoPedido: Pedido) => void;
  addPedidoItem: (novoItem: Omit<PedidoItem, "id">) => void;
  incrementPedidoItem: (id: string) => void;
  decrementPedidoItem: (id: string) => void;
  removePedidoItem: (id: string) => void;
  clearPedido: () => void;
  updateListaExcecoes: (id: string, excecoes: ListaExcecoes[]) => void;
  updatePessoa: (handlePessoa: number, pessoaNome: string) => void;
  updatePedidoFields: (fields: Partial<Pedido>) => void;

  //Pessoa
  selectedPessoa: PessoaProps | null;
  setSelectedPessoa: (pessoa: PessoaProps | null) => void;
  clearSelectedPessoa: () => void;
  updateSelectedPessoa: (updatedData: Partial<Pick<PessoaProps, "Handle" | "Codigo" | "Nome" | "CgcCpf">>) => void;
  confirmedSelectedPessoa: (pessoa: PessoaProps) => void;
}

const calculateTotalConsumido = (pedidoItens: PedidoItem[]): number => {
  return pedidoItens.reduce((total, item) => {
    const totalExcecoes = item.ListaExcecoes.reduce((sum, ex) => sum + ex.Quantidade * ex.Valor, 0);
    return (
      total + item.Quantidade * item.Valor + totalExcecoes + item.ValorAcrescimo + item.ValorOutros - item.ValorDesconto
    );
  }, 0);
};

const usePedidoStore = create<PedidoStore>((set) => ({
  pedido: {
    QtdItensMesa: 0,
    QtdPessoasMesa: 1,
    Observacao: null,
    PessoaNome: "",
    NumeroMesaCartao: 0,
    ValorCreditoLiberado: 0.0,
    VerificaLimiteCredito: false,
    TotalConsumido: 0.0,
    Numero: "",
    tipoLancamento: "mesa",
  },
  pedidoItens: [],
  setPedido: (novoPedido) => set({ pedido: novoPedido }),
  addPedidoItem: (novoItem) =>
    set((state) => {
      const pessoaInfo = state.selectedPessoa;
      const { QtdPessoasMesa, Observacao, NumeroMesaCartao, Numero, tipoLancamento } = state.pedido;

      const updatedItem: PedidoItem = {
        ...novoItem,
        id: `${novoItem.HandleItem}-${state.pedidoItens.length}`,
        QuantidadePessoas: QtdPessoasMesa ? QtdPessoasMesa : 1,
        ObservacaoPedido: Observacao,
        PessoaNome: pessoaInfo?.Nome ? pessoaInfo?.Nome : "",
        HandlePessoa: pessoaInfo?.Handle ? pessoaInfo?.Handle : null,
        NumeroMesaCartao: NumeroMesaCartao,
        NumeroMesa: tipoLancamento === "mesa" ? Numero || "" : "",
        NumeroCartao: tipoLancamento === "cartao" ? Numero || "" : "",
      };

      const updatedPedidoItens = [...state.pedidoItens, updatedItem];

      return {
        pedidoItens: updatedPedidoItens,
        pedido: {
          ...state.pedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
      };
    }),
  incrementPedidoItem: (id: string) =>
    set((state) => {
      const updatedPedidoItens = state.pedidoItens.map((item) =>
        item.id === id ? { ...item, Quantidade: item.Quantidade + 1 } : item
      );
      return {
        pedidoItens: updatedPedidoItens,
        pedido: {
          ...state.pedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
      };
    }),
  decrementPedidoItem: (id: string) =>
    set((state) => {
      const updatedPedidoItens = state.pedidoItens
        .map((item) => (item.id === id ? { ...item, Quantidade: Math.max(0, item.Quantidade - 1) } : item))
        .filter((item) => item.Quantidade > 0);
      return {
        pedidoItens: updatedPedidoItens,
        pedido: {
          ...state.pedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
      };
    }),
  removePedidoItem: (id: string) =>
    set((state) => {
      const updatedPedidoItens = state.pedidoItens.filter((item) => item.id !== id);
      return {
        pedidoItens: updatedPedidoItens,
        pedido: {
          ...state.pedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
      };
    }),
  clearPedido: () =>
    set((state) => ({
      pedidoItens: [],
      pedido: {
        ...state.pedido,
        TotalConsumido: 0,
      },
    })),
  updateListaExcecoes: (id: string, excecoes: ListaExcecoes[]) =>
    set((state) => {
      const updatedPedidoItens = state.pedidoItens.map((item) =>
        item.id === id
          ? {
              ...item,
              ListaExcecoes: [...item.ListaExcecoes, ...excecoes.filter((ex) => ex.Quantidade > 0)],
            }
          : item
      );
      return {
        pedidoItens: updatedPedidoItens,
        pedido: {
          ...state.pedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
      };
    }),
  updatePessoa: (handlePessoa: number, pessoaNome: string) =>
    set((state) => ({
      pedido: {
        ...state.pedido,
        PessoaNome: pessoaNome,
      },
      pedidoItens: state.pedidoItens.map((item) => ({
        ...item,
        HandlePessoa: handlePessoa,
        PessoaNome: pessoaNome,
      })),
    })),
  updatePedidoFields: (fields: Partial<Pedido>) =>
    set((state) => {
      const updatedPedido = {
        ...state.pedido,
        ...fields,
      };

      const updatedPedidoItens = state.pedidoItens.map((item) => {
        const updatedItem = {
          ...item,
          ...Object.keys(fields).reduce((acc, key) => {
            if (key === "Observacao") {
              acc.ObservacaoPedido = fields.Observacao as string;
            } else if (key === "QtdPessoasMesa") {
              acc.QuantidadePessoas = fields.QtdPessoasMesa as number;
            } else if (key in item) {
              acc[key as keyof PedidoItem] = fields[key as keyof Pedido] as any;
            }
            return acc;
          }, {} as Partial<PedidoItem>),
        };

        return updatedItem;
      });

      return {
        pedido: {
          ...updatedPedido,
          TotalConsumido: calculateTotalConsumido(updatedPedidoItens),
        },
        pedidoItens: updatedPedidoItens,
      };
    }),

  // Funções relacionadas a pessoa
  selectedPessoa: null, // Pessoa selecionada inicialmente nula
  setSelectedPessoa: (pessoa) => set({ selectedPessoa: pessoa }), // Define a pessoa selecionada
  clearSelectedPessoa: () => set({ selectedPessoa: null }), // Limpa a pessoa selecionada
  updateSelectedPessoa: (updatedData) =>
    set((state) => {
      if (state.selectedPessoa) {
        const updatedPessoa = {
          ...state.selectedPessoa,
          ...updatedData, // Atualiza apenas as propriedades passadas no `updatedData`
        };

        // Chama a função `updatePessoa` do `usePedidoStore`
        const { updatePessoa } = usePedidoStore.getState();
        updatePessoa(updatedPessoa.Handle, updatedPessoa.Nome);

        return {
          selectedPessoa: updatedPessoa,
        };
      }
      return state; // Se `selectedPessoa` for null, retorna o estado sem alterações
    }),
  confirmedSelectedPessoa: (pessoa) => {
    set({ selectedPessoa: pessoa }); // Define a pessoa selecionada no estado
    // Chama a função `updatePessoa` do `usePedidoStore`
    const { updatePessoa } = usePedidoStore.getState();
    updatePessoa(pessoa.Handle, pessoa.Nome);
  },
}));

export { usePedidoStore };
