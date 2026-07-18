import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

// Generates a unique QR token string + a base64 QR image for a visitor pass
export const generateVisitorQR = async () => {
  const qrToken = `VIS-${uuidv4()}`;
  const qrImage = await QRCode.toDataURL(qrToken);
  return { qrToken, qrImage };
};
