import { BeliefState, DomainPriors, PersonalityTraits, UserProfile } from '../types';

/**
 * Profiling Engine
 * 
 * Aggregates BKT Beliefs, Domain Priors, and Personality Traits
 * to build a final multidimensional skill profile.
 */

export function generateProfile(
    userId: string,
    beliefs: BeliefState[],
    personality: PersonalityTraits,
    priors: DomainPriors
): UserProfile {
    const domainScores: Record<string, number> = {};
    const conceptStrengths: Record<string, number> = {};
    const attributeScores: Record<string, number> = {};

    // Segregate beliefs into distinct buckets
    for (const belief of beliefs) {
        if (belief.conceptType === 'Domain') {
            // fuse BKT domain belief with Personality prior
            const prior = (priors as any)[belief.concept] || 0.5;
            // Simple fusion logic: average of actual evaluated skill and initial prior
            domainScores[belief.concept] = (belief.probability * 0.7) + (prior * 0.3);
        } else if (belief.conceptType === 'Concept') {
            conceptStrengths[belief.concept] = belief.probability;
        } else if (belief.conceptType === 'Attribute') {
            attributeScores[belief.concept] = belief.probability;
        }
    }

    return {
        userId,
        personality,
        domainPriors: priors,
        domainScores,
        conceptStrengths,
        attributeScores
    };
}
