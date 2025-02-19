import { useRouter } from "expo-router";

type ProdutosOptions = {
  handleGrupo2?: string;
  handleGrupo3?: string;
  searchNomeProduto?: string;
};

// Define o hook de navegação compatível com o Expo Router
const useNavigationFoods = () => {
  const navigationController = useRouter();

  // Rotas de Autenticação
  const navigateToLogin = () => navigationController.push("/");
  const navigateToRegister = () => navigationController.push("/auth-Register");

  // Rotas Principais (Drawer)
  const navigateToMainScreen = ({ reset = false }: { reset?: boolean } = {}) => {
    if (reset) {
      // Substitui a tela anterior, impedindo voltar
      console.log("Resetando a navegação");
      navigationController.replace("/panel-Main");
      return;
    } else {
      // Apenas adiciona à pilha de navegação
      navigationController.push("/panel-Main");
    }
  };

  const navigateToListTables = () => navigationController.push("/panel-ListTables");
  const navigateToListCards = () => navigationController.push("/panel-ListCards");

  // Rotas Launcher
  const navigateToOrderList = () => navigationController.push("/laucher-OrderList");
  const navigateToGroup2List = () => navigationController.push("/laucher-Group2List");

  /**
   * Navega para a tela "Group3List".
   *
   * @param handleGrupo2 - Número representando o handle do Grupo 2.
   */
  const navigateToGroup3List = (handleGrupo2: string) =>
    navigationController.push({ pathname: "/laucher-Group3List", params: { handleGrupo2 } });

  /**
   * Navega para a tela "ProductList".
   *
   * @param options - Opções para configurar ou filtrar a listagem de produtos.
   */
  const navigateToProductList = (options: ProdutosOptions) =>
    navigationController.push({ pathname: "/laucher-ProductList", params: options });

  /**
   * Navega para a tela "ExceptionList".
   *
   * @param idPedido - Identificador do pedido.
   * @param HandleItem - Número representando o item específico.
   * @param HandleGrupo2 - Número representando o grupo 2.
   */
  const navigateToExceptionList = (idPedido: string, HandleItem: string, HandleGrupo2: string) =>
    navigationController.push({
      pathname: "/laucher-ExceptionList",
      params: { idPedido, HandleItem, HandleGrupo2 },
    });

  // Rotas de Pessoas
  const navigateToListPeople = () => navigationController.push("/person-Register");

  /**
   * Navega para a tela "EditPerson".
   *
   * @param type - "edit" para edição ou "register" para cadastro.
   */
  const navigateToEditPerson = (type: "edit" | "register") =>
    navigationController.push({ pathname: "/person-Edit", params: { type } });

  // Rotas de Pagamento
  const navigateToDetailPayment = () => navigationController.push("/pay-Details");
  const navigateToOptionsPayment = () => navigationController.push("/pay-Options");

  /**
   * Navega para a tela "ProcessingPayment".
   *
   * @param type - "pending" para processando ou "finish" para finalizado.
   */
  const navigateToProcessingPayment = (type: "pending" | "finish") =>
    navigationController.push({ pathname: "/pay-response", params: { type } });

  return {
    navigationController,
    // Autenticação
    navigateToLogin,
    navigateToRegister,

    // Principal
    navigateToMainScreen,
    navigateToListTables,
    navigateToListCards,

    // Launcher
    navigateToOrderList,
    navigateToGroup2List,
    navigateToGroup3List,
    navigateToProductList,
    navigateToExceptionList,

    // Pessoas
    navigateToListPeople,
    navigateToEditPerson,

    // Pagamento
    navigateToDetailPayment,
    navigateToOptionsPayment,
    navigateToProcessingPayment,
  };
};

export { useNavigationFoods };
