# Engineering Career Assessment System

### (Personality + Adaptive Quiz Architecture)

---

## Overview

This system evaluates users through a combination of:

- Personality Assessment (Stage 1)
- Adaptive Quiz Engine (Stage 2)

It dynamically identifies the most suitable engineering domains and roles by combining:

- Personality traits
- Concept-level performance
- Adaptive belief modeling (BKT)

---

## High-Level Flow

User
↓
Personality Assessment
↓
Adaptive Quiz Engine
↓
Evaluation + BKT Engine
↓
Profiling Engine
↓
Recommendation Engine
↓
Dashboard

---

## 1. Personality Assessment Layer (Stage 1)

### Input

- Questionnaire (RIASEC-inspired + engineering-specific traits)

### Trait Extraction Engine

Maps responses into:

- Analytical inclination
- Creativity
- Practical vs Theoretical preference
- Team vs Individual preference
- Risk-taking vs Structured mindset

### Output

- Personality Vector
- Initial Domain Priors (used to guide quiz starting point)

- Example:
  Analytical: High
  Creative: Medium
  Practical: High

- Boost probability for: DSA, Systems

---

## **Bloom’s Taxonomy Integration**

Questions are structured across levels inspired by academic systems like **Visvesvaraya Technological University (VTU)**:

- Remember
- Understand
- Apply
- Analyze
- Evaluate
- Create

This ensures:

- Not just correctness
- But **depth of understanding**

---

## **Washington Accord Integration**

The assessment is aligned with **Washington Accord Graduate Attributes (PO1–PO12)** to ensure evaluation beyond theoretical knowledge.

The quiz specifically focuses on:

- **PO1 – Engineering Knowledge**
- **PO2 – Problem Analysis**
- **PO3 – Design / Development of Solutions**
- **PO4 – Investigation of Problems**
- **PO5 – Modern Tool Usage**
- **PO8 – Ethics**

This ensures:

- Not just problem-solving ability
- But **real-world engineering competency**

- Not just technical knowledge
- But **decision-making, design thinking, and professional responsibility**

---

## 2. Adaptive Quiz Engine (Stage 2 Core)

### Domain Space

- DSA
- Web Development
- Machine Learning
- Systems

---

### Question Bank

Each question is tagged with:

- Domain
- Concept
- Difficulty (Easy / Medium / Hard)
- Bloom’s Level
  - Understand
  - Apply
  - Analyze
- Attribute
  - Problem Solving
  - Design
  - Analysis
  - Communication
- Type
  - MCQ
  - Subjective

---

### Question Flow Controller

#### Phase 1: Broad Filtering

- 1–2 MCQs per domain
- Medium difficulty
- Goal: eliminate weak domains

#### Phase 2: Domain Shortlisting

Select top 2–3 domains based on:

- Quiz performance
- Personality priors

#### Phase 3: Deep Evaluation

- Focus only on shortlisted domains
- Use:
  - MCQs (Apply level)
  - Subjective (Analyze level)

---

```text
                 START
                   ↓
     ┌──────────────────────────────┐
     │ Round 1: Domain Screening    │
     │ 4 Domains × 4–5 Questions    │
     │ (Mixed subjects inside)      │
     │ Bloom: L1–L2                 │
     │ WA: PO1                      │
     └──────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Score Each Domain            │
     │ Rank Domains                 │
     └──────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Select Top 3 Domains         │
     └──────────────────────────────┘
                   ↓
     ┌────────────────────────────────────┐
     │ Round 2: Adaptive Domain Expansion │
     │ - If strong → more questions       │
     │ - If weak → reduce/stop            │
     │ Bloom: L3–L4                       │
     │ WA: PO2, PO5                       │
     └────────────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Narrow to Top 2 Domains      │
     └──────────────────────────────┘
                   ↓
     ┌────────────────────────────────────┐
     │ Round 3: Advanced Domain Testing   │
     │ Case-based / complex problems      │
     │ Bloom: L4–L5                       │
     │ WA: PO3, PO4                       │
     └────────────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Narrow to Best Domain        │
     └──────────────────────────────┘
                   ↓
     ┌────────────────────────────────────┐
     │ Final Round: Domain Mastery        │
     │ Design / open-ended / real-world   │
     │ Bloom: L6                          │
     │ WA: PO3, PO8                       │
     └────────────────────────────────────┘
                   ↓
     ┌──────────────────────────────┐
     │ Final Output                 │
     │ - Best Domain                │
     │ - Skill Depth Level          │
     │ - WA Attribute Profile       │
     └──────────────────────────────┘
                   ↓
                  END
```

### Adaptive Logic

Next question depends on:

- Previous answer correctness
- Current belief (BKT)
- Bloom’s progression

Rules:

- Correct → Increase difficulty / Bloom level
- Incorrect → Decrease level or repeat concept
- Uncertain → Re-test similar concept

---

## 3. Evaluation Engine

### MCQ Evaluator

- Binary correctness
- Fast scoring

### Subjective Evaluator (LLM-based)

Evaluates:

- Concept understanding
- Logical structure
- Explanation quality

Outputs:

- Score
- Concept correctness
- Attribute mapping (e.g., communication)

---

### Concept Mapper

Maps responses to:

- Concept
- Domain
- Attribute

---

## 4. BKT Engine (Belief System)

### Belief State

Maintains probability for:

- Each concept
- Each domain
- Each attribute

---

### Update Mechanism

After every answer:

- Correct → Increase belief
- Incorrect → Decrease belief

Also accounts for:

- Guessing
- Slipping

---

### Usage

- Drives question selection
- Determines confidence levels
- Controls stopping logic

---

### Stopping Criteria

Stop when:

- Belief > threshold (strong skill)
- Belief < threshold (weak skill)
- Domain ranking stabilizes

---

## 5. Profiling Engine

### Domain Profile

- Confidence score per domain

### Concept Profile

- Strong vs weak concepts

### Attribute Profile

- Problem solving
- Design
- Analysis
- Communication

---

### Personality + Skill Fusion

Combines:

- Personality vector (Stage 2)
- Skill confidence (Stage 3)

---

## 6. Recommendation Engine

### Role Mapping

Domain + Attributes + Personality → Roles

Examples:

- High analytical + DSA → Backend / SDE
- High creativity + Web → Frontend
- High analysis + ML → ML roles

---

### Skill Gap Detection

- Low-belief concepts
- Weak attributes

---

### Output

- Best-fit domains
- Role suggestions
- Improvement areas

---

## 7. Output Dashboard

Displays:

### Domain Fit

- Ranked domains with confidence

### Personality Insights

- Trait breakdown

### Skill Insights

- Concept-level strengths & weaknesses

### Attribute Breakdown

- Engineering competencies

### Recommendations

- Roles
- Next steps

---

## 8. Data Layer

### Question Database

- Fully tagged questions

### User Response Store

- Answers + evaluations

### Belief Store

- BKT probabilities per user

### Personality Store

- Trait vectors

---

## Final System Summary

- Personality Layer → Sets initial direction
- Adaptive Quiz Engine → Explores & narrows domains
- Evaluation Engine → Interprets responses
- BKT Engine → Tracks confidence dynamically
- Profiling Engine → Builds multi-dimensional profile
- Recommendation Engine → Outputs roles and insights
