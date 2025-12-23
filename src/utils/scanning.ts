/**
 * จำลองการสแกน QR/Barcode
 */
export const startScanning = (
  setScanProgress: (progress: number) => void,
  setIsScanning: (scanning: boolean) => void,
  setRunSheetNumber: (number: string) => void
): void => {
  setIsScanning(true);
  setScanProgress(0);
  
  const mockNumbers = ["RS-2025098", "RS-8877112", "RS-4455667"];
  
  const interval = setInterval(() => {
    setScanProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setRunSheetNumber(
            mockNumbers[Math.floor(Math.random() * mockNumbers.length)]
          );
          setIsScanning(false);
        }, 500);
        return 100;
      }
      return prev + 10;
    });
  }, 150);
};

