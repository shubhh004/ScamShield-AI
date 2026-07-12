import apiClient from '@/lib/api/apiClient';
import type {
  ScanUrlResult,
  ScanEmailResult,
  SmsScanResult,
  QrScanResult,
  ImageScanResult,
} from '@/types/scanner';

type ApiWrap<T> = { success: true; data: T };

export async function scanUrl(url: string): Promise<ScanUrlResult> {
  const res = await apiClient.post<ApiWrap<ScanUrlResult>>('/scan/url', { url });
  return res.data.data;
}

export async function scanEmail(payload: {
  sender: string;
  subject: string;
  body: string;
}): Promise<ScanEmailResult> {
  const res = await apiClient.post<ApiWrap<ScanEmailResult>>('/scan/email', payload);
  return res.data.data;
}

export async function scanSms(message: string): Promise<SmsScanResult> {
  const res = await apiClient.post<ApiWrap<SmsScanResult>>('/scan/sms', { message });
  return res.data.data;
}

export async function scanQr(file: File): Promise<QrScanResult> {
  const form = new FormData();
  form.append('image', file);
  const res = await apiClient.post<ApiWrap<QrScanResult>>('/scan/qr', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function scanImage(file: File): Promise<ImageScanResult> {
  const form = new FormData();
  form.append('image', file);
  const res = await apiClient.post<ApiWrap<ImageScanResult>>('/scan/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
