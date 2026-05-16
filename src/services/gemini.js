export const generateFlashcards = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error("API key is not configured. Please set VITE_GEMINI_API_KEY in .env");
  }

  // We are using a standard fetch call to the Gemini API
  // Using gemini-1.5-flash since 3.0 might be a typo for 1.5 in standard terms or we can just use the latest url pattern.
  // The user requested "Gemini 3 Flash API". Since we don't have exactly "gemini-3.0-flash", we will use "gemini-1.5-flash" 
  // or "gemini-2.0-flash". Let's assume gemini-1.5-flash is standard for now, but we can name the variable to reflect the user's request.
  const model = "gemini-3-flash-preview"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
You are a tutor. Create a study package based on the following lecture text.
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

Lecture text:
${text}
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json" // Force JSON output
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("AI returned an empty response candidates list.");
    }
    
    const contentText = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!contentText) {
      throw new Error("AI returned an empty response text.");
    }

    // Parse JSON
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
