import { useSQLiteContext } from "expo-sqlite";

export function dbo_DetalhesPedido() {
  const database = useSQLiteContext();

  // 🔹 Salvar ou atualizar um pedido completo e retornar o pedido salvo
  async function saveAndGetPedido(data: PedidoCompleto): Promise<PedidoCompleto | null> {
    try {
      await insertPedido(data);
      return await getPedido();
    } catch (error) {
      console.error("❌ Erro ao salvar e buscar o pedido:", error);
      throw error;
    }
  }

  // 🔹 Salvar ou atualizar um pedido completo (pedido, itens, composições e pagamentos)
  async function insertPedido(data: PedidoCompleto) {
    try {
      await database.execAsync("DELETE FROM pedido_detalhes");
      await database.execAsync("DELETE FROM pedido_itens");
      await database.execAsync("DELETE FROM pedido_itens_composicao");
      await database.execAsync("DELETE FROM pedido_itens_detalhes");
      await database.execAsync("DELETE FROM pagamentos_realizados");

      // Resetar o contador de auto incremento
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'pedido_detalhes';");
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'pedido_itens';");
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'pedido_itens_composicao';");
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'pedido_itens_detalhes';");
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'pagamentos_realizados';");

      // 🔹 Inserir Detalhes do Pedido
      const stmtPedido = database.prepareSync(`
        INSERT INTO pedido_detalhes 
        (Handle, Numero, HandleGarcom, Total, FoodsQtdPessoas, ValorDesconto, ValorAcrescimo, ValorOutros, Tipo, Nome, 
         SolicitouConta, Data, GarcomNome, FilialNome, FilialRazao, FilialEndereco, FilialFone) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      stmtPedido.executeSync([
        data.Pedido.Handle,
        data.Pedido.Numero,
        data.Pedido.HandleGarcom,
        data.Pedido.Total,
        data.Pedido.FoodsQtdPessoas,
        data.Pedido.ValorDesconto ?? 0,
        data.Pedido.ValorAcrescimo ?? 0,
        data.Pedido.ValorOutros ?? 0,
        data.Pedido.Tipo,
        data.Pedido.Nome,
        data.Pedido.SolicitouConta ? 1 : 0,
        data.Pedido.Data,
        data.Pedido.GarcomNome,
        data.Pedido.FilialNome,
        data.Pedido.FilialRazao,
        data.Pedido.FilialEndereco,
        data.Pedido.FilialFone,
      ]);

      // 🔹 Inserir Itens do Pedido
      const stmtItem = database.prepareSync(`
        INSERT INTO pedido_itens 
        (pedido_handle, HandleItem, NumeroMesa, QuantidadePessoas, HandleGarcom, DescricaoItem, Quantidade, Valor, Total, DescricaoExcecoes, NomeGrupo, NomeSabor) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      data.Itens.forEach((item) => {
        stmtItem.executeSync([
          data.Pedido.Handle,
          item.HandleItem,
          item.NumeroMesa,
          item.QuantidadePessoas,
          item.HandleGarcom,
          item.DescricaoItem ?? "",
          item.Quantidade,
          item.Valor ?? 0,
          item.Total ?? 0,
          item.DescricaoExcecoes ?? "",
          item.NomeGrupo ?? "",
          item.NomeSabor ?? "",
        ]);
      });

      // 🔹 Inserir Composições dos Itens do Pedido
      const stmtComposicao = database.prepareSync(`
        INSERT INTO pedido_itens_composicao 
        (pedido_handle, item_handle, HandleItem, DescricaoItem, Valor, DescricaoExcecoes, NomeSabor) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `);
      data.Itens.forEach((item) => {
        if (!item.ListaComposicao || item.ListaComposicao.length === 0) return;

        item.ListaComposicao.forEach((composicao) => {
          stmtComposicao.executeSync([
            data.Pedido.Handle,
            item.HandleItem,
            composicao.HandleItem,
            composicao.DescricaoItem,
            composicao.Valor ?? 0,
            composicao.DescricaoExcecoes ?? "",
            composicao.NomeSabor ?? "",
          ]);
        });
      });

      // 🔹 Inserir Detalhes dos Itens do Pedido
      const stmtDetalhe = database.prepareSync(`
        INSERT INTO pedido_itens_detalhes 
        (pedido_handle, item_handle, Codigo, Descricao, Quantidade, DataInclusao, HoraInclusao, Garcom, DescricaoExcecoes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      data.Itens.forEach((item) => {
        if (!item.DetalheItem || item.DetalheItem.length === 0) return;

        item.DetalheItem.forEach((detalhe) => {
          stmtDetalhe.executeSync([
            data.Pedido.Handle,
            item.HandleItem,
            detalhe.Codigo,
            detalhe.Descricao,
            detalhe.Quantidade,
            detalhe.DataInclusao,
            detalhe.HoraInclusao,
            detalhe.Garcom,
            detalhe.DescricaoExcecoes ?? "",
          ]);
        });
      });

      // 🔹 Inserir Pagamentos Realizados
      const stmtPagamento = database.prepareSync(`
        INSERT INTO pagamentos_realizados 
        (pedido_handle, Tabela, Handle, HandleCondicaoPagamento, ValorPago, ValorTroco, ValorAcrescimo, ValorOutros, ValorDesconto, 
         ValorProdutos, GpeHandleDestino, Sequencia, QuantidadePessoas, PesHandle, NtaHandle, Observacao, Usuario, DataHora, 
         PesCnpjCfp, PesNome, TipoOperacao, HandleTipoNota, DescricaoCondicao, Atk) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      data.Pagamentos.forEach((pagamento) => {
        stmtPagamento.executeSync([
          data.Pedido.Handle,
          pagamento.Tabela,
          pagamento.Handle,
          pagamento.HandleCondicaoPagamento,
          pagamento.ValorPago ?? 0,
          pagamento.ValorTroco ?? 0,
          pagamento.ValorAcrescimo ?? 0,
          pagamento.ValorOutros ?? 0,
          pagamento.ValorDesconto ?? 0,
          pagamento.ValorProdutos ?? 0,
          pagamento.GpeHandleDestino ?? null,
          pagamento.Sequencia,
          pagamento.QuantidadePessoas,
          pagamento.PesHandle,
          pagamento.NtaHandle ?? null,
          pagamento.Observacao ?? "",
          pagamento.Usuario,
          pagamento.DataHora,
          pagamento.PesCnpjCfp ?? "",
          pagamento.PesNome,
          pagamento.TipoOperacao,
          pagamento.HandleTipoNota ?? null,
          pagamento.DescricaoCondicao,
          pagamento.Atk ?? "",
        ]);
      });

      //console.log("✅ Detalhes do pedido, itens, composições, detalhes e pagamentos foram salvos com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao salvar detalhes do pedido:", error);
      throw error;
    }
  }

  // 🔹 Buscar todos os dados do pedido salvo
  async function getPedido() {
    try {
      // 🔹 Buscar pedido principal
      const pedido = await database.getFirstAsync<PedidoDetalhes>(`
        SELECT * FROM pedido_detalhes LIMIT 1;
      `);

      if (!pedido) {
        console.warn("Nenhum pedido encontrado.");
        return null;
      }

      // ✅ Converter `SolicitouConta` para boolean
      pedido.SolicitouConta = Boolean(pedido.SolicitouConta);

      // 🔹 Buscar itens do pedido
      const itens = await database.getAllAsync<PedidoItem>(
        `
        SELECT * FROM pedido_itens WHERE pedido_handle = ?;
      `,
        [pedido.Handle]
      );

      // 🔹 Buscar composições dos itens (ListaComposicao)
      const composicoes = await database.getAllAsync<
        Omit<PedidoComposicao, "id"> & { id: number; item_handle: number }
      >(
        `
        SELECT * FROM pedido_itens_composicao WHERE pedido_handle = ?;
      `,
        [pedido.Handle]
      );

      // 🔹 Buscar detalhes dos itens (DetalheItem)
      const detalhesItens = await database.getAllAsync<
        Omit<PedidoDetalheItem, "id"> & { id: number; item_handle: number }
      >(
        `
        SELECT * FROM pedido_itens_detalhes WHERE pedido_handle = ?;
      `,
        [pedido.Handle]
      );

      // 🔹 Mapear os itens e associar corretamente as composições e detalhes correspondentes
      const itensComComposicoesEDetalhes = itens.map((item) => ({
        ...item,
        ListaComposicao: composicoes
          .filter((comp) => comp.item_handle === item.HandleItem)
          .map((comp) => ({
            id: comp.id, // ✅ Adicionando o id obrigatório
            HandleItem: comp.HandleItem,
            DescricaoItem: comp.DescricaoItem,
            Valor: comp.Valor ?? 0,
            DescricaoExcecoes: comp.DescricaoExcecoes,
            NomeSabor: comp.NomeSabor,
          })),
        DetalheItem: detalhesItens
          .filter((detalhe) => detalhe.item_handle === item.HandleItem)
          .map((detalhe) => ({
            id: detalhe.id, // ✅ Adicionando o id obrigatório
            Codigo: detalhe.Codigo,
            Descricao: detalhe.Descricao,
            Quantidade: detalhe.Quantidade,
            DataInclusao: detalhe.DataInclusao,
            HoraInclusao: detalhe.HoraInclusao,
            Garcom: detalhe.Garcom,
            DescricaoExcecoes: detalhe.DescricaoExcecoes,
          })),
      }));

      // 🔹 Buscar pagamentos realizados
      const pagamentos = await database.getAllAsync<PagamentoRealizado>(
        `
        SELECT * FROM pagamentos_realizados WHERE pedido_handle = ?;
      `,
        [pedido.Handle]
      );

      // 🔹 Estrutura final no formato esperado
      const resultado: PedidoCompleto = {
        Pedido: pedido,
        Itens: itensComComposicoesEDetalhes,
        Pagamentos: pagamentos,
      };

      //console.log("✅ Pedido carregado com sucesso!", resultado);
      return resultado;
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes do pedido:", error);
      throw error;
    }
  }

  async function insertPagamento(order: PedidoCompleto, payment: Omit<PagamentoRealizado, "id">): Promise<void> {
    try {
      // Prepara o comando SQL para inserir o pagamento
      const stmtPagamento = database.prepareSync(`
        INSERT INTO pagamentos_realizados 
        (pedido_handle, Tabela, Handle, HandleCondicaoPagamento, ValorPago, ValorTroco, ValorAcrescimo, ValorOutros, ValorDesconto, 
         ValorProdutos, GpeHandleDestino, Sequencia, QuantidadePessoas, PesHandle, NtaHandle, Observacao, Usuario, DataHora, 
         PesCnpjCfp, PesNome, TipoOperacao, HandleTipoNota, DescricaoCondicao, Atk) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);

      stmtPagamento.executeSync([
        order.Pedido.Handle, // O handle do pedido
        payment.Tabela,
        payment.Handle,
        payment.HandleCondicaoPagamento,
        payment.ValorPago ?? 0,
        payment.ValorTroco ?? 0,
        payment.ValorAcrescimo ?? 0,
        payment.ValorOutros ?? 0,
        payment.ValorDesconto ?? 0,
        payment.ValorProdutos ?? 0,
        payment.GpeHandleDestino ?? null,
        payment.Sequencia,
        payment.QuantidadePessoas,
        payment.PesHandle,
        payment.NtaHandle ?? null,
        payment.Observacao ?? "",
        payment.Usuario,
        payment.DataHora,
        payment.PesCnpjCfp ?? "",
        payment.PesNome,
        payment.TipoOperacao,
        payment.HandleTipoNota ?? null,
        payment.DescricaoCondicao,
        payment.Atk ?? "",
      ]);

      console.log("✅ Pagamento realizado inserido com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inserir pagamento realizado:", error);
      throw error;
    }
  }

  // 🔹 Retorna apenas a última parcela (último pagamento) inserida.
  async function getUltimaParcela(): Promise<PagamentoRealizado | null> {
    try {
      // Primeiro, busca o pedido
      const pedido = await database.getFirstAsync<PedidoDetalhes>(`
          SELECT * FROM pedido_detalhes LIMIT 1;
        `);
      if (!pedido) {
        console.warn("Nenhum pedido encontrado.");
        return null;
      }
      // Busca todos os pagamentos do pedido
      const pagamento = await database.getFirstAsync<PagamentoRealizado>(
        `
          SELECT * FROM pagamentos_realizados 
          WHERE pedido_handle = ? 
          ORDER BY id DESC 
          LIMIT 1;
        `,
        [pedido.Handle]
      );

      if (!pagamento) {
        console.warn("Pagamento encontrado.");
        return null;
      }
      // Retorna o último elemento do array
      return pagamento;
    } catch (error) {
      console.error("❌ Erro ao buscar a última parcela:", error);
      throw error;
    }
  }

  // 🔹 Retorna uma parcela baseado no handle informado.
  async function getPagamentoByHandle(handle_pagemnto: string): Promise<PagamentoRealizado | null> {
    try {
      const pagamento = await database.getFirstAsync<PagamentoRealizado>(
        `SELECT * FROM pagamentos_realizados WHERE Handle = ? LIMIT 1;`,
        [handle_pagemnto]
      );
      if (!pagamento) {
        console.warn(`Nenhum pagamento encontrado com o handle ${handle_pagemnto}.`);
        return null;
      }
      return pagamento;
    } catch (error) {
      console.error(`❌ Erro ao buscar pagamento com handle ${handle_pagemnto}:`, error);
      throw error;
    }
  }

  return {
    saveAndGetPedido,
    insertPedido,
    getPedido,
    insertPagamento,
    getUltimaParcela,
    getPagamentoByHandle,
  };
}
