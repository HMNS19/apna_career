import React, { useState, useEffect } from 'react';
import { mockQuestions, personalityQuestions } from '../data/questions';
import { BeliefState, Domain, DomainPriors, PersonalityTraits, Question, UserProfile } from '../types';
import { extractTraits, calculateDomainPriors, PersonalityAnswer } from '../engine/personality';
import { selectNextQuestion } from '../engine/adaptiveSelector';
import { evaluateMCQ } from '../engine/evaluation';
import { updateBelief } from '../engine/bkt';
import { generateProfile } from '../engine/profiling';
import { generateRecommendations, RecommendationResult } from '../engine/recommendation';

type Stage = 'LANDING' | 'PERSONALITY' | 'ADAPTIVE_QUIZ' | 'RESULTS';

export default function App() {
  const [stage, setStage] = useState<Stage>('LANDING');

  // Personality State
  const [pIndex, setPIndex] = useState(0);
  const [pAnswers, setPAnswers] = useState<PersonalityAnswer[]>([]);
  const [traits, setTraits] = useState<PersonalityTraits | null>(null);
  const [priors, setPriors] = useState<DomainPriors>({});

  // Quiz State
  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [beliefs, setBeliefs] = useState<BeliefState[]>([]);
  const [latestIsCorrect, setLatestIsCorrect] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [quizCount, setQuizCount] = useState(0);
  const MAX_QUIZ_QUESTIONS = 5;

  // Results State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const startPersonality = () => setStage('PERSONALITY');

  const handlePersonalityAnswer = (score: number) => {
    const newAnswers = [
      ...pAnswers,
      { questionId: personalityQuestions[pIndex].id, trait: personalityQuestions[pIndex].trait, score }
    ];
    setPAnswers(newAnswers);

    if (pIndex + 1 < personalityQuestions.length) {
      setPIndex(pIndex + 1);
    } else {
      // Analyze personality
      const calculatedTraits = extractTraits(newAnswers);
      const calculatedPriors = calculateDomainPriors(calculatedTraits);
      setTraits(calculatedTraits);
      setPriors(calculatedPriors);

      // Init Quiz
      startQuiz(calculatedTraits, calculatedPriors);
    }
  };

  const startQuiz = (traits: PersonalityTraits, priors: DomainPriors) => {
    // Sort domains by prior to shortlist
    const sortedDomains = (Object.keys(priors) as Domain[]).sort((a, b) => (priors[b] || 0) - (priors[a] || 0));
    const shortlisted = sortedDomains.slice(0, 2);

    const firstQ = selectNextQuestion(mockQuestions, {
      askedQuestionIds: new Set(),
      beliefs: [],
      latestIsCorrect: false,
      lastQuestion: null
    }, shortlisted);

    if (firstQ) {
      setCurrentQuestion(firstQ);
      setAskedQuestionIds(new Set([firstQ.id]));
    }
    setStage('ADAPTIVE_QUIZ');
  };

  const handleQuizAnswer = (answer: string) => {
    if (!currentQuestion) return;

    // Evaluate
    const isCorrect = evaluateMCQ(currentQuestion, answer);

    // Update BKT Belief
    const existingBelief = beliefs.find(b => b.concept === currentQuestion.concept);
    const priorProb = existingBelief ? existingBelief.probability : 0.5; // default unknown
    const newProb = updateBelief(priorProb, isCorrect);

    const updatedBeliefs = [...beliefs.filter(b => b.concept !== currentQuestion.concept), {
      userId: 'user1',
      concept: currentQuestion.concept,
      probability: newProb,
      conceptType: 'Concept' as const
    }];

    // Domain belief heuristic based on response
    const existingDomainBelief = updatedBeliefs.find(b => b.concept === currentQuestion.domain);
    const dPrior = existingDomainBelief ? existingDomainBelief.probability : 0.5;
    const dNewProb = updateBelief(dPrior, isCorrect);

    const finalBeliefs = [...updatedBeliefs.filter(b => b.concept !== currentQuestion.domain), {
      userId: 'user1',
      concept: currentQuestion.domain,
      probability: dNewProb,
      conceptType: 'Domain' as const
    }];

    setBeliefs(finalBeliefs);
    setLatestIsCorrect(isCorrect);
    setLastQuestion(currentQuestion);
    setQuizCount(quizCount + 1);

    if (quizCount + 1 >= MAX_QUIZ_QUESTIONS) {
      finishAssessment(finalBeliefs);
    } else {
      // Pick next
      const newAsked = new Set(askedQuestionIds);
      const sortedDomains = (Object.keys(priors) as Domain[]).sort((a, b) => (priors[b] || 0) - (priors[a] || 0));
      const shortlisted = sortedDomains.slice(0, 2);

      const nextQ = selectNextQuestion(mockQuestions, {
        askedQuestionIds: newAsked,
        beliefs: finalBeliefs,
        latestIsCorrect: isCorrect,
        lastQuestion: currentQuestion
      }, shortlisted);

      if (nextQ) {
        setCurrentQuestion(nextQ);
        newAsked.add(nextQ.id);
        setAskedQuestionIds(newAsked);
      } else {
        finishAssessment(finalBeliefs);
      }
    }
  };

  const finishAssessment = (finalBeliefs: BeliefState[]) => {
    if (!traits) return;
    const userProfile = generateProfile('user1', finalBeliefs, traits, priors);
    const recs = generateRecommendations(userProfile);

    setProfile(userProfile);
    setRecommendation(recs);
    setStage('RESULTS');
  };

  return (
    <div className="app-container">
      {stage === 'LANDING' && (
        <div className="glass-card text-center" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <div className="badge">AI Engineered</div>
          <h1>Discover Your Engineering Identity</h1>
          <p>
            An adaptive assessment that fuses behavioral traits with technical precision to recommend your optimal career role.
          </p>
          <button className="btn-primary" onClick={startPersonality}>
            Begin Assessment
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      )}

      {stage === 'PERSONALITY' && (
        <div className="glass-card fade-in">
          <div className="badge">Stage 1: Personality</div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${((pIndex) / personalityQuestions.length) * 100}%` }}></div>
          </div>
          <h2>{personalityQuestions[pIndex].text}</h2>
          <div className="options-grid">
            <button className="option-btn" onClick={() => handlePersonalityAnswer(1.0)}>Strongly Agree</button>
            <button className="option-btn" onClick={() => handlePersonalityAnswer(0.7)}>Agree</button>
            <button className="option-btn" onClick={() => handlePersonalityAnswer(0.3)}>Disagree</button>
            <button className="option-btn" onClick={() => handlePersonalityAnswer(0.0)}>Strongly Disagree</button>
          </div>
        </div>
      )}

      {stage === 'ADAPTIVE_QUIZ' && currentQuestion && (
        <div className="glass-card fade-in">
          <span className="badge">{currentQuestion.domain}</span>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}>{currentQuestion.difficulty}</span>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(quizCount / MAX_QUIZ_QUESTIONS) * 100}%` }}></div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Testing: {currentQuestion.concept}
          </p>
          <h2>{currentQuestion.content}</h2>
          <div className="options-grid">
            {currentQuestion.options?.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => handleQuizAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'RESULTS' && profile && recommendation && (
        <div className="glass-card fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="badge">Final Profile</div>
          <h1>Your Technical Persona</h1>

          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-title">Top Suggested Roles</div>
              <div style={{ marginTop: '1rem' }}>
                {recommendation.recommendedRoles.map(r => (
                  <span key={r} className="role-pill">{r}</span>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Top Technical Domains</div>
              {Object.entries(profile.domainScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([dom, score]) => (
                  <div key={dom} className="skill-row" style={{ marginTop: '0.8rem' }}>
                    <span>{dom}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{Math.round(score * 100)}%</span>
                  </div>
                ))}
            </div>

            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-title" style={{ marginBottom: '1rem' }}>Identified Skill Gaps & Action Items</div>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                {recommendation.improvements.length > 0 ? recommendation.improvements.map((imp, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{imp}</li>
                )) : <li>No critical skill gaps found! Outstanding performance.</li>}
              </ul>
            </div>
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Retake Assessment</button>
          </div>
        </div>
      )}
    </div>
  );
}
