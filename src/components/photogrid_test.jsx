import React, { useState, useEffect } from 'react';
import { Upload, X, Smartphone, Layout, Image as ImageIcon, ArrowRight, ArrowLeft, Grid, Download, Loader, PaintBucket, Layers, SplitSquareHorizontal, Sparkles, Wand2 } from 'lucide-react';

const Photogrid = () => {
  const apiKey = ""; // API Key injected at runtime

  // --- State ---
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1529139574466-a302d2052574?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60"
  ]);

  // Background State
  const [bgMode, setBgMode] = useState('color'); // 'color', 'image', 'split'
  const [bgColor, setBgColor] = useState('#262626');
  const [bgImage, setBgImage] = useState(null); // Single wide image
  const [bgSplitImages, setBgSplitImages] = useState([null, null, null, null]); // 4 separate images
  const [bgSplitTwoImages, setBgSplitTwoImages] = useState([null, null]); // 2 separate images

  // Layout State (Converted to state to allow dynamic additions)
  const defaultLayouts = {
    seamless: {
      name: "Seamless Flow",
      description: "Overlapping aesthetic for continuous scroll.",
      items: [
        { left: '2%', top: '5%', width: '22%', height: '80%', zIndex: 10 },
        { left: '18%', top: '25%', width: '18%', height: '40%', zIndex: 20 },
        { left: '40%', top: '10%', width: '30%', height: '85%', zIndex: 5 },
        { left: '78%', top: '15%', width: '20%', height: '70%', zIndex: 10 }
      ]
    },
    editorial: {
      name: "Editorial Gallery",
      description: "Clean spacing, museum style.",
      items: [
        { left: '4%', top: '10%', width: '17%', height: '60%', zIndex: 10 },
        { left: '27%', top: '20%', width: '21%', height: '60%', zIndex: 10 },
        { left: '52%', top: '10%', width: '21%', height: '80%', zIndex: 10 },
        { left: '79%', top: '30%', width: '17%', height: '50%', zIndex: 10 }
      ]
    },
    diagonal: {
      name: "Diagonal Cascade",
      description: "Stair-step motion across the feed.",
      items: [
        { left: '2%', top: '5%', width: '20%', height: '50%', zIndex: 10 },
        { left: '24%', top: '25%', width: '22%', height: '55%', zIndex: 10 },
        { left: '50%', top: '45%', width: '22%', height: '50%', zIndex: 10 },
        { left: '76%', top: '10%', width: '22%', height: '80%', zIndex: 5 }
      ]
    },
    film_strip: {
      name: "Film Strip",
      description: "Cinematic horizontal band.",
      items: [
        { left: '0%', top: '35%', width: '25%', height: '30%', zIndex: 10 },
        { left: '25%', top: '35%', width: '25%', height: '30%', zIndex: 10 },
        { left: '50%', top: '35%', width: '25%', height: '30%', zIndex: 10 },
        { left: '75%', top: '35%', width: '25%', height: '30%', zIndex: 10 }
      ]
    },
    scattered: {
      name: "Messy Desk",
      description: "Random, overlapping polaroid vibe.",
      items: [
        { left: '5%', top: '10%', width: '20%', height: '50%', zIndex: 5, rotate: -5 },
        { left: '20%', top: '40%', width: '25%', height: '50%', zIndex: 10, rotate: 5 },
        { left: '55%', top: '5%', width: '22%', height: '60%', zIndex: 8, rotate: -3 },
        { left: '75%', top: '30%', width: '20%', height: '55%', zIndex: 12, rotate: 4 }
      ]
    }
  };

  const [layouts, setLayouts] = useState(defaultLayouts);
  const [activeLayout, setActiveLayout] = useState('seamless'); 
  const [viewMode, setViewMode] = useState('canvas'); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // --- External Libraries Loader (JSZip & FileSaver) ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
    ]).then(() => {
      setLibsLoaded(true);
    }).catch(err => console.error("Failed to load export libraries", err));
  }, []);

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBgSplitUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSplits = [...bgSplitImages];
        newSplits[index] = reader.result;
        setBgSplitImages(newSplits);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTwoBgSplitUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSplits = [...bgSplitTwoImages];
        newSplits[index] = reader.result;
        setBgSplitTwoImages(newSplits);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStyle = (index) => {
    // Safety check if layout or items don't exist
    if (!layouts[activeLayout] || !layouts[activeLayout].items[index]) return {};

    const layoutItem = layouts[activeLayout].items[index];
    return {
      left: layoutItem.left,
      top: layoutItem.top,
      width: layoutItem.width,
      height: layoutItem.height,
      zIndex: layoutItem.zIndex,
      transform: layoutItem.rotate ? `rotate(${layoutItem.rotate}deg)` : 'none'
    };
  };

  // --- AI Layout Generation ---
  const generateLayout = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);

    try {
      const systemPrompt = `
        You are an API that generates Instagram Carousel Layouts in JSON format.
        The canvas is a panoramic strip with 400% Width (4 slides) and 100% Height.
        
        Rules:
        1. Return ONLY valid JSON. No markdown formatting.
        2. Schema:
           {
             "name": "Short Name",
             "description": "Short description",
             "items": [
               { "left": "0-380%", "top": "0-80%", "width": "20-50%", "height": "30-80%", "zIndex": 1-20, "rotate": -15 to 15 }
             ]
           }
        3. 'items' array MUST have exactly 4 objects.
        4. Use 'left' percentages greater than 100% to place items on slides 2, 3, and 4.
        5. Be creative based on the user's prompt: "${aiPrompt}"
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
      
      if (text) {
        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const newLayout = JSON.parse(jsonStr);
        
        // Add ID to layout
        const layoutId = `ai_${Date.now()}`;
        
        setLayouts(prev => ({
          ...prev,
          [layoutId]: newLayout
        }));
        
        setActiveLayout(layoutId);
        setAiPrompt('');
        setShowAiPanel(false);
      }

    } catch (error) {
      console.error("AI Generation Failed", error);
      alert("Failed to generate layout. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // --- Export Logic ---
  const handleExport = async () => {
    if (!window.JSZip || !window.saveAs) {
      alert("Export libraries are still loading. Please try again in a moment.");
      return;
    }

    setIsExporting(true);

    try {
      const canvasWidth = 4320; // 4 * 1080
      const canvasHeight = 1350; // 4:5 aspect ratio
      const singleSlideWidth = 1080;
      const DoubleSlideWidth = 2160;


      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      // 1. Draw Background
      if (bgMode === 'color') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (bgMode === 'image' && bgImage) {
         const bgImg = await loadImage(bgImage);
         if (bgImg) drawCoverImage(ctx, bgImg, 0, 0, canvasWidth, canvasHeight);
      
      }
      else if (bgMode === 'two-images') {
        // Draw 4 separate BG images
        for (let i = 0; i < 2; i++) {
          if (bgSplitTwoImages[i]) {
            const bgImg = await loadImage(bgSplitTwoImages[i]);
            if (bgImg) drawCoverImage(ctx, bgImg, i * DoubleSlideWidth, 0, DoubleSlideWidth, canvasHeight);
          } else {
            ctx.fillStyle = bgColor; // Fallback to color if split image missing
            ctx.fillRect(i * DoubleSlideWidth, 0, DoubleSlideWidth, canvasHeight);
          }
        }
      } 
      else if (bgMode === 'split') {
         for (let i = 0; i < 4; i++) {
           if (bgSplitImages[i]) {
             const bgImg = await loadImage(bgSplitImages[i]);
             if (bgImg) drawCoverImage(ctx, bgImg, i * singleSlideWidth, 0, singleSlideWidth, canvasHeight);
           } else {
             ctx.fillStyle = bgColor; 
             ctx.fillRect(i * singleSlideWidth, 0, singleSlideWidth, canvasHeight);
           }
         }
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // 2. Load Foreground Images
      const loadedImages = await Promise.all(images.map(src => loadImage(src)));

      // 3. Draw Layout Items
      if (layouts[activeLayout]) {
        const layoutItems = layouts[activeLayout].items;
        const indexedItems = layoutItems.map((item, idx) => ({ ...item, img: loadedImages[idx], originalIndex: idx }))
                                        .sort((a, b) => a.zIndex - b.zIndex);

        indexedItems.forEach(item => {
          if (!item.img) return;

          const x = (parseFloat(item.left) / 100) * canvasWidth;
          const y = (parseFloat(item.top) / 100) * canvasHeight;
          const w = (parseFloat(item.width) / 100) * canvasWidth;
          const h = (parseFloat(item.height) / 100) * canvasHeight;

          ctx.save();
          if (item.rotate) {
            ctx.translate(x + w/2, y + h/2);
            ctx.rotate((item.rotate * Math.PI) / 180);
            ctx.translate(-(x + w/2), -(y + h/2));
          }

          // Clip and Draw
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();
          drawCoverImage(ctx, item.img, x, y, w, h);
          ctx.restore();
        });
      }

      // 4. Slice and Zip
      const zip = new window.JSZip();
      
      for (let i = 0; i < 4; i++) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = singleSlideWidth;
        sliceCanvas.height = canvasHeight;
        const sliceCtx = sliceCanvas.getContext('2d');
        
        const sourceData = ctx.getImageData(i * singleSlideWidth, 0, singleSlideWidth, canvasHeight);
        sliceCtx.putImageData(sourceData, 0, 0);

        const blob = await new Promise(resolve => sliceCanvas.toBlob(resolve, 'image/jpeg', 0.95));
        zip.file(`slide_${i + 1}.jpg`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      window.saveAs(content, "instagram-carousel.zip");

    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export Failed: ${error.message}. \n\nTip: If using Unsplash/Stock images, they may cause security errors. Try replacing ALL photos with your own uploads.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper: Load Image Promisified with CORS handling
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      if (!src.startsWith('data:')) {
        img.crossOrigin = "anonymous"; 
      }
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn("Failed to load image:", src);
        resolve(null); 
      };
    });
  };

  // Helper: Simulate Object-Fit: Cover on Canvas
  const drawCoverImage = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let drawW, drawH, drawX, drawY;

    if (imgRatio > targetRatio) {
      drawH = h;
      drawW = h * imgRatio;
      drawX = x - (drawW - w) / 2;
      drawY = y;
    } else {
      drawW = w;
      drawH = w / imgRatio;
      drawX = x;
      drawY = y - (drawH - h) / 2;
    }
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };


  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, 3));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-pink-500 selection:text-white pb-20">
      
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Grid size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SCRL Simulator</h1>
          </div>
          
          <div className="flex gap-2">
             <div className="flex gap-1 bg-neutral-800 p-1 rounded-lg mr-4">
              <button 
                onClick={() => setViewMode('canvas')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'canvas' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
              >
                Canvas
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}
              >
                Preview
              </button>
            </div>

            <button 
              onClick={handleExport}
              disabled={!libsLoaded || isExporting}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all ${!libsLoaded || isExporting ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-white text-black hover:bg-neutral-200'}`}
            >
              {isExporting ? <Loader className="animate-spin" size={16}/> : <Download size={16} />}
              {isExporting ? 'Processing...' : 'Export Slices'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* 1. Uploads */}
          <div className="lg:col-span-3 bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800 h-fit">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold mb-4 flex items-center gap-2">
              <Upload size={14} /> 1. Photos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square bg-neutral-700 rounded-xl overflow-hidden border border-neutral-600 transition-all hover:border-neutral-400">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-medium">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(idx, e)} />
                  </label>
                  <div className="absolute top-1 left-1 bg-black/50 px-1.5 py-0.5 rounded text-[10px] font-mono backdrop-blur">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Layouts & AI */}
          <div className="lg:col-span-6 bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-2">
                <Layout size={14} /> 2. Layouts
              </h2>
              <button 
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${showAiPanel ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600'}`}
              >
                <Sparkles size={12} /> {showAiPanel ? 'Close AI' : 'Magic Layout'}
              </button>
            </div>

            {/* AI Generator Panel */}
            {showAiPanel && (
              <div className="mb-4 p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-purple-200 mb-1">Describe your dream layout</label>
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., 'Chaotic cyberpunk collage with overlapping angles' or 'Minimalist vertical strips'"
                      className="w-full bg-black/30 border border-purple-500/30 rounded-lg p-2 text-xs text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-400 resize-none h-16"
                    />
                  </div>
                  <button 
                    onClick={generateLayout}
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    className="h-16 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all text-white border border-purple-400/50"
                  >
                    {isGeneratingAI ? <Loader size={16} className="animate-spin mb-1"/> : <Wand2 size={16} className="mb-1"/>}
                    {isGeneratingAI ? 'Thinking' : 'Generate'}
                  </button>
                </div>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
              {Object.entries(layouts).map(([key, layout]) => (
                <button 
                  key={key}
                  onClick={() => setActiveLayout(key)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group min-h-[100px] relative overflow-hidden ${activeLayout === key ? 'bg-neutral-700 border-pink-500/50' : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'}`}
                >
                  <div className="z-10 relative">
                    <div className="font-medium text-white group-hover:text-pink-400 transition-colors text-xs flex items-center gap-1">
                      {key.startsWith('ai_') && <Sparkles size={10} className="text-purple-400" />}
                      {layout.name}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1 leading-tight line-clamp-3">{layout.description}</div>
                  </div>
                  {activeLayout === key && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Background Settings */}
          <div className="lg:col-span-3 bg-neutral-800/50 p-5 rounded-2xl border border-neutral-800 h-fit">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold mb-4 flex items-center gap-2">
              <PaintBucket size={14} /> 3. Background
            </h2>
            
            {/* BG Mode Tabs */}
            <div className="flex bg-neutral-900 p-1 rounded-lg mb-4">
              <button onClick={() => setBgMode('color')} className={`flex-1 py-1 text-[10px] font-medium rounded ${bgMode === 'color' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}><PaintBucket size={12} className="inline mr-1"/> Color</button>
              <button onClick={() => setBgMode('image')} className={`flex-1 py-1 text-[10px] font-medium rounded ${bgMode === 'image' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}><ImageIcon size={12} className="inline mr-1"/> Image</button>
              <button onClick={() => setBgMode('two-images')} className={`flex-1 py-1 text-[10px] font-medium rounded ${bgMode === 'two-image' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}><ImageIcon size={12} className="inline mr-1" /> 2ximage</button>
              <button onClick={() => setBgMode('split')} className={`flex-1 py-1 text-[10px] font-medium rounded ${bgMode === 'split' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}><SplitSquareHorizontal size={12} className="inline mr-1"/> Split</button>
            </div>

            {/* Mode Specific Controls */}
            {bgMode === 'color' && (
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Pick Color</label>
                <div className="flex gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-12 rounded bg-transparent border-0 cursor-pointer" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 text-xs font-mono uppercase" />
                </div>
              </div>
            )}

            {bgMode === 'image' && (
              <div className="space-y-2">
                 <div className="aspect-[4/1] bg-neutral-900 border border-neutral-700 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden group">
                    {bgImage ? <img src={bgImage} className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-500">Upload Panoramic</span>}
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                    </label>
                 </div>
              </div>
            )}

             {bgMode === 'two-images' && (
              <div className="grid grid-cols-4 gap-2">
                 {[0,1].map(i => (
                   <div key={i} className="aspect-[3/4] bg-neutral-900 border border-neutral-700 border-dashed rounded flex items-center justify-center relative overflow-hidden group">
                      {bgSplitTwoImages[i] ? <img src={bgSplitTwoImages[i]} className="w-full h-full object-cover" /> : <span className="text-[8px] text-neutral-600">{i+1}</span>}
                      <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={12} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleTwoBgSplitUpload(i, e)} />
                      </label>
                   </div>
                 ))}
              </div>
            )}

             {bgMode === 'split' && (
              <div className="grid grid-cols-4 gap-2">
                 {[0,1,2,3].map(i => (
                   <div key={i} className="aspect-[3/4] bg-neutral-900 border border-neutral-700 border-dashed rounded flex items-center justify-center relative overflow-hidden group">
                      {bgSplitImages[i] ? <img src={bgSplitImages[i]} className="w-full h-full object-cover" /> : <span className="text-[8px] text-neutral-600">{i+1}</span>}
                      <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={12} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBgSplitUpload(i, e)} />
                      </label>
                   </div>
                 ))}
              </div>
            )}
          </div>

        </div>

        {/* --- MAIN VISUALIZER AREA --- */}
        
        {viewMode === 'canvas' ? (
          /* CANVAS MODE */
          <div className="space-y-4">
             <div className="flex justify-between items-end px-2">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Layout size={18} /> Full Canvas Strip
                </h3>
                <span className="text-xs font-mono text-neutral-500">4320px x 1350px (Scaled)</span>
             </div>
             
             {/* The Strip Container */}
             <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
               <div className="relative w-full aspect-[4/1.25] border border-neutral-700 rounded-lg overflow-hidden shadow-2xl min-w-[800px]"
                    style={{ backgroundColor: bgMode === 'color' ? bgColor : '#262626' }}
               >
                  {/* BACKGROUND LAYER */}
                  {bgMode === 'image' && bgImage && (
                    <img src={bgImage} className="absolute inset-0 w-full h-full object-cover z-0" />
                  )}
                  {bgMode === 'two-images' && (
                    <div className="absolute inset-0 w-full h-full grid grid-cols-2 z-0">
                      {bgSplitTwoImages.map((src, i) => (
                        <div key={i} className="relative h-full w-full border-r border-transparent">
                          {src && <img src={src} className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  )}

                {bgMode === 'split' && (
                    <div className="absolute inset-0 w-full h-full grid grid-cols-4 z-0">
                      {bgSplitImages.map((src, i) => (
                        <div key={i} className="relative h-full w-full border-r border-transparent">
                          {src && <img src={src} className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  )}

                  
                  {/* Grid Lines (The "Cuts") */}
                  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-30">
                    <div className="border-r border-dashed border-pink-500/30 h-full relative group">
                      <span className="absolute bottom-2 right-2 text-[10px] text-pink-500/50 font-mono group-hover:text-pink-400 transition-colors">SLIDE 1 CUT</span>
                    </div>
                    <div className="border-r border-dashed border-pink-500/30 h-full relative group">
                      <span className="absolute bottom-2 right-2 text-[10px] text-pink-500/50 font-mono group-hover:text-pink-400 transition-colors">SLIDE 2 CUT</span>
                    </div>
                    <div className="border-r border-dashed border-pink-500/30 h-full relative group">
                      <span className="absolute bottom-2 right-2 text-[10px] text-pink-500/50 font-mono group-hover:text-pink-400 transition-colors">SLIDE 3 CUT</span>
                    </div>
                    <div className="h-full relative">
                      <span className="absolute bottom-2 right-2 text-[10px] text-pink-500/50 font-mono">SLIDE 4</span>
                    </div>
                  </div>

                  {/* Decorative Elements (Only if no BG image to keep it clean) */}
                  {bgMode === 'color' && (
                    <div className="absolute top-[10%] left-[23%] text-neutral-800 text-[8rem] font-bold opacity-20 pointer-events-none select-none z-0 tracking-tighter leading-none mix-blend-overlay">
                      MEMORIES
                    </div>
                  )}
                  
                  {/* The Images */}
                  {images.map((img, idx) => {
                     const style = getStyle(idx);
                     // If no style (e.g. AI returned malformed data), skip
                     if (!style.left) return null;

                     return (
                      <div 
                        key={idx}
                        className="absolute shadow-xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:z-50 hover:shadow-pink-500/20"
                        style={style}
                      >
                        <img src={img} alt={`Composition ${idx}`} className="w-full h-full object-cover" />
                        {/* Sticker/Tape Effect - Randomly applied */}
                        {idx % 2 === 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/20 rotate-2 backdrop-blur-sm"></div>}
                      </div>
                    )
                  })}

               </div>
             </div>
          </div>

        ) : (
          /* PREVIEW MODE (Phone Simulator) */
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <Smartphone size={18} /> Instagram Feed Preview
            </h3>

            <div className="relative w-[320px] h-[600px] bg-black border-[8px] border-neutral-800 rounded-[3rem] shadow-2xl overflow-hidden">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-xl z-50"></div>
               
               {/* IG Header */}
               <div className="mt-8 px-4 py-2 flex justify-between items-center text-white border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600"></div>
                    <span className="text-xs font-semibold">your_username</span>
                  </div>
                  <div className="text-xs font-bold">...</div>
               </div>

               {/* Carousel Window */}
               <div className="relative w-full aspect-[4/5] bg-neutral-900 overflow-hidden group">
                  
                  {/* The moving strip */}
                  <div 
                    className="absolute top-0 left-0 h-full w-[400%] flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 25}%)` }}
                  >
                     {/* We recreate the full strip inside the phone but scale it to match the phone width */}
                     <div className="relative w-full h-full" style={{ backgroundColor: bgMode === 'color' ? bgColor : '#262626' }}>
                        
                        {/* BACKGROUND */}
                        {bgMode === 'image' && bgImage && (
                          <img src={bgImage} className="absolute inset-0 w-full h-full object-cover z-0" />
                        )}
                        {bgMode === 'two-images' && (
                          <div className="absolute inset-0 w-full h-full grid grid-cols-2 z-0">
                            {bgSplitTwoImages.map((src, i) => (
                              <div key={i} className="relative h-full w-full">
                                {src && <img src={src} className="w-full h-full object-cover" />}
                              </div>
                            ))}
                          </div>
                        )} 
                        {bgMode === 'split' && (
                          <div className="absolute inset-0 w-full h-full grid grid-cols-4 z-0">
                            {bgSplitImages.map((src, i) => (
                              <div key={i} className="relative h-full w-full">
                                {src && <img src={src} className="w-full h-full object-cover" />}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Images */}
                        {images.map((img, idx) => {
                          const style = getStyle(idx);
                          // If no style, skip
                          if (!style.left) return null;

                          return (
                            <div 
                              key={idx}
                              className="absolute overflow-hidden shadow-lg"
                              style={style}
                            >
                              <img src={img} className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  {/* Slide Indicators (Dots) */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-50">
                    {[0,1,2,3].map(dot => (
                      <div key={dot} className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${currentSlide === dot ? 'bg-blue-500' : 'bg-white/50'}`}></div>
                    ))}
                  </div>

                  {/* Navigation Zones */}
                  <button onClick={prevSlide} className={`absolute inset-y-0 left-0 w-1/4 z-50 flex items-center justify-start pl-2 outline-none ${currentSlide === 0 ? 'hidden' : ''}`}>
                    <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"><ArrowLeft size={12}/></div>
                  </button>
                  <button onClick={nextSlide} className={`absolute inset-y-0 right-0 w-1/4 z-50 flex items-center justify-end pr-2 outline-none ${currentSlide === 3 ? 'hidden' : ''}`}>
                    <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"><ArrowRight size={12}/></div>
                  </button>
               </div>

               {/* Fake Actions */}
               <div className="px-4 py-3 flex justify-between items-center text-white">
                 <div className="flex gap-4">
                   <div className="w-5 h-5 border-2 border-white rounded-full"></div> 
                   <div className="w-5 h-5 border-2 border-white rounded-full"></div> 
                   <div className="w-5 h-5 border-2 border-white rounded-full"></div> 
                 </div>
                 <div className="w-5 h-5 border-2 border-white rounded-full"></div> 
               </div>
               <div className="px-4 text-[10px] text-white">
                 <span className="font-bold">Liked by others</span> and <span className="font-bold">others</span>
                 <div className="mt-1"><span className="font-bold">your_username</span> New post using the SCRL layout method. #seamless #design</div>
               </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Photogrid;