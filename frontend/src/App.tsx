import React, { useState } from 'react';
import { mockQuestions, personalityQuestions } from '../data/questions';
import { BeliefState, Domain, DomainPriors, PersonalityTraits, Question, UserProfile, QuizPhase } from '../types';
import { extractTraits, calculateDomainPriors, PersonalityAnswer } from '../engine/personality';
import { selectNextQuestion } from '../engine/adaptiveSelector';
import { evaluateMCQ } from '../engine/evaluation';
import { updateBelief } from '../engine/bkt';
import { generateProfile } from '../engine/profiling';
import { generateRecommendations, RecommendationResult } from '../engine/recommendation';
import { rankAndNarrowDomains } from '../engine/orchestrator';

type Stage = 'LANDING' | 'PERSONALITY' | 'QUIZ' | 'RESULTS';

export default function App() {
  const [stage, setStage] = useState<Stage>('LANDING');

  // Personality State
  const [pIndex, setPIndex] = useState(0);
  const [pAnswers, setPAnswers] = useState<PersonalityAnswer[]>([]);
  const [traits, setTraits] = useState<PersonalityTraits | null>(null);
  const [priors, setPriors] = useState<DomainPriors>({});

  // Orchestration & Adaptive Quiz State
  const [phase, setPhase] = useState<QuizPhase>('Screening');
  const [activeDomains, setActiveDomains] = useState<Domain[]>(['DSA', 'Web Development', 'Machine Learning', 'Systems']);
  const [phaseQCount, setPhaseQCount] = useState(0);

  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(new Set());
  const [beliefs, setBeliefs] = useState<BeliefState[]>([]);
  const [latestIsCorrect, setLatestIsCorrect] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Results State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const QUESTIONS_PER_PHASE = 3;

  const startPersonality = () => setStage('PERSONALITY');

  const handlePersonalityAnswer = (score: number) => {
    const newAnswers = [...pAnswers, { trait: personalityQuestions[pIndex].trait, score }];
    setPAnswers(newAnswers);

    if (pIndex + 1 < personalityQuestions.length) setPIndex(pIndex + 1);
    else {
      const calculatedTraits = extractTraits(newAnswers);
      const calculatedPriors = calculateDomainPriors(calculatedTraits);
      setTraits(calculatedTraits);
      setPriors(calculatedPriors);

      const firstQ = selectNextQuestion(mockQuestions, {
        askedQuestionIds: new Set(),
        beliefs: [],
        latestIsCorrect: false,
        lastQuestion: null,
        phase: 'Screening',
        activeDomains: ['DSA', 'Web Development', 'Machine Learning', 'Systems']
      });

      if (firstQ) {
        setCurrentQuestion(firstQ);
        setAskedQuestionIds(new Set([firstQ.id]));
      }
      setStage('QUIZ');
    }
  };

  const traversePhase = (currentBeliefs: BeliefState[], currentPhase: QuizPhase) => {
    const { nextPhase, activeDomains: newDomains } = rankAndNarrowDomains(currentBeliefs, currentPhase, ['DSA', 'Web Development', 'Machine Learning', 'Systems']);
    if (!nextPhase) {
      finishAssessment(currentBeliefs, newDomains[0]);
      return;
    }

    setPhase(nextPhase);
    setActiveDomains(newDomains);
    setPhaseQCount(0);

    const nextQ = selectNextQuestion(mockQuestions, {
      askedQuestionIds,
      beliefs: currentBeliefs,
      latestIsCorrect, // maintain context
      lastQuestion,
      phase: nextPhase,
      activeDomains: newDomains
    });

    if (nextQ) {
      setCurrentQuestion(nextQ);
      setAskedQuestionIds(new Set([...askedQuestionIds, nextQ.id]));
    } else {
      finishAssessment(currentBeliefs, newDomains[0]);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (!currentQuestion) return;

    let isCorrect = false;
    if (currentQuestion.type === 'MCQ') {
      isCorrect = evaluateMCQ(currentQuestion, answer);
    } else {
      // Mock LLM subject evaluation
      isCorrect = answer.length > 10;
    }

    // BKT Core integration (Update Concept, Domain, Attribute independently)
    const updateTargetBelief = (target: string, type: 'Concept' | 'Domain' | 'Attribute') => {
      const existing = beliefs.find(b => b.concept === target);
      const priorProb = existing ? existing.probability : 0.5;
      return { userId: 'user1', concept: target, conceptType: type, probability: updateBelief(priorProb, isCorrect) };
    };

    const newBeliefs = beliefs.filter(b => b.concept !== currentQuestion.concept && b.concept !== currentQuestion.domain && b.concept !== currentQuestion.attribute);
    const updatedBeliefs = [
      ...newBeliefs,
      updateTargetBelief(currentQuestion.concept, 'Concept'),
      updateTargetBelief(currentQuestion.domain, 'Domain'),
      updateTargetBelief(currentQuestion.attribute, 'Attribute')
    ];

    setBeliefs(updatedBeliefs);
    setLatestIsCorrect(isCorrect);
    setLastQuestion(currentQuestion);

    if (phaseQCount + 1 >= QUESTIONS_PER_PHASE) {
      // Trigger phase transition hook
      traversePhase(updatedBeliefs, phase);
    } else {
      // Continue inside same phase
      setPhaseQCount(phaseQCount + 1);
      const nextQ = selectNextQuestion(mockQuestions, {
        askedQuestionIds,
        beliefs: updatedBeliefs,
        latestIsCorrect: isCorrect,
        lastQuestion: currentQuestion,
        phase,
        activeDomains
      });

      if (nextQ) {
        setCurrentQuestion(nextQ);
        setAskedQuestionIds(new Set([...askedQuestionIds, nextQ.id]));
      } else {
        traversePhase(updatedBeliefs, phase);
      }
    }
  };

  const finishAssessment = (finalBeliefs: BeliefState[], bestDomain: Domain) => {
    if (!traits) return;
    const userProfile = generateProfile('user1', finalBeliefs, traits, priors, bestDomain);
    const recs = generateRecommendations(userProfile);

    setProfile(userProfile);
    setRecommendation(recs);
    setStage('RESULTS');
  };

  return (
    <div className="app-container">
      {stage === 'LANDING' && (
        <div className="glass-card text-center" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <div className="badge">Engineering Architecture V2</div>
          <h1>Washington Accord Aligned Engineering Assessment</h1>
          <p>
            An adaptive 8-phase assessment fusing BKT algorithms with Bloom's Taxonomy.
          </p>
          <button className="btn-primary" onClick={startPersonality}>Begin Assessment</button>
        </div>
      )}

      {stage === 'PERSONALITY' && (
        <div className="glass-card fade-in">
          <div className="badge">Phase 1: Personality Trait Extractor</div>
          <div className="progress-container"><div className="progress-bar" style={{ width: `${(pIndex / personalityQuestions.length) * 100}%` }}></div></div>
          <h2>{personalityQuestions[pIndex].text}</h2>
          <div className="options-grid">
            <button className="option-btn" onClick={() => handlePersonalityAnswer(1.0)}>Strongly Agree</button>
            <button className="option-btn" onClick={() => handlePersonalityAnswer(0.0)}>Strongly Disagree</button>
          </div>
        </div>
      )}

      {stage === 'QUIZ' && currentQuestion && (
        <div className="glass-card fade-in">
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#3b82f633', color: '#60a5fa' }}>{phase} Round</span>
            <span className="badge" style={{ background: '#f59e0b33', color: '#fbbf24' }}>Bloom: {currentQuestion.bloomLevel}</span>
            <span className="badge" style={{ background: '#10b98133', color: '#34d399' }}>WA: {currentQuestion.attribute}</span>
          </div>

          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {currentQuestion.domain} • {currentQuestion.concept} • {currentQuestion.difficulty}
          </p>

          <h2 style={{ marginTop: '1rem' }}>{currentQuestion.content}</h2>

          {currentQuestion.type === 'MCQ' ? (
            <div className="options-grid">
              {currentQuestion.options?.map((opt, i) => (
                <button key={i} className="option-btn" onClick={() => handleQuizAnswer(opt)}>{opt}</button>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                placeholder="Write your analytical response based on system design..."
                style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuizAnswer((e.target as any).value) }}
              />
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Press Enter to submit.</p>
            </div>
          )}
        </div>
      )}

      {stage === 'RESULTS' && profile && (
        <div className="glass-card fade-in">
          <div className="badge">Final Evaluation via BKT Base</div>
          <h1>{recommendation?.bestDomain} Specialist</h1>

          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-title">Suggested Roles</div>
              <div style={{ marginTop: '1rem' }}>{recommendation?.recommendedRoles.map(r => <span key={r} className="role-pill">{r}</span>)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Washington Accord Metrics</div>
              {Object.entries(profile.attributeScores).map(([po, score]) => (
                <div key={po} className="skill-row"><span>{po} Assessment</span><span style={{ color: 'var(--success)' }}>{Math.round(score * 100)}%</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
