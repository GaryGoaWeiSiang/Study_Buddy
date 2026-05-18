export const generateFlashcards = async ({ text, fileData }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error("API key is not configured. Please set VITE_GEMINI_API_KEY in .env");
  }

  // Resilient multi-model fallback chain to ensure high availability
  const modelsToTry = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting study package generation using model: ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `
You are a tutor. Create a comprehensive study package based on the following material (text and/or uploaded document/image).
IMPORTANT: If an image of handwritten notes is provided, prioritize extracting and transcribing the handwriting accurately.
Return the result strictly as a JSON object with the following structure:
{
  "title": "A short, descriptive title (3-5 words)",
  "cards": [
    { "front": "question or concept", "back": "answer or definition" }
  ],
  "quiz": [
    {
      "type": "multiple-choice", 
      "question": "question text",
      "options": ["choice 1", "choice 2", "choice 3", "choice 4"],
      "correctAnswer": 0,
      "explanation": "A clear, helpful explanation of why the correct option is correct."
    },
    {
      "type": "true-false",
      "question": "statement",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "A clear, helpful explanation of why the statement is true or false."
    }
  ]
}
Include exactly 10 flashcards and exactly 15 quiz questions (a mix of multiple-choice and true-false).
Do not include any other text, markdown formatting, or explanations. Only the raw JSON object.

Text source (if provided):
${text}
      `;

      const requestParts = [{ text: prompt }];

      if (fileData) {
        requestParts.push({
          inline_data: {
            mime_type: fileData.mimeType,
            data: fileData.base64
          }
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: requestParts
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("AI returned an empty response candidates list.");
      }
      
      const contentText = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!contentText) {
        throw new Error("AI returned an empty response text.");
      }

      try {
        const parsedData = JSON.parse(contentText);
        if (!parsedData.cards || !Array.isArray(parsedData.cards)) {
          throw new Error("AI response did not contain a valid cards array.");
        }
        if (!parsedData.quiz || !Array.isArray(parsedData.quiz)) {
          throw new Error("AI response did not contain a valid quiz array.");
        }
        
        console.log(`Successfully generated deck using model: ${model}!`);
        return parsedData;
      } catch (parseError) {
        console.error(`Failed to parse JSON from ${model}:`, contentText);
        throw new Error("AI response was not valid JSON format.");
      }
    } catch (error) {
      console.warn(`Model ${model} failed. Error:`, error.message);
      lastError = error;
      // Continue to the next model in the fallback chain
    }
  }

  // If we get here, all models in the fallback chain have failed
  throw new Error(`Failed to generate study package. All AI models in the fallback chain were unavailable. Last error: ${lastError?.message}`);
};
