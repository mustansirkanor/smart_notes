import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.isConfigured = false;
    this.genAI = null;
    this.model = null;
    this.multilingualModel = null;
    
    setTimeout(() => this.initialize(), 100);
  }

  initialize() {
    console.log('🔍 Initializing Enhanced AI Service...');
    console.log('🔑 GEMINI_API_KEY in aiService:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        });
        
        // Separate model for multilingual tasks
        this.multilingualModel = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        });
        
        this.isConfigured = true;
        console.log('✅ Enhanced Gemini AI service initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Enhanced Gemini AI:', error);
      }
    }
  }

  // ✅ NEW: Voice-enhanced chat
  async chatWithContext(message, topicId, userId, options = {}) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please check your GEMINI_API_KEY.');
    }

    try {
      let context = '';
      if (topicId) {
        const Topic = await import('../models/Topic.js');
        const Note = await import('../models/Note.js');
        
        const topic = await Topic.default.findById(topicId);
        const notes = await Note.default.find({ topic: topicId });
        
        context = `Current Topic: ${topic?.title || 'Unknown'}
Recent Notes: ${notes.slice(0, 3).map(note => 
  `${note.title}: ${note.content.substring(0, 200)}...`
).join('\n')}`;
      }

      // Enhanced prompt with voice context
      const prompt = `You are a helpful AI study assistant for a Smart Notes app.
${options.isVoiceInput ? 'Note: This message was spoken by the user, so respond naturally as if in conversation.' : ''}
${options.targetLanguage ? `Please respond in ${options.targetLanguage}.` : ''}

Context: ${context}
User Question: ${message}

Provide a helpful, concise response that:
- Relates to their study materials when possible
- Offers practical study tips
- Is encouraging and supportive
- Suggests actions they can take in their notes
${options.isVoiceInput ? '- Uses conversational tone suitable for speech' : ''}

Keep responses under 200 words and be ${options.isVoiceInput ? 'conversational' : 'clear'}.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error in enhanced chat:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  // ✅ NEW: Multi-language translation
  async translateContent(content, targetLanguage, sourceLanguage = 'auto') {
    if (!this.isConfigured) {
      throw new Error('AI service not configured.');
    }

    try {
      const prompt = `Translate the following text ${sourceLanguage !== 'auto' ? `from ${sourceLanguage}` : ''} to ${targetLanguage}.
      
Maintain the original formatting and structure. If the text contains technical terms or proper nouns, keep them accurate.

Text to translate:
${content}

Translation:`;

      const result = await this.multilingualModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error in translation:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  // ✅ NEW: Generate flashcards from notes
  async generateFlashcards(notes, options = {}) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured.');
    }

    try {
      const notesText = notes.map(note => `${note.title}: ${note.content}`).join('\n\n');
      const prompt = `Create ${options.count || 10} educational flashcards from these notes.

Notes:
${notesText}

Format each flashcard as JSON with this structure:
{
  "question": "Clear, specific question",
  "answer": "Concise, accurate answer", 
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"]
}

Make questions that test understanding, not just memorization. Include a mix of difficulty levels.
Return as a JSON array of flashcard objects.`;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error(`Flashcard generation failed: ${error.message}`);
    }
  }

  // ✅ NEW: Create personalized study plan
  async createStudyPlan(topics, preferences, goals) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured.');
    }

    try {
      const prompt = `Create a personalized study plan based on:

Topics: ${topics.map(t => `${t.title} (${t.noteCount} notes)`).join(', ')}

Preferences:
- Study hours per day: ${preferences.studyHoursPerDay}
- Session duration: ${preferences.sessionDuration} minutes
- Break duration: ${preferences.breakDuration} minutes
- Preferred times: ${preferences.preferredTimes?.map(pt => `${pt.day} ${pt.startTime}-${pt.endTime}`).join(', ')}

Goals: ${goals.join(', ')}

Create a structured study plan with:
1. Daily schedule for the next 2 weeks
2. Specific tasks for each topic
3. Review sessions for spaced repetition
4. Progress milestones

Return as JSON with this structure:
{
  "title": "Personalized Study Plan",
  "duration": "2 weeks",
  "schedule": [
    {
      "date": "2025-08-22",
      "tasks": [
        {
          "topicTitle": "Topic Name",
          "title": "Study task",
          "estimatedTime": 45,
          "type": "study|review|practice|test"
        }
      ]
    }
  ],
  "goals": [
    {
      "title": "Goal title", 
      "targetDate": "2025-09-01",
      "priority": "high|medium|low"
    }
  ]
}`;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error creating study plan:', error);
      throw new Error(`Study plan creation failed: ${error.message}`);
    }
  }

  // ✅ NEW: Analyze study patterns and provide insights
  async analyzeStudyPatterns(studySessions) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured.');
    }

    try {
      const sessionData = studySessions.map(session => ({
        date: session.createdAt,
        duration: session.duration,
        focusScore: session.focusScore,
        notesCreated: session.notesCreated,
        wordsWritten: session.wordsWritten,
        mood: session.mood,
        topicId: session.topicId
      }));

      const prompt = `Analyze these study sessions and provide insights:

${JSON.stringify(sessionData, null, 2)}

Provide analysis including:
1. Study patterns and trends
2. Most productive times/days
3. Focus and mood correlations
4. Recommendations for improvement
5. Optimal study times based on performance

Return as JSON:
{
  "insights": {
    "productiveHours": ["hour1", "hour2"],
    "averageFocus": number,
    "studyStreak": number,
    "improvementAreas": ["area1", "area2"]
  },
  "recommendations": [
    {
      "type": "schedule|technique|environment",
      "title": "Recommendation title",
      "description": "Detailed suggestion"
    }
  ],
  "trends": {
    "weeklyPattern": "description",
    "moodImpact": "description",
    "focusFactors": "description"
  }
}`;

      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error analyzing study patterns:', error);
      throw new Error(`Study pattern analysis failed: ${error.message}`);
    }
  }

  // Existing methods remain the same...
  async generateSummary(notes) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please check your GEMINI_API_KEY.');
    }

    try {
      const notesText = notes.map(note => `${note.title}: ${note.content}`).join('\n\n');
      const prompt = `Summarize these notes in 5 key points with clear headings:\n\n${notesText}`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  async enhancedSearch(query, contextNotes) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please check your GEMINI_API_KEY.');
    }

    try {
      const context = contextNotes.map(note => `${note.title}: ${note.content}`).join('\n\n');
      const prompt = `Based on these notes: ${context}\n\nAnswer this question with 3-5 key points: "${query}"`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error in enhanced search:', error);
      throw new Error(`Failed to perform enhanced search: ${error.message}`);
    }
  }

  async generateSmartPoints(topicTitle, existingContent, requestType = 'general') {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please check your GEMINI_API_KEY.');
    }

    const prompts = {
      general: `Create 5 key learning points for "${topicTitle}":\n${existingContent}\n\nFormat as bullet points with brief explanations.`,
      studyGuide: `Create a 5-point study guide for "${topicTitle}":\n${existingContent}`,
      practicalTips: `Give 5 practical tips for "${topicTitle}":\n${existingContent}`,
      conceptMap: `Create 5 core concepts for "${topicTitle}":\n${existingContent}`,
      quickReference: `Create a quick 5-point reference for "${topicTitle}":\n${existingContent}`
    };

    try {
      const selectedPrompt = prompts[requestType] || prompts.general;
      const result = await this.model.generateContent(selectedPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating smart points:', error);
      throw new Error(`Failed to generate smart points: ${error.message}`);
    }
  }

  async generateFromPrompt(customPrompt, topicTitle, existingContent) {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please check your GEMINI_API_KEY.');
    }

    try {
      const enhancedPrompt = `Topic: "${topicTitle}"\nContent: ${existingContent}\nRequest: ${customPrompt}\n\nProvide a clear, structured response:`;

      const result = await this.model.generateContent(enhancedPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating from prompt:', error);
      throw new Error(`Failed to generate content from prompt: ${error.message}`);
    }
  }
}

export default new AIService();
