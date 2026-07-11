export interface ImageScanResult {
  scanId: string;
  extractedText: string;
  urlsFound: string[];
  emailsFound: string[];
  phoneNumbersFound: string[];
  otpFound: string[];
}
