import { BrowserMultiFormatReader } from "@zxing/library";

/**
 * อ่าน QR code จากรูปภาพ (base64 string)
 * ลองหลายวิธีเพื่อเพิ่มโอกาสในการอ่าน QR code
 */
export const readQRFromImage = async (imageSrc: string): Promise<string | null> => {
  try {
    const codeReader = new BrowserMultiFormatReader();

    // สร้าง Image element จาก base64
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          console.log("Original image dimensions:", img.width, "x", img.height);

          // ลองหลายขนาดเพื่อเพิ่มโอกาสในการอ่าน QR code
          const sizesToTry = [
            { max: 2000, name: "original/large" },
            { max: 1500, name: "medium" },
            { max: 1000, name: "small" },
          ];

          for (const sizeConfig of sizesToTry) {
            try {
              const maxDimension = sizeConfig.max;
              let canvas: HTMLCanvasElement | null = null;
              let ctx: CanvasRenderingContext2D | null = null;

              // สร้าง canvas
              canvas = document.createElement("canvas");
              ctx = canvas.getContext("2d", { willReadFrequently: true });

              if (!ctx) {
                throw new Error("Cannot create canvas context");
              }

              // คำนวณขนาดใหม่
              let targetWidth = img.width;
              let targetHeight = img.height;

              if (targetWidth > maxDimension || targetHeight > maxDimension) {
                const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
                targetWidth = Math.floor(targetWidth * ratio);
                targetHeight = Math.floor(targetHeight * ratio);
              }

              canvas.width = targetWidth;
              canvas.height = targetHeight;

              // วาดรูปด้วย image smoothing เพื่อความชัดเจน
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              console.log(`Trying to decode at size ${sizeConfig.name}:`, targetWidth, "x", targetHeight);

              // แปลง canvas เป็น image element เพื่อ decode
              const canvasImg = new Image();
              canvasImg.crossOrigin = "anonymous";

              await new Promise<void>((resolveImg) => {
                canvasImg.onload = () => resolveImg();
                canvasImg.src = canvas.toDataURL();
              });

              // ลอง decode
              const result = await codeReader.decodeFromImageElement(canvasImg);

              if (result) {
                console.log(`QR code found at size ${sizeConfig.name}:`, result.getText());
                resolve(result.getText());
                return;
              }
            } catch (err) {
              // ถ้าเป็น NotFoundException ให้ลองขนาดถัดไป
              if (err instanceof Error && err.name === "NotFoundException") {
                console.log(`No QR code found at size ${sizeConfig.name}, trying next size...`);
                continue;
              }
              // ถ้าเป็น error อื่น ให้ throw ต่อ
              throw err;
            }
          }

          // ถ้าลองทุกขนาดแล้วยังไม่เจอ ให้ลองใช้ image element โดยตรง
          console.log("Trying with original image element...");
          try {
            const result = await codeReader.decodeFromImageElement(img);
            if (result) {
              console.log("QR code found with original image:", result.getText());
              resolve(result.getText());
              return;
            }
          } catch (err) {
            if (err instanceof Error && err.name === "NotFoundException") {
              console.log("No QR code found with original image");
            }
          }

          // ไม่เจอ QR code ในทุกวิธี
          console.log("QR code not found after trying all methods");
          resolve(null);
        } catch (err) {
          if (err instanceof Error && err.name === "NotFoundException") {
            resolve(null); // ไม่เจอ QR code
          } else {
            console.error("Error during QR decoding:", err);
            reject(err);
          }
        }
      };

      img.onerror = () => {
        reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
      };

      img.src = imageSrc;
    });
  } catch (error) {
    console.error("Error reading QR from image:", error);
    return null;
  }
};
