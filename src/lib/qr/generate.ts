import QRCode from "qrcode";

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: "M",
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#F09226",
      light: "#020026",
    },
  });
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    width: 400,
    margin: 2,
    color: {
      dark: "#F09226",
      light: "#020026",
    },
  });
}
