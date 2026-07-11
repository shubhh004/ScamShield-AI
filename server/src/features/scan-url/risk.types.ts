export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}
