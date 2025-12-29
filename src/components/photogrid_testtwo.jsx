import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, X, Smartphone, Layout, Image as ImageIcon, ArrowRight, ArrowLeft,
  Grid, Download, Loader, PaintBucket, SplitSquareHorizontal, Sparkles, Wand2,
  Plus, Trash2, Move, Maximize2, ZoomIn, RotateCw, FlipHorizontal, FlipVertical,
  Check, GripVertical, Settings2, RefreshCw,
  Crop,
  HardDrive,
  Save
} from 'lucide-react';


// --- Production Ready UI Constants ---
const THEME = {
  bg: "bg-zinc-950",
  panel: "bg-zinc-900 border border-zinc-800",
  panelHover: "hover:border-zinc-700",
  text: "text-zinc-100",
  textMuted: "text-zinc-400",
  accent: "bg-indigo-600 hover:bg-indigo-500",
  accentText: "text-indigo-400",
  danger: "text-red-400 hover:bg-red-900/20",
};

// Layouts
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



const INITIAL_FRAME_ADJUSTMENTS = {
  0: { x: 0, y: 0, scale: 1, rotate: -5, flipX: false, flipY: false },
  1: { x: 0, y: 0, scale: 1, rotate: 5, flipX: false, flipY: false },
  2: { x: 0, y: 0, scale: 1, rotate: -3, flipX: false, flipY: false },
  3: { x: 0, y: 0, scale: 1, rotate: 4, flipX: false, flipY: false },
};

// Local Storage Key
// const STORAGE_KEY = 'PHOTOGRID_STATE';

// const getDefaultState = () => ({
//   images: Array(4).fill(null), // Holds base64 or URL for the 4 slots
//   transforms: Array(4).fill({ scale: 1, rotate: 0, flipX: false, flipY: false }),
//   layout: defaultLayouts.seamless,
//   bgImage: null,
//   bgColor: '#0a0a0a',
//   gridGap: 10,
//   editorWidth: '95%',
//   editorHeight: '95%',
//   message: null,
//   lastSaved: null
// });

// // Helper function to load state from Local Storage
// const loadStateFromStorage = () => {
//   try {
//     const serializedState = localStorage.getItem(STORAGE_KEY);
//     if (serializedState === null) {
//       return getDefaultState();
//     }
//     const savedState = JSON.parse(serializedState);
//     // Ensure the loaded state has the necessary 'lastSaved' property or default it
//     return { ...getDefaultState(), ...savedState, lastSaved: savedState.lastSaved ? new Date(savedState.lastSaved) : null };
//   } catch (e) {
//     console.error("Could not load state from local storage:", e);
//     return getDefaultState();
//   }
// };

const Photogrid = () => {
  const apiKey = import.meta.env.VITE_API_KEY; // API Key injected at runtime

  // --- State ---
  const [layouts, setLayouts] = useState(defaultLayouts);

  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
    "http://images.unsplash.com/photo-1762764919450-560fd6515192?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60"
  ]);



  // Adjustments now include advanced transforms
  // Structure: { [index]: { x, y, scale, rotate, flipX, flipY } }
  // Content/Frame Adjustments
  const [imageAdjustments, setImageAdjustments] = useState({});
  const [frameAdjustments, setFrameAdjustments] = useState(INITIAL_FRAME_ADJUSTMENTS);


  // Background State with Transforms
  const [bgMode, setBgMode] = useState('color'); // 'color', 'image', 'split'
  const [bgColor, setBgColor] = useState('#18181b'); // Darker default
  const [bgImage, setBgImage] = useState(null);
  const [bgFit, setBgFit] = useState('cover');
  const [bgSplitImages, setBgSplitImages] = useState([null, null, null, null]);
  const [bgAdjustment, setBgAdjustment] = useState({ scale: 1, rotate: 0, flipX: false, flipY: false });

  // UI State
  const [activeLayout, setActiveLayout] = useState('seamless');
  const [viewMode, setViewMode] = useState('canvas');
  const [toolMode, setToolMode] = useState('frame'); // 'frame' (move box) or 'content' (pan image)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // Mobile touch 
  // const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });


  // Dragging Refs/State
  const canvasRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState(null);

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // 'bg' or number
  const [editingType, setEditingType] = useState('content'); // 'content', 'frame', or 'bg' - NEW STATE
  const [tempTransform, setTempTransform] = useState({});

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);


  // save work section starts

  // const [state, setState] = useState(loadStateFromStorage);
  // console.log(state)
  // const saveTimeoutRef = useRef(null);

  // --- LOCAL STORAGE PERSISTENCE (EFFECTS) ---

  // 1. Automatic Debounced Save to Local Storage
  // useEffect(() => {
  //   // Only save if the component is mounted and we have valid state
  //   if (saveTimeoutRef.current) {
  //     clearTimeout(saveTimeoutRef.current);
  //   }

  //   // Debounce the save operation to avoid excessive writes
  //   saveTimeoutRef.current = setTimeout(() => {
  //     const stateToSave = {
  //       images,
  //       layouts,
  //       bgImage,
  //       bgColor,
  //       // lastSaved: new Date().toISOString()
  //     };
  //     try {
  //       localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  //       // Update the lastSaved state to reflect the automatic save time
  //       setState(s => ({ ...s, lastSaved: new Date() }));
  //       console.log('State automatically saved to Local Storage.');
  //     } catch (e) {
  //       console.error("Error saving state to local storage:", e);
  //       // Changed setMessage to use setState directly
  //       setState(s => ({ ...s, message: 'Error: Could not automatically save work.' }));
  //     }
  //   }, 5000); // 5 second debounce

  //   // Cleanup function to clear the timeout when the effect re-runs or component unmounts
  //   return () => {
  //     if (saveTimeoutRef.current) {
  //       clearTimeout(saveTimeoutRef.current);
  //     }
  //   };
  // }, [images, layouts, bgImage, bgColor]); // Dependencies that trigger save

  // const manualSave = () => {
  //   const stateToSave = {
  //     images,
  //     layouts,
  //     bgImage,
  //     bgColor,
  //     // lastSaved: new Date().toISOString()
  //   };
  //   try {
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  //     setState(s => ({ ...s, message: 'Work saved manually!', lastSaved: new Date() }));
  //   } catch (e) {
  //     setState(s => ({ ...s, message: 'Error: Failed to save work.' }));
  //     console.error("Manual save failed:", e);
  //   } finally {
  //     setTimeout(() => setState(s => ({ ...s, message: null })), 3000);
  //   }
  // };


  // const manualLoad = () => {
  //   const loadedState = loadStateFromStorage();
  //   setState(() => ({ ...loadedState, message: 'Work loaded successfully!' }));
  //   setTimeout(() => setState(s => ({ ...s, message: null })), 3000);
  // };

  // const manualClear = () => {
  //   // Use a custom modal in production, but window.confirm for simplicity here.
  //   // NOTE: Using a simple JS confirmation for this context, but in a real React app, a custom modal is preferred.
  //   if (!window.confirm("Are you sure you want to clear ALL saved work from this browser?")) return;
  //   try {
  //     localStorage.removeItem(STORAGE_KEY);
  //     setState(() => ({ ...getDefaultState(), message: 'Saved work cleared. Editor reset.' }));
  //   } catch (e) {
  //     setState(s => ({ ...s, message: 'Error: Failed to clear saved work.' }));
  //     console.error("Clear storage failed:", e);
  //   } finally {
  //     setTimeout(() => setState(s => ({ ...s, message: null })), 3000);
  //   }
  // };

  //   const formatTimestamp = (date) => {
  //     if (!date) return "Never";
  //     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' });
  // };

  // Save work section ends here


  // --- Effects ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); return;
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
    ]).then(() => setLibsLoaded(true)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // --- Handlers: Drag & Drop Ordering ---

  // Desktop Drag Start
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // Desktop Drag Over
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Desktop Drop Over
  const onDrop = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newImages = [...images];
    const itemToMove = newImages[draggedItemIndex];
    newImages.splice(draggedItemIndex, 1);
    newImages.splice(index, 0, itemToMove);
    setImages(newImages);

    // Swap adjustments too
    const newAdj = { ...imageAdjustments };
    const adjToMove = newAdj[draggedItemIndex];
    console.log("adjToMove", adjToMove)
    // This is complex because we rely on indices. 
    // Simplified: Reset adjustments on reorder for simplicity or map strictly.
    // For this demo, we'll just clear the swapped ones to prevent confusion.
    delete newAdj[draggedItemIndex];
    delete newAdj[index];
    setImageAdjustments(newAdj);
    setDraggedItemIndex(null);
  };

  // // Mobile Touch Start
  // const onTouchStart = (e, index) => {
  //   setDraggedItemIndex(index);
  //   const touch = e.touches[0];
  //   setTouchPosition({ x: touch.clientX, y: touch.clientY });

  // };

  // // Mobile Touch Move

  // // Mobile Touch Move
  // const onTouchMove = (e) => {
  //   e.preventDefault();
  //   const touch = e.touches[0];
  //   setTouchPosition({ x: touch.clientX, y: touch.clientY });
  // };


  // // Mobile Touch End
  // const onTouchEnd = (e, index) => {
  //   if (draggedItemIndex === null || draggedItemIndex === index) return;

  //   const newImages = [...images];
  //   const itemToMove = newImages[draggedItemIndex];
  //   newImages.splice(draggedItemIndex, 1);
  //   newImages.splice(index, 0, itemToMove);
  //   setImages(newImages);

  //   setDraggedItemIndex(null);
  // };



  // --- Handlers: Uploads ---
  const handleBulkUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    })).then(newImageUrls => {
      const updatedImages = [...images];
      newImageUrls.forEach((url, i) => {
        if (i < 4) updatedImages[i] = url;
        else updatedImages.push(url);
      });
      setImages(updatedImages);
    });
  }, [images]);

  const handleSingleImageUpload = (index, e) => {
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

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    setImageAdjustments(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  // --- Handlers: Canvas Drag Pan/Move ---
  const handleMouseDown = (e, index) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling issues
    setDraggingId(index);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e) => {
    if (draggingId === null) return;

    // Calculate raw delta
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Reset start to current for incremental updates
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (toolMode === 'content') {
      // MODE: Content (Crop/Pan Image inside Frame)
      setImageAdjustments(prev => {
        const current = prev[draggingId] || { x: 0, y: 0, scale: 1, rotate: 0 };
        return {
          ...prev,
          [draggingId]: { ...current, x: current.x + dx, y: current.y + dy }
        };
      });
    } else {
      // MODE: Frame (Move Layout Box)
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // Convert pixel delta to percentage delta based on canvas size
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;

        setLayouts(prev => {
          // Deep clone to modify the active layout items
          const newLayouts = { ...prev };
          const active = { ...newLayouts[activeLayout] };
          const newItems = [...active.items];
          const targetItem = { ...newItems[draggingId] };

          // Update position
          targetItem.left = `${parseFloat(targetItem.left) + dxPct}%`;
          targetItem.top = `${parseFloat(targetItem.top) + dyPct}%`;

          newItems[draggingId] = targetItem;
          active.items = newItems;
          newLayouts[activeLayout] = active;
          return newLayouts;
        });
      }
    }
  }, [draggingId, toolMode, activeLayout]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    if (draggingId !== null) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);


  // --- Handlers: Modal & Transformations ---
  const openEditModal = (indexOrBg, type = 'content') => { // Added 'type' parameter
    setEditingIndex(indexOrBg);
    setEditingType(type); // Set the type of editing

    // Load the correct transformation data into tempTransform
    if (indexOrBg === 'bg') {
      setTempTransform({ ...bgAdjustment });
    } else if (type === 'frame') {
      setTempTransform(frameAdjustments[indexOrBg] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false });
    } else { // type === 'content'
      setTempTransform(imageAdjustments[indexOrBg] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false });
    }
    setEditModalOpen(true);
  };


  const saveEditModal = () => {
    if (editingIndex === 'bg') {
      setBgAdjustment(tempTransform);
    } else if (editingType === 'frame') { // Save to frame adjustments
      setFrameAdjustments(prev => ({ ...prev, [editingIndex]: tempTransform }));
    } else { // Save to image content adjustments
      setImageAdjustments(prev => ({ ...prev, [editingIndex]: tempTransform }));
    }
    setEditModalOpen(false);
  };


  const updateTempTransform = (key, value) => {
    setTempTransform(prev => ({ ...prev, [key]: value }));
  };


  // --- AI Layout ---

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

    // console.log("imageCount", Images)
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

      // Reset frame adjustments for a new AI-generated layout
      setFrameAdjustments({
        0: { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false },
        1: { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false },
        2: { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false },
        3: { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false },
      });

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


  // function generateRandomLayout(prompt, count) {

  //   const Newlayout = {
  //     name: prompt.slice(0, 30),
  //     description: `Instagram collage layout for ${prompt}`,
  //     items: []
  //   };

  //   const isGridMode = count > 10; // Switch to grid for large counts

  //   if (isGridMode) {
  //     const columns = Math.ceil(Math.sqrt(count)); // Square-ish grid
  //     const rows = Math.ceil(count / columns);
  //     const cellWidth = 100 / columns;
  //     const cellHeight = 100 / rows;

  //     for (let i = 0; i < count; i++) {
  //       const col = i % columns;
  //       const row = Math.floor(i / columns);

  //       const left = `${col * cellWidth + 2}%`;
  //       const top = `${row * cellHeight + 2}%`;
  //       const width = `${cellWidth - 4}%`;
  //       const height = `${cellHeight - 4}%`;

  //       Newlayout.items.push({
  //         left,
  //         top,
  //         width,
  //         height,
  //         zIndex: 1,
  //         rotate: 0 // No rotation for grid
  //       });
  //     }
  //   } else {
  //     for (let i = 0; i < count; i++) {
  //       const left = `${Math.floor(Math.random() * 80)}%`;
  //       const top = `${Math.floor(Math.random() * 60)}%`;

  //       let width, height;
  //       if (count <= 4) {
  //         width = `${20 + Math.floor(Math.random() * 5)}%`;
  //         height = `${40 + Math.floor(Math.random() * 20)}%`;
  //       } else if (count <= 8) {
  //         width = `${15 + Math.floor(Math.random() * 10)}%`;
  //         height = `${30 + Math.floor(Math.random() * 20)}%`;
  //       } else {
  //         width = `${8 + Math.floor(Math.random() * 5)}%`;
  //         height = `${12 + Math.floor(Math.random() * 8)}%`;
  //       }

  //       const zIndex = Math.floor(Math.random() * 15) + 5;
  //       const rotate = Math.floor(Math.random() * 21) - 10;

  //       Newlayout.items.push({ left, top, width, height, zIndex, rotate });
  //     }
  //   }

  //   return Newlayout;
  // }

  function generateRandomLayout(prompt, count) {
    const Newlayout = {
      name: prompt.slice(0, 30),
      description: `Instagram collage layout for ${prompt}`,
      items: []
    };

    // ✅ Switch to grid mode if count > 10
    const isGridMode = count > 5;

    if (isGridMode) {
      // Calculate grid dimensions
      const columns = Math.ceil(Math.sqrt(count)); // Square-ish grid
      const rows = Math.ceil(count / columns);
      const cellWidth = 100 / columns; // Each cell width in %
      const cellHeight = 100 / rows;   // Each cell height in %

      for (let i = 0; i < count; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);

        const left = `${col * cellWidth + 2}%`; // Add small margin
        const top = `${row * cellHeight + 2}%`;

        const width = `${cellWidth - 4}%`; // Slight margin inside cell
        const height = `${cellHeight - 4}%`;

        Newlayout.items.push({
          left,
          top,
          width,
          height,
          zIndex: 1,
          rotate: 0 // No rotation for grid mode
        });
      }
    } else {
      // ✅ Collage Mode for <=10
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


  // --- Export Logic (Updated to include frame adjustments) ---

  const handleExport = async () => {
    if (!window.JSZip || !window.saveAs) { alert("Export libraries loading..."); return; }
    setIsExporting(true);
    try {
      const canvasWidth = 4320; const canvasHeight = 1350; const singleSlideWidth = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth; canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      // 1. Background
      ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      if (bgMode === 'image' && bgImage) {
        const bgImg = await loadImage(bgImage);
        if (bgImg) {
          ctx.save();
          ctx.translate(canvasWidth / 2, canvasHeight / 2);
          ctx.rotate((bgAdjustment.rotate * Math.PI) / 180);
          ctx.scale((bgAdjustment.flipX ? -1 : 1) * bgAdjustment.scale, (bgAdjustment.flipY ? -1 : 1) * bgAdjustment.scale);
          ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
          if (bgFit === 'cover') drawCoverImage(ctx, bgImg, 0, 0, canvasWidth, canvasHeight);
          else ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
          ctx.restore();
        }
      } else if (bgMode === 'split') {
        for (let i = 0; i < 4; i++) {
          if (bgSplitImages[i]) {
            const bgImg = await loadImage(bgSplitImages[i]);
            if (bgImg) drawCoverImage(ctx, bgImg, i * singleSlideWidth, 0, singleSlideWidth, canvasHeight);
          } else { ctx.fillStyle = bgColor; ctx.fillRect(i * singleSlideWidth, 0, singleSlideWidth, canvasHeight); }
        }
      }

      // 2. Load Images
      const loadedImages = await Promise.all(images.map(src => src ? loadImage(src) : Promise.resolve(null)));

      // 3. Draw Items
      if (layouts[activeLayout]) {
        const layoutItems = layouts[activeLayout].items;
        const indexedItems = layoutItems.map((item, idx) => ({ ...item, img: loadedImages[idx], originalIndex: idx })).sort((a, b) => a.zIndex - b.zIndex);

        indexedItems.forEach(item => {
          if (!item.img) return;
          let x = (parseFloat(item.left) / 100) * canvasWidth;
          let y = (parseFloat(item.top) / 100) * canvasHeight;
          let w = (parseFloat(item.width) / 100) * canvasWidth;
          let h = (parseFloat(item.height) / 100) * canvasHeight;

          ctx.save();

          // FRAME ADJUSTMENTS (New: applied before clipping/image content)
          const fAdj = frameAdjustments[item.originalIndex] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false };

          // 1. Translate frame to its center for rotation/scale
          const frameCenterX = x + w / 2;
          const frameCenterY = y + h / 2;

          ctx.translate(frameCenterX, frameCenterY);

          // 2. Apply complex frame transforms
          ctx.rotate((fAdj.rotate * Math.PI) / 180);
          ctx.scale((fAdj.flipX ? -1 : 1) * fAdj.scale, (fAdj.flipY ? -1 : 1) * fAdj.scale);

          // 3. Translate back, applying any translation offset from drag (fAdj.x/y is 0 here from this logic)
          ctx.translate(-frameCenterX, -frameCenterY);

          // 4. Create the clipping mask (the frame itself)
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip(); // Clip everything outside the rotated/scaled frame box

          // IMAGE CONTENT ADJUSTMENTS (Original: applied inside the clipped area)
          const iAdj = imageAdjustments[item.originalIndex] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false };
          const exportScaleFactor = 3.5;

          const imgCenterX = x + w / 2;
          const imgCenterY = y + h / 2;

          // 1. Translate to image center inside the frame
          ctx.translate(imgCenterX, imgCenterY);

          // 2. Apply content transforms
          ctx.rotate((iAdj.rotate * Math.PI) / 180);
          ctx.scale((iAdj.flipX ? -1 : 1) * iAdj.scale, (iAdj.flipY ? -1 : 1) * iAdj.scale);

          // 3. Apply pan (iAdj.x/y)
          ctx.translate(iAdj.x * exportScaleFactor, iAdj.y * exportScaleFactor);

          // 4. Draw image
          const imgRatio = item.img.width / item.img.height;
          const targetRatio = w / h;
          let drawW, drawH;
          if (imgRatio > targetRatio) { drawH = h; drawW = h * imgRatio; } else { drawW = w; drawH = w / imgRatio; }
          ctx.drawImage(item.img, -drawW / 2, -drawH / 2, drawW, drawH);

          ctx.restore();
        });
      }

      // 4. Slice
      const zip = new window.JSZip();
      for (let i = 0; i < 4; i++) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = singleSlideWidth; sliceCanvas.height = canvasHeight;
        const sliceCtx = sliceCanvas.getContext('2d');
        const sourceData = ctx.getImageData(i * singleSlideWidth, 0, singleSlideWidth, canvasHeight);
        sliceCtx.putImageData(sourceData, 0, 0);
        const blob = await new Promise(resolve => sliceCanvas.toBlob(resolve, 'image/jpeg', 0.95));
        zip.file(`slide_${i + 1}.jpg`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      window.saveAs(content, "instagram-carousel.zip");

    } catch (error) { console.error(error); alert("Export Failed"); } finally { setIsExporting(false); }
  };

  const loadImage = (src) => new Promise(r => { const i = new Image(); if (!src.startsWith('data:')) i.crossOrigin = "anonymous"; i.src = src; i.onload = () => r(i); i.onerror = () => r(null); });


  const drawCoverImage = (ctx, img, x, y, w, h) => {
    const r = img.width / img.height; const tr = w / h;
    let dw, dh, dx, dy;
    if (r > tr) { dh = h; dw = h * r; dx = x - (dw - w) / 2; dy = y; } else { dw = w; dh = w / r; dx = x; dy = y - (dh - h) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // --- Render Helpers ---
  const getRenderStyle = (index) => {
    if (!layouts[activeLayout] || !layouts[activeLayout].items[index]) return {};
    const item = layouts[activeLayout].items[index];

    // Frame adjustment (New)
    const fAdj = frameAdjustments[index] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false };

    // Image content adjustment (Original)
    const iAdj = imageAdjustments[index] || { x: 0, y: 0, scale: 1, rotate: 0, flipX: false, flipY: false };

    // Apply complex frame transform to the container
    // Note: fAdj.x/y is not used here as frame movement is handled by item.left/top in the layout state for now.
    const frameTransform = `rotate(${fAdj.rotate}deg) scale(${fAdj.scale}) scaleX(${fAdj.flipX ? -1 : 1}) scaleY(${fAdj.flipY ? -1 : 1})`;

    return {
      container: {
        left: item.left, top: item.top, width: item.width, height: item.height,
        zIndex: item.zIndex,
        transform: frameTransform,
        cursor: toolMode === 'frame' ? 'move' : 'default',
        transformOrigin: 'center'
      },
      image: {
        // Apply image content transform
        transform: `translate(${iAdj.x}px, ${iAdj.y}px) rotate(${iAdj.rotate}deg) scale(${iAdj.scale}) scaleX(${iAdj.flipX ? -1 : 1}) scaleY(${iAdj.flipY ? -1 : 1})`,
        cursor: toolMode === 'content' ? (draggingId === index ? 'grabbing' : 'grab') : 'default'
      }
    };
  };


  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-sans selection:bg-indigo-500/30 pb-20`}>

      {/* Header */}
      <div className={`border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-[100]`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${THEME.accent} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20`}>
              <Grid size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Mosaicly</h1>
              <div className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Pro Edition</div>
            </div>
          </div>


          {/* Save work */}

          {/* --- SAVE WORK SECTION --- */}
          {/* <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 mr-2">
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={manualSave} className={`flex-1 px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${THEME.accent} text-white flex items-center justify-center gap-1`}>
                <Save size={14} /> Save Now
              </button>
              <button onClick={manualLoad} className={`flex-1 px-4 py-1.5 text-xs font-medium rounded-lg transition-all bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1`}>
                <RefreshCw size={14} /> Load Work
              </button>
              <button onClick={manualClear} className={`flex-1 px-4 py-1.5 text-xs font-medium rounded-lg transition-all bg-red-900/40 ${THEME.danger} flex items-center justify-center gap-1`}>
              <Trash2 size={14} /> Clear Saved State
            </button>
            </div>
            
          </div> */}

          <div className="flex gap-2">
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 mr-2">
              <button onClick={() => setViewMode('canvas')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'canvas' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Canvas</button>
              <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Preview</button>
            </div>
            <button
              onClick={handleExport}
              disabled={!libsLoaded || isExporting}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs transition-all ${isExporting ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              {isExporting ? <Loader className="animate-spin" size={14} /> : <Download size={14} />}
              {isExporting ? 'Packaging...' : 'Export ZIP'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">

          {/* LEFT PANEL: Photos */}
          <div className={`lg:col-span-3 ${THEME.panel} rounded-xl p-4 flex flex-col h-[calc(100vh-140px)]`}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Upload size={14} /> Assets
              </h2>
              <label className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 font-medium border border-zinc-700">
                <Plus size={12} /> Bulk
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleBulkUpload} />
              </label>
            </div>

            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 overflow-y-auto p-1 custom-scrollbar">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  draggable={!!img}
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  // onTouchStart={(e) => onTouchStart(e, idx)}
                  // onTouchMove={(e) => onTouchMove(e)}
                  // onTouchEnd={(e) => onTouchEnd(e, idx)}
                  className="group relative aspect-square bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all cursor-move"


                >
                  {img ? (
                    <>
                      <img src={img} loading="lazy" alt={`Asset ${idx}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button onClick={() => openEditModal(idx)} className="p-2 bg-zinc-900 rounded-full hover:bg-indigo-600 text-white transition-colors border border-zinc-700" title="Edit Transform">
                          <Maximize2 size={14} />
                        </button>
                        <button onClick={() => removeImage(idx)} className="p-2 bg-zinc-900 rounded-full hover:bg-red-500 text-white transition-colors border border-zinc-700" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Drag Handle Indicator */}
                      <div className="absolute top-2 left-2 bg-black/50 p-1 rounded text-zinc-400">
                        <GripVertical size={12} />
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors">
                      <Plus size={20} className="text-zinc-600" />
                      <span className="text-[10px] text-zinc-600 mt-2">Add Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(idx, e)} />
                    </label>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-500 text-center">Drag to reorder • Drop on canvas</div>
            </div>
          </div>

          {/* CENTER/RIGHT PANEL: Layouts & Controls */}
          <div className="lg:col-span-9 space-y-6">

            {/* Top Toolbar */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
              {/* Layout Selector */}
              <div className={`${THEME.panel} rounded-xl p-4 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2"><Layout size={14} /> Templates</h2>
                  <button onClick={() => setShowAiPanel(!showAiPanel)} className={`text-[10px] flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${showAiPanel ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}>
                    <Sparkles size={10} /> {showAiPanel ? 'Close AI' : 'Generate'}
                  </button>
                </div>

                {showAiPanel && (
                  <div className="mb-3 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                    <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe a layout (e.g. 'Chaotic 90s magazine collage')..." className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none h-16 mb-2" />
                    <button onClick={generateLayout} disabled={isGeneratingAI || !aiPrompt.trim()} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white transition-colors disabled:opacity-50">{isGeneratingAI ? 'Generating...' : 'Create Layout'}</button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-2 gap-2">
                  {Object.entries(layouts).map(([key, layout]) => (
                    <button key={key} onClick={() => setActiveLayout(key)} className={`text-left p-3 rounded-lg border transition-all relative overflow-hidden group ${activeLayout === key ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'}`}>
                      <div className={`text-xs font-medium mb-1 ${activeLayout === key ? 'text-indigo-300' : 'text-zinc-300'}`}>{layout.name}</div>
                      <div className="text-[10px] text-zinc-500 leading-tight line-clamp-2">{layout.description}</div>
                      {activeLayout === key && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Editor */}
              <div className={`${THEME.panel} rounded-xl p-4 flex flex-col h-64`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2"><PaintBucket size={14} /> Background</h2>
                  {bgMode === 'image' && bgImage && (
                    <button onClick={() => openEditModal('bg')} className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300"><Settings2 size={12} /> Edit BG</button>
                  )}
                </div>

                <div className="flex bg-zinc-950 p-1 rounded-lg mb-4 border border-zinc-800">
                  <button onClick={() => setBgMode('color')} className={`flex-1 py-1.5 text-[10px] font-medium rounded ${bgMode === 'color' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Solid</button>
                  <button onClick={() => setBgMode('image')} className={`flex-1 py-1.5 text-[10px] font-medium rounded ${bgMode === 'image' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Image</button>
                  <button onClick={() => setBgMode('split')} className={`flex-1 py-1.5 text-[10px] font-medium rounded ${bgMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Split</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {bgMode === 'color' && (
                    <div className="flex gap-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-12 rounded bg-transparent border-0 cursor-pointer" />
                      <div className="flex-1 flex flex-col justify-center">
                        <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono uppercase w-full" />
                        <span className="text-[10px] text-zinc-600 mt-1">Hex Code</span>
                      </div>
                    </div>
                  )}

                  {bgMode === 'image' && (
                    <div className="space-y-3">
                      <div className="aspect-[3/1] bg-zinc-950 border border-zinc-800 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden group">
                        {bgImage ? (
                          <div className="w-full h-full relative">
                            <img src={bgImage} className={`w-full h-full ${bgFit === 'cover' ? 'object-cover' : 'object-contain'}`} style={{ transform: `scale(${bgAdjustment.scale}) rotate(${bgAdjustment.rotate}deg) scaleX(${bgAdjustment.flipX ? -1 : 1}) scaleY(${bgAdjustment.flipY ? -1 : 1})` }} />
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">Upload Pano</span>
                        )}
                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={16} />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => setBgImage(r.result); r.readAsDataURL(f); }
                          }} />
                        </label>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500">Mode</span>
                        <button onClick={() => setBgFit(bgFit === 'cover' ? 'contain' : 'cover')} className="text-[10px] px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">
                          {bgFit === 'cover' ? 'Cover' : 'Fit'}
                        </button>
                      </div>
                    </div>
                  )}

                  {bgMode === 'split' && (
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="aspect-[3/4] bg-zinc-950 border border-zinc-800 border-dashed rounded flex items-center justify-center relative overflow-hidden group">
                          {bgSplitImages[i] ? <img src={bgSplitImages[i]} className="w-full h-full object-cover" /> : <span className="text-[9px] text-zinc-700">{i + 1}</span>}
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={12} className="text-zinc-400" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { const n = [...bgSplitImages]; n[i] = r.result; setBgSplitImages(n) }; r.readAsDataURL(f); }
                            }} />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CANVAS AREA */}
            <div className={`${THEME.panel} rounded-xl p-1 min-h-[400px] flex flex-col relative`}>
              {viewMode === 'canvas' ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Maximize2 size={14} className="text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-300">Master Canvas</span>
                      <span className="text-[10px] text-zinc-600 font-mono ml-2">4320 x 1350px</span>
                    </div>

                    {/* Tool Toggle */}
                    <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                      <button
                        onClick={() => setToolMode('frame')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1 ${toolMode === 'frame' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Move size={10} /> Move Frame
                      </button>
                      <button
                        onClick={() => setToolMode('content')}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1 ${toolMode === 'content' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Crop size={10} /> Pan Image
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto p-4 custom-scrollbar bg-zinc-950/50">
                    <div ref={canvasRef} className="relative aspect-[4/1.25] border border-zinc-800 rounded-md overflow-hidden shadow-2xl min-w-[1000px] bg-zinc-900 mx-auto"
                      style={{ backgroundColor: bgMode === 'color' ? bgColor : '#18181b' }}>

                      {/* Background Layer */}
                      {bgMode === 'image' && bgImage && (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img src={bgImage} className={`w-full h-full ${bgFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                            style={{ transform: `scale(${bgAdjustment.scale}) rotate(${bgAdjustment.rotate}deg) scaleX(${bgAdjustment.flipX ? -1 : 1}) scaleY(${bgAdjustment.flipY ? -1 : 1})` }} />
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

                      {/* Guides */}
                      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none z-30">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="border-r border-dashed border-indigo-500/20 h-full relative">
                            <span className="absolute bottom-2 right-2 text-[9px] text-indigo-500/40 font-mono">SLICE {i}</span>
                          </div>
                        ))}
                      </div>

                      {/* Foreground Images */}
                      {images.map((img, idx) => {
                        const style = getRenderStyle(idx);
                        {/* if (!style.container.left) return null; */ }
                        return (
                          <div key={idx} className="absolute group" style={style.container} onMouseDown={(e) => handleMouseDown(e, idx)}
                          
                          >
                            <div className="w-full h-full overflow-hidden relative shadow-xl hover:shadow-indigo-500/20 transition-shadow">
                              {img ? (
                                <>
                                  <img src={img} draggable={false}
                                   
                                    className="w-full h-full object-cover pointer-events-none select-none" style={style.image} />
                                  {/* Quick Actions Overlay */}
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">

                                    {/* NEW BUTTON: Edit Frame Properties */}
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(idx, 'frame'); }}
                                      className="p-1 bg-black/60 rounded text-white hover:bg-green-600 backdrop-blur-md"
                                      title="Edit Frame Properties">
                                      <Layout size={10} />
                                    </button>

                                    {/* ORIGINAL BUTTON: Edit Content Properties */}
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(idx, 'content'); }}
                                      className="p-1 bg-black/60 rounded text-white hover:bg-indigo-600 backdrop-blur-md"
                                      title="Edit Image Content Properties">
                                      <Maximize2 size={10} />
                                    </button>

                                    <label className="p-1 bg-black/60 rounded text-white hover:bg-zinc-700 backdrop-blur-md cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                      <RefreshCw size={10} />
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(idx, e)} />
                                    </label>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center border-2 border-dashed border-zinc-700">
                                  <span className="text-[10px] text-zinc-500">Empty Frame</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Phone Preview */
                <div className="flex flex-col items-center justify-center py-8 h-full bg-zinc-950/50">
                  <div className="relative w-[300px] h-[580px] bg-black border-[6px] border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
                    {/* Dynamic Content */}
                    <div className="mt-8 relative h-full bg-zinc-900">
                      <div className="h-full flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        <div className="min-w-full h-full relative" style={{ backgroundColor: bgMode === 'color' ? bgColor : '#18181b' }}>
                          {/* Simplified Preview Rendering (No BG Transforms for perf in preview, just static crop) */}
                          {bgMode === 'image' && bgImage && <img src={bgImage} className={`w-full h-full ${bgFit === 'cover' ? 'object-cover' : 'object-contain'}`} />}
                          {/* Render images roughly */}
                          {images.map((img, idx) => {
                            const s = getRenderStyle(idx);
                            if (!s.container.left) return null;
                            return (
                              <div key={idx} className="absolute overflow-hidden"
                                style={{ ...s.container, width: `calc(${s.container.width} * 4)`, left: `calc(${s.container.left} * 4)` }}>
                                {img && <img src={img} className="w-full h-full object-cover" />}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Overlay Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-50">
                      {[0, 1, 2, 3].map(d => <div key={d} className={`w-1.5 h-1.5 rounded-full ${currentSlide === d ? 'bg-indigo-500' : 'bg-white/20'}`}></div>)}
                    </div>
                    <button onClick={() => setCurrentSlide(p => Math.max(0, p - 1))} className="absolute top-1/2 left-2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur rounded-full text-white/50 hover:bg-black/40"><ArrowLeft size={16} /></button>
                    <button onClick={() => setCurrentSlide(p => Math.min(3, p + 1))} className="absolute top-1/2 right-2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur rounded-full text-white/50 hover:bg-black/40"><ArrowRight size={16} /></button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-4">Interactive Preview Mode</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* --- EDIT MODAL --- */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Settings2 size={16} /> Image Adjustments
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 font-bold mb-2 block flex justify-between">
                    <span>Scale</span> <span>{tempTransform.scale?.toFixed(1)}x</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <ZoomIn size={14} className="text-zinc-500" />
                    <input type="range" min="0.5" max="3" step="0.1"
                      value={tempTransform.scale || 1}
                      onChange={(e) => updateTempTransform('scale', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-zinc-500 font-bold mb-2 block flex justify-between">
                    <span>Rotation</span> <span>{tempTransform.rotate || 0}°</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <RotateCw size={14} className="text-zinc-500" />
                    <input type="range" min="-180" max="180" step="5"
                      value={tempTransform.rotate || 0}
                      onChange={(e) => updateTempTransform('rotate', parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => updateTempTransform('flipX', !tempTransform.flipX)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${tempTransform.flipX ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <FlipHorizontal size={14} /> Flip X
                  </button>
                  <button
                    onClick={() => updateTempTransform('flipY', !tempTransform.flipY)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${tempTransform.flipY ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <FlipVertical size={14} /> Flip Y
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className="aspect-video bg-black rounded-lg border border-zinc-800 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                {editingIndex === 'bg' && bgImage ? (
                  <img src={bgImage} className="max-w-[80%] max-h-[80%] object-contain"
                    style={{ transform: `scale(${tempTransform.scale}) rotate(${tempTransform.rotate}deg) scaleX(${tempTransform.flipX ? -1 : 1}) scaleY(${tempTransform.flipY ? -1 : 1})`, transition: 'transform 0.2s' }} />
                ) : editingIndex !== 'bg' && images[editingIndex] ? (
                  <img src={images[editingIndex]} className="max-w-[80%] max-h-[80%] object-contain"
                    style={{ transform: `scale(${tempTransform.scale}) rotate(${tempTransform.rotate}deg) scaleX(${tempTransform.flipX ? -1 : 1}) scaleY(${tempTransform.flipY ? -1 : 1})`, transition: 'transform 0.2s' }} />
                ) : <span className="text-zinc-600 text-xs">No Preview</span>}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-2">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={saveEditModal} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                <Check size={14} /> Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Photogrid;