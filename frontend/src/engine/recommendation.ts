import { UserProfile } from '../types';

export interface RecommendationResult {
    recommendedRoles: string[];
    skillGaps: string[];
    improvements: string[];
    bestDomain: string | null;
}

export function generateRecommendations(profile: UserProfile): RecommendationResult {
    const roles: string[] = [];
    const gaps: string[] = [];
    const improvements: string[] = [];

    const { domainScores, conceptStrengths, personality, attributeScores, bestDomain } = profile;

    // Map purely off the Final Best Domain identified by round narrowing
    if (bestDomain === 'DSA') roles.push('Backend Software Engineer', 'Algorithms Engineer');
    if (bestDomain === 'Web Development') roles.push('Frontend Developer', 'Full Stack Engineer');
    if (bestDomain === 'Systems') roles.push('Systems Architect', 'Platform Engineer');
    if (bestDomain === 'Machine Learning') roles.push('ML Engineer', 'Data Scientist');

    // Identify skill gaps in Bloom logic or WA
    for (const [concept, score] of Object.entries(conceptStrengths)) {
        if (score < 0.5) {
            gaps.push(concept);
            improvements.push(`Improve foundational depth mapping to WA Attribute areas in ${concept}.`);
        }
    }

    // Washington Accord specific mappings gap
    if ((attributeScores['PO1'] || 0) < 0.5) improvements.push('PO1 (Engineering Knowledge): Strengthen theoretical fundamentals.');
    if ((attributeScores['PO3'] || 0) < 0.5) improvements.push('PO3 (Design): Focus on architecture and system-level thinking.');

    if (roles.length === 0) roles.push('General Software Developer');

    return {
        recommendedRoles: roles,
        skillGaps: gaps,
        improvements,
        bestDomain
    };
}
