import { Question, Response } from '../types';

/**
 * Evaluation Engine
 * 
 * Scores answers for MCQs securely. Contains a placeholder for
 * subjective evaluation via LLM processing.
 */

export function evaluateMCQ(question: Question, userAnswer: string): boolean {
    if (question.type !== 'MCQ') {
        throw new Error('evaluateMCQ called on non-MCQ question');
    }

    return question.correctAnswer?.trim().toLowerCase() === userAnswer.trim().toLowerCase();
}

/**
 * Subjective Evaluator (LLM Placeholder)
 * 
 * In production, this would call an LLM (e.g. GPT-4) to evaluate the text answer
 * on concept correctness, logical structure, and explanation quality.
 */
export async function evaluateSubjective(question: Question, userAnswer: string): Promise<{
    isCorrect: boolean;
    score: number;
    conceptUnderstanding: number;
    attributeMappingScore: number;
}> {
    // Placeholder logic for LLM simulation
    console.log(`Sending to LLM: Evaluating answer "${userAnswer}" for question "${question.content}"`);

    // Fake delay mimicking network request
    await new Promise(resolve => setTimeout(resolve, 500));

    // Heuristic mock evaluation (Length-based for demonstration)
    const score = userAnswer.length > 20 ? 0.8 : 0.4;

    return {
        isCorrect: score > 0.5,
        score,
        conceptUnderstanding: score,
        attributeMappingScore: score
    };
}
