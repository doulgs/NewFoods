import { LoadingScreen } from "@/components/Loadings";
import { printPaymentReceipt } from "@/hooks/printPaymentReceipt";
import { useNavigationFoods } from "@/hooks/navigation/useNavegitionFoods";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { dbo_DetalhesPedido } from "@/database/schemas/dbo_DetalhesPedido";

export default function PayResponse() {
  const { type } = useLocalSearchParams<{ type: "pending" | "finish" }>();
  const { navigationController, navigateToMainScreen } = useNavigationFoods();

  const { getUltimaParcela } = dbo_DetalhesPedido();

  const handlePrintReceipt = async () => {
    const ultimaParcelaInserida = await getUltimaParcela();

    if (!ultimaParcelaInserida) return;

    if (ultimaParcelaInserida.Atk === "DIN" || ultimaParcelaInserida.Atk === "") {
      await printPaymentReceipt(ultimaParcelaInserida);
    }
    return null;
  };

  useEffect(() => {
    // Define o timeout de 1 minuto (60000 ms)
    handlePrintReceipt();

    const timer = setTimeout(() => {
      if (type === "finish") {
        navigationController.dismissTo("/panel-Main");
      } else {
        navigationController.dismissTo("/pay-Details");
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
