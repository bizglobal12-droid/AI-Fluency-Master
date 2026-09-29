async function runRAGQuery(query, apiKey) {
    try {
        const cleanKey = apiKey.trim();
        if (!cleanKey) {
            throw new Error("Please enter a valid Gemini API key.");
        }

        // 1. Fetch Knowledge Base
        const kbResponse = await fetch("data/knowledge-base.json", { cache: "no-store" });
        if (!kbResponse.ok) {
            throw new Error("Could not load knowledge-base.json. Verify the file location.");
        }
        const kbData = await kbResponse.json();

        // 2. Retrieve relevant course modules
        const lowerQuery = query.toLowerCase();
        const terms = lowerQuery.split(/\s+/).filter(term => term.length >= 3);

        let matches = [];
        if (Array.isArray(kbData)) {
            matches = kbData
                .map(module => {
                    const title = String(module.title || "");
                    const content = String(module.content || module.description || "");
                    const haystack = (title + " " + content).toLowerCase();
                    const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
                    return { module, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 4)
                .map(item => item.module);
        }

        const selectedModules = matches.length > 0 ? matches : (Array.isArray(kbData) ? kbData.slice(0, 4) : []);
        const contextText = selectedModules
            .map(module => `[${module.chapter || "Course Module"} — ${module.title || ""}]\n${module.content || module.description || ""}`)
            .join("\n\n");

        // 3. Build grounded prompt
        const systemPrompt = `You are the AI Fluency Master Assistant.
Answer the user's question using ONLY the course context below.
If the context does not contain enough information, say that the course knowledge base does not provide enough information rather than inventing facts.
Keep answers clear, useful, and concise.

COURSE CONTEXT:
${contextText}

USER QUESTION:
${query}`;

        // 4. Call the current Gemini API model.
        // Gemini 2.0 Flash was shut down on June 1, 2026.
        const model = "gemini-3.8-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const apiResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": cleanKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Gemini API Error Response:", data);
            throw new Error(data.error?.message || `Gemini API request failed (HTTP ${apiResponse.status}).`);
        }

        const answer = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!answer) {
            throw new Error("Gemini returned no text response.");
        }

        return {
            answer,
            sources: selectedModules.map(module => ({
                chapter: module.chapter || "Course Module",
                title: module.title || "Untitled"
            }))
        };

    } catch (error) {
        console.error("RAG Execution Error:", error);
        throw error;
    }
}
