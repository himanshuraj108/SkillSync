import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateMatchExplanation = async (userA, userB, compatibilityData) => {
    try {
        const prompt = `Explain in 2-3 sentences why these users are a good match.
User A teaches: ${compatibilityData.best_pair.user_a_teaches || 'none'}.
User B teaches: ${compatibilityData.best_pair.user_b_teaches || 'none'}.
Compatibility Score: ${compatibilityData.score}%.`;

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant'
        });

        return response.choices[0]?.message?.content || 'These users have complementary skills and matching availability, making them a great fit for a skill swap.';
    } catch (error) {
        return 'These users have complementary skills and matching availability, making them a great fit for a skill swap.';
    }
};

export const generateLearningRoadmap = async (userId, skill, currentLevel, weeklyHours, completedSessions, weakTopics) => {
    try {
        const prompt = `Create a learning roadmap for a ${currentLevel} learning ${skill}.
They study ${weeklyHours} hours/week, have done ${completedSessions} sessions.
Weak topics: ${weakTopics.map(w => w.topic).join(', ')}.
Return ONLY valid JSON in this format: { "steps": [{ "step": 1, "title": "...", "description": "...", "estimated_hours": 5, "resources": [{"title": "...", "url": "..."}] }] }`;

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0]?.message?.content);
    } catch (error) {
        return { steps: [] };
    }
};

export const generateSessionSummary = async (sessionData) => {
    try {
        const prompt = `Summarize this learning session.
Skill: ${sessionData.skill}
Agenda: ${sessionData.agenda}
Teacher Notes: ${sessionData.teacherNotes}
Learner Confidence (1-5): ${sessionData.learnerConfidence}
Return ONLY valid JSON: { "what_covered": "...", "key_takeaways": ["..."], "practice_suggestions": ["..."], "next_session_focus": "..." }`;

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        return response.choices[0]?.message?.content;
    } catch (error) {
        return JSON.stringify({ what_covered: 'Session completed.', key_takeaways: [], practice_suggestions: [], next_session_focus: 'TBD' });
    }
};

export const detectWeakTopics = async (sessionHistory) => {
    try {
        const notes = sessionHistory.map(s => s.teacher_post_notes).filter(Boolean).join(' | ');
        if (!notes) return [];

        const prompt = `Analyze these teacher notes from multiple sessions and identify recurring weak topics for the student.
Notes: ${notes}
Return ONLY valid JSON: { "weak_topics": [{ "topic": "...", "explanation": "..." }] }`;

        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0]?.message?.content).weak_topics || [];
    } catch (error) {
        return [];
    }
};
