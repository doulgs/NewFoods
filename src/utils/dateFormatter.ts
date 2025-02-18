import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br"); // Define o idioma para português do Brasil

// Tipos de formatação de data suportados
export type DateFormatStyle = "hours" | "date" | "short" | "medium" | "long" | "full";

/**
 * Mapeia os estilos para os padrões de formatação do Day.js.
 */
const DATE_FORMATS: Record<DateFormatStyle, string> = {
  hours: "HH:mm",
  date: "DD/MM/YY",
  short: "DD/MM/YY HH:mm",
  medium: "DD/MM/YYYY [às] HH:mm",
  long: "DD [de] MMMM [de] YYYY [às] HH:mm",
  full: "dddd, DD [de] MMMM [de] YYYY [às] HH:mm",
};

/**
 * Formata uma data conforme o estilo desejado.
 * @param inputDate Data a ser formatada (Date, string ou undefined)
 * @param style Estilo de formatação (padrão: "medium")
 * @returns Data formatada ou mensagem de erro
 */
export const formatDateTime = (inputDate?: Date | string, style: DateFormatStyle = "medium"): string => {
  if (!inputDate) return "Data não informada";

  const dateObj = dayjs(inputDate);
  return dateObj.isValid() ? dateObj.format(DATE_FORMATS[style]) : `Data inválida: ${inputDate}`;
};

/**
 * Obtém a data e hora atual no formato ISO ajustado para UTC-3.
 * @returns Data e hora formatada no padrão ISO 8601.
 */
export const getCurrentDateTimeISO = (): string => {
  const now = new Date();
  now.setHours(now.getHours() - 3);
  return now.toISOString();
};
