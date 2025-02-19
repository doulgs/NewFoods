import "../styles/global.css";

import { database } from "@/database/database";
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from "@expo-google-fonts/quicksand";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

// Impede que a Splash Screen feche automaticamente antes do carregamento das fontes
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Esconde a Splash Screen quando as fontes forem carregadas
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Se as fontes ainda não carregaram, exibe um indicador de carregamento
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#044470" }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView onLayout={onLayoutRootView} style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <SQLiteProvider databaseName="quickfoods.db" onInit={database}>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <Stack
              screenOptions={{
                headerTintColor: "#fff",
                headerStyle: { backgroundColor: "#044470" },
                headerTitleStyle: { fontFamily: "Quicksand_700Bold", fontSize: 22 },
              }}
            >
              <Stack.Screen name="index" options={{ title: "Login", headerShown: false }} />
              <Stack.Screen name="auth-Register" options={{ title: "Registro", headerShown: false }} />

              <Stack.Screen name="laucher-ExceptionList" options={{ title: "Exceções" }} />
              <Stack.Screen name="laucher-Group2List" options={{ title: "Grupos 2" }} />
              <Stack.Screen name="laucher-Group3List" options={{ title: "Grupos 3" }} />
              <Stack.Screen name="laucher-OrderList" options={{ title: "Gerenciar Pedido" }} />
              <Stack.Screen name="laucher-ProductList" options={{ title: "Listagem de Produtos" }} />

              <Stack.Screen name="panel-ListCards" options={{ title: "Painel de Cartões" }} />
              <Stack.Screen name="panel-ListTables" options={{ title: "Painel de Mesas" }} />
              <Stack.Screen
                name="panel-Main"
                options={{
                  title: "QuickFoods",
                }}
              />

              <Stack.Screen name="pay-Details" options={{ title: "Detalhes do Pedido" }} />
              <Stack.Screen name="pay-Options" options={{ title: "Pagamento" }} />
              <Stack.Screen name="pay-response" options={{ headerShown: false }} />

              <Stack.Screen name="person-Register" options={{ title: "Lista de Pessoas" }} />
              <Stack.Screen name="person-Edit" options={{ title: "Editar Pessoa" }} />
            </Stack>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
