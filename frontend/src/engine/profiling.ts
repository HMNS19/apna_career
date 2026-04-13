import { BeliefState, DomainPriors, PersonalityTraits, UserProfile, Domain } from '../types';

export function generateProfile(
    userId: string,
    beliefs: BeliefState[],
    personality: PersonalityTraits,
    priors: DomainPriors,
    bestDomainFromQuiz: Domain | null
): UserProfile {
    const domainScores: Record<string, number> = {};
    const conceptStrengths: Record<string, number> = {};
    const attributeScores: Record<string, number> = {};

    for (const belief of beliefs) {
        if (belief.conceptType === 'Domain') {
            const prior = (priors as any)[belief.concept] || 0.5;
            domainScores[belief.concept] = (belief.probability * 0.7) + (prior * 0.3);
        } else if (belief.conceptType === 'Concept') {
            conceptStrengths[belief.concept] = belief.probability;
        } else if (belief.conceptType === 'Attribute') {
            attributeScores[belief.concept] = belief.probability;
        }
    }

    return {
        userId,
        bestDomain: bestDomainFromQuiz,
        personality,
        domainPriors: priors,
        domainScores,
        conceptStrengths,
        attributeScores
    };
}
