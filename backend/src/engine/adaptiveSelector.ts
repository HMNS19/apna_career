import { Question, BeliefState, Domain, QuizPhase, BloomLevel } from '../types';

/**
 * Advanced Adaptive Question Selector Engine
 * 
 * Works purely on the Phase -> Domain Restriction -> BKT mapping.
 */

export interface SelectorContext {
    askedQuestionIds: Set<string>;
    beliefs: BeliefState[];
    latestIsCorrect: boolean;
    lastQuestion: Question | null;
    phase: QuizPhase;
    activeDomains: Domain[];
}

// Helper to determine active Bloom pool per Phase
function getValidBloomLevels(phase: QuizPhase): BloomLevel[] {
    switch (phase) {
        case 'Screening': return ['Remember', 'Understand']; // L1-L2
        case 'Expansion': return ['Apply', 'Analyze']; // L3-L4
        case 'Advanced': return ['Analyze', 'Evaluate']; // L4-L5
        case 'Mastery': return ['Evaluate', 'Create']; // L6
    }
}

// BKT driven heuristic: We look for questions matching a belief window, or fallback to constraints.
export function selectNextQuestion(questionBank: Question[], context: SelectorContext): Question | null {
    // 1. Filter out seen questions and non-active domains
    let available = questionBank
        .filter(q => !context.askedQuestionIds.has(q.id))
        .filter(q => context.activeDomains.includes(q.domain));

    if (available.length === 0) return null;

    // 2. Filter by phase-allowed Bloom Levels
    const allowedBlooms = getValidBloomLevels(context.phase);
    let phaseFiltered = available.filter(q => allowedBlooms.includes(q.bloomLevel));

    // Fallback if not enough questions meet the strict Bloom criteria for this phase
    if (phaseFiltered.length === 0) phaseFiltered = available;

    // 3. Selection based on Adaptive Logic (Performance & BKT)
    // If there's no last question, just pick a baseline question for the current limits
    if (!context.lastQuestion) {
        return phaseFiltered[0]; // Could shuffle or pick lowest difficulty
    }

    const { difficulty, concept } = context.lastQuestion;
    let targetDifficulty = difficulty;

    // React to previous answer correctness (escalate/de-escalate)
    if (context.latestIsCorrect) {
        if (difficulty === 'Easy') targetDifficulty = 'Medium';
        else if (difficulty === 'Medium') targetDifficulty = 'Hard';
    } else {
        if (difficulty === 'Hard') targetDifficulty = 'Medium';
        else if (difficulty === 'Medium') targetDifficulty = 'Easy';
    }

    // 4. BKT Influence - Find concepts where belief is uncertain (0.3 to 0.7) to maximize information gain
    let uncertainConcepts = context.beliefs
        .filter(b => b.conceptType === 'Concept' && b.probability > 0.3 && b.probability < 0.7)
        .map(b => b.concept);

    let candidates = phaseFiltered.filter(q => q.difficulty === targetDifficulty);

    // If latest was uncertain/incorrect, prefer re-testing the concept or uncertain ones
    if (!context.latestIsCorrect) {
        const conceptCandidates = candidates.filter(q => q.concept === concept || uncertainConcepts.includes(q.concept));
        if (conceptCandidates.length > 0) candidates = conceptCandidates;
    } else {
        // Correct answer -> move to under-tested or new concepts
        const newConcepts = candidates.filter(q => q.concept !== concept);
        if (newConcepts.length > 0) candidates = newConcepts;
    }

    // Fallback chain
    if (candidates.length === 0) candidates = phaseFiltered.filter(q => q.difficulty === (context.latestIsCorrect ? 'Hard' : 'Easy'));
    if (candidates.length === 0) candidates = phaseFiltered;

    return candidates[0] || null;
}
