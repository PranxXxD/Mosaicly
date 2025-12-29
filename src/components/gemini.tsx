



async function fetchImages(count) {
    const urls = Array.from({ length: count }).map(
      (_, i) => `https://picsum.photos/seed/${i}/600/400`
    );
    setImages(urls);
  }

const generateLayout = async () => {
    console.log("aiPrompt", aiPrompt);
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);

    // Extract number from prompt
    const FindNumber = aiPrompt?.match(/\b(\d+)\b/);
    const imageCount = FindNumber ? parseInt(FindNumber[0], 10) : 4;
    fetchImages(imageCount)

    console.log("imageCount", Images)
    try {
      // ✅ AI Prompt referencing default layouts

      const systemPrompt = `
Generate a JSON layout for an Instagram collage (100% width, 100% height).
Rules:
1. Return ONLY valid JSON.
2. Schema:
   {
     "name": "Short descriptive name",
     "description": "Brief description of the layout",
     "items": [
       { "left": "0-90%", "top": "0-80%", "width": "10-25%", "height": "15-40%", "zIndex": 5-20, "rotate": -10 to 10 }
     ]
   }
3. The "items" array MUST contain exactly ${imageCount} objects. Do NOT default to 4.
4. All items should be placed within a single slide (100% width).
5. Allow overlapping and random positions for a collage effect.
6. Reflect the user prompt theme creatively.
If you cannot generate exactly ${imageCount} items, return an error.
User Prompt: "${aiPrompt}"
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      let newLayout;

      if (text) {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        newLayout = JSON.parse(jsonStr);

        // Validate item count
        if (imageCount < 10) {
          if (!newLayout.items || newLayout.items.length !== imageCount) {
            console.warn(`AI returned ${newLayout.items?.length || 0} items instead of ${imageCount}. Using fallback.`);
            newLayout = generateRandomLayout(aiPrompt, imageCount);
          }
        }
      } else {
        if (imageCount > 10) {
          newLayout = generateRandomLayout(aiPrompt, imageCount);
        }
      }


      const layoutId = `ai_${Date.now()}`;
      setLayouts(prev => ({
        ...prev,
        [layoutId]: newLayout
      }));

      setActiveLayout(layoutId);
      setAiPrompt('');
      setShowAiPanel(false);

    } catch (error) {
      console.error("AI Generation Failed", error);
      alert("Failed to generate layout. Using fallback layout.");
      const fallbackLayout = generateRandomLayout(aiPrompt, imageCount);
      const layoutId = `ai_${Date.now()}`;
      setLayouts(prev => ({
        ...prev,
        [layoutId]: fallbackLayout
      }));
      setActiveLayout(layoutId);
    } finally {
      setIsGeneratingAI(false);
    }
  };




  // ✅ Random Layout Generator

  // "Streetwear Fashion Collage with 5 images featuring bold colors, sneakers, and urban vibes.


  function generateRandomLayout(prompt, count) {

    const Newlayout = {
      name: prompt.slice(0, 30),
      description: `Instagram collage layout for ${prompt}`,
      items: []
    };

    const isGridMode = count > 10; // Switch to grid for large counts

    if (isGridMode) {
      const columns = Math.ceil(Math.sqrt(count)); // Square-ish grid
      const rows = Math.ceil(count / columns);
      const cellWidth = 100 / columns;
      const cellHeight = 100 / rows;

      for (let i = 0; i < count; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);

        const left = `${col * cellWidth + 2}%`;
        const top = `${row * cellHeight + 2}%`;
        const width = `${cellWidth - 4}%`;
        const height = `${cellHeight - 4}%`;

        Newlayout.items.push({
          left,
          top,
          width,
          height,
          zIndex: 1,
          rotate: 0 // No rotation for grid
        });
      }
    } else {
      for (let i = 0; i < count; i++) {
        const left = `${Math.floor(Math.random() * 80)}%`;
        const top = `${Math.floor(Math.random() * 60)}%`;

        let width, height;
        if (count <= 4) {
          width = `${20 + Math.floor(Math.random() * 5)}%`;
          height = `${40 + Math.floor(Math.random() * 20)}%`;
        } else if (count <= 8) {
          width = `${15 + Math.floor(Math.random() * 10)}%`;
          height = `${30 + Math.floor(Math.random() * 20)}%`;
        } else {
          width = `${8 + Math.floor(Math.random() * 5)}%`;
          height = `${12 + Math.floor(Math.random() * 8)}%`;
        }

        const zIndex = Math.floor(Math.random() * 15) + 5;
        const rotate = Math.floor(Math.random() * 21) - 10;

        Newlayout.items.push({ left, top, width, height, zIndex, rotate });
      }
    }

    return Newlayout;
  }
