import { Question } from '../types';

export const mockQuestions: Question[] = [
    {
        id: 'q1',
        domain: 'DSA',
        concept: 'Arrays',
        difficulty: 'Easy',
        bloomLevel: 'Understand',
        attribute: 'Problem solving',
        type: 'MCQ',
        content: 'Which data structure stores elements in contiguous memory locations?',
        options: ['Linked List', 'Array', 'Tree', 'Graph'],
        correctAnswer: 'Array'
    },
    {
        id: 'q2',
        domain: 'Web Development',
        concept: 'DOM',
        difficulty: 'Medium',
        bloomLevel: 'Apply',
        attribute: 'Design',
        type: 'MCQ',
        content: 'Which method is used to attach an event handler to a document element safely?',
        options: ['attachEvent', 'addEventListener', 'onEvent', 'listen'],
        correctAnswer: 'addEventListener'
    },
    {
        id: 'q3',
        domain: 'Machine Learning',
        concept: 'Overfitting',
        difficulty: 'Medium',
        bloomLevel: 'Apply',
        attribute: 'Analysis',
        type: 'MCQ',
        content: 'Which technique is primarily used to prevent overfitting in neural networks?',
        options: ['Gradient Descent', 'Dropout', 'Backpropagation', 'Activation Functions'],
        correctAnswer: 'Dropout'
    },
    {
        id: 'q4',
        domain: 'Systems',
        concept: 'Caching',
        difficulty: 'Medium',
        bloomLevel: 'Understand',
        attribute: 'Design',
        type: 'MCQ',
        content: 'What is the main purpose of a cache in system architecture?',
        options: ['Persistent storage', 'To reduce data access latency', 'Network routing', 'Security encryption'],
        correctAnswer: 'To reduce data access latency'
    },
    {
        id: 'q5',
        domain: 'DSA',
        concept: 'Graphs',
        difficulty: 'Hard',
        bloomLevel: 'Analyze',
        attribute: 'Problem solving',
        type: 'MCQ',
        content: 'In Dijkstra\'s algorithm, what data structure is best used to extract the minimum distance node efficiently?',
        options: ['Stack', 'Queue', 'Priority Queue / Min Heap', 'Linked List'],
        correctAnswer: 'Priority Queue / Min Heap'
    },
    {
        id: 'q6',
        domain: 'Web Development',
        concept: 'Performance',
        difficulty: 'Hard',
        bloomLevel: 'Analyze',
        attribute: 'Analysis',
        type: 'MCQ',
        content: 'Why does adding `<script defer>` improve page load performance compared to a standard `<script>` tag in the head?',
        options: ['It executes the script synchronously before parsing HTML.', 'It downloads the script in parallel and executes it after HTML parsing.', 'It stops HTML parsing completely until downloaded.', 'It caches the script permanently in the browser.'],
        correctAnswer: 'It downloads the script in parallel and executes it after HTML parsing.'
    }
];

export const personalityQuestions = [
    {
        id: 'p1',
        text: 'When approaching a new problem, I prefer to break it down into logical steps before acting.',
        trait: 'analytical' as const
    },
    {
        id: 'p2',
        text: 'I enjoy designing intuitive interfaces and focusing on the aesthetic feel of a project.',
        trait: 'creative' as const
    },
    {
        id: 'p3',
        text: 'I care more about how the system scales under load than making it look pretty.',
        trait: 'structured' as const
    },
    {
        id: 'p4',
        text: 'I love trying out new frameworks and building tangible prototypes fast.',
        trait: 'practical' as const
    }
];
