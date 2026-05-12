import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, RefreshCw, AlertCircle, CheckCircle2, ThumbsUp, Lightbulb, PlayCircle, Share2, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analyzeArticulation, ArticulationAnalysis } from './services/geminiService';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<ArticulationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [activeText, setActiveText] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const sampleText = "anggota Badan Pemeriksa Keuangan dipilih oleh Dewan Perwakilan Rakyat dengan memperhatikan pertimbangan Dewan Perwakilan Daerah dan diresmikan oleh Presiden";

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      setAnalysis(null);
      setDuration(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = { mimeType: 'audio/webm' };
      // Fallback for Safari
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' };
      }
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        await handleAudioProcessing(audioBlob, mimeType);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Izin mikrofon ditolak. Silakan izinkan akses mikrofon untuk menggunakan aplikasi ini.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error("Gagal membaca audio"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const result = await analyzeArticulation(base64, mimeType, activeText);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat menganalisis audio. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setDuration(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDownloadScreenshot = async () => {
    if (!resultsRef.current) return;
    try {
      setIsDownloading(true);
      
      const dataUrl = await htmlToImage.toPng(resultsRef.current, {
        backgroundColor: '#FDFCF8',
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `artikula-hasil-${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error("Gagal mengambil screenshot", err);
      setError("Gagal menghasilkan gambar untuk dibagikan.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3D3B36] font-sans selection:bg-[#8A9A5B]/20">
      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
        
        <header className="text-center space-y-4 mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8A9A5B] text-white shadow-sm rounded-full mb-2">
            <Mic size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold italic tracking-tight text-[#3D3B36]">
            Artikula Assistant
          </h1>
          <p className="text-sm font-medium uppercase tracking-widest opacity-70 max-w-xl mx-auto">
            Pelatih artikulasi pribadi Anda. Rekam suara Anda saat berbicara atau membaca sesuatu, dan AI kami akan memberikan ulasan, skor, serta saran perbaikan.
          </p>
        </header>

        {error && (
          <div className="bg-[#FDFCF8] border border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-start gap-4">
            <AlertCircle className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* RECODER SECTION */}
        {!analysis && (
          <Card className="p-10 border border-[#EAE7DF] rounded-[40px] bg-white shadow-sm flex flex-col items-center justify-center text-center gap-8">
            
            <div className="w-full max-w-2xl px-4">
              {activeText ? (
                <div className="bg-[#F5F5F0] rounded-3xl p-6 border border-[#EAE7DF] relative">
                  <button 
                    onClick={() => setActiveText(null)}
                    className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-[#EAE7DF] text-[#5A5A40] hover:bg-[#D4A373] hover:text-white transition-colors"
                  >
                    &times;
                  </button>
                  <p className="text-xl font-serif italic text-[#3D3B36] leading-relaxed">"{activeText}"</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mt-4">Teks Latihan</p>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveText(sampleText)}
                  className="px-6 py-2.5 rounded-full border border-[#EAE7DF] text-[#5A5A40] text-xs font-bold uppercase tracking-widest hover:bg-[#F5F5F0] transition-colors"
                 >
                  Gunakan Sampel Teks
                </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div 
                className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 shadow-lg ${
                  isRecording ? 'bg-red-500 text-white scale-105' : 'bg-[#5A5A40] text-white hover:scale-105 cursor-pointer'
                }`}
                onClick={!isRecording && !isProcessing ? startRecording : undefined}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-full border-[3px] border-red-500/30 animate-ping"></span>
                )}
                
                {isProcessing ? (
                  <Loader2 size={40} className="animate-spin text-[#8A9A5B]" />
                ) : isRecording ? (
                   <Mic size={40} className="animate-pulse" />
                ) : (
                  <PlayCircle size={48} strokeWidth={1.5} />
                )}
              </div>
              
              <div className="space-y-1">
                {isRecording ? (
                  <>
                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-4">Merekam...</p>
                    <p className="text-3xl font-serif text-[#3D3B36] tracking-wider font-bold mt-1">{formatTime(duration)}</p>
                  </>
                ) : isProcessing ? (
                   <p className="text-[#8A9A5B] font-bold uppercase tracking-widest text-xs mt-4">Menganalisis audio...</p>
                ) : (
                  <p className="text-[#3D3B36] opacity-60 font-medium text-sm mt-4">Ketuk untuk mulai merekam</p>
                )}
              </div>
            </div>

            {isRecording && (
              <button 
                onClick={stopRecording}
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#5A5A40] text-[#5A5A40] rounded-full font-bold shadow-sm hover:bg-[#F5F5F0] transition-colors uppercase tracking-widest text-xs"
              >
                <Square size={16} fill="currentColor" />
                Hentikan Rekaman
              </button>
            )}
          </Card>
        )}

        {/* RESULTS SECTION */}
        {analysis && (
          <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[40px] px-2 py-4 bg-[#FDFCF8]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-2xl font-serif italic tracking-tight font-bold text-[#3D3B36] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#8A9A5B] rounded-full flex items-center justify-center text-white shadow-sm">
                  <Mic size={16} />
                </div>
                Hasil Analisis
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadScreenshot}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-full border border-[#D4A373] text-[#D4A373] text-xs font-bold uppercase tracking-widest hover:bg-[#D4A373] hover:text-white transition-colors disabled:opacity-50"
                  title="Simpan Hasil"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Simpan Hasil
                </button>
                <button 
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-[#8A9A5B] text-white text-xs font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-opacity"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              <Card className="p-8 border border-[#EAE7DF] rounded-3xl bg-[#F5F5F0] shadow-sm md:col-span-1 flex flex-col items-center justify-center text-center gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 block mb-1">Skor Artikulasi</p>
                  <div className="text-7xl font-serif font-bold text-[#8A9A5B]">
                    {analysis.score}
                  </div>
                </div>
                <Progress value={analysis.score} className="h-2 w-full max-w-[160px] bg-[#EAE7DF] [&>div]:bg-[#D4A373]" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">
                  {analysis.score >= 80 ? 'Sangat Baik' : analysis.score >= 60 ? 'Cukup Baik' : 'Perlu Peningkatan'}
                </p>
              </Card>

              <Card className="p-8 border border-[#EAE7DF] rounded-3xl bg-[#F5F5F0] shadow-sm md:col-span-2 flex flex-col justify-center">
                <h3 className="flex items-center gap-2 text-xl font-serif italic mb-3 text-[#3D3B36]">
                  <CheckCircle2 className="text-[#8A9A5B]" size={20} />
                  Ringkasan
                </h3>
                <p className="text-sm leading-relaxed opacity-90">
                  {analysis.summary}
                </p>
                <div className="mt-6 p-5 bg-white rounded-2xl border border-[#EAE7DF]">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Transkrip</p>
                  <p className="text-[#3D3B36] italic font-serif text-lg">"{analysis.transcript}"</p>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 border border-[#EAE7DF] rounded-3xl bg-white shadow-sm flex flex-col">
                <h3 className="flex items-center gap-2 text-xl font-serif italic mb-6 text-[#3D3B36]">
                  <ThumbsUp className="text-[#8A9A5B]" size={20} />
                  Kekuatan Anda
                </h3>
                <ul className="space-y-4">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EAE7DF] text-[#3D3B36] flex items-center justify-center shrink-0 mt-0.5 font-serif italic">
                        <span className="text-sm">{idx + 1}</span>
                      </div>
                      <span className="text-sm leading-relaxed opacity-90">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-8 border-0 rounded-[40px] bg-[#5A5A40] text-[#FDFCF8] shadow-md flex flex-col">
                <h3 className="flex items-center gap-2 text-xl font-serif italic mb-6 text-[#FDFCF8]">
                  <Lightbulb className="text-[#D4A373]" size={20} />
                  Saran Perbaikan
                </h3>
                <ul className="space-y-4 flex-1">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8A9A5B] flex items-center justify-center shrink-0 mt-0.5 font-serif italic text-white">
                        <span className="text-sm">{idx + 1}</span>
                      </div>
                      <span className="text-sm leading-relaxed opacity-90">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
