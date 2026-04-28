const { GoogleGenerativeAI } = require('@google/generative-ai');

let model;

function getGeminiModel() {
  if (model) {
    return model;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  return model;
}

module.exports = { getGeminiModel };
