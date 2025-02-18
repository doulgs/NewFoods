type NativePrint = {
  showFeedback: boolean;
  printableContent: string;
};

interface ImagePrint {
  type: "image";
  imagePath: string;
}

interface TextPrint {
  type: "text";
  content: string;
  align: "center" | "left" | "right";
  size: "small" | "medium" | "big";
}

type PrintContent = ImagePrint | TextPrint;
