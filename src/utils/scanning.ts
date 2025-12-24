/**
 * เปิดกล้องเพื่อสแกน QR/Barcode
 */
export const startScanning = (
  setIsScanning: (scanning: boolean) => void
): void => {
  setIsScanning(true);
};

