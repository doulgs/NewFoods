import { type SQLiteDatabase } from "expo-sqlite";

export async function database(database: SQLiteDatabase) {
  try {
    // 🔹 Tabela de Usuários
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS usuario (
        Handle INTEGER PRIMARY KEY,
        Nome TEXT NOT NULL,
        Apelido TEXT
      );
    `);

    // 🔹 Tabela de Configurações do Sistema
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lancamentoLiberado TEXT DEFAULT '',
        Grupo2ComQuantidadeMultiSelect TEXT DEFAULT '',
        UnidadeComQuantidadeFracionada TEXT DEFAULT '',
        UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao TEXT DEFAULT '',
        ObrigatorioNumeroMesaLancamentoCartao TEXT DEFAULT ''
      );
    `);

    // 🔹 Tabela de Mesas e Cartões Temporários
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS temp_mesa_cartao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Numero TEXT NOT NULL,
        Nome TEXT NOT NULL,
        TempoInatividade TEXT NOT NULL,
        SolicitouConta INTEGER CHECK(SolicitouConta IN (0,1)) DEFAULT 0,
        HorarioUltimaAlteracao TEXT NOT NULL,
        Inatividade INTEGER CHECK(Inatividade IN (0,1)) DEFAULT 0,
        Status TEXT NOT NULL,
        NumeroMesa INTEGER,
        QuantidadePessoas INTEGER NOT NULL,
        GpeHandle INTEGER NOT NULL
      );
    `);

    // 🔹 Tabela de Pedidos (Pedido Detalhes)
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS pedido_detalhes (
        Handle INTEGER PRIMARY KEY,
        Numero TEXT NOT NULL,
        HandleGarcom INTEGER NOT NULL,
        Total REAL DEFAULT 0,
        FoodsQtdPessoas INTEGER NOT NULL,
        ValorDesconto REAL DEFAULT 0,
        ValorAcrescimo REAL DEFAULT 0,
        ValorOutros REAL DEFAULT 0,
        Tipo TEXT NOT NULL,
        Nome TEXT NOT NULL,
        SolicitouConta INTEGER CHECK(SolicitouConta IN (0,1)) DEFAULT 0,
        Data TEXT NOT NULL,
        GarcomNome TEXT NOT NULL,
        FilialNome TEXT NOT NULL,
        FilialRazao TEXT NOT NULL,
        FilialEndereco TEXT NOT NULL,
        FilialFone TEXT NOT NULL
      );
    `);

    // 🔹 Tabela de Itens do Pedido
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS pedido_itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_handle INTEGER NOT NULL,
        HandleItem INTEGER NOT NULL,
        NumeroMesa INTEGER NOT NULL, 
        QuantidadePessoas INTEGER DEFAULT 1, 
        HandleGarcom INTEGER NOT NULL, 
        DescricaoItem TEXT NOT NULL,
        Quantidade REAL NOT NULL,
        Valor REAL DEFAULT 0,
        Total REAL DEFAULT 0,
        DescricaoExcecoes TEXT,
        NomeGrupo TEXT,
        NomeSabor TEXT,
        FOREIGN KEY (pedido_handle) REFERENCES pedido_detalhes(Handle) ON DELETE CASCADE
      );
    `);

    // 🔹 Tabela de Composição dos Itens do Pedido
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS pedido_itens_composicao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_handle INTEGER NOT NULL,
        item_handle INTEGER NOT NULL,
        HandleItem INTEGER NOT NULL,
        DescricaoItem TEXT NOT NULL,
        Valor REAL DEFAULT 0,
        DescricaoExcecoes TEXT,
        NomeSabor TEXT,
        FOREIGN KEY (pedido_handle) REFERENCES pedido_detalhes(Handle) ON DELETE CASCADE,
        FOREIGN KEY (item_handle) REFERENCES pedido_itens(HandleItem) ON DELETE CASCADE
      );
    `);

    // 🔹 Tabela de Detalhes dos Itens do Pedido
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS pedido_itens_detalhes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_handle INTEGER NOT NULL,
        item_handle INTEGER NOT NULL,
        Codigo TEXT NOT NULL,
        Descricao TEXT NOT NULL,
        Quantidade REAL DEFAULT 0,
        DataInclusao TEXT NOT NULL,
        HoraInclusao TEXT NOT NULL,
        Garcom TEXT NOT NULL,
        DescricaoExcecoes TEXT,
        FOREIGN KEY (pedido_handle) REFERENCES pedido_detalhes(Handle) ON DELETE CASCADE,
        FOREIGN KEY (item_handle) REFERENCES pedido_itens(HandleItem) ON DELETE CASCADE
      );
    `);

    // 🔹 Tabela de Pagamentos Realizados
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS pagamentos_realizados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_handle INTEGER NOT NULL,
        Tabela TEXT NOT NULL,
        Handle INTEGER NOT NULL,
        HandleCondicaoPagamento INTEGER NOT NULL,
        ValorPago REAL DEFAULT 0,
        ValorTroco REAL DEFAULT 0,
        ValorAcrescimo REAL DEFAULT 0,
        ValorOutros REAL DEFAULT 0,
        ValorDesconto REAL DEFAULT 0,
        ValorProdutos REAL DEFAULT 0,
        GpeHandleDestino INTEGER NULL,
        Sequencia INTEGER NOT NULL,
        QuantidadePessoas INTEGER NOT NULL,
        PesHandle INTEGER NOT NULL,
        NtaHandle INTEGER NULL,
        Observacao TEXT NULL,
        Usuario TEXT NOT NULL,
        DataHora TEXT NOT NULL,
        PesCnpjCfp TEXT,
        PesNome TEXT NOT NULL,
        TipoOperacao TEXT NOT NULL,
        HandleTipoNota INTEGER NULL,
        DescricaoCondicao TEXT NOT NULL,
        Atk TEXT,
        FOREIGN KEY (pedido_handle) REFERENCES pedido_detalhes(Handle) ON DELETE CASCADE
      );
    `);

    console.log("Tabelas criadas com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}
