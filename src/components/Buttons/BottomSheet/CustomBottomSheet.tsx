import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, ReactNode, useCallback, useImperativeHandle, useRef } from "react";
import { CustomBackdrop } from "./CustomBackdrop";
import { CustomHandleComponent } from "./CustomHandleComponent";

type BottomSheetProps = {
  children: ReactNode;
  snapPoints?: string[];
  initialIndex?: number;
};

export type BottomSheetHandle = {
  open: () => void;
  close: () => void;
  navigateTo: (index: number) => void;
};

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  ({ children, snapPoints = ["25%", "50%"], initialIndex = 1 }, ref) => {
    // ref para o BottomSheetModal
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Abrir o BottomSheet
    const open = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    // Fechar o BottomSheet
    const close = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
    }, []);

    // Navegar para um índice específico
    const navigateTo = useCallback((index: number) => {
      bottomSheetModalRef.current?.snapToIndex(index);
    }, []);

    // Expor as funções para o componente pai
    useImperativeHandle(ref, () => ({
      open,
      close,
      navigateTo,
    }));

    const handleSheetChanges = useCallback((index: number) => {
      //console.log("handleSheetChanges", index);
    }, []);

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={initialIndex}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={(props) => <CustomBackdrop {...props} />}
        handleComponent={(props) => <CustomHandleComponent {...props} />}
        backgroundStyle={{ backgroundColor: "#044470", borderWidth: 1, borderColor: "#000000" }}
      >
        <BottomSheetView className="flex-1">{children}</BottomSheetView>
      </BottomSheetModal>
    );
  }
);
