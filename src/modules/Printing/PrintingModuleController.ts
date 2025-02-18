import { PrintingModuleService } from "./PrintingModuleService";

/**
 * Função genérica para gerar o conteúdo de impressão.
 * @param images - Array de paths de imagens para serem impressas.
 * @returns Uma string JSON representando o conteúdo de impressão.
 */
async function handlePrintProcess(images: string[]): Promise<null> {
  const printContent: PrintContent[] = images.map((imagePath) => ({
    type: "image",
    imagePath,
  }));

  const printContentJson = JSON.stringify(printContent);

  await PrintingModuleService({
    showFeedback: false,
    printableContent: printContentJson,
  });

  return null;
}
