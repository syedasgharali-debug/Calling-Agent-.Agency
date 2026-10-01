export interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  mins: number;
  agents: number;
  numbers: number;
  features: string[];
  color: string;
  recommended?: boolean;
  hidden?: boolean; // Admin-only plan flag
  trialDays?: number;
  trialDescription?: string;
}
