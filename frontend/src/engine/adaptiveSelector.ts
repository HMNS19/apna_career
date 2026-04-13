import { Question, BeliefState, Domain } from '../types';

/**
 * Adaptive Question Selector Engine
 * 
 * Responsible for selecting the next best question based on current beliefs,
 * performance, and Bloom's level progression.
 */

interface SelectorContext {
    askedQuestionIds: Set<string>;
    beliefs: BeliefState[];
    latestIsCorrect: boolean;
    lastQuestion: Question | null;
}

export function selectNextQuestion(
    questionBank: Question[],
    context: SelectorContext,
    shortlistedDomains: Domain[]
): Question | null {
    // Filter out already asked
    let available = questionBank.filter(q => !context.askedQuestionIds.has(q.id));

    if (available.length === 0) return null;

    // Filter to shortlisted domains
    if (shortlistedDomains.length > 0) {
        available = available.filter(q => shortlistedDomains.includes(q.domain));
    }

    // If no last question (first time), pick medium MCQ from prioritized domain
    if (!context.lastQuestion) {
        const firstQ = available.find(q => q.difficulty === 'Medium' && q.type === 'MCQ');
        return firstQ || available[0];
    }

    const { difficulty, bloomLevel, concept } = context.lastQuestion;

    // Decide next Bloom's level & Difficulty
    let targetDifficulty = difficulty;
    let targetBloom = bloomLevel;

    if (context.latestIsCorrect) {
        // Escalate
        if (difficulty === 'Easy') targetDifficulty = 'Medium';
        else if (difficulty === 'Medium') targetDifficulty = 'Hard';

        if (bloomLevel === 'Understand') targetBloom = 'Apply';
        else if (bloomLevel === 'Apply') targetBloom = 'Analyze';
    } else {
        // De-escalate or repeat concept
        if (difficulty === 'Hard') targetDifficulty = 'Medium';
        else if (difficulty === 'Medium') targetDifficulty = 'Easy';
    }

    // Attempt to find a question matching target criteria
    let candidates = available.filter(q =>
        (context.latestIsCorrect ? q.concept !== concept : q.concept === concept) &&
        q.difficulty === targetDifficulty &&
        q.bloomLevel === targetBloom
    );

    if (candidates.length === 0) {
        // Relax Bloom's level constraint
        candidates = available.filter(q => q.difficulty === targetDifficulty);
    }

    if (candidates.length === 0) {
        // Keep asking anything available from shortlisted domains
        candidates = available;
    }

    // Pick the first valid candidate
    return candidates[0] || null;
}
