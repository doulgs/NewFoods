import { useSQLiteContext } from "expo-sqlite";

interface ResultConfigData {
  lancamentoLiberado: "Ambos" | "Mesa" | "Cartao";
  Grupo2ComQuantidadeMultiSelect: Array<number>;
  UnidadeComQuantidadeFracionada: Array<string>;
  UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao: boolean;
  ObrigatorioNumeroMesaLancamentoCartao: boolean;
}

export function dbo_Configuracoes() {
  const database = useSQLiteContext();

  // Inserir ou atualizar a configuração (apaga antes de inserir)
  // Função auxiliar para remover diacríticos (acentos) de uma string
  function removeDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async function insertConfig(config: ConfigData) {
    try {
      // Normalização e validação do campo lancamentoLiberado:
      const mapping: Record<string, "Ambos" | "Mesa" | "Cartao"> = {
        ambos: "Ambos",
        mesa: "Mesa",
        cartao: "Cartao",
      };

      // Remove acentos e converte para minúsculas
      const normalizedInput = removeDiacritics(config.lancamentoLiberado).toLowerCase();
      // Mapeia para o valor correto ou define padrão "Ambos" se não reconhecer
      const normalizedValue = mapping[normalizedInput];
      config.lancamentoLiberado = normalizedValue ? normalizedValue : "Ambos";

      await database.execAsync(`DELETE FROM config`);
      // Resetar o contador de auto incremento
      await database.execAsync("DELETE FROM sqlite_sequence WHERE name = 'config';");

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
        config.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao,
        config.ObrigatorioNumeroMesaLancamentoCartao,
      ]);

      console.log("Config --> Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      throw error;
    }
  }

  // Buscar a configuração atual
  async function getConfig(): Promise<ResultConfigData> {
    try {
      const result = await database.getFirstAsync<ConfigData>(`SELECT * FROM config ORDER BY id DESC LIMIT 1;`);

      if (!result) {
        return {
          lancamentoLiberado: "Ambos",
          Grupo2ComQuantidadeMultiSelect: [],
          UnidadeComQuantidadeFracionada: [],
          UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao: false,
          ObrigatorioNumeroMesaLancamentoCartao: false,
        };
      }

      return {
        lancamentoLiberado: result.lancamentoLiberado as "Ambos" | "Mesa" | "Cartao",
        Grupo2ComQuantidadeMultiSelect: result.Grupo2ComQuantidadeMultiSelect.split(",").map((num) =>
          Number(num.trim())
        ),
        UnidadeComQuantidadeFracionada: result.UnidadeComQuantidadeFracionada.split(",").map((item) => item.trim()),
        UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao:
          result.UtilizarMesmoNumeroCartaoParaNumeroMesaNoCartao === "true",
        ObrigatorioNumeroMesaLancamentoCartao: result.ObrigatorioNumeroMesaLancamentoCartao === "true",
      };
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
    insertConfig,
    getConfig,
    clearConfig,
  };
}
