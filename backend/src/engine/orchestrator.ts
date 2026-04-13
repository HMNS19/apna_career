import { BeliefState, Domain, QuizPhase } from '../types';

/**
 * Quiz flow orchestrator logic 
 * Handles transitions strictly defined in the architecture.
 */

export function rankAndNarrowDomains(beliefs: BeliefState[], currentPhase: QuizPhase, allDomains: Domain[]): { nextPhase: QuizPhase | null, activeDomains: Domain[] } {
    // Aggregate BKT domain beliefs
    const domainScores: { [key in Domain]?: number } = {};
    for (const b of beliefs) {
        if (b.conceptType === 'Domain') {
            domainScores[b.concept as Domain] = b.probability;
        }
    }

    // Sort domains by highest belief
    const sorted = allDomains.sort((a, b) => (domainScores[b] || 0.5) - (domainScores[a] || 0.5));

    if (currentPhase === 'Screening') {     // To Expansion (Top 3)
        return { nextPhase: 'Expansion', activeDomains: sorted.slice(0, 3) };
    }

    if (currentPhase === 'Expansion') {     // To Advanced (Top 2)
        return { nextPhase: 'Advanced', activeDomains: sorted.slice(0, 2) };
    }

    if (currentPhase === 'Advanced') {      // To Mastery (Top 1)
        return { nextPhase: 'Mastery', activeDomains: sorted.slice(0, 1) };
    }

    return { nextPhase: null, activeDomains: sorted.slice(0, 1) };
}
