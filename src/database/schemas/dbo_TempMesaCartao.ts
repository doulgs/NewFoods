import { useSQLiteContext } from "expo-sqlite";

type MesaCartaoType = Omit<TempMesaCartao, "id">;

export function dbo_TempMesaCartao() {
  const database = useSQLiteContext();

  // Substituir o único registro de TempMesaCartao (Apaga antes de inserir)
  async function insertTmpMesaCartao(data: MesaCartaoType) {
    try {
      // Remover o registro existente antes de inserir um novo
      await database.execAsync(`DELETE FROM temp_mesa_cartao`);

      const statement = database.prepareSync(`
        INSERT INTO temp_mesa_cartao 
        (Numero, Nome, TempoInatividade, SolicitouConta, HorarioUltimaAlteracao, 
         Inatividade, Status, NumeroMesa, QuantidadePessoas, GpeHandle) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `);
      statement.executeSync([
        data.Numero,
        data.Nome,
        data.TempoInatividade,
        data.SolicitouConta ? 1 : 0,
        data.HorarioUltimaAlteracao,
        data.Inatividade ? 1 : 0,
        data.Status,
        data.NumeroMesa || null,
        data.QuantidadePessoas,
        data.GpeHandle,
      ]);

      console.log("TempMesaCartao --> Registro atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir registro em TempMesaCartao:", error);
      throw error;
    }
  }

  // Buscar o registro atual
  async function getTempMesaCartao() {
    try {
      const result = await database.getFirstAsync<TempMesaCartao>(`
        SELECT * FROM temp_mesa_cartao LIMIT 1;
      `);
      return result || null;
    } catch (error) {
      console.error("Erro ao buscar registro de TempMesaCartao:", error);
      throw error;
    }
  }

  // Limpar o registro
  async function clearTempMesaCartao() {
    try {
      await database.execAsync(`DELETE FROM temp_mesa_cartao`);
      console.log("TempMesaCartao --> Registro removido com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar TempMesaCartao:", error);
      throw error;
    }
  }

  return {
    insertTmpMesaCartao,
    getTempMesaCartao,
    clearTempMesaCartao,
  };
}
