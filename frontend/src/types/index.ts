export type Domain = 'DSA' | 'Web Development' | 'Machine Learning' | 'Systems';

export interface User {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  domain: Domain;
  concept: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomLevel: 'Understand' | 'Apply' | 'Analyze';
  attribute: 'Problem solving' | 'Design' | 'Analysis' | 'Communication';
  type: 'MCQ' | 'Subjective';
  content: string;
  options?: string[]; // Empty for subjective
  correctAnswer?: string; // For MCQ
}

export interface Response {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
}

export interface BeliefState {
  userId: string;
  concept: string; // Could be specific concept, domain, or attribute
  probability: number; // 0 to 1
  conceptType: 'Concept' | 'Domain' | 'Attribute';
}

export interface PersonalityTraits {
  analytical: number;
  creative: number;
  practical: number;
  teamOriented: number;
  structured: number;
}

export interface DomainPriors {
  [domain in Domain]?: number; // 0 to 1 mapping
}

export interface UserProfile {
  userId: string;
  personality: PersonalityTraits;
  domainPriors: DomainPriors;
  domainScores: Record<string, number>;
  conceptStrengths: Record<string, number>;
  attributeScores: Record<string, number>;
}
