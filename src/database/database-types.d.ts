// Interface para configuração da aplicação
interface AppConfig {
  id: number;
  url: string;
}

// Interface para usuários
interface Usuario {
  Handle: number;
  Nome: string;
  Apelido: string | null;
}

// Interface para configurações do sistema
interface ConfigData {
  lancamentoLiberado: string;
  Grupo2ComQuantidadeMultiSelect: string;
  UnidadeComQuantidadeFracionada: string;
  UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao: string;
  ObrigatorioNumeroMesaLancamentoCartao: string;
}

interface ResultConfigData {
  lancamentoLiberado: "Ambos" | "Mesa" | "Cartao";
  Grupo2ComQuantidadeMultiSelect: Array<number>;
  UnidadeComQuantidadeFracionada: Array<string>;
  UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao: boolean;
  ObrigatorioNumeroMesaLancamentoCartao: boolean;
}

// Interface para mesas e cartões temporários
interface TempMesaCartao {
  id: number;
  Numero: string;
  Nome: string;
  TempoInatividade: string;
  SolicitouConta: boolean;
  HorarioUltimaAlteracao: string;
  Inatividade: boolean;
  Status: string;
  NumeroMesa?: number | null;
  QuantidadePessoas: number;
  GpeHandle: number;
}

// Interface para detalhes do pedido
interface PedidoDetalhes {
  Handle: number;
  Numero: string;
  HandleGarcom: number;
  Total: number;
  FoodsQtdPessoas: number;
  ValorDesconto: number;
  ValorAcrescimo: number;
  ValorOutros: number;
  Tipo: string;
  Nome: string;
  SolicitouConta: boolean;
  Data: string;
  GarcomNome: string;
  FilialNome: string;
  FilialRazao: string;
  FilialEndereco: string;
  FilialFone: string;
}

// Interface para itens do pedido
interface PedidoItem {
  id: number;
  Handle: number;
  HandleItem: number;
  NumeroMesa: number;
  QuantidadePessoas: number;
  HandleGarcom: number;
  DescricaoItem: string;
  Quantidade: number;
  Valor: number;
  Total: number;
  DescricaoExcecoes?: string | null;
  NomeGrupo?: string | null;
  NomeSabor?: string | null;
  ListaComposicao?: PedidoComposicao[];
  DetalheItem?: PedidoDetalheItem[];
}

// Interface para composição dos itens
interface PedidoComposicao {
  id: number;
  HandleItem: number;
  DescricaoItem: string;
  Valor: number;
  DescricaoExcecoes?: string | null;
  NomeSabor?: string | null;
}

// Interface para detalhes dos itens
interface PedidoDetalheItem {
  id: number;
  Codigo: string;
  Descricao: string;
  Quantidade: number;
  DataInclusao: string;
  HoraInclusao: string;
  Garcom: string;
  DescricaoExcecoes?: string | null;
}

// Interface para pagamentos realizados
interface PagamentoRealizado {
  id: number;
  pedido_handle: number;
  Tabela: string;
  Handle: number;
  HandleCondicaoPagamento: number;
  ValorPago: number;
  ValorTroco: number;
  ValorAcrescimo: number;
  ValorOutros: number;
  ValorDesconto: number;
  ValorProdutos: number;
  GpeHandleDestino?: number | null;
  Sequencia: number;
  QuantidadePessoas: number;
  PesHandle: number;
  NtaHandle?: number | null;
  Observacao?: string | null;
  Usuario: string;
  DataHora: string;
  PesCnpjCfp?: string;
  PesNome: string;
  TipoOperacao: string;
  HandleTipoNota?: number | null;
  DescricaoCondicao: string;
  Atk: string;
}

// Interface para pedido completo
interface PedidoCompleto {
  Pedido: PedidoDetalhes;
  Itens: PedidoItem[];
  Pagamentos: PagamentoRealizado[];
}
