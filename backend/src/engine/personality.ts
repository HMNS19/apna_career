import { PersonalityTraits, DomainPriors, Domain } from '../types';

/**
 * Personality Engine
 * 
 * Maps answers from the initial questionnaire to personality traits
 * and generates initial domain priors to guide the adaptive selection.
 */

export interface PersonalityAnswer {
    questionId: string;
    trait: keyof PersonalityTraits;
    score: number; // 0 to 1 scale
}

export function extractTraits(answers: PersonalityAnswer[]): PersonalityTraits {
    const traits: PersonalityTraits = {
        analytical: 0,
        creative: 0,
        practical: 0,
        teamOriented: 0,
        structured: 0
    };

    const counts: Record<keyof PersonalityTraits, number> = {
        analytical: 0,
        creative: 0,
        practical: 0,
        teamOriented: 0,
        structured: 0
    };

    for (const ans of answers) {
        traits[ans.trait] += ans.score;
        counts[ans.trait] += 1;
    }

    // Average out
    for (const key of Object.keys(traits) as Array<keyof PersonalityTraits>) {
        if (counts[key] > 0) {
            traits[key] /= counts[key];
        }
    }

    return traits;
}

export function calculateDomainPriors(traits: PersonalityTraits): DomainPriors {
    // Logic maps specific trait combinations to initial domain probabilities
    // Example: High analytical -> High DSA, High creative -> High Web Dev

    return {
        'DSA': (traits.analytical * 0.7) + (traits.structured * 0.3),
        'Web Development': (traits.creative * 0.6) + (traits.practical * 0.4),
        'Systems': (traits.analytical * 0.5) + (traits.practical * 0.5),
        'Machine Learning': (traits.analytical * 0.8) + (traits.creative * 0.2)
    };
}
