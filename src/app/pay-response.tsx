import { LoadingScreen } from "@/components/Loadings";
import { dbo_DetalhesPedido } from "@/database/schemas/dbo_DetalhesPedido";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import { printPaymentReceipt } from "@/hooks/printPaymentReceipt";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";

export default function PayResponse() {
  const { type = "voltar" } = useLocalSearchParams<{ type?: "voltar" | "pending" | "finish" }>();

  const { navigationController, navigateToMainScreen } = useNavigationFoods();

  const { getUltimaParcela } = dbo_DetalhesPedido();

  const handlePrintReceipt = async () => {
    const ultimaParcelaInserida = await getUltimaParcela();

    if (!ultimaParcelaInserida) return;

    //console.log("ultimaParcelaInserida", ultimaParcelaInserida);
    if (ultimaParcelaInserida.Atk === "DIN" || !ultimaParcelaInserida.Atk) {
      await printPaymentReceipt(ultimaParcelaInserida);
    }
    return null;
  };

  useEffect(() => {
    if (type === "voltar") {
      navigationController.back();
      return;
    }
    // Define o timeout de 1 minuto (60000 ms)
    const timer = setTimeout(() => {
      handlePrintReceipt();

      if (type === "finish") {
        navigationController.dismissTo("/panel-Main");
        return;
      } else {
        navigationController.dismissTo("/pay-Details");
        return;
      }
    }, 5000);

    // Limpa o timeout quando o componente for desmontado
    return () => clearTimeout(timer);
  }, [type, navigationController, navigateToMainScreen]);

  return (
    <LoadingScreen
      useBackground
      color="#FFF"
      stylesText="text-white"
      msg="Carregando as informações disponíveis, aguarde..."
    />
  );
}
