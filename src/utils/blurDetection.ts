/**
 * ตรวจสอบความชัดของภาพโดยใช้ Laplacian Variance
 * @param imageData - ImageData จาก canvas
 * @returns ค่า variance (ค่าสูง = ภาพชัด, ค่าต่ำ = ภาพเบลอ)
 */
export const detectBlur = (imageData: ImageData): number => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let laplacianSum = 0;
  let laplacianSquaredSum = 0;
  let count = 0;

  // แปลงเป็น grayscale และคำนวณ Laplacian
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Laplacian kernel: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]]
      const topIdx = ((y - 1) * width + x) * 4;
      const bottomIdx = ((y + 1) * width + x) * 4;
      const leftIdx = (y * width + (x - 1)) * 4;
      const rightIdx = (y * width + (x + 1)) * 4;

      const topGray = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
      const bottomGray = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
      const leftGray = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
      const rightGray = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;

      const laplacian = Math.abs(4 * gray - topGray - bottomGray - leftGray - rightGray);
      laplacianSum += laplacian;
      laplacianSquaredSum += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) return 0;

  const mean = laplacianSum / count;
  const variance = laplacianSquaredSum / count - mean * mean;

  return variance;
};

export const BLUR_THRESHOLD = 100; // Threshold สำหรับความชัด
