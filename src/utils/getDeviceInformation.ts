import * as Device from "expo-device";
import DeviceInfo from "react-native-device-info";

// Interface para definir a estrutura das informações do dispositivo
interface DeviceInformationProps {
  uniqueId: string | null;
  Modelo: string | null;
  Plataforma: string | null;
  Versao: string | null;
  Fornecedor: string | null;
}

/**
 * Obtém as informações do dispositivo
 *
 * @returns Um objeto contendo as informações do dispositivo ou um erro detalhado.
 */
const getDeviceInformation = async (): Promise<{ infoDispositivo?: DeviceInformationProps; error?: string }> => {
  try {
    const uniqueId = await DeviceInfo.getUniqueId();
    const Plataforma = Device.osName || null;
    const Modelo = Device.modelName || null;
    const Versao = Device.osVersion || null;
    const Fornecedor = await Device.manufacturer; // 🔹 Agora tratado corretamente com await

    // Cria um objeto com as informações do dispositivo
    const infoDispositivo: DeviceInformationProps = {
      uniqueId,
      Plataforma,
      Modelo,
      Versao,
      Fornecedor,
    };

    return { infoDispositivo };
  } catch (error) {
    console.error("Erro ao obter informações do dispositivo:", error);
    return { error: `Erro ao obter informações do dispositivo: ${error}` };
  }
};

export { getDeviceInformation, DeviceInformationProps };
