import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, Download, X, Wand2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const PRESET_STYLES = [
  { id: 'anime', label: '動漫風格', description: 'Inspired by Japanese animation with vibrant colors and distinct character designs.', prompt: 'Anime style, Studio Ghibli, high quality, vibrant colors, 2D illustration' },
  { id: 'cyberpunk', label: '賽博龐克', description: 'Futuristic sci-fi aesthetic with neon lights and high-tech elements.', prompt: 'Cyberpunk style, neon lights, futuristic city, highly detailed, sci-fi' },
  { id: 'watercolor', label: '水彩畫', description: 'Artistic painting style with soft edges and expressive brush strokes.', prompt: 'Watercolor painting style, artistic, soft edges, expressive brush strokes' },
  { id: 'sketch', label: '鉛筆素描', description: 'Detailed black and white hand-drawn pencil illustration.', prompt: 'Pencil sketch style, detailed, black and white, hand-drawn' },
  { id: '3d', label: '3D 渲染', description: 'High-quality 3D computer graphics similar to modern animated films.', prompt: '3D render, Pixar style, Unreal Engine 5, volumetric lighting, cute' },
];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(PRESET_STYLES[0].id);
  const [customStyle, setCustomStyle] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片檔案 (JPEG, PNG 等)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setOriginalImage(result);
      setMimeType(file.type);
      setGeneratedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setError('請先上傳圖片');
      return;
    }

    const promptText = selectedStyle === 'custom' 
      ? customStyle 
      : PRESET_STYLES.find(s => s.id === selectedStyle)?.prompt;

    if (!promptText || promptText.trim() === '') {
      setError('請選擇或輸入風格');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = originalImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: `Convert this image to the following style: ${promptText}. Keep the main subject and composition the same.`,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imgUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            setGeneratedImage(imgUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error('無法生成圖片，請稍後再試');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '發生錯誤，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `styled-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <Wand2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">AI 圖片風格轉換</h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            上傳您的照片，選擇喜歡的風格，讓 AI 為您重新繪製獨一無二的藝術作品。
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload & Original */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/60">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                原始圖片
              </h2>
              
              {!originalImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`aspect-square w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-zinc-300 hover:border-indigo-400 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${isDragging ? 'text-indigo-700' : 'text-zinc-700'}`}>
                      {isDragging ? '放開以載入圖片' : '點擊或拖曳上傳圖片'}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">支援 JPG, PNG 格式</p>
                  </div>
                </div>
              ) : (
                <div className="relative group aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100">
                  <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setOriginalImage(null);
                        setGeneratedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      移除圖片
                    </button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Right Column: Settings & Result */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/60">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                選擇轉換風格
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {PRESET_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${
                      selectedStyle === style.id 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className={`text-xs leading-relaxed ${selectedStyle === style.id ? 'text-indigo-600/80' : 'text-zinc-500'}`}>
                      {style.description}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedStyle('custom')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 ${
                    selectedStyle === 'custom' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="font-medium">自訂風格...</div>
                  <div className={`text-xs leading-relaxed ${selectedStyle === 'custom' ? 'text-indigo-600/80' : 'text-zinc-500'}`}>
                    Describe your own unique style using text.
                  </div>
                </button>
              </div>

              {selectedStyle === 'custom' && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    描述您想要的風格 (支援中文或英文)
                  </label>
                  <textarea
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="例如：梵谷的星夜風格、8-bit 像素風、黑白復古照片..."
                    className="w-full p-4 rounded-2xl border-2 border-zinc-200 focus:border-indigo-500 focus:ring-0 resize-none transition-colors outline-none"
                    rows={3}
                  />
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!originalImage || isGenerating || (selectedStyle === 'custom' && !customStyle.trim())}
                className="w-full py-4 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-2xl font-medium text-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 正在繪製中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    開始轉換
                  </>
                )}
              </button>
            </div>

            {/* Result Area */}
            {generatedImage && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    轉換結果
                  </h2>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下載圖片
                  </button>
                </div>
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100">
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
