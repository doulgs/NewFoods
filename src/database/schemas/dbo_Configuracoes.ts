import { useSQLiteContext } from "expo-sqlite";

export function dbo_Configuracoes() {
  const database = useSQLiteContext();

  // Inserir ou atualizar a configuração (apaga antes de inserir)
  async function setConfig(config: ConfigData) {
    try {
      await database.execAsync(`DELETE FROM config`);

      const statement = database.prepareSync(`
        INSERT INTO config 
        (lancamentoLiberado, Grupo2ComQuantidadeMultiSelect, UnidadeComQuantidadeFracionada, 
         UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao, ObrigatorioNumeroMesaLancamentoCartao) 
        VALUES (?, ?, ?, ?, ?);
      `);
      statement.executeSync([
        config.lancamentoLiberado,
        config.Grupo2ComQuantidadeMultiSelect,
        config.UnidadeComQuantidadeFracionada,
        config.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao ? 1 : 0,
        config.ObrigatorioNumeroMesaLancamentoCartao ? 1 : 0,
      ]);

      console.log("Config --> Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      throw error;
    }
  }

  // Buscar a configuração atual
  async function getConfig(): Promise<ConfigData> {
    try {
      const result = await database.getFirstAsync<ConfigData>(`
        SELECT * FROM config ORDER BY id DESC LIMIT 1;
      `);

      return (
        result || {
          id: 0,
          lancamentoLiberado: "Ambos",
          Grupo2ComQuantidadeMultiSelect: "",
          UnidadeComQuantidadeFracionada: "",
          UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao: false,
          ObrigatorioNumeroMesaLancamentoCartao: false,
        }
      );
    } catch (error) {
      console.error("Erro ao buscar configuração:", error);
      throw error;
    }
  }

  // Resetar configuração para o padrão
  async function clearConfig() {
    try {
      await database.execAsync(`DELETE FROM config`);
      console.log("Config --> Configuração resetada!");
    } catch (error) {
      console.error("Erro ao resetar configuração:", error);
      throw error;
    }
  }

  return {
    setConfig,
    getConfig,
    clearConfig,
  };
}
