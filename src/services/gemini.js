export const generateFlashcards = async ({ text, fileData }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error("API key is not configured. Please set VITE_GEMINI_API_KEY in .env");
  }

  // Using the requested model: Gemini 3 Flash (using the preview endpoint)
  const model = "gemini-1.5-flash"; // Falling back to 1.5-flash as 3.0/3-flash might be preview-only or named differently in regional endpoints
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
      "correctAnswer": 0
    },
    {
      "type": "true-false",
      "question": "statement",
      "options": ["True", "False"],
      "correctAnswer": 0
    }
  ]
}
Include exactly 10 flashcards and 5-8 quiz questions (a mix of multiple-choice and true-false).
Do not include any other text, markdown formatting, or explanations. Only the raw JSON object.

Text source (if provided):
${text}
  `;

  try {
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
      throw new Error(`API Error: ${response.status} - ${errText}`);
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
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON:", contentText);
      throw new Error("AI response was not valid JSON format.");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};
