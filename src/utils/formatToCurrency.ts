/**
 * Formata um número como moeda brasileira (BRL).
 *
 * @param value - O valor numérico a ser formatado.
 * @returns Uma string formatada como moeda brasileira. Exemplo: `R$ 1.000,00`
 */
export function formatToCurrency(value: number | null | undefined): string {
  // Se o valor não for um número válido, assume como `0`
  const numericValue = Number(value) || 0;

  return numericValue
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    .replace(/^(\D+)/, "$1 "); // 🔹 Garante espaço após "R$"
}
