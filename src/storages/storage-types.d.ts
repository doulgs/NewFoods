// Interface para GrupoExcecao
interface GrupoExcecaoList {
  Handle: number;
  Ordem: number | null;
  Descricao: string;
}

// Interface para Excecao
interface Excecao {
  Handle: number;
  Nome: string;
  Valor: number;
  Ordem: number | null;
  Quantidade: number;
  Mark: boolean;
  GrupoExcecao: GrupoExcecao;
}

// Interface para Grupo2
interface Grupo2 {
  Handle: number;
  Codigo: string;
  Nome: string;
  NomeReduzido: string;
  UrlFoto: string;
  EhComposicao: boolean;
  GrupoExcecaoList: GrupoExcecaoList[];
  Excecoes: Excecao[];
}

interface Produtos {
  Handle: number;
  Codigo: string;
  CodigoInt: number;
  Nome: string;
  Descricao: string;
  Valor: number;
  HandleGrupo1: number;
  HandleGrupo2: number;
  HandleGrupo3: null | number;
  UrlFoto: string;
  NomeSabor: string;
  HandleCombo: number;
  UnidadeSigla: string;
  ValorPromocional: number;
}

interface ProdutosExcecoes {
  Handle: number;
  HandleItem: number | null; // Permite null
  Nome: string;
  Valor: number;
  Ordem: string | null;
  Quantidade: number;
  Mark: boolean;
  HabilitaQuantidade: boolean;
  GrupoExcecao: GrupoExcecao;
}

interface GrupoExcecao {
  Handle: number;
  Ordem: string;
  Descricao: string;
}

interface ProdutoExcAuto {
  HandleItem: number;
  HandleExcecao: number;
  Quantidade: number;
}

interface ComboItem {
  HandleCombo: number;
  HandleItemCombo: number;
  Quantidade: number;
  Ordem: number;
}

// Interface para Grupo2
interface Grupo3 {
  Handle: number;
  Codigo: string;
  Nome: string;
  NomeReduzido: string;
  Inativo: number;
  Tipo: null;
  QuantidadeItensComposicao: number;
  NomeDif: string;
  Tabela: null;
}

// Interface para condições de pagamento
interface CondicaoPagamento {
  Handle: number;
  Descricao: string;
  VisivelModuloFoods: boolean;
  CodigoIntegracaoPagamento: string;
  Tabela: string | null;
}

interface TempMesaCartao {
  Numero: string;
  Nome: string;
  TempoInatividade: string;
  SolicitouConta: boolean;
  HorarioUltimaAlteracao: string;
  Inatividade: boolean;
  Status: string;
  NumeroMesa?: number; // Opcional, pois pode ser apenas para mesas
  QuantidadePessoas: number;
  GpeHandle: number;
}
