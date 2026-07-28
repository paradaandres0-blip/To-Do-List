export interface Center {
  id: string;
  name: string;
  website: string;
  plan: 'Básico' | 'Pro' | 'Enterprise';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
