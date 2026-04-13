/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * BKT is a hidden Markov model that infers a student's knowledge state 
 * based on their correct and incorrect answers.
 * 
 * Belief (Probability of mastery): The likelihood that the user understands the concept.
 * Guess: Probability they answer correctly even if they don't know it.
 * Slip: Probability they answer incorrectly even if they know it.
 * Transit/Learning Rate: Probability of learning the concept after a single practice opportunity.
 */

export interface BKTParams {
    guess: number;
    slip: number;
    transit: number; // probability of transitioning from not knowing to knowing
}

const DEFAULT_BKT_PARAMS: BKTParams = {
    guess: 0.25, // For a 4-option MCQ
    slip: 0.1,   // 10% chance of making a silly mistake
    transit: 0.1 // Assume 10% learning rate per interaction
};

/**
 * Updates the user's belief of mastery for a specific concept based on their latest answer.
 * 
 * @param currentBelief - Prior probability of knowing the concept (0 to 1)
 * @param isCorrect - Whether the user answered the latest question correctly
 * @param params - BKT parameters (guess, slip, transit)
 * @returns Updated belief (Posterior probability)
 */
export function updateBelief(
    currentBelief: number,
    isCorrect: boolean,
    params: BKTParams = DEFAULT_BKT_PARAMS
): number {
    const { guess, slip, transit } = params;

    let newBelief = 0;

    if (isCorrect) {
        // P(L_t | Correct) = P(Correct | L_t) * P(L_t) / P(Correct)
        const probCorrectGivenKnown = 1 - slip;
        const probCorrectGivenUnknown = guess;

        // Overall probability of a correct answer
        const probCorrectOverall =
            (currentBelief * probCorrectGivenKnown) +
            ((1 - currentBelief) * probCorrectGivenUnknown);

        // Posterior knowing they got it right
        const posterior = (currentBelief * probCorrectGivenKnown) / probCorrectOverall;

        // Add learning transition: P(L_t+1) = Posterior + (1 - Posterior) * Transit
        newBelief = posterior + (1 - posterior) * transit;
    } else {
        // P(L_t | Incorrect) = P(Incorrect | L_t) * P(L_t) / P(Incorrect)
        const probIncorrectGivenKnown = slip;
        const probIncorrectGivenUnknown = 1 - guess;

        const probIncorrectOverall =
            (currentBelief * probIncorrectGivenKnown) +
            ((1 - currentBelief) * probIncorrectGivenUnknown);

        const posterior = (currentBelief * probIncorrectGivenKnown) / probIncorrectOverall;

        // Add learning transition
        newBelief = posterior + (1 - posterior) * transit;
    }

    // Ensure bounds
    return Math.max(0, Math.min(1, newBelief));
}
