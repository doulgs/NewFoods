import { useNavigationState } from "@react-navigation/native";

function usePreviousRouteName(): string | null {
  const routes = useNavigationState((state) => state.routes);
  // Se houver pelo menos duas rotas, o penúltimo é a rota anterior
  if (routes.length >= 2) {
    return routes[routes.length - 2].name;
  }
  return null;
}

export { usePreviousRouteName };
