
// Fix: Import React to provide the React namespace for React.ReactNode used in the Feature interface
import React from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}
