import mongoose from 'mongoose';
import Groq from 'groq-sdk';
import { History } from '../history/history.model';
import { AppError, ForbiddenError, NotFoundError, ValidationError } from '../../lib/errors';
import { env } from '../../config/env';
import type { IHistory } from '../history/history.model';
import type { AIResponse, PromptData } from './ai.types';

// ── Type-safe accessors for Record<string, unknown> ───────────────────────────

function asObject(val: unknown): Record<string, unknown> | null {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
    ? (val as Record<string, unknown>)
    : null;
}

function asArray(val: unknown): unknown[] {
  return Array.isArray(val) ? (val as unknown[]) : [];
}

function toStringOrNull(val: unknown): string | null {
  return typeof val === 'string' ? val : null;
}

function toStringArray(val: unknown): string[] {
  return asArray(val).filter((item): item is string => typeof item === 'string');
}

// ── Domain helpers ────────────────────────────────────────────────────────────

function deriveRiskLevel(score: number): string {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

function extractUrlStrings(val: unknown): string[] {
  return asArray(val)
    .map(asObject)
    .filter((item): item is Record<string, unknown> => item !== null)
    .map((item) => toStringOrNull(item['url']))
    .filter((u): u is string => u !== null);
}

function extractOcrReasons(result: Record<string, unknown>): string[] {
  const seen = new Set<string>();
  for (const key of ['urlScan', 'emailScan', 'smsScan']) {
    const sub = asObject(result[key]);
    if (sub !== null) {
      for (const reason of toStringArray(sub['reasons'])) {
        seen.add(reason);
      }
    }
  }
  return [...seen];
}

// ── Prompt construction ───────────────────────────────────────────────────────

function extractPromptData(scan: IHistory): PromptData {
  const r = scan.result;

  switch (scan.scanType) {
    case 'url': {
      const url = toStringOrNull(r['url']);
      return {
        scanType: 'url',
        riskScore: scan.riskScore,
        riskLevel: toStringOrNull(r['riskLevel']) ?? deriveRiskLevel(scan.riskScore),
        reasons: toStringArray(r['reasons']),
        urlsFound: url !== null ? [url] : [],
        emailsFound: [],
        phoneNumbersFound: [],
        ocrText: null,
      };
    }

    case 'email': {
      return {
        scanType: 'email',
        riskScore: scan.riskScore,
        riskLevel: toStringOrNull(r['riskLevel']) ?? deriveRiskLevel(scan.riskScore),
        reasons: toStringArray(r['reasons']),
        urlsFound: extractUrlStrings(r['urlsFound']),
        emailsFound: [],
        phoneNumbersFound: [],
        ocrText: null,
      };
    }

    case 'sms': {
      return {
        scanType: 'sms',
        riskScore: scan.riskScore,
        riskLevel: toStringOrNull(r['riskLevel']) ?? deriveRiskLevel(scan.riskScore),
        reasons: toStringArray(r['reasons']),
        urlsFound: extractUrlStrings(r['urlsFound']),
        emailsFound: [],
        phoneNumbersFound: toStringArray(r['phoneNumbersFound']),
        ocrText: null,
      };
    }

    case 'qr': {
      const qrScan = asObject(r['scan']);
      const decoded = toStringOrNull(r['decoded']);
      return {
        scanType: 'qr',
        riskScore: scan.riskScore,
        riskLevel:
          qrScan !== null
            ? (toStringOrNull(qrScan['riskLevel']) ?? deriveRiskLevel(scan.riskScore))
            : deriveRiskLevel(scan.riskScore),
        reasons: qrScan !== null ? toStringArray(qrScan['reasons']) : [],
        urlsFound: r['type'] === 'url' && decoded !== null ? [decoded] : [],
        emailsFound: [],
        phoneNumbersFound: [],
        ocrText: null,
      };
    }

    case 'ocr': {
      const ocr = asObject(r['ocr']);
      return {
        scanType: 'ocr',
        riskScore: scan.riskScore,
        riskLevel: toStringOrNull(r['overallRisk']) ?? deriveRiskLevel(scan.riskScore),
        reasons: extractOcrReasons(r),
        urlsFound: ocr !== null ? toStringArray(ocr['urlsFound']) : [],
        emailsFound: ocr !== null ? toStringArray(ocr['emailsFound']) : [],
        phoneNumbersFound: ocr !== null ? toStringArray(ocr['phoneNumbersFound']) : [],
        ocrText: ocr !== null ? toStringOrNull(ocr['extractedText']) : null,
      };
    }
  }
}

export function buildPrompt(scan: IHistory, question?: string): string {
  const data = extractPromptData(scan);
  const lines: string[] = [
    'You are a cybersecurity assistant for ScamShield AI.',
    'Analyse the following scan result and explain the risk clearly.',
    '',
    `Scan Type   : ${data.scanType.toUpperCase()}`,
    `Risk Score  : ${data.riskScore}/100`,
    `Risk Level  : ${data.riskLevel}`,
  ];

  if (data.reasons.length > 0) {
    lines.push('', 'Threat Indicators:');
    for (const reason of data.reasons) {
      lines.push(`  • ${reason}`);
    }
  }

  if (data.urlsFound.length > 0) {
    lines.push('', 'URLs Found:');
    for (const url of data.urlsFound) {
      lines.push(`  • ${url}`);
    }
  }

  if (data.emailsFound.length > 0) {
    lines.push('', 'Emails Found:');
    for (const email of data.emailsFound) {
      lines.push(`  • ${email}`);
    }
  }

  if (data.phoneNumbersFound.length > 0) {
    lines.push('', 'Phone Numbers Found:');
    for (const phone of data.phoneNumbersFound) {
      lines.push(`  • ${phone}`);
    }
  }

  if (data.ocrText !== null && data.ocrText.length > 0) {
    lines.push('', 'OCR Extracted Text (first 500 chars):', data.ocrText.slice(0, 500));
  }

  if (question !== undefined && question.trim().length > 0) {
    lines.push('', `User Question: ${question.trim()}`);
  }

  lines.push(
    '',
    'Provide:',
    '1. A clear explanation of the risk and what it means for the user.',
    '2. Exactly 3 actionable safety tips.',
  );

  return lines.join('\n');
}

// ── Groq client ───────────────────────────────────────────────────────────────

const groqClient = new Groq({ apiKey: env.GROQ_API_KEY, timeout: 30_000 });

const SYSTEM_PROMPT =
  'You are a cybersecurity assistant. ' +
  'Respond with ONLY valid JSON — no markdown, no code fences. ' +
  'The JSON must have exactly two keys: ' +
  '"answer" (a string explaining the risk) and ' +
  '"tips" (an array of exactly 3 actionable safety tip strings).';

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const match = /\{[\s\S]*\}/.exec(text);
    if (match === null) return undefined;
    try {
      return JSON.parse(match[0]) as unknown;
    } catch {
      return undefined;
    }
  }
}

function parseGroqResponse(raw: string, model: string): AIResponse {
  const parsed = tryParseJson(raw);
  if (
    parsed !== null &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    typeof (parsed as Record<string, unknown>)['answer'] === 'string' &&
    Array.isArray((parsed as Record<string, unknown>)['tips'])
  ) {
    const obj = parsed as Record<string, unknown>;
    const tips = (obj['tips'] as unknown[])
      .filter((t): t is string => typeof t === 'string')
      .slice(0, 3);
    return {
      answer: obj['answer'] as string,
      tips,
      provider: 'Groq',
      model,
    };
  }

  return {
    answer: raw,
    tips: [],
    provider: 'Groq',
    model,
  };
}

// ── AI provider call ──────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<AIResponse> {
  try {
    const completion = await groqClient.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const choice = completion.choices[0];
    const raw = choice?.message.content ?? '';
    return parseGroqResponse(raw, completion.model);
  } catch (err) {
    if (err instanceof Groq.AuthenticationError) {
      throw new AppError(503, 'AI_AUTH_ERROR', 'AI service authentication failed');
    }
    if (err instanceof Groq.RateLimitError) {
      throw new AppError(429, 'AI_RATE_LIMIT', 'AI service rate limit exceeded');
    }
    if (err instanceof Groq.APIConnectionTimeoutError) {
      throw new AppError(504, 'AI_TIMEOUT', 'AI service request timed out');
    }
    if (err instanceof Groq.APIError) {
      throw new AppError(502, 'AI_UNAVAILABLE', 'AI service unavailable');
    }
    throw err;
  }
}

// ── Ownership-verified scan loader ────────────────────────────────────────────

async function loadAndVerifyScan(userId: string, scanId: string): Promise<IHistory> {
  if (!mongoose.Types.ObjectId.isValid(scanId)) {
    throw new ValidationError('Invalid scan ID');
  }

  const scan = await History.findById(scanId).lean();

  if (scan === null) {
    throw new NotFoundError('Scan');
  }

  if ((scan.userId as mongoose.Types.ObjectId).toString() !== userId) {
    throw new ForbiddenError();
  }

  return scan as unknown as IHistory;
}

// ── Public orchestrator ───────────────────────────────────────────────────────

export async function explainScan(
  userId: string,
  scanId: string,
  question?: string,
): Promise<AIResponse> {
  const scan = await loadAndVerifyScan(userId, scanId);
  const prompt = buildPrompt(scan, question);
  return callAI(prompt);
}
