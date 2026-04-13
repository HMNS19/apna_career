import { UserProfile } from '../types';

/**
 * Recommendation Engine
 * 
 * Uses the complete UserProfile to map skills and personality to precise roles,
 * and highlights skill gaps and improvement suggestions.
 */

export interface RecommendationResult {
    recommendedRoles: string[];
    skillGaps: string[];
    improvements: string[];
}

export function generateRecommendations(profile: UserProfile): RecommendationResult {
    const roles: string[] = [];
    const gaps: string[] = [];
    const improvements: string[] = [];

    const { domainScores, conceptStrengths, personality, attributeScores } = profile;

    // Rule 1: High Analytical + High DSA state -> Backend/SDE
    if ((domainScores['DSA'] || 0) > 0.7 && personality.analytical > 0.7) {
        roles.push('Backend Software Engineer', 'SDE I');
    }

    // Rule 2: High Web + Creative -> Frontend
    if ((domainScores['Web Development'] || 0) > 0.7 && personality.creative > 0.6) {
        roles.push('Frontend Developer', 'UI/UX Engineer');
    }

    // Rule 3: High Systems/Architecture -> Systems Engineer
    if ((domainScores['Systems'] || 0) > 0.7 && (attributeScores['Design'] || 0) > 0.7) {
        roles.push('Systems Engineer');
    }

    // Identify skill gaps
    for (const [concept, score] of Object.entries(conceptStrengths)) {
        if (score < 0.5) {
            gaps.push(concept);
            improvements.push(`Focus on foundational knowledge in ${concept}. Practice Apply-level questions.`);
        }
    }

    // Attribute gaps
    if ((attributeScores['Problem solving'] || 0) < 0.5) {
        improvements.push('Work on problem-solving exercises. Suggestion: Start with LeetCode Easy problems.');
    }

    if (roles.length === 0) {
        roles.push('General Software Developer'); // fallback
    }

    return {
        recommendedRoles: roles,
        skillGaps: gaps,
        improvements
    };
}
