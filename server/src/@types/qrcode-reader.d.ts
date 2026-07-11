declare module 'qrcode-reader' {
  interface QrCodeResult {
    result: string;
    points: unknown[];
  }

  type QrCodeCallback = (error: unknown, value: QrCodeResult | null | undefined) => void;

  class QrCode {
    callback: QrCodeCallback | null;
    decode(src: { data: Buffer; width: number; height: number }): void;
  }

  export = QrCode;
}
