import { useSQLiteContext } from "expo-sqlite";

export function dbo_Global() {
  const database = useSQLiteContext();

  // 🔹 Função para buscar TODOS os registros e exibi-los no console
  async function getAllTablesDataAndLog() {
    try {
      const tables = [
        { name: "usuario", type: "Usuario" },
        { name: "config", type: "ConfigData" },
        { name: "temp_mesa_cartao", type: "TempMesaCartao" },
        { name: "pedido_detalhes", type: "PedidoDetalhes" },
        { name: "pedido_itens", type: "PedidoItem" },
        { name: "pedido_itens_composicao", type: "PedidoComposicao" },
        { name: "pedido_itens_detalhes", type: "PedidoDetalheItem" },
        { name: "pagamentos_realizados", type: "PagamentoRealizado" },
      ];

      const allData: Record<string, any[]> = {};

      console.log("📊 --- LISTANDO TODOS OS REGISTROS DO BANCO --- 📊");

      for (const table of tables) {
        try {
          // 🔥 Correção: Envolver a consulta em `SELECT * FROM tabela`
          const data = await database.getAllAsync(`SELECT * FROM ${table.name}`);
          allData[table.type] = data;

          console.log(`\n📌 Tabela: ${table.name.toUpperCase()}`);
          console.log(data.length > 0 ? JSON.stringify(data, null, 2) : "🔹 Nenhum registro encontrado.");
        } catch (error) {
          console.error(`❌ Erro ao buscar registros de ${table.name}:`, error);
          allData[table.type] = [];
        }
      }

      console.log("\n✅ --- FIM DA LISTAGEM --- ✅");

      return allData;
    } catch (error) {
      console.error("❌ Erro ao listar todos os registros do banco de dados:", error);
      throw error;
    }
  }

  return {
    getAllTablesDataAndLog,
  };
}
