import type { GeoapifySearchResult } from "@/types";
import type { Timestamp } from "@/types";

interface OverlayOptions {
  address?: GeoapifySearchResult | null;
  timestamp?: Timestamp | null;
  statusLabel?: string;
}

/**
 * เพิ่ม overlay ลงใน canvas
 */
export function addOverlayToCanvas(canvas: HTMLCanvasElement, options: OverlayOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { address, timestamp, statusLabel } = options;
  const width = canvas.width;
  const height = canvas.height;

  // คำนวณขนาดฟอนต์ตามขนาดภาพ (เพิ่มขนาดขึ้น)
  const baseFontSize = Math.max(width, height) / 35;
  const smallFontSize = baseFontSize * 0.65;

  // สร้างข้อความสถานที่
  let locationLine1 = "";
  let locationLine2 = "";
  if (address?.address) {
    const addr = address.address;
    if (addr.address_line1 && addr.address_line2) {
      locationLine1 = addr.address_line1;
      locationLine2 = addr.address_line2;
    } else if (addr.formatted) {
      const parts = addr.formatted.split(",");
      locationLine1 = parts[0] || "";
      locationLine2 = parts.slice(1).join(",").trim() || "";
    }
  }

  // สร้างข้อความพิกัด
  let coordinatesText = "";
  if (address?.address?.latitude && address?.address?.longitude) {
    coordinatesText = `ละติจูด: ${address.address.latitude.toFixed(6)}, ลองกิจูด: ${address.address.longitude.toFixed(6)}`;
  }

  // สร้างข้อความวันที่และเวลา (dd/MM/yyyy hh:mm:ss บรรทัดเดียว)
  let dateTimeText = "";
  if (timestamp) {
    const [day, month, year] = timestamp.date.split("/");
    const [hours, minutes, seconds] = timestamp.time.split(":");

    // Format: dd/MM/yyyy hh:mm:ss
    dateTimeText = `${day.padStart(2, "0")}/${month.padStart(
      2,
      "0"
    )}/${year} ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  }

  // สร้างข้อความสถานะ
  const statusText = statusLabel || "";

  // วาดพื้นหลัง overlay ที่ด้านล่าง (สีเทา fade) - เพิ่มความสูง
  const overlayHeight = Math.max(height * 0.3, 180);
  const overlayY = height - overlayHeight;

  // Gradient background สีเทา fade (ลดความเข้มลง 50%)
  const gradient = ctx.createLinearGradient(0, overlayY, 0, height);
  gradient.addColorStop(0, "rgba(100, 100, 100, 0)");
  gradient.addColorStop(0.2, "rgba(100, 100, 100, 0.15)");
  gradient.addColorStop(0.5, "rgba(100, 100, 100, 0.3)");
  gradient.addColorStop(1, "rgba(100, 100, 100, 0.425)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, overlayY, width, overlayHeight);

  // วาดเส้นแบ่งด้านบน (จางๆ)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, overlayY);
  ctx.lineTo(width, overlayY);
  ctx.stroke();

  // Caption process name ภาษาไทย ตัวหนา ที่ด้านบนสุด
  const columnX = baseFontSize * 0.3;
  let currentY = overlayY + baseFontSize * 0.6;

  if (statusText) {
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `bold ${baseFontSize * 1.1}px sans-serif`;
    ctx.fillText(statusText, columnX, currentY);
    currentY += baseFontSize * 1.5;

    // วาดเส้นแบ่งใต้ caption
    ctx.strokeStyle = "rgba(155, 152, 152, 0.64)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(columnX, currentY - baseFontSize * 0.3);
    ctx.lineTo(width - columnX, currentY - baseFontSize * 0.3);
    ctx.stroke();

    currentY += baseFontSize * 0.5;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // ขนาดตัวอักษรสำหรับคอลัมน์ซ้าย (เล็กกว่าคอลัมน์ขวา)
  const leftBaseFontSize = baseFontSize * 0.7;

  // ส่วนที่ 1: วันที่และเวลา (dd/MM/yyyy hh:mm:ss บรรทัดเดียว)
  if (dateTimeText) {
    ctx.font = `bold ${leftBaseFontSize * 0.9}px sans-serif`;
    ctx.fillText(dateTimeText, columnX, currentY);
    currentY += leftBaseFontSize * 1.3;
  }

  // ส่วนที่ 2: สถานที่และพิกัด (ต่อจากวันที่/เวลา)
  if (address?.address) {
    // สถานที่บรรทัดแรก
    if (locationLine1) {
      ctx.font = `bold ${smallFontSize}px sans-serif`;
      ctx.fillText(locationLine1, columnX, currentY);
      currentY += smallFontSize * 1.2;
    }

    // สถานที่บรรทัดที่สอง
    if (locationLine2) {
      ctx.font = `bold ${smallFontSize}px sans-serif`;
      ctx.fillText(locationLine2, columnX, currentY);
      currentY += smallFontSize * 1.2;
    }

    // พิกัด
    if (coordinatesText) {
      ctx.font = `${smallFontSize * 0.85}px sans-serif`;
      ctx.fillText(coordinatesText, columnX, currentY);
    }
  }

  // วาด checkmark ที่มุมบนขวา
  if (statusText) {
    const checkmarkSize = baseFontSize * 1.2;
    const checkmarkX = width - checkmarkSize * 1.5;
    const checkmarkY = baseFontSize * 0.8;

    // วาดวงกลมพื้นหลัง
    ctx.fillStyle = "#006633"; // karabao green
    ctx.beginPath();
    ctx.arc(checkmarkX + checkmarkSize / 2, checkmarkY + checkmarkSize / 2, checkmarkSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // วาดขอบสีขาว
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(2, baseFontSize / 20);
    ctx.stroke();

    // วาด checkmark (✓)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(3, baseFontSize / 15);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const checkX = checkmarkX + checkmarkSize / 2;
    const checkY = checkmarkY + checkmarkSize / 2;
    ctx.moveTo(checkX - checkmarkSize * 0.25, checkY);
    ctx.lineTo(checkX - checkmarkSize * 0.05, checkY + checkmarkSize * 0.2);
    ctx.lineTo(checkX + checkmarkSize * 0.25, checkY - checkmarkSize * 0.2);
    ctx.stroke();
  }
}

/**
 * เพิ่ม overlay ลงใน image data URL และคืนค่า image data URL ใหม่
 */
export async function addOverlayToImage(imageDataUrl: string, options: OverlayOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Cannot get canvas context"));
        return;
      }

      // วาดภาพเดิม
      ctx.drawImage(img, 0, 0);

      // เพิ่ม overlay
      addOverlayToCanvas(canvas, options);

      // แปลงเป็น data URL
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
}
