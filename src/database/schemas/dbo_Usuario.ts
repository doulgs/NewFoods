import { useSQLiteContext } from "expo-sqlite";

export function dbo_Usuario() {
  const database = useSQLiteContext();
  // Inserir um novo usuário (apaga todos os registros antes de inserir)
  async function insertUsuario({ Handle, Nome, Apelido }: Usuario) {
    try {
      // Primeiro, deletar todos os registros existentes
      await database.execAsync(`DELETE FROM usuario`);

      // Em seguida, inserir o novo registro
      const statement = database.prepareSync(`
        INSERT INTO usuario (Handle, Nome, Apelido) VALUES (?, ?, ?);
      `);
      statement.executeSync([Handle, Nome, Apelido]);

      console.log("Usuário --> Novo registro inserido com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir usuário:", error);
      throw error;
    }
  }

  // Atualizar um usuário existente
  async function updateUsuario({ Handle, Nome, Apelido }: Usuario) {
    try {
      const statement = database.prepareSync(`
        UPDATE usuario
        SET Nome = ?, Apelido = ?
        WHERE Handle = ?;
      `);
      statement.executeSync([Nome, Apelido, Handle]);

      console.log("Usuário --> Registro atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  // Deletar um usuário pelo Handle
  async function deleteUsuario({ Handle }: Usuario) {
    try {
      const statement = database.prepareSync(`
        DELETE FROM usuario WHERE Handle = ?;
      `);
      statement.executeSync([Handle]);

      console.log("Usuário --> Registro deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  }

  // Buscar um usuário pelo Handle
  async function getUsuario() {
    try {
      const result = await database.getFirstAsync<{ Handle: number; Nome: string; Apelido: string }>(
        `SELECT * FROM usuario LIMIT 1;`
      );

      if (!result) {
        console.log("Usuário --> Nenhum registro encontrado!");
        throw new Error("Usuário não encontrado!");
      }

      return result;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw error;
    }
  }

  // Retornar todos os usuários cadastrados
  async function getAllUsuarios() {
    try {
      const result = await database.getAllAsync<{ Handle: number; Nome: string; Apelido: string }>(`
        SELECT * FROM usuario;
      `);

      return result;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  }

  return {
    insertUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    getAllUsuarios,
  };
}
