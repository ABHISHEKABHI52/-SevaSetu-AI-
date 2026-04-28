const { getGeminiModel } = require('../config/gemini');

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function analyzeReportText(rawText) {
  const model = getGeminiModel();

  if (!model) {
    return {
      category: 'general_support',
      urgencyLevel: 'medium',
      summary: rawText.slice(0, 120),
      affectedPeopleCount: null,
      location: null,
      requiredSkills: [],
      suggestedTaskTitle: 'Review reported need',
      suggestedTaskDescription: rawText,
      confidenceScore: 0.35
    };
  }

  const prompt = `You are analyzing NGO community reports. Return strict JSON only with keys: category, urgencyLevel, summary, affectedPeopleCount, location, requiredSkills, suggestedTaskTitle, suggestedTaskDescription, confidenceScore.\n\nReport:\n${rawText}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
  const parsed = safeJsonParse(text);

  if (!parsed) {
    throw new Error('Gemini returned invalid JSON');
  }

  return parsed;
}

async function classifyTask(taskText) {
  const model = getGeminiModel();

  if (!model) {
    return {
      taskCategory: 'general_support',
      requiredSkills: [],
      suggestedLanguages: [],
      indoorOrOutdoor: 'unknown',
      estimatedDurationHours: 2
    };
  }

  const prompt = `Classify the following volunteer task. Return strict JSON only with keys: taskCategory, requiredSkills, suggestedLanguages, indoorOrOutdoor, estimatedDurationHours.\n\nTask:\n${taskText}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
  const parsed = safeJsonParse(text);

  if (!parsed) {
    throw new Error('Gemini returned invalid JSON');
  }

  return parsed;
}

module.exports = {
  analyzeReportText,
  classifyTask
};
