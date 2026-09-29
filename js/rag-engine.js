// Step 1: Load Knowledge Base Data
async function fetchKnowledgeBase() {
  try {
    const response = await fetch('./data/knowledge-base.json');
    return await response.json();
  } catch (error) {
    console.error("Error loading knowledge base:", error);
    return [];
  }
}

// Step 2: Retrieval Algorithm (Keyword and Relevance Search)
function retrieveRelevantDocs(userQuery, knowledgeBase, maxResults = 2) {
  const queryWords = userQuery.toLowerCase().split(/\s+/);
  
  const scored = knowledgeBase.map(item => {
    let score = 0;
    const fullText = `${item.chapter} ${item.title} ${item.content}`.toLowerCase();
    
    queryWords.forEach(word => {
      if (word.length > 2 && fullText.includes(word)) {
        score += 1;
      }
    });

    return { item, score };
  });

  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(entry => entry.item);
}

// Step 3: RAG Query Generator (Augment & Generate)
async function runRAGQuery(userQuery, apiKey) {
  const knowledgeBase = await fetchKnowledgeBase();
  const retrievedDocs = retrieveRelevantDocs(userQuery, knowledgeBase);

  // Construct context string from retrieved records
  let contextText = "";
  if (retrievedDocs.length > 0) {
    contextText = retrievedDocs.map(doc => `[Source: ${doc.chapter} - ${doc.title}]\n${doc.content}`).join("\n\n");
  } else {
    contextText = "No specific course context found matching this exact query. Use general AI Fluency knowledge.";
  }

  // Augmented Prompt
  const augmentedPrompt = `
  You are the official AI Assistant for the 'AI Fluency Master Academy'.
  Answer the user's question clearly and concisely.
  
  USE THIS COURSE CONTEXT TO ANSWER:
  ---
  ${contextText}
  ---

  USER QUESTION: ${userQuery}
  `;

  // Call Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: augmentedPrompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error('API Request Failed. Please check your API Key.');
  }

  const data = await response.json();
  return {
    answer: data.candidates[0].content.parts[0].text,
    sources: retrievedDocs
  };
}
