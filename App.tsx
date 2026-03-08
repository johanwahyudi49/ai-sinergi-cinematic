import React, { useState, useRef, useEffect } from 'react';
import { 
  Clapperboard, 
  Film, 
  Camera, 
  Image as ImageIcon, 
  RefreshCw, 
  Sparkles,
  FileText,
  ArrowRight,
  Save,
  Wand2,
  Download,
  Users,
  User,
  Upload,
  ChevronDown,
  ChevronUp,
  Dices,
  Sparkle,
  MapPin,
  Package,
  Plus,
  X,
  Eye,
  FileImage,
  Trash2,
  Maximize2,
  Aperture,
  Move,
  Check,
  Grid,
  Palette,
  RotateCcw,
  FileJson,
  Printer,
  AlertTriangle,
  Home,
  FolderOpen,
  SaveAll,
  PaintBucket,
  Eraser,
  Video,
  Copy,
  Loader2,
  Music,
  Headphones,
  Play,
  Pause,
  Volume2,
  Mic
} from 'lucide-react';
import { generateStoryboardImage, generateScriptContent, generateSpeech } from './services/geminiService';

// --- Types ---
interface Character {
  id: number;
  name: string;
  desc: string;
}

interface ProfileItem {
  id: number;
  name: string;
  description: string;
  detailedDescription: string;
  prompt: string;
  imageUrl: string | null;
  imageHistory: string[]; 
  refImageUrls: string[];
  isGeneratingImage: boolean;
  isUploaded: boolean;
}

interface Shot {
  id: number;
  time: string;
  act: string;
  shotSize: string;
  cameraAngle: string;
  mood: string;
  action: string;
  prompt: string | null;
  isGeneratingPrompt: boolean;
  imageUrl: string | null;
  imageHistory: string[]; 
  isGeneratingImage: boolean;
  aspectRatio: "16:9" | "9:16";
  characterRefIds: number[];
  locationRefId: string;
  elementRefIds: number[]; // Changed to array for multi-select
  videoPrompt: string | null; 
  isGeneratingVideoPrompt: boolean; 
}

// --- Constants ---
const genresList = [
  "Fiksi Ilmiah (Sci-Fi)", "Film Noir", "Fantasi", "Aksi/Petualangan", "Horor", "Dokumenter", "Romantis", "Cyberpunk", "Drama Sejarah", "Thriller Psikologis", "Misteri", "Komedi Gelap", "Surrealis", "Biografi", "Film Keluarga", "1980"
];

const predefinedMoods = ["Tegang (Tense)", "Melankolis", "Ceria (Upbeat)", "Misterius", "Epik", "Sepi (Isolation)", "Kacau (Chaotic)", "Romantis", "Nostalgic", "Horrific"];
const shotSizes = ["Extreme Close Up (ECU)", "Close Up (CU)", "Medium Close Up (MCU)", "Medium Shot (MS)", "Cowboy Shot", "Full Shot (FS)", "Wide Shot (WS)", "Extreme Wide Shot (EWS)"];
const cameraAngles = ["Eye Level", "Low Angle", "High Angle", "Overhead / Top Down", "Dutch Angle / Canted", "Over the Shoulder (OTS)", "Point of View (POV)", "Worm's Eye View"];

const stylePresets: Record<string, string> = {
  "Cinematic Realism (Live Action)": "Raw photography, cinematic movie screencap, shot on ARRI Alexa 65, 35mm film grain, photorealistic, depth of field, bokeh, cinematic lighting, color graded, live action footage, highly detailed texture, not animation, not drawing, not 3d render, not illustration",
  "3D Animation (Pixar/Disney)": "3D animation style, Pixar style, Disney style, 3D render, octane render, character design, vibrant colors, soft lighting, cute, expressive, animation movie",
  "Anime (Studio Ghibli)": "Anime style, Studio Ghibli style, highly detailed 2D animation, hand drawn, watercolor background, hayao miyazaki style, beautiful scenery",
  "Modern Anime (Shinkai)": "Modern anime style, Makoto Shinkai style, high detail, lens flare, vibrant blue sky, polished 2D animation",
  "Film Noir (B&W)": "Black and white, film noir, high contrast, dramatic shadows, grainy film texture, vintage 1940s look",
  "Cyberpunk Digital Art": "Cyberpunk aesthetic, neon lights, digital art, artstation, futuristic, high contrast, synthwave colors",
  "Oil Painting": "Oil painting style, textured brushstrokes, classic art style, impressionist, romanticism, masterpiece",
  "Sketch / Storyboard": "Rough pencil sketch, storyboard style, black and white, loose lines, concept art sketch"
};

const randomTemplates = [
  {
    title: "Gerilya Merah Putih",
    logline: "Di tengah agresi militer 1948, seorang kurir surat rahasia harus menembus hutan Jawa yang lebat untuk menyampaikan pesan kemerdekaan sebelum fajar menyingsing.",
    genres: ["Drama Sejarah", "Aksi/Petualangan"],
    duration: "2",
    characterList: [
      {id: 1, name: "Sersan Tejo", desc: "Pejuang veteran, wajah tegas penuh lumpur"}, 
      {id: 2, name: "Laras", desc: "Gadis desa penunjuk jalan, kebaya lusuh"}
    ],
    coreMessage: "Kemerdekaan dibayar dengan keberanian sunyi.",
    visualStyle: "Pencahayaan dramatis hutan tropis, warna tanah dan hijau militer, tekstur kulit berkeringat, atmosfer perang gerilya.",
    mood: "Tegang (Tense)",
    stylePreset: "Cinematic Realism (Live Action)"
  },
  {
    title: "Si Kancil & Kota Cyber",
    logline: "Kancil, seekor cyborg cerdik di Jakarta tahun 2077, harus mencuri chip data dari Raja Buaya, seorang bos mafia korporat yang menguasai air bersih.",
    genres: ["Cyberpunk", "Fantasi"],
    duration: "1",
    characterList: [
      {id: 1, name: "Kancil-X", desc: "Kecil, gesit, mata bionik neon"}, 
      {id: 2, name: "Boss Croc", desc: "Besar, jas mahal, tangan robotik"}
    ],
    coreMessage: "Kecerdikan mengalahkan kekuatan brutal, bahkan di masa depan.",
    visualStyle: "Neon batik patterns, hologram wayang, hujan asam di gedung pencakar langit, warna vibrant ungu dan hijau.",
    mood: "Ceria (Upbeat)",
    stylePreset: "3D Animation (Pixar/Disney)"
  },
  {
    title: "Misteri Hutan Larangan",
    logline: "Sebuah tim dokumenter tersesat di hutan Kalimantan saat meliput satwa langka, namun mereka mulai diburu oleh sesuatu yang bukan hewan maupun manusia.",
    genres: ["Horor", "Thriller Psikologis"],
    duration: "2",
    characterList: [
      {id: 1, name: "Dina", desc: "Jurnalis skeptis, selalu bawa kamera"}, 
      {id: 2, name: "Pak Asep", desc: "Pemandu lokal yang menyembunyikan rahasia"}
    ],
    coreMessage: "Alam memiliki aturannya sendiri yang tak boleh dilanggar.",
    visualStyle: "Found footage style, shaky cam, low light, grainy night vision, hijau gelap dan hitam pekat.",
    mood: "Horrific",
    stylePreset: "Cinematic Realism (Live Action)"
  },
  {
    title: "Kopi & Kenangan",
    logline: "Seorang barista tuli di Yogyakarta menemukan cara berkomunikasi dengan pelanggan misterius melalui seni latte dan catatan di tisu, mengungkap masa lalu yang menyakitkan.",
    genres: ["Romantis", "Drama"],
    duration: "1",
    characterList: [
      {id: 1, name: "Arya", desc: "Barista tuli, ekspresif, tampan"}, 
      {id: 2, name: "Maya", desc: "Penulis novel yang sedang 'writer's block'"}
    ],
    coreMessage: "Bahasa cinta tidak selalu membutuhkan suara.",
    visualStyle: "Warm tones, soft focus, close up on details (coffee, hands), golden hour lighting, cozy atmosphere.",
    mood: "Romantis",
    stylePreset: "Cinematic Realism (Live Action)"
  },
  {
    title: "Pendekar Neon",
    logline: "Di Jakarta tahun 2100, seorang pendekar silat tradisional menggunakan pedang laser buatan sendiri untuk melawan sindikat perdagangan memori manusia.",
    genres: ["Aksi/Petualangan", "Cyberpunk"],
    duration: "2",
    characterList: [
      {id: 1, name: "Jaka", desc: "Pendekar muda dengan jaket kulit futuristik"}, 
      {id: 2, name: "Siber-Barong", desc: "Robot penjaga elit musuh"}
    ],
    coreMessage: "Tradisi adalah senjata terkuat di masa depan yang tanpa jiwa.",
    visualStyle: "High contrast, neon blues and pinks, wet asphalt reflections, dynamic action angles, neo-noir.",
    mood: "Epik",
    stylePreset: "Cyberpunk Digital Art"
  },
  {
    title: "Operasi Soto Lamongan",
    logline: "Sekelompok pensiunan agen rahasia harus bersatu kembali untuk misi terakhir: mencuri resep rahasia soto legendaris saingan mereka sebelum festival kuliner nasional.",
    genres: ["Komedi Gelap", "Aksi/Petualangan"],
    duration: "3",
    characterList: [
      {id: 1, name: "Opa Heru", desc: "Mantan intel, sekarang pelupa"}, 
      {id: 2, name: "Nenek Siti", desc: "Ahli peledak, hobi merajut"}
    ],
    coreMessage: "Persahabatan lebih lezat daripada kemenangan.",
    visualStyle: "Wes Anderson style symmetry, bright pastel colors, vintage props, quirky composition, datar expression.",
    mood: "Ceria (Upbeat)",
    stylePreset: "Cinematic Realism (Live Action)"
  },
  {
    title: "Dukun Digital",
    logline: "Seorang programmer jenius menemukan bahwa kode biner kuno di internet sebenarnya adalah mantra pemanggil arwah, dan dia tidak sengaja mengunduh entitas jahat ke server kantornya.",
    genres: ["Fiksi Ilmiah (Sci-Fi)", "Misteri"],
    duration: "2",
    characterList: [
      {id: 1, name: "Reza", desc: "Hacker introvert, kurang tidur"}, 
      {id: 2, name: "Entity-404", desc: "Bayangan digital berbentuk asap"}
    ],
    coreMessage: "Teknologi tanpa spiritualitas adalah kehancuran.",
    visualStyle: "Glitch art aesthetic, screen artifacts, cold blue server room lights vs red demonic static.",
    mood: "Misterius",
    stylePreset: "Modern Anime (Shinkai)"
  }
];

// Initial Form Data (for reset)
const initialFormData = {
  title: "Sinyal Terakhir",
  coreMessage: "Harapan tetap ada meski dalam isolasi total.",
  genres: ["Fiksi Ilmiah (Sci-Fi)"], 
  visualStyle: "Estetika Blade Runner 2049, oranye dan biru teal, atmosfer berkabut",
  mood: "Sepi (Isolation)",
  stylePreset: "Cinematic Realism (Live Action)", 
  characterList: [
      {id: 1, name: "Elara", desc: "Astronot wanita"},
      {id: 2, name: "Unit 7", desc: "Robot AI usang"}
  ],
  logline: "Setelah bumi membisu, seorang astronot di pos pemantauan harus memutuskan untuk meninggalkan posnya atau menunggu sinyal yang mungkin takkan pernah datang.",
  duration: "1" 
};

// Voice Options Map
const voiceCharacters = [
    { id: 'Kore', name: 'Sari (Wanita, Lembut)', gender: 'Wanita' },
    { id: 'Zephyr', name: 'Lina (Wanita, Ceria)', gender: 'Wanita' },
    { id: 'Puck', name: 'Bayu (Pria, Santai)', gender: 'Pria' },
    { id: 'Fenrir', name: 'Agus (Pria, Berat)', gender: 'Pria' },
    { id: 'Charon', name: 'Pak Tejo (Pria, Wibawa)', gender: 'Pria' },
];

const voiceEmotions = ["Netral", "Bahagia", "Sedih", "Tegang", "Marah", "Penuh Harapan"];
const voiceAges = ["Muda", "Dewasa", "Lanjut Usia"];

// Available Accent Colors - Gold (Dark Mode) vs Vibrant (Light Mode)
const colorOptions = [
  { hex: '#D4AF37', name: 'Sinergi Gold', isDark: false }, // Default Gold
  { hex: '#FFC107', name: 'Luxury Glossy Gold', isDark: true }, // Dark Mode
  { hex: '#F97316', name: 'Jingga (Orange)', isDark: false }, // Light Mode
  { hex: '#EF4444', name: 'Merah (Red)', isDark: false }, // Light Mode
  { hex: '#A855F7', name: 'Ungu (Purple)', isDark: false }, // Light Mode
  { hex: '#3B82F6', name: 'Biru (Blue)', isDark: false }, // Light Mode
  { hex: '#14B8A6', name: 'Toska (Teal)', isDark: false }, // Light Mode
  { hex: '#22C55E', name: 'Hijau (Green)', isDark: false }, // Light Mode
  { hex: '#64748B', name: 'Abu (Grey)', isDark: false }, // Light Mode
];

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} border-2 border-[#D4AF37] p-0.5 bg-white shadow-lg flex-shrink-0`}>
    <div className="w-full h-full bg-[#6F060C] border border-[#D4AF37] flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      <span className="text-2xl font-black text-[#D4AF37] tracking-tighter [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)] z-10">AI</span>
    </div>
  </div>
);

// Helper to decode Base64 to Uint8Array
function base64ToUint8Array(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper to add WAV header to Raw PCM data
function pcmToWavBlob(base64PCM: string, sampleRate: number = 24000): Blob {
    const bytes = base64ToUint8Array(base64PCM);
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bytes.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    view.setUint16(32, numChannels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bytes.length, true);

    return new Blob([view, bytes], { type: 'audio/wav' });
}

export default function App() {
  const [activeTab, setActiveTab] = useState('concept');
  const [castingTab, setCastingTab] = useState<'actors' | 'locations' | 'elements'>('actors');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingConceptImage, setIsGeneratingConceptImage] = useState(false);
  const [workflowStep, setWorkflowStep] = useState('input');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Refine State
  const [refiningShot, setRefiningShot] = useState<{id: number, text: string} | null>(null);
  const [refiningProfile, setRefiningProfile] = useState<{id: number, type: 'actor' | 'location' | 'element', text: string} | null>(null);
  
  // Randomize AI State
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Video Prompt State
  const [videoPromptShot, setVideoPromptShot] = useState<{id: number, text: string} | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // New Audio Settings State
  const [audioSettings, setAudioSettings] = useState({
      narrationText: "",
      voiceCharacter: "Kore", // Default Gemini voice ID (Sari)
      voiceEmotion: "Netral",
      voiceAge: "Dewasa"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Color State - Default to Sinergi Gold
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeaderColorPicker, setShowHeaderColorPicker] = useState(false);
  
  // Determine Mode based on color (Gold = Dark, Others = Light)
  const isDarkMode = colorOptions.find(c => c.hex === primaryColor)?.isDark ?? true;
  const isGoldTheme = primaryColor === '#FFC107';

  const [generatedData, setGeneratedData] = useState<{
    concept: any;
    characterProfiles: ProfileItem[];
    locationProfiles: ProfileItem[];
    elementProfiles: ProfileItem[];
    shots: Shot[];
    audio: {
      musicPrompt: string;
      narrationAudio: string | null; // Blob URL of the WAV file
      isGeneratingMusicPrompt: boolean;
      isGeneratingNarration: boolean;
    };
  }>({
    concept: null,
    characterProfiles: [],
    locationProfiles: [],
    elementProfiles: [], 
    shots: [],
    audio: {
      musicPrompt: "",
      narrationAudio: null,
      isGeneratingMusicPrompt: false,
      isGeneratingNarration: false
    }
  });
  
  // Input State
  const [formData, setFormData] = useState(initialFormData);
  const [customGenre, setCustomGenre] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => {
        const exists = prev.genres.includes(genre);
        if (exists) return { ...prev, genres: prev.genres.filter(g => g !== genre) };
        return { ...prev, genres: [...prev.genres, genre] };
    });
  };

  const addCustomGenre = () => {
    if (customGenre.trim()) {
        const g = customGenre.trim();
        if (!formData.genres.includes(g)) {
            toggleGenre(g);
        }
        setCustomGenre('');
    }
  };

  const updateCharacterInput = (id: number, field: keyof Character, value: string) => {
    setFormData(prev => ({
        ...prev,
        characterList: prev.characterList.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addCharacterInput = () => {
    setFormData(prev => ({
        ...prev,
        characterList: [...prev.characterList, { id: Date.now(), name: "", desc: "" }]
    }));
  };

  const removeCharacterInput = (id: number) => {
    if(formData.characterList.length <= 1) return;
    setFormData(prev => ({
        ...prev,
        characterList: prev.characterList.filter(c => c.id !== id)
    }));
  };

  const handleRandomizeProject = async () => {
    setIsRandomizing(true);
    
    // AI Prompt for random idea with enforced variety
    const prompt = `
    Role: Creative Film Producer.
    Task: Create a UNIQUE, creative, and detailed film concept in INDONESIAN language.

    CRITICAL INSTRUCTION: FORCE VARIETY IN GENRE AND TIME PERIOD.
    The user wants to see diverse ideas, NOT just Sci-Fi/Futuristic.
    
    Step 1: Randomly select a Time Period from: [Ancient Nusantara, Dutch Colonial, 1945 Independence, 1980s/90s Nostalgia, Modern Day (2024), Near Future].
    Step 2: Randomly select a Genre from: [Comedy, Slice of Life, Mystery/Detective, Horror, Thriller, Romance, Drama, Action].
    Step 3: Combine them into a unique premise.

    Examples of variety to emulate:
    - A Mystery in a Modern High School.
    - A Satirical Comedy about ghosts in a 1990s village.
    - A Historical Drama about spices.
    - A Thriller set in a crowded Jakarta market today.
    - A Horror movie set in the Dutch Colonial era.

    Output JSON strictly matching this structure:
    {
      "title": "String (Creative Title)",
      "logline": "String (Interesting premise, max 2 sentences)",
      "coreMessage": "String (Thematic statement)",
      "genres": ["String"], // e.g. ["Komedi", "Horor"] or ["Drama", "Sejarah"]
      "duration": "String (0.5, 1, 2, 3, 5, or 10)",
      "mood": "String (e.g. Tegang, Ceria, Misterius, Melankolis, Lucu)",
      "visualStyle": "String (Detailed visual description matching the era selected)",
      "stylePreset": "String (Pick one: Cinematic Realism (Live Action), 3D Animation (Pixar/Disney), Anime (Studio Ghibli), Modern Anime (Shinkai), Film Noir (B&W), Cyberpunk Digital Art, Oil Painting, Sketch / Storyboard)",
      "characterList": [
        { "id": 1, "name": "Name", "desc": "Short visual description" },
        { "id": 2, "name": "Name", "desc": "Short visual description" }
      ]
    }
    `;

    try {
        const result = await generateScriptContent(prompt);
        if (result && result.title) {
            setFormData(prev => ({ ...prev, ...result }));
        } else {
            // Fallback to hardcoded templates if AI fails/returns bad JSON
            const random = randomTemplates[Math.floor(Math.random() * randomTemplates.length)];
            setFormData(prev => ({ ...prev, ...random }));
        }
    } catch (e) {
        console.error("Failed to generate random idea via AI", e);
        // Fallback to hardcoded templates
        const random = randomTemplates[Math.floor(Math.random() * randomTemplates.length)];
        setFormData(prev => ({ ...prev, ...random }));
    } finally {
        setIsRandomizing(false);
    }
  };

  // --- ACTIONS ---
  const handleSaveToDocs = () => {
     if (!generatedData.concept) {
        alert("Belum ada konsep yang tersedia untuk disimpan.");
        return;
    }

    const content = `
JUDUL FILM: ${generatedData.concept.title || formData.title}
GENRE: ${formData.genres.join(', ')}
DURASI: ${formData.duration} Menit
LOGLINE: ${formData.logline}

=== MUSIK & AUDIO ===
Music Prompt: ${generatedData.audio.musicPrompt || '-'}
Narasi: ${audioSettings.narrationText}

=== SHOTLIST SUMMARY ===
Total Shots: ${generatedData.shots.length}
${generatedData.shots.map(s => `[${s.time}] ${s.shotSize} - ${s.action}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(generatedData.concept.title || "Project").replace(/[^a-z0-9]/gi, '_')}_Concept.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    const projectData = {
        metadata: {
            appVersion: "1.2",
            createdAt: new Date().toISOString()
        },
        formData,
        generatedData,
        audioSettings, // Save audio settings too
        workflowStep,
        activeTab,
        castingTab
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(formData.title || "Project").replace(/[^a-z0-9]/gi, '_')}_History.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target.result as string;
              const data = JSON.parse(content);

              if (data.formData && data.generatedData) {
                  setFormData(data.formData);
                  // Ensure audio object exists for older saves
                  setGeneratedData({
                      ...data.generatedData,
                      audio: data.generatedData.audio || { musicPrompt: "", narrationAudio: null, isGeneratingMusicPrompt: false, isGeneratingNarration: false }
                  });
                  if (data.audioSettings) {
                      setAudioSettings(data.audioSettings);
                  }
                  setWorkflowStep(data.workflowStep || 'input');
                  setActiveTab(data.activeTab || 'concept');
                  if (data.castingTab) setCastingTab(data.castingTab);
                  alert("Project successfully loaded!");
              } else {
                  alert("Invalid project file format.");
              }
          } catch (error) {
              console.error("Failed to parse project file", error);
              alert("Gagal membaca file project.");
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackToForm = () => {
    setWorkflowStep('input');
  };

  const handleConceptEdit = (field: string, value: string, index?: number) => {
    setGeneratedData(prev => {
      const newConcept = { ...prev.concept };
      if (index !== undefined && Array.isArray(newConcept[field])) {
        newConcept[field][index] = value;
      } else {
        newConcept[field] = value;
      }
      return { ...prev, concept: newConcept };
    });
  };

  const handleProfileEdit = (id: number, type: 'actor' | 'location' | 'element', field: keyof ProfileItem, value: any) => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    setGeneratedData(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addCastingItem = (type: 'actor' | 'location' | 'element') => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    const newId = Date.now();
    const newItem: ProfileItem = {
        id: newId,
        name: "New Item",
        description: "Description",
        detailedDescription: "Detailed visual description...",
        prompt: "",
        imageUrl: null,
        imageHistory: [],
        refImageUrls: [],
        isGeneratingImage: false,
        isUploaded: false
    };

    setGeneratedData(prev => ({
        ...prev,
        [listKey]: [...prev[listKey], newItem]
    }));
  };

  const removeCastingItem = (id: number, type: 'actor' | 'location' | 'element') => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    setGeneratedData(prev => ({
        ...prev,
        [listKey]: prev[listKey].filter(item => item.id !== id)
    }));
  };

  const handleShotEdit = (id: number, field: keyof Shot, value: any) => {
    setGeneratedData(prev => ({
      ...prev,
      shots: prev.shots.map(shot => {
        if (shot.id !== id) return shot;
        if (field === 'prompt') {
            return { ...shot, prompt: value };
        }
        return { ...shot, [field]: value, prompt: null, imageUrl: null };
      })
    }));
  };

  const toggleCharacterInShot = (shotId: number, charId: number) => {
      setGeneratedData(prev => ({
          ...prev,
          shots: prev.shots.map(s => {
              if (s.id !== shotId) return s;
              const currentIds = s.characterRefIds || [];
              if (currentIds.includes(charId)) {
                  return { ...s, characterRefIds: currentIds.filter(id => id !== charId) };
              } else {
                  return { ...s, characterRefIds: [...currentIds, charId] };
              }
          })
      }));
  };

  const toggleElementInShot = (shotId: number, elemId: number) => {
      setGeneratedData(prev => ({
          ...prev,
          shots: prev.shots.map(s => {
              if (s.id !== shotId) return s;
              const currentIds = s.elementRefIds || [];
              if (currentIds.includes(elemId)) {
                  return { ...s, elementRefIds: currentIds.filter(id => id !== elemId) };
              } else {
                  return { ...s, elementRefIds: [...currentIds, elemId] };
              }
          })
      }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, id: number, type: 'actor' | 'location' | 'element', subtype = 'full') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
        
        setGeneratedData(prev => ({
          ...prev,
          [listKey]: prev[listKey].map(item => {
            if (item.id !== id) return item;
            
            if (subtype === 'ref') {
                const currentRefs = item.refImageUrls || [];
                if (currentRefs.length >= 3) {
                    alert("Maksimal 3 referensi gambar.");
                    return item;
                }
                return { ...item, refImageUrls: [...currentRefs, result], imageUrl: null, isUploaded: false };
            } 
            else {
                return { 
                    ...item, 
                    imageUrl: result, 
                    imageHistory: [result, ...(item.imageHistory || [])],
                    isUploaded: true 
                }; 
            }
          })
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeRefImage = (id: number, type: 'actor' | 'location' | 'element', index: number) => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    setGeneratedData(prev => ({
        ...prev,
        [listKey]: prev[listKey].map(item => {
            if (item.id !== id) return item;
            const newRefs = [...(item.refImageUrls || [])];
            newRefs.splice(index, 1);
            return { ...item, refImageUrls: newRefs };
        })
    }));
  };

  const restoreImage = (
      id: number | null, 
      type: 'concept' | 'actor' | 'location' | 'element' | 'shot', 
      url: string
  ) => {
      if (type === 'concept') {
          setGeneratedData(prev => ({...prev, concept: {...prev.concept, imageUrl: url}}));
          return;
      }

      if (type === 'shot') {
          setGeneratedData(prev => ({
              ...prev,
              shots: prev.shots.map(s => s.id === id ? { ...s, imageUrl: url } : s)
          }));
          return;
      }

      const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
      setGeneratedData(prev => ({
          ...prev,
          [listKey]: prev[listKey].map(item => item.id === id ? { ...item, imageUrl: url } : item)
      }));
  };

  const handleRemoveProfileImage = (id: number, type: 'actor' | 'location' | 'element') => {
      const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
      setGeneratedData(prev => ({
          ...prev,
          [listKey]: prev[listKey].map(item => item.id === id ? { ...item, imageUrl: null, imageHistory: [], isUploaded: false } : item)
      }));
  };

  // --- GENERATORS ---
  const generateConcept = async () => {
    setIsGenerating(true);
    const prompt = `
    Role: World-class Film Director & Screenwriter.
    Task: Create a unique, high-concept film treatment based on the user's raw input.
    OUTPUT LANGUAGE: INDONESIAN (Bahasa Indonesia).
    
    User Input:
    - Title: "${formData.title}"
    - Logline: "${formData.logline}"
    - Core Message: "${formData.coreMessage}"
    - Mood: "${formData.mood}"
    - Genres: ${formData.genres.join(', ')}
    - Characters: ${formData.characterList.map(c => `${c.name} (${c.desc})`).join(', ')}
    - Visual Style: "${formData.visualStyle}"

    Output Requirements:
    1. Expand the logline into a compelling 3-act structure.
    2. Deepen the emotional core into a single powerful sentence (PESAN UTAMA).
    3. Define a distinct visual language.

    Output Format (JSON):
    {
        "title": "string",
        "theme": "string",
        "emotionalMessage": "string (Single sentence in Indonesian)",
        "synopsis": ["Act 1...", "Act 2...", "Act 3..."],
        "visualDirection": "string"
    }
    `;

    const result = await generateScriptContent(prompt);

    if (result) {
        let conceptImageUrl = null;
        try {
            const styleInstruction = formData.stylePreset === 'Custom' 
                ? "Custom Style" 
                : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);
            
            const visualDir = result.visualDirection || "";
            const imagePrompt = `STYLE: ${styleInstruction}. VISUAL CONCEPT ART. World Building for movie "${result.title}". ${formData.visualStyle}. ${visualDir}. Cinematic establishing shot of the main setting. High detail, masterpiece. NO TEXT, TEXTLESS, NO TYPOGRAPHY.`;
            
            conceptImageUrl = await generateStoryboardImage(imagePrompt, [], "16:9");
        } catch (e: any) {
            console.error("Failed to generate concept image", e);
            if (e?.message === 'QUOTA_EXCEEDED') {
                alert("Batas kuota API tercapai saat membuat gambar konsep. Teks konsep berhasil dibuat. Silakan coba 'Regenerate Concept Art' beberapa saat lagi.");
            }
        }

        const conceptWithImage = { 
            ...result, 
            imageUrl: conceptImageUrl, 
            imageHistory: conceptImageUrl ? [conceptImageUrl] : [] 
        };
        
        setGeneratedData(prev => ({ ...prev, concept: conceptWithImage }));
        
        setAudioSettings(prev => ({
            ...prev,
            narrationText: `${formData.logline}. ${result.emotionalMessage}`
        }));

        setWorkflowStep('concept_review');
        setActiveTab('concept');
    } else {
        alert("Gagal menghasilkan konsep. Mohon coba lagi atau periksa koneksi.");
    }
    setIsGenerating(false);
  };

  const regenerateConceptImage = async () => {
    if (!generatedData.concept) return;
    setIsGeneratingConceptImage(true);
    try {
        const styleInstruction = formData.stylePreset === 'Custom' 
            ? "Custom Style" 
            : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);
            
        const visualDir = generatedData.concept.visualDirection || "";
        const imagePrompt = `STYLE: ${styleInstruction}. VISUAL CONCEPT ART. World Building for movie "${generatedData.concept.title}". ${formData.visualStyle}. ${visualDir}. Cinematic establishing shot of the main setting. High detail, masterpiece. NO TEXT, TEXTLESS, NO TYPOGRAPHY.`;
        
        const imageUrl = await generateStoryboardImage(imagePrompt, [], "16:9");
        
        if (imageUrl) {
            setGeneratedData(prev => ({
                ...prev,
                concept: { 
                    ...prev.concept, 
                    imageUrl,
                    imageHistory: [imageUrl, ...(prev.concept.imageHistory || [])]
                }
            }));
        }
    } catch (error: any) {
        console.error(error);
        if (error?.message === 'QUOTA_EXCEEDED') {
            alert("Gagal regenerate gambar (Quota Exceeded). Silakan tunggu beberapa saat sebelum mencoba lagi.");
        } else {
            alert("Gagal regenerate gambar. Coba lagi nanti.");
        }
    } finally {
        setIsGeneratingConceptImage(false);
    }
  };

  const generateCasting = async () => {
    setIsGenerating(true);
    const prompt = `
    Role: Casting Director.
    Task: Breakdown film into SPECIFIC visual assets.
    OUTPUT LANGUAGE: INDONESIAN.

    Input:
    - Title: ${generatedData.concept.title}
    - Synopsis: ${generatedData.concept.synopsis.join(" ")}
    - Visual Style: ${formData.visualStyle}
    - Initial Characters: ${formData.characterList.map(c => c.name).join(", ")}

    Format (JSON):
    {
        "characters": [{ "name": "Name", "description": "Role", "detailedDescription": "Visual desc" }],
        "locations": [{ "name": "Name", "description": "Role", "detailedDescription": "Visual desc" }],
        "elements": [{ "name": "Name", "description": "Function", "detailedDescription": "Visual desc" }]
    }
    `;

    const result = await generateScriptContent(prompt);

    if (result) {
        const processItems = (arr: any[]) => (arr || []).map((x: any, i: number) => ({
            id: i + 1,
            name: x.name,
            description: x.description,
            detailedDescription: x.detailedDescription,
            prompt: "",
            imageUrl: null,
            imageHistory: [],
            refImageUrls: [],
            isGeneratingImage: false,
            isUploaded: false
        }));

        setGeneratedData(prev => ({
            ...prev,
            characterProfiles: processItems(result.characters),
            locationProfiles: processItems(result.locations),
            elementProfiles: processItems(result.elements)
        }));
        
        setWorkflowStep('character_design');
        setActiveTab('characters');
    }
    setIsGenerating(false);
  };

  const generatePrompt = (id: number, type: 'actor' | 'location' | 'element') => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    const styleInstruction = formData.stylePreset === 'Custom' 
        ? "Custom Style" 
        : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);

    setGeneratedData(prev => ({
        ...prev,
        [listKey]: prev[listKey].map(item => {
            if(item.id !== id) return item;
            let promptText = "";
            if(type === 'actor') promptText = `${styleInstruction}. Character Reference Sheet of ${item.name}. Description: ${item.detailedDescription}. Layout: Close-up Portrait, Full Body Front View, and Full Body Back View. Isolated on clean background, professional concept art, 8k.`;
            if(type === 'location') promptText = `${styleInstruction}. Cinematic Environment Design: ${item.name}. Description: ${item.detailedDescription}. Wide angle 16:9, establishing shot, highly detailed texture, volumetric lighting, 8k.`;
            if(type === 'element') promptText = `${styleInstruction}. Product shot of ${item.name}. Description: ${item.detailedDescription}. Isolated on pure white background, studio lighting, highly detailed, 8k.`;
            return { ...item, prompt: promptText };
        })
    }));
  };

  const generateImage = async (id: number, type: 'actor' | 'location' | 'element') => {
    const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
    const item = generatedData[listKey].find(i => i.id === id);
    if (!item || !item.prompt) return;

    setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { ...i, isGeneratingImage: true } : i)}));
    
    try {
        let finalPrompt = `GENERATE A WIDE LANDSCAPE IMAGE (16:9 ASPECT RATIO). PROMPT: ${item.prompt}. NO TEXT, TEXTLESS.`;
        const imageUrl = await generateStoryboardImage(finalPrompt, item.refImageUrls, "16:9");

        if (imageUrl) {
            setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { 
                ...i, 
                imageUrl: imageUrl,
                imageHistory: [imageUrl, ...(i.imageHistory || [])],
                isGeneratingImage: false 
            } : i)}));
        } else {
            throw new Error("Failed generation");
        }
    } catch (error: any) {
        console.error(error);
        if (error?.message === 'QUOTA_EXCEEDED') {
            alert("Gagal generate gambar (Quota Exceeded). Silakan coba lagi dalam beberapa saat.");
        }
        setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { ...i, isGeneratingImage: false } : i)}));
    }
  };

  const handleProfileRefinement = async (id: number, type: 'actor' | 'location' | 'element') => {
      if (!refiningProfile || !refiningProfile.text.trim()) return;
      
      const listKey = type === 'actor' ? 'characterProfiles' : type === 'location' ? 'locationProfiles' : 'elementProfiles';
      const item = generatedData[listKey].find(i => i.id === id);
      if (!item || !item.imageUrl) return;

      setRefiningProfile(null); // Close modal
      setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { ...i, isGeneratingImage: true } : i)}));

      try {
          const styleInstruction = formData.stylePreset === 'Custom' 
              ? "Custom Style" 
              : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);
              
          const refinementPrompt = `STYLE: ${styleInstruction}. BASE IMAGE PROVIDED. INSTRUCTION: ${refiningProfile.text}. ${item.prompt}. KEEP CHARACTER/ENVIRONMENT FEATURES CONSISTENT. NO TEXT.`;
          const refImages = [item.imageUrl];

          const imageUrl = await generateStoryboardImage(refinementPrompt, refImages, "16:9");

          if (imageUrl) {
              setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { 
                  ...i, 
                  imageUrl: imageUrl,
                  imageHistory: [imageUrl, ...(i.imageHistory || [])],
                  isGeneratingImage: false 
              } : i)}));
          } else {
              throw new Error("Failed");
          }
      } catch (error: any) {
          console.error(error);
          setGeneratedData(prev => ({...prev, [listKey]: prev[listKey].map(i => i.id === id ? { ...i, isGeneratingImage: false } : i)}));
          alert("Gagal refine gambar.");
      }
  };

  const generateShotlist = async () => {
    setIsGenerating(true);
    const durationVal = parseFloat(formData.duration);
    const targetShots = Math.ceil(durationVal * 20);

    const charactersContext = generatedData.characterProfiles.map(c => `- ID ${c.id}: ${c.name}`).join('\n');
    const locationsContext = generatedData.locationProfiles.map(l => `- ID ${l.id}: ${l.name}`).join('\n');
    const elementsContext = generatedData.elementProfiles.map(e => `- ID ${e.id}: ${e.name}`).join('\n');

    const prompt = `
    Role: Expert Director of Photography & Storyboard Artist.
    Task: Create a sequential shotlist for a film.
    OUTPUT: INDONESIAN for 'action'/'mood'.
    IMPORTANT: Output STRICT JSON.
    
    Story Context: ${generatedData.concept.synopsis.join(' ')}
    
    Assets Available:
    CHARACTERS:
    ${charactersContext}
    LOCATIONS:
    ${locationsContext}
    ELEMENTS:
    ${elementsContext}
    
    Instructions:
    1. Break down story linearly into approx ${targetShots} shots.
    2. MANDATORY: Select distinct and cinematic 'shotSize' and 'cameraAngle' for each shot based on the drama. DO NOT just use 'Wide Shot' or 'Eye Level' repeatedly. Use Extreme Close Ups for emotion, Low Angles for power, etc.
    3. characterIds: array of integers.
    4. locationId: integer ID.
    5. elementIds: array of integers (optional).
    
    Output Format (JSON):
    {
        "shots": [
            {
                "time": "0:00",
                "act": "Setup",
                "shotSize": "String (e.g., Extreme Close Up (ECU), Low Angle)",
                "cameraAngle": "String",
                "mood": "String",
                "action": "Visual description...",
                "characterIds": [1],
                "locationId": 1,
                "elementIds": [1]
            }
        ]
    }
    `;

    const result = await generateScriptContent(prompt);

    if (result && result.shots) {
        const processedShots = result.shots.map((s: any, idx: number) => ({
            id: idx + 1,
            time: s.time,
            act: s.act,
            shotSize: s.shotSize,
            cameraAngle: s.cameraAngle,
            mood: s.mood,
            action: s.action,
            prompt: null,
            isGeneratingPrompt: false,
            imageUrl: null,
            imageHistory: [],
            isGeneratingImage: false,
            aspectRatio: "16:9",
            characterRefIds: Array.isArray(s.characterIds) ? s.characterIds : [],
            locationRefId: s.locationId ? s.locationId.toString() : "",
            elementRefIds: Array.isArray(s.elementIds) ? s.elementIds : (s.elementId ? [s.elementId] : []),
            videoPrompt: null,
            isGeneratingVideoPrompt: false
        }));

        setGeneratedData(prev => ({ ...prev, shots: processedShots }));
        setWorkflowStep('shotlist_review');
        setActiveTab('shotlist');
    } else {
        alert("Gagal membuat shotlist.");
    }
    setIsGenerating(false);
  };

  const generateSinglePrompt = async (shotId: number) => {
    setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingPrompt: true } : s) }));

    try {
        const shot = generatedData.shots.find(s => s.id === shotId);
        if (!shot) return;
        
        const chars = generatedData.characterProfiles.filter(c => shot.characterRefIds.includes(c.id)).map(c => c.name).join(', ');
        const loc = generatedData.locationProfiles.find(l => l.id.toString() === shot.locationRefId)?.name || "Background";
        const elems = generatedData.elementProfiles.filter(e => shot.elementRefIds.includes(e.id)).map(e => e.name).join(', ');
        
        const styleInstruction = formData.stylePreset === 'Custom' 
            ? "Custom Style" 
            : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);

        const promptForAI = `
        Role: Prompt Engineer.
        Task: English Image Prompt (YAML style).
        Input (Indonesian): ${shot.action}. 
        Char: ${chars}. 
        Loc: ${loc}. 
        Elements: ${elems}.
        MANDATORY CAMERA SPECS: Shot Size: "${shot.shotSize}", Angle: "${shot.cameraAngle}".
        Style: ${styleInstruction}.
        
        Output JSON: {"subject": "...", "action": "...", "background": "...", "lighting": "...", "camera": "...", "style": "${styleInstruction}"}
        `;

        const result = await generateScriptContent(promptForAI);

        if (result && result.subject) {
            const promptStr = `Style: ${result.style}\nSubjek: ${result.subject}\nAksi: ${result.action}\nLatar: ${result.background}\nCahaya: ${result.lighting}\nKamera: ${result.camera} (Shot Size: ${shot.shotSize}, Angle: ${shot.cameraAngle})`;
            setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, prompt: promptStr, isGeneratingPrompt: false } : s) }));
        } else {
             const fallbackPrompt = `Style: ${styleInstruction}\nSubjek: ${chars}\nAksi: ${shot.action}\nLatar: ${loc}\nKamera: ${shot.shotSize}, ${shot.cameraAngle}`;
             setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, prompt: fallbackPrompt, isGeneratingPrompt: false } : s) }));
        }
    } catch (e) {
        setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingPrompt: false } : s) }));
    }
  };

  const generateShotImage = async (shotId: number) => {
    const shot = generatedData.shots.find(s => s.id === shotId);
    if (!shot || !shot.prompt) return;
    setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingImage: true } : s)}));

    try {
        const refImages = [];
        shot.characterRefIds.forEach(cId => {
            const char = generatedData.characterProfiles.find(c => c.id === cId);
            if (char?.imageUrl) refImages.push(char.imageUrl);
        });

        const styleInstruction = formData.stylePreset === 'Custom' 
            ? "Custom Style" 
            : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);
            
        let promptText = `STYLE: ${styleInstruction}. SCENE: ${shot.prompt}. MANDATORY SHOT SIZE: ${shot.shotSize}, CAMERA ANGLE: ${shot.cameraAngle}. NO TEXT.`;
        if (refImages.length > 0) promptText += ` Maintain character features from reference.`;

        const imageUrl = await generateStoryboardImage(promptText, refImages, shot.aspectRatio);

        if (imageUrl) {
            // Fix: Changed 'i' to 's' as 'i' was not defined in this scope.
            setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { 
                ...s, 
                imageUrl: imageUrl,
                imageHistory: [imageUrl, ...(s.imageHistory || [])],
                isGeneratingImage: false 
            } : s)}));
        } else {
            throw new Error("Failed");
        }
    } catch (error: any) {
        if (error.message === "QUOTA_EXCEEDED") {
            alert("Gagal generate gambar (Quota Exceeded). Silakan coba lagi dalam beberapa saat.");
        }
        setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingImage: false } : s)}));
    }
  };

  const handleShotRefinement = async (shotId: number) => {
    if (!refiningShot || !refiningShot.text.trim()) return;
    
    const shot = generatedData.shots.find(s => s.id === shotId);
    if (!shot || !shot.imageUrl) return;

    setRefiningShot(null); // Close modal
    setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingImage: true } : s)}));

    try {
        const styleInstruction = formData.stylePreset === 'Custom' 
            ? "Custom Style" 
            : (stylePresets[formData.stylePreset] || stylePresets["Cinematic Realism (Live Action)"]);
            
        const refinementPrompt = `STYLE: ${styleInstruction}. BASE IMAGE PROVIDED. INSTRUCTION: ${refiningShot.text}. ${shot.prompt}. KEEP COMPOSITION CONSISTENT. FIX ANOMALIES. NO TEXT.`;
        const refImages = [shot.imageUrl];

        const imageUrl = await generateStoryboardImage(refinementPrompt, refImages, shot.aspectRatio);

        if (imageUrl) {
            setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { 
                ...s, 
                imageUrl: imageUrl,
                imageHistory: [imageUrl, ...(s.imageHistory || [])],
                isGeneratingImage: false 
            } : s)}));
        } else {
            throw new Error("Failed");
        }
    } catch (error: any) {
        setGeneratedData(prev => ({...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingImage: false } : s)}));
        alert("Gagal refine gambar. Coba lagi.");
    }
  };
  
  const generateVideoPrompt = async (shotId: number) => {
      setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingVideoPrompt: true } : s) }));
      const shot = generatedData.shots.find(s => s.id === shotId);
      
      try {
          if (!shot) throw new Error("Shot not found");
          
          const promptForAI = `
            Role: Expert Video Prompt Engineer.
            Task: Create a highly detailed VIDEO GENERATION PROMPT based on the static image description.
            Input Scene: ${shot.prompt}
            Shot Size: ${shot.shotSize}
            Camera Angle: ${shot.cameraAngle}
            Action: ${shot.action}
            
            Instructions:
            1. **SUBJECT MOVEMENT (CRITICAL):** Describe specifically how the subject moves within the frame. (e.g., "The warrior lunges forward," "The woman turns her head slowly," "Tears roll down cheek"). If static, describe subtle micro-movements (breathing, hair blowing).
            2. **CAMERA MOVEMENT (CRITICAL):** Describe the camera move. (e.g., "Cinematic push in," "Truck left following subject," "Handheld shake").
            3. **DIALOGUE (IF SPEAKING):** If the action implies the character is speaking, YOU MUST include specific text: "Character speaks: '[Insert short dialogue in INDONESIAN language here]'". Ensure the dialogue fits the emotional context.
            4. Combine these into a fluid, English sentence focused on MOTION.
            5. Keep it concise (under 75 words).
            6. Output only the prompt string.
          `;
          
          const jsonPrompt = `
            ${promptForAI}
            Output JSON: { "videoPrompt": "The actual prompt text here" }
          `;
          
          const jsonResult = await generateScriptContent(jsonPrompt);
          
          if (jsonResult && jsonResult.videoPrompt) {
              setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, videoPrompt: jsonResult.videoPrompt, isGeneratingVideoPrompt: false } : s) }));
              setVideoPromptShot({ id: shotId, text: jsonResult.videoPrompt });
          } else {
               throw new Error("Failed to parse video prompt");
          }
          
      } catch (error) {
          console.error("Video Prompt Error", error);
          alert("Gagal membuat video prompt.");
          setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, isGeneratingVideoPrompt: false } : s) }));
      }
  };

  const generateMusicPrompt = async () => {
    setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, isGeneratingMusicPrompt: true } }));
    
    const prompt = `
    Role: Music Supervisor & Composer.
    Task: Create a highly detailed text prompt for an AI Music Generator (like Suno or Udio).
    Film Details:
    - Title: ${formData.title}
    - Genre: ${formData.genres.join(', ')}
    - Mood: ${formData.mood}
    - Duration: ${formData.duration} minutes
    - Synopsis: ${generatedData.concept.synopsis.join(' ')}

    Instructions:
    1. Describe the instrumentation, tempo (BPM), key, and emotional progression.
    2. Format it as a prompt string for an AI music tool.
    3. Output JSON: { "musicPrompt": "The prompt string..." }
    `;

    try {
        const result = await generateScriptContent(prompt);
        if (result && result.musicPrompt) {
            setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, musicPrompt: result.musicPrompt, isGeneratingMusicPrompt: false } }));
        }
    } catch (e) {
        console.error("Music Prompt Gen Error", e);
        setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, isGeneratingMusicPrompt: false } }));
    }
  };

  const generateNarration = async () => {
    setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, isGeneratingNarration: true } }));
    
    try {
        const textToSay = audioSettings.narrationText || `${formData.logline}. ${generatedData.concept.emotionalMessage}`;
        const rawBase64Audio = await generateSpeech(textToSay, audioSettings.voiceCharacter);

        if (rawBase64Audio) {
            const wavBlob = pcmToWavBlob(rawBase64Audio, 24000); 
            const wavUrl = URL.createObjectURL(wavBlob);
            setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, narrationAudio: wavUrl, isGeneratingNarration: false } }));
        } else {
            throw new Error("No audio returned");
        }
    } catch (e) {
        console.error("TTS Error", e);
        alert("Gagal membuat narasi suara.");
        setGeneratedData(prev => ({ ...prev, audio: { ...prev.audio, isGeneratingNarration: false } }));
    }
  };

  const playNarration = async () => {
      if (!generatedData.audio.narrationAudio) return;
      
      try {
          if (isPlaying && audioSourceRef.current) {
              audioSourceRef.current.stop();
              setIsPlaying(false);
              return;
          }

          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }

          const response = await fetch(generatedData.audio.narrationAudio);
          const arrayBuffer = await response.arrayBuffer();

          audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current!.destination);
              source.onended = () => setIsPlaying(false);
              source.start(0);
              audioSourceRef.current = source;
              setIsPlaying(true);
          }, (e) => console.error("Error decoding audio data", e));

      } catch (e) {
          console.error("Playback error", e);
      }
  };

  const toggleAspectRatio = (shotId: number, ratio: "16:9" | "9:16") => {
    setGeneratedData(prev => ({ ...prev, shots: prev.shots.map(s => s.id === shotId ? { ...s, aspectRatio: ratio, prompt: null, imageUrl: null } : s) }));
  };

  const isInputMode = workflowStep === 'input' && !isGenerating;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        .font-anton {
          font-family: "Anton", system-ui;
          font-weight: 400;
          font-style: normal;
        }
        ::selection {
          background-color: ${primaryColor};
          color: ${isDarkMode ? 'black' : 'white'};
        }
        
        .text-accent { 
            color: ${primaryColor} !important; 
            ${isGoldTheme ? `text-shadow: 0 0 15px ${primaryColor}80;` : 'text-shadow: none;'}
        }

        .bg-accent { 
            background-color: ${primaryColor} !important; 
            
            ${isGoldTheme ? `
                background-image: linear-gradient(
                    180deg, 
                    rgba(255,255,255,0.6) 0%, 
                    rgba(255,255,255,0.2) 40%, 
                    rgba(255,255,255,0) 40%, 
                    rgba(0,0,0,0.1) 100%
                ) !important;
                box-shadow: 
                    inset 0 1px 0 rgba(255,255,255,0.7), 
                    inset 0 -1px 0 rgba(0,0,0,0.1), 
                    0 4px 15px -3px ${primaryColor}80 !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
            ` : `
                background-image: none !important;
                box-shadow: none !important;
                border: 1px solid transparent !important;
            `}
        }
        
        .bg-accent:hover {
             filter: brightness(1.1) contrast(1.1);
             ${isGoldTheme ? `box-shadow: 0 0 25px ${primaryColor}AA !important;` : ''}
        }
        
        .border-accent { border-color: ${primaryColor} !important; }
        
        .hover-bg-accent:hover { 
            background-color: ${primaryColor} !important; 
            ${isGoldTheme ? `
             background-image: linear-gradient(
                180deg, 
                rgba(255,255,255,0.6) 0%, 
                rgba(255,255,255,0.2) 40%, 
                rgba(255,255,255,0) 40%, 
                rgba(0,0,0,0.1) 100%
            ) !important;
            box-shadow: 0 0 15px ${primaryColor}80 !important;
            ` : `
             background-image: none !important;
             box-shadow: none !important;
            `}
        }

        .hover-text-accent:hover { 
            color: ${primaryColor} !important; 
            ${isGoldTheme ? `text-shadow: 0 0 25px ${primaryColor};` : 'text-shadow: none;'}
        }
        .hover-border-accent:hover { border-color: ${primaryColor} !important; }
        
        .focus-border-accent:focus { border-color: ${primaryColor} !important; }
        .ring-accent:focus { --tw-ring-color: ${primaryColor} !important; }

        ${!isDarkMode ? `
          .bg-black { background-color: #ffffff !important; }
          .bg-\\[\\#0a0a0a\\] { background-color: #C91829 !important; }
          .bg-\\[\\#111\\] { background-color: #ffffff !important; }
          .bg-\\[\\#151515\\] { background-color: #f1f5f9 !important; }
          .bg-\\[\\#222\\] { background-color: #e2e8f0 !important; }
          .bg-\\[\\#050505\\] { background-color: #f1f5f9 !important; }
          
          .bg-black\\/50 { background-color: rgba(255,255,255,0.8) !important; border: 1px solid #D4AF37 !important; color: #36454F !important; }
          .bg-black\\/60 { background-color: rgba(255,255,255,0.9) !important; border: 1px solid #D4AF37 !important; color: #36454F !important; }
          
          .bg-black\\/80 { 
              background-color: #ffffff !important; 
              color: #36454F !important; 
              border: 1px solid #D4AF37 !important; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }
          .bg-black\\/90 { background-color: rgba(255,255,255,0.95) !important; border: 1px solid #D4AF37 !important; color: #36454F !important; }
          .bg-black\\/95 { background-color: rgba(255,255,255,0.98) !important; }

          .border-white\\/10 { border-color: #D4AF37 !important; }
          .border-white\\/20 { border-color: #D4AF37 !important; }

          .text-white { color: #36454F !important; }
          .text-neutral-300 { color: #36454F !important; }
          .text-neutral-400 { color: #4A5568 !important; }
          .text-neutral-500 { color: #718096 !important; }
          
          .border-\\[\\#333\\] { border-color: #D4AF37 !important; }
          .border-\\[\\#222\\] { border-color: #D4AF37 !important; }
          
          input, select, textarea {
             background-color: #ffffff !important;
             color: #36454F !important;
             border-color: #D4AF37 !important;
          }
          input:focus, select:focus, textarea:focus {
             border-color: #D4AF37 !important;
          }

          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f5f9 !important; 
          }
          ::-webkit-scrollbar-thumb {
            background: #D4AF37 !important; 
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #B8860B !important; 
          }
        ` : ''}

        @media print {
            @page { margin: 1cm; size: landscape; }
            body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLoadProject} 
        accept=".json" 
        className="hidden" 
      />

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-md print:hidden" onClick={() => setFullscreenImage(null)}>
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                <img src={fullscreenImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl border border-[#333]" onClick={(e) => e.stopPropagation()} alt="Fullscreen" />
                <button className="absolute top-4 right-4 bg-accent text-white p-3 rounded-full hover:bg-white transition-all" onClick={() => setFullscreenImage(null)}><X className="w-6 h-6"/></button>
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className={`transition-all duration-500 z-40 bg-[#0a0a0a] border-b border-[#333] print:hidden
          ${isInputMode ? 'hidden' : 'block relative'}`}>
          
         <div className="w-full">
            <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <h2 className="text-xl font-anton !text-white tracking-widest uppercase">SINERGI</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab('concept')} disabled={false} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all border ${activeTab === 'concept' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : `bg-transparent text-neutral-500 border-transparent hover:border-[#333] hover:text-white`}`}><FileText className="w-4 h-4"/> CONCEPT</button>
                            <button onClick={() => (workflowStep !== 'input' && workflowStep !== 'concept_review') && setActiveTab('characters')} disabled={workflowStep === 'concept_review'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all border ${workflowStep === 'concept_review' ? 'opacity-30 cursor-not-allowed text-neutral-700 border-transparent' : activeTab === 'characters' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : `bg-transparent text-neutral-500 border-transparent hover:border-[#333] hover:text-white`}`}><Users className="w-4 h-4"/> CASTING</button>
                            <button onClick={() => (workflowStep === 'shotlist_review' || workflowStep === 'audio_generation') && setActiveTab('shotlist')} disabled={workflowStep !== 'shotlist_review' && workflowStep !== 'audio_generation'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all border ${workflowStep !== 'shotlist_review' && workflowStep !== 'audio_generation' ? 'opacity-30 cursor-not-allowed text-neutral-700 border-transparent' : activeTab === 'shotlist' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : `bg-transparent text-neutral-500 border-transparent hover:border-[#333] hover:text-white`}`}><Camera className="w-4 h-4"/> SHOTLIST</button>
                            <button onClick={() => workflowStep === 'audio_generation' && setActiveTab('audio')} disabled={workflowStep !== 'audio_generation'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all border ${workflowStep !== 'audio_generation' ? 'opacity-30 cursor-not-allowed text-neutral-700 border-transparent' : activeTab === 'audio' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : `bg-transparent text-neutral-500 border-transparent hover:border-[#333] hover:text-white`}`}><Music className="w-4 h-4"/> AUDIO</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowHeaderColorPicker(!showHeaderColorPicker)} 
                                className="flex items-center gap-2 bg-[#151515] hover:bg-white text-neutral-400 hover:text-black px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-[#333]"
                                title="Ganti Tema Warna"
                            >
                                <div className="w-3 h-3 rounded-full border border-neutral-500" style={{ backgroundColor: primaryColor }}></div>
                                <Palette className="w-4 h-4"/>
                            </button>
                            {showHeaderColorPicker && (
                                <div className="absolute top-full right-0 mt-2 bg-[#151515] border border-[#333] p-3 rounded-lg shadow-2xl grid grid-cols-4 gap-2 z-50 w-48 animate-fadeIn">
                                    {colorOptions.map((c) => (
                                        <button 
                                            key={c.hex} 
                                            onClick={() => { setPrimaryColor(c.hex); setShowHeaderColorPicker(false); }}
                                            className={`w-8 h-8 rounded-full border border-[#333] hover:scale-110 transition-transform ${primaryColor === c.hex ? 'ring-2 ring-white' : ''}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={handleSaveProject} className="flex items-center gap-2 bg-[#151515] hover:bg-white text-neutral-400 hover:text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-[#333]">
                            <SaveAll className="w-4 h-4"/> <span className="hidden md:inline">Save</span>
                        </button>
                        <div className="w-px h-6 bg-[#333] mx-2"></div>
                        <button onClick={handleSaveToDocs} className={`flex items-center gap-2 bg-[#151515] hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} text-neutral-400 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-transparent hover:border-[#333]`} title="Simpan Konsep">
                            <FileText className="w-4 h-4"/>
                        </button>
                        <button onClick={handleBackToForm} className={`flex items-center gap-2 bg-[#151515] hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} text-neutral-400 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-transparent hover:border-[#333]`} title="Home / Mulai Dari Awal">
                            <Home className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* INPUT MODE */}
      {isInputMode && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 print:hidden">
              <div className="max-w-6xl w-full bg-[#111] border border-[#333] rounded-2xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden h-[90vh]">
                  
                  <div className="w-full md:w-1/3 bg-[#6F060C] border-r border-[#D4AF37] p-8 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-white opacity-5 pattern-grid-lg pointer-events-none"></div>
                      <div className="relative z-10">
                          <div className="mb-6 flex items-center gap-3">
                             <Logo className="w-14 h-14" />
                             <h2 className="text-4xl font-anton !text-white tracking-widest uppercase">SINERGI</h2>
                          </div>
                          
                          <h2 className="text-xs font-bold !text-white uppercase tracking-[0.3em] mb-2">AI STORYBOARD</h2>
                          <h1 className="text-5xl md:text-6xl font-black !text-white uppercase tracking-tighter leading-none mb-6">CINEMATIC FILM</h1>
                          
                          <p className="text-rose-100 text-sm leading-relaxed">Ubah ide kerenmu jadi cerita penuh makna dalam bentuk video AI...</p>
                      </div>
                      <div className="mt-8 relative z-10 flex flex-col gap-4">
                          <button 
                            onClick={handleRandomizeProject} 
                            disabled={isRandomizing}
                            className={`flex items-center gap-2 bg-[linear-gradient(to_bottom,#fff1a8_50%,#ffcc00_50%)] text-black px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.1em] transition-all cursor-pointer shadow-[0_2px_0_0_#a68500,0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:brightness-105 active:translate-y-[1px] active:shadow-[0_1px_0_0_#a68500,inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-[#a68500] relative z-20 w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                              {isRandomizing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Dices className="w-4 h-4 stroke-[2.5px]"/>} 
                              {isRandomizing ? "GENERATING..." : "IDE RANDOM (AI)"}
                          </button>
                          
                          <div className="border-t border-[#333] pt-4">
                             <p className="text-[10px] !text-white uppercase tracking-widest mb-2 font-bold">Lanjutkan Project:</p>
                             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 bg-[#222] hover:bg-white text-white hover:text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-all w-full justify-center shadow-lg border border-[#333]">
                                  <FolderOpen className="w-5 h-5"/> LOAD PROJECT
                             </button>
                          </div>
                          
                          <div className="mt-4 relative">
                             <button 
                                onClick={() => setShowColorPicker(!showColorPicker)} 
                                className="flex items-center gap-3 text-xs font-bold !text-white uppercase tracking-widest transition-all group"
                             >
                                 <div className="w-4 h-4 rounded-full border border-white transition-colors" style={{ backgroundColor: primaryColor }}></div>
                                 COLOR THEME
                                 <ChevronDown className="w-3 h-3 !text-white"/>
                             </button>

                             {showColorPicker && (
                                 <div className="absolute left-0 bottom-full mb-2 bg-[#151515] border border-[#333] p-3 rounded-lg shadow-2xl grid grid-cols-4 gap-2 z-50 w-64 animate-fadeIn">
                                     {colorOptions.map((c) => (
                                        <button 
                                            key={c.hex} 
                                            onClick={() => { setPrimaryColor(c.hex); setShowColorPicker(false); }}
                                            className={`w-8 h-8 rounded-full border border-[#333] hover:scale-110 transition-transform ${primaryColor === c.hex ? 'ring-2 ring-white' : ''}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        />
                                     ))}
                                 </div>
                             )}
                          </div>
                      </div>
                  </div>

                  <div className="w-full md:w-2/3 flex flex-col h-full bg-white">
                      <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-thin scrollbar-thumb-rose-200">
                          <div className="space-y-6">
                              <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">JUDUL FILM</label>
                                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-white border border-[#D4AF37] rounded-lg px-4 py-3 text-[#36454F] focus-border-accent focus:ring-1 ring-accent focus:outline-none transition-all placeholder-neutral-400" />
                              </div>
                              
                              <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Logline / Premis</label>
                                  <textarea name="logline" value={formData.logline} onChange={handleInputChange} rows={3} className="w-full bg-white border border-[#D4AF37] rounded-lg px-4 py-3 text-[#36454F] focus-border-accent focus:ring-1 ring-accent focus:outline-none resize-none text-sm placeholder-neutral-400" />
                              </div>

                              <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Pesan Utama / Emosional</label>
                                  <input type="text" name="coreMessage" value={formData.coreMessage} onChange={handleInputChange} className="w-full bg-white border border-[#D4AF37] rounded-lg px-4 py-3 text-[#36454F] focus-border-accent focus:ring-1 ring-accent focus:outline-none transition-all placeholder-neutral-400" placeholder="Apa inti cerita ini?" />
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Durasi</label>
                                      <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-white border border-[#D4AF37] rounded-lg px-3 py-3 text-[#36454F] text-sm focus-border-accent focus:outline-none">
                                          <option value="0.5">30s</option>
                                          <option value="1">1 Min</option>
                                          <option value="2">2 Min</option>
                                          <option value="3">3 Min</option>
                                          <option value="5">5 Min</option>
                                          <option value="10">10 Min</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Mood Utama</label>
                                      <select name="mood" value={formData.mood} onChange={handleInputChange} className="w-full bg-white border border-[#D4AF37] rounded-lg px-3 py-3 text-[#36454F] text-sm focus-border-accent focus:outline-none">
                                          {predefinedMoods.map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Genre</label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                      {genresList.map(g => (
                                          <button key={g} onClick={() => toggleGenre(g)} className={`px-2 py-2 rounded text-[10px] font-bold uppercase tracking-wider border transition-all truncate ${formData.genres.includes(g) ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : 'bg-transparent text-neutral-400 border-[#D4AF37] hover-border-accent hover-text-accent'}`}>{g}</button>
                                      ))}
                                      {formData.genres.filter(g => !genresList.includes(g)).map(g => (
                                          <button key={g} onClick={() => toggleGenre(g)} className={`px-2 py-2 rounded text-[10px] font-bold uppercase tracking-wider border transition-all truncate bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent`}>{g}</button>
                                      ))}
                                  </div>
                                  <div className="flex gap-2">
                                       <input 
                                          value={customGenre}
                                          onChange={(e) => setCustomGenre(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && addCustomGenre()}
                                          placeholder="Tambah Genre Custom..."
                                          className="bg-white border border-[#D4AF37] rounded px-3 py-2 text-xs text-[#36454F] focus-border-accent flex-1 outline-none"
                                       />
                                       <button onClick={addCustomGenre} className={`px-4 py-2 bg-rose-50 hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} rounded text-[10px] font-bold uppercase tracking-widest transition-all border border-[#D4AF37]`}>
                                          <Plus className="w-3 h-3"/>
                                       </button>
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Daftar Karakter Utama</label>
                                  <div className="space-y-3">
                                      {formData.characterList.map((char, idx) => (
                                          <div key={char.id} className="flex gap-2">
                                              <div className={`w-8 h-8 bg-rose-50 rounded flex items-center justify-center text-accent font-bold text-xs border border-[#D4AF37]`}>{idx + 1}</div>
                                              <input 
                                                  placeholder="Nama" 
                                                  value={char.name} 
                                                  onChange={(e) => updateCharacterInput(char.id, 'name', e.target.value)}
                                                  className="bg-white border border-[#D4AF37] rounded px-3 py-1 text-sm text-[#36454F] focus-border-accent w-1/3 outline-none"
                                              />
                                              <input 
                                                  placeholder="Deskripsi Singkat" 
                                                  value={char.desc} 
                                                  onChange={(e) => updateCharacterInput(char.id, 'desc', e.target.value)}
                                                  className="bg-white border border-[#D4AF37] rounded px-3 py-1 text-sm text-[#36454F] focus-border-accent flex-1 outline-none"
                                              />
                                              {formData.characterList.length > 1 && (
                                                  <button onClick={() => removeCharacterInput(char.id)} className="p-2 text-neutral-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                                              )}
                                          </div>
                                      ))}
                                      <button onClick={addCharacterInput} className="w-full py-2 border border-dashed border-[#D4AF37] rounded text-[10px] uppercase tracking-widest text-neutral-400 hover-text-accent hover-border-accent flex items-center justify-center gap-2 transition-all">
                                          <Plus className="w-3 h-3"/> Tambah Karakter
                                      </button>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 gap-6">
                                  <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Style Visual (Preset)</label>
                                      <select name="stylePreset" value={formData.stylePreset} onChange={handleInputChange} className="w-full bg-white border border-[#D4AF37] rounded-lg px-3 py-3 text-accent text-sm font-bold focus-border-accent focus:outline-none">
                                          {Object.keys(stylePresets).map(s => <option key={s} value={s}>{s}</option>)}
                                          <option value="Custom">Custom</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] uppercase tracking-widest text-[#36454F] mb-2 font-bold">Visual Style (Detail Tambahan)</label>
                                      <textarea name="visualStyle" value={formData.visualStyle} onChange={handleInputChange} rows={2} className="w-full bg-white border border-[#D4AF37] rounded-lg px-4 py-3 text-[#36454F] focus-border-accent focus:ring-1 ring-accent focus:outline-none resize-none text-sm placeholder-neutral-400" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="p-8 md:p-10 pt-0 mt-auto border-t border-[#D4AF37] bg-white">
                          <button 
                            onClick={generateConcept} 
                            disabled={isGenerating} 
                            className={`w-full mt-4 bg-[linear-gradient(to_bottom,#fff1a8_50%,#ffcc00_50%)] text-black font-black uppercase tracking-[0.12em] py-2.5 rounded-lg text-[11px] flex items-center justify-center gap-2 transition-all shadow-[0_2px_0_0_#a68500,0_6px_12px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:brightness-105 active:translate-y-[1px] active:shadow-[0_1px_0_0_#a68500,inset_0_1px_0_0_rgba(255,255,255,0.8)] border border-[#a68500] relative z-20 disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4 fill-black" />} 
                                {isGenerating ? "GENERATING..." : "GENERATE CONCEPT"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MAIN APP CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-black flex flex-col print:hidden">
        
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-accent animate-pulse font-mono tracking-widest text-sm uppercase">Processing your vision...</p>
          </div>
        )}

        {generatedData.concept && !isInputMode && (
            <div className="flex-1 flex flex-col overflow-hidden">

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#333] pb-32">
                    {activeTab === 'concept' && (
                        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
                            <div className="text-center mb-10">
                                <h2 className="text-6xl text-accent uppercase tracking-tighter mb-4 font-anton">{generatedData.concept.title}</h2>
                            </div>

                            <div className="w-full mb-12 rounded-xl overflow-hidden shadow-2xl border border-[#333] relative group min-h-[400px] bg-[#111] flex flex-col">
                                {generatedData.concept.imageUrl ? (
                                    <>
                                        <img src={generatedData.concept.imageUrl} alt="Visual Concept" className="w-full h-auto max-h-[500px] object-cover" />
                                        
                                        {generatedData.concept.imageHistory && generatedData.concept.imageHistory.length > 1 && (
                                            <div className="absolute bottom-4 left-4 z-20 flex gap-2 p-2 bg-black/60 backdrop-blur rounded-lg overflow-x-auto max-w-[80%] scrollbar-none">
                                                {generatedData.concept.imageHistory.map((url: string, i: number) => (
                                                    <img 
                                                        key={i} 
                                                        src={url} 
                                                        onClick={() => restoreImage(null, 'concept', url)}
                                                        className={`w-12 h-8 object-cover rounded cursor-pointer border-2 transition-all hover:scale-110 ${generatedData.concept.imageUrl === url ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                          <button onClick={regenerateConceptImage} disabled={isGeneratingConceptImage} className={`p-2 bg-black/50 text-white rounded-full hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} transition-colors backdrop-blur flex items-center gap-2`} title="Regenerate Image">
                                              <RefreshCw className="w-5 h-5" />
                                          </button>
                                          <button onClick={() => setFullscreenImage(generatedData.concept.imageUrl)} className={`p-2 bg-black/50 text-white rounded-full hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} transition-colors backdrop-blur`}>
                                              <Maximize2 className="w-5 h-5" />
                                          </button>
                                          <a href={generatedData.concept.imageUrl} download="concept.png" className={`p-2 bg-black/50 text-white rounded-full hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} transition-colors backdrop-blur`}>
                                              <Download className="w-5 h-5" />
                                          </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-[400px] flex flex-col items-center justify-center text-center p-8">
                                        {isGeneratingConceptImage ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCw className="w-12 h-12 text-accent animate-spin" />
                                                <p className="text-accent uppercase tracking-widest font-bold animate-pulse">Generating World...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <ImageIcon className="w-16 h-16 text-neutral-700" />
                                                <p className="text-neutral-500 text-sm max-w-md">Gambar konsep belum tersedia (Mungkin karena batas kuota). Silakan coba generate ulang.</p>
                                                <button 
                                                    onClick={regenerateConceptImage} 
                                                    className={`bg-accent hover:bg-white ${isDarkMode ? 'text-black' : 'text-white hover:text-black'} px-6 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center gap-2 transition-all`}
                                                >
                                                    <Wand2 className="w-4 h-4" /> Generate Concept Art
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-accent font-bold uppercase tracking-widest text-xl border-b border-[#333] pb-4">Sinopsis & Struktur</h3>
                                    {generatedData.concept.synopsis.map((text: string, idx: number) => (
                                        <div key={idx} className="bg-[#111] p-6 rounded-xl border border-[#333] hover-border-accent transition-all">
                                            <span className="text-xs font-bold text-accent block mb-3 uppercase tracking-wider">{idx === 0 ? 'Act I: Setup' : idx === 1 ? 'Act II: Conflict' : 'Act III: Resolution'}</span>
                                            <textarea className="w-full bg-transparent text-neutral-300 leading-relaxed focus:outline-none resize-y min-h-[120px] text-sm" value={text} onChange={(e) => handleConceptEdit('synopsis', e.target.value, idx)} />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-8">
                                    <h3 className="text-accent font-bold uppercase tracking-widest text-xl border-b border-[#333] pb-4">Visual Concept</h3>
                                    <div className="bg-[#111] p-8 rounded-xl border border-[#333]">
                                        <div className="mb-8 border-b border-[#333] pb-8">
                                            <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Genre & Tema</label>
                                            <div className="text-white text-lg font-bold mb-1">{formData.genres.join(", ")}</div>
                                            <div className="text-neutral-400 text-sm">{generatedData.concept.theme}</div>
                                        </div>

                                        <div className="mb-8 border-b border-[#333] pb-8">
                                            <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Style Preset (Selected)</label>
                                            <div className="text-accent text-lg font-bold mb-1 flex items-center gap-2"><Palette className="w-5 h-5"/> {formData.stylePreset}</div>
                                        </div>

                                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-4">PESAN UTAMA</label>
                                        <div className={`p-6 bg-accent rounded-xl ${isDarkMode ? 'text-black' : 'text-white'} font-serif text-xl text-center italic font-bold mb-8`}>"{generatedData.concept.emotionalMessage}"</div>
                                        
                                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-4 flex justify-between items-center">
                                            Visual Direction
                                            <button 
                                                onClick={regenerateConceptImage} 
                                                disabled={isGeneratingConceptImage} 
                                                className={`text-[10px] bg-[#222] hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} px-3 py-1 rounded-full transition-all flex items-center gap-2 disabled:opacity-50`}
                                            >
                                                {isGeneratingConceptImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                Regenerate Concept Art
                                            </button>
                                        </label>
                                        <textarea className="w-full h-64 bg-[#0a0a0a] rounded-xl p-6 text-base text-neutral-300 focus:ring-1 ring-accent focus:outline-none resize-none leading-relaxed mb-2" value={generatedData.concept.visualDirection} onChange={(e) => handleConceptEdit('visualDirection', e.target.value)} />
                                        <p className="text-[10px] text-neutral-500 italic">*Edit teks di atas lalu klik "Regenerate Concept Art" untuk mengubah gambar dunia cerita.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'characters' && (
                        <div className="max-w-7xl mx-auto animate-fadeIn">
                            <div className="flex justify-center mb-8 gap-4">
                                <button onClick={() => setCastingTab('actors')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${castingTab === 'actors' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'bg-[#151515] text-neutral-500 hover:text-white'}`}><Users className="w-4 h-4"/> Actors</button>
                                <button onClick={() => setCastingTab('elements')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${castingTab === 'elements' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'bg-[#151515] text-neutral-500 hover:text-white'}`}><Package className="w-4 h-4"/> Elements</button>
                                <button onClick={() => setCastingTab('locations')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${castingTab === 'locations' ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'bg-[#151515] text-neutral-500 hover:text-white'}`}><MapPin className="w-4 h-4"/> Locations</button>
                            </div>

                            <div className="space-y-6">
                                {((castingTab === 'actors' ? generatedData.characterProfiles : castingTab === 'locations' ? generatedData.locationProfiles : generatedData.elementProfiles)).map((item) => (
                                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-[#111] rounded-xl overflow-hidden shadow-xl border border-[#333]">
                                    
                                    <div className="lg:col-span-5 border-r border-[#333] p-5 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#333]">
                                            <div className={`bg-accent ${isDarkMode ? 'text-black' : 'text-white'} w-6 h-6 flex items-center justify-center font-bold rounded text-xs`}>{item.id}</div>
                                            <input value={item.name} onChange={(e) => handleProfileEdit(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'name', e.target.value)} className="bg-transparent font-bold text-lg text-white focus:outline-none w-full" placeholder="Name" />
                                            <button onClick={() => removeCastingItem(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} className="text-neutral-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                        <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#333] mb-3 space-y-2">
                                             <label className="text-[9px] uppercase text-neutral-500 font-bold block tracking-widest">Deskripsi Visual</label>
                                             <textarea 
                                                value={item.detailedDescription} 
                                                onChange={(e) => handleProfileEdit(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'detailedDescription', e.target.value)} 
                                                className="w-full h-24 bg-black rounded-lg p-2 text-xs text-neutral-300 focus:ring-1 ring-accent focus:outline-none resize-none border border-[#333]" 
                                                placeholder="Deskripsi detail..." 
                                             />
                                             {!item.prompt && (
                                                <button onClick={() => generatePrompt(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} className={`w-full py-2 bg-[#222] hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} text-neutral-400 rounded-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 font-bold`}>
                                                    <Wand2 className="w-3 h-3"/> Generate Prompt
                                                </button>
                                             )}
                                        </div>
                                        {item.prompt && (
                                            <div className="animate-fadeIn">
                                                <label className="text-[9px] uppercase text-accent font-bold mb-1 tracking-widest flex justify-between items-center">
                                                    <span>Generate Prompt</span>
                                                    <button className="text-[9px] text-neutral-500 hover:text-white" onClick={() => handleProfileEdit(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'prompt', "")}>Reset</button>
                                                </label>
                                                <textarea value={item.prompt} onChange={(e) => handleProfileEdit(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'prompt', e.target.value)} className={`w-full h-20 bg-accent ${isDarkMode ? 'text-black' : 'text-white'} rounded-lg border-none p-2 text-[10px] font-mono font-bold focus:outline-none resize-none`} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:col-span-7 bg-black min-h-[300px] relative flex flex-col">
                                         {item.imageUrl ? (
                                             <div className="relative w-full h-full group">
                                                 {item.isGeneratingImage && (
                                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                                                        <RefreshCw className="w-8 h-8 text-accent animate-spin mb-2" />
                                                        <span className="text-accent font-bold uppercase text-[10px] tracking-widest">Rendering Visual...</span>
                                                    </div>
                                                 )}
                                                 <img src={item.imageUrl} className="w-full h-full object-contain bg-[#000]" alt="Preview" onClick={() => setFullscreenImage(item.imageUrl)} />
                                                 
                                                 {item.imageHistory && item.imageHistory.length > 1 && (
                                                    <div className="absolute bottom-4 left-4 z-20 flex gap-2 p-2 bg-black/60 backdrop-blur rounded-lg overflow-x-auto max-w-[60%] scrollbar-none">
                                                        {item.imageHistory.map((url: string, i: number) => (
                                                            <img 
                                                                key={i} 
                                                                src={url} 
                                                                onClick={() => restoreImage(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', url)}
                                                                className={`w-10 h-10 object-cover rounded cursor-pointer border-2 transition-all hover:scale-110 ${item.imageUrl === url ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                 )}

                                                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                                     <button onClick={() => setFullscreenImage(item.imageUrl)} className={`p-2 bg-black/50 hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} rounded text-white backdrop-blur`}><Maximize2 className="w-4 h-4"/></button>
                                                     <a href={item.imageUrl} download={`asset-${item.id}.png`} className={`p-2 bg-black/50 hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} rounded text-white backdrop-blur`} title="Download"><Download className="w-4 h-4"/></a>
                                                     <button onClick={() => generateImage(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} className={`p-2 bg-black/50 hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} rounded text-white backdrop-blur`} title="Regenerate"><RefreshCw className="w-4 h-4"/></button>
                                                     <button onClick={() => setRefiningProfile({id: item.id, type: castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', text: ''})} className={`p-2 bg-black/50 hover-bg-accent ${isDarkMode ? 'hover:text-black' : 'hover:text-white'} rounded text-white backdrop-blur`} title="Refine Image"><Eraser className="w-4 h-4"/></button>
                                                     <button onClick={() => handleRemoveProfileImage(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} className="p-2 bg-black/50 hover:bg-red-500 rounded text-white backdrop-blur" title="Hapus Gambar"><Trash2 className="w-4 h-4"/></button>
                                                 </div>

                                                 {refiningProfile?.id === item.id && refiningProfile.type === (castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element') && (
                                                     <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 animate-fadeIn">
                                                         <h4 className="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Eraser className="w-5 h-5 text-accent"/> Refine Profile Image</h4>
                                                         <div className="w-full max-w-md bg-[#111] border border-[#333] rounded-xl p-4 shadow-2xl">
                                                             <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wide">Jelaskan perubahan yang diinginkan...</p>
                                                             <textarea 
                                                                 autoFocus
                                                                 value={refiningProfile.text}
                                                                 onChange={(e) => setRefiningProfile(prev => prev ? {...prev, text: e.target.value} : null)}
                                                                 className="w-full h-24 bg-black border border-[#333] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent resize-none mb-4"
                                                                 placeholder="Contoh: Buat ekspresi lebih serius, ganti pakaian jadi lebih lusuh, ubah pencahayaan..."
                                                             />
                                                             <div className="flex justify-end gap-2">
                                                                 <button onClick={() => setRefiningProfile(null)} className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Batal</button>
                                                                 <button 
                                                                     onClick={() => handleProfileRefinement(item.id, refiningProfile.type)} 
                                                                     disabled={!refiningProfile.text.trim()}
                                                                     className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${!refiningProfile.text.trim() ? 'bg-[#333] text-neutral-600 cursor-not-allowed' : `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:bg-white hover:text-black`}`}
                                                                 >
                                                                     Refine
                                                                 </button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )}
                                             </div>
                                         ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                                {item.isGeneratingImage ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] text-accent uppercase tracking-widest animate-pulse">Rendering...</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full max-w-xs space-y-4">
                                                        <button 
                                                            onClick={() => generateImage(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} 
                                                            disabled={!item.prompt} 
                                                            className={`w-full py-3 rounded-lg uppercase text-xs font-bold tracking-widest transition-all ${!item.prompt ? 'bg-[#222] border border-[#333] text-neutral-600 opacity-50 cursor-not-allowed' : `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:bg-white hover:text-black shadow-lg`}`}
                                                        >
                                                            {!item.prompt ? "Prompt Needed" : "Generate Visual (AI)"}
                                                        </button>
                                                        <div>
                                                            <div className="flex justify-center gap-2 mb-2">
                                                                {item.refImageUrls.map((url, i) => (
                                                                    <div key={i} className="w-10 h-10 border border-accent rounded overflow-hidden relative group">
                                                                        <img src={url} className="w-full h-full object-cover"/>
                                                                        <button onClick={() => removeRefImage(item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"><X className="w-3 h-3"/></button>
                                                                    </div>
                                                                ))}
                                                                {item.refImageUrls.length < 3 && (
                                                                    <label className="w-10 h-10 border border-dashed border-[#333] hover-border-accent rounded flex items-center justify-center cursor-pointer text-neutral-500 hover-text-accent">
                                                                        <Plus className="w-4 h-4"/>
                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'ref')} />
                                                                    </label>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] text-neutral-500">Upload maksimal 3 referensi</p>
                                                        </div>
                                                        <div className="border-t border-[#333] my-2"></div>
                                                        <label className="w-full py-2 border border-[#333] hover:border-white rounded-lg flex items-center justify-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all mt-2">
                                                            <Upload className="w-3 h-3" /> Upload Custom Image
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, item.id, castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element', 'full')} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                         )}
                                    </div>
                                </div>
                                ))}

                                <button onClick={() => addCastingItem(castingTab === 'actors' ? 'actor' : castingTab === 'locations' ? 'location' : 'element')} className="w-full py-6 border-2 border-dashed border-[#333] hover-border-accent rounded-xl flex items-center justify-center gap-3 text-neutral-500 hover-text-accent transition-all group">
                                    <Plus className="w-5 h-5 group-hover:text-black"/>
                                    <span className="font-bold uppercase tracking-widest text-xs">Tambah {castingTab === 'actors' ? 'Character' : castingTab === 'locations' ? 'Location' : 'Element'} Baru</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shotlist' && (
                        <div className="max-w-[98%] mx-auto animate-fadeIn">
                             <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
                                <div><h3 className="text-2xl font-black text-white uppercase tracking-widest">Master <span className="text-accent">Shotlist</span></h3></div>
                                <div className="text-right"><span className="text-3xl font-black text-accent">{generatedData.shots.length}</span><span className="text-neutral-500 text-[9px] uppercase block tracking-widest">Shots</span></div>
                            </div>
                            
                            <div className="space-y-8">
                                {generatedData.shots.map((shot) => (
                                <div key={shot.id} className="relative group">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-[#111] rounded-xl overflow-hidden shadow-lg border border-[#333]">
                                        
                                        <div className="lg:col-span-4 flex flex-col border-r border-[#333]">
                                            <div className="px-4 py-2 bg-[#0a0a0a] border-b border-[#333] flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 bg-accent ${isDarkMode ? 'text-black' : 'text-white'} font-bold flex items-center justify-center rounded text-xs`}>{shot.id}</div>
                                                    <span className="text-accent font-mono font-bold text-xs">{shot.time}</span>
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#222] text-white tracking-widest">{shot.act}</span>
                                                </div>
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col gap-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-1">Jarak Shot</label>
                                                        <select value={shot.shotSize} onChange={(e) => handleShotEdit(shot.id, 'shotSize', e.target.value)} className="w-full bg-[#151515] rounded text-[10px] text-white p-1.5 focus:outline-none border border-[#333]">{shotSizes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-1">Sudut Kamera</label>
                                                        <select value={shot.cameraAngle} onChange={(e) => handleShotEdit(shot.id, 'cameraAngle', e.target.value)} className="w-full bg-[#151515] rounded text-[10px] text-white p-1.5 focus:outline-none border border-[#333]">{cameraAngles.map(t => <option key={t} value={t}>{t}</option>)}</select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Actors (Multi-select)</label>
                                                        <div className="flex flex-wrap gap-1">
                                                            {generatedData.characterProfiles.map(c => {
                                                                const isSelected = shot.characterRefIds.includes(c.id);
                                                                return (
                                                                    <button 
                                                                        key={c.id} 
                                                                        onClick={() => toggleCharacterInShot(shot.id, c.id)}
                                                                        className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${isSelected ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : 'bg-[#0a0a0a] text-neutral-500 border-[#333] hover:border-white'}`}
                                                                    >
                                                                        {c.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-1 flex items-center gap-1"><Package className="w-3 h-3"/> Elements (Multi)</label>
                                                        <div className="flex flex-wrap gap-1">
                                                            {generatedData.elementProfiles.map(e => {
                                                                const isSelected = shot.elementRefIds.includes(e.id);
                                                                return (
                                                                    <button 
                                                                        key={e.id} 
                                                                        onClick={() => toggleElementInShot(shot.id, e.id)}
                                                                        className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${isSelected ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} border-accent` : 'bg-[#0a0a0a] text-neutral-500 border-[#333] hover:border-white'}`}
                                                                    >
                                                                        {e.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2">
                                                    <div>
                                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label>
                                                        <select value={shot.locationRefId} onChange={(e) => handleShotEdit(shot.id, 'locationRefId', e.target.value)} className="w-full bg-[#0a0a0a] rounded p-1.5 text-[10px] text-white border border-[#333]"><option value="">None</option>{generatedData.locationProfiles.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                                                    </div>
                                                </div>

                                                <div className="bg-[#0a0a0a] p-2 rounded-lg border border-[#333]">
                                                    <label className="text-[9px] uppercase text-accent font-bold block mb-1 tracking-widest">Visual Action</label>
                                                    <textarea value={shot.action} onChange={(e) => handleShotEdit(shot.id, 'action', e.target.value)} className="w-full h-20 bg-black rounded p-2 text-xs text-neutral-300 focus:ring-1 ring-accent focus:outline-none resize-none border border-[#333]" placeholder="Describe action..." />
                                                </div>
                                                    
                                                <div className="relative flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[9px] uppercase text-accent font-bold tracking-widest">Prompt (YAML)</label>
                                                        <button onClick={() => generateSinglePrompt(shot.id)} className="text-[9px] text-neutral-500 hover-text-accent flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Regen AI</button>
                                                    </div>
                                                    <div className={`w-full rounded-lg p-2 h-full min-h-[100px] relative overflow-hidden transition-all ${shot.prompt ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'bg-[#0a0a0a] border border-dashed border-[#333]'}`}>
                                                        {shot.prompt ? (
                                                            <textarea 
                                                                value={shot.prompt} 
                                                                onChange={(e) => handleShotEdit(shot.id, 'prompt', e.target.value)}
                                                                placeholder="Prompt AI akan muncul di sini (bisa diedit)..."
                                                                className={`w-full h-full bg-transparent border-none p-0 text-[10px] font-mono font-bold ${isDarkMode ? 'text-black' : 'text-white'} focus:outline-none resize-none leading-tight whitespace-pre-wrap cursor-text hover:cursor-text`}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                {shot.isGeneratingPrompt ? <span className="text-[10px] text-accent animate-pulse">AI Writing...</span> : <button onClick={() => generateSinglePrompt(shot.id)} className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-neutral-500 hover-text-accent font-bold"><Wand2 className="w-3 h-3" /> Generate Prompt</button>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-8 bg-black flex flex-col justify-center relative min-h-[500px]">
                                            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/50 p-1 rounded backdrop-blur">
                                                <button onClick={() => toggleAspectRatio(shot.id, "16:9")} className={`px-2 py-0.5 rounded text-[9px] font-bold ${shot.aspectRatio === "16:9" ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'text-white'}`}>16:9</button>
                                                <button onClick={() => toggleAspectRatio(shot.id, "9:16")} className={`px-2 py-0.5 rounded text-[9px] font-bold ${shot.aspectRatio === "9:16" ? `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}` : 'text-white'}`}>9:16</button>
                                            </div>

                                            <div className="w-full h-full p-4 flex items-center justify-center bg-[#050505] relative overflow-hidden">
                                                {shot.imageUrl ? (
                                                    <div className="relative group w-full h-full flex items-center justify-center">
                                                        {shot.isGeneratingImage && (
                                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                                                                <RefreshCw className="w-10 h-10 text-accent animate-spin mb-2" />
                                                                <span className="text-accent font-bold uppercase text-[10px] tracking-widest">Rendering Scene...</span>
                                                            </div>
                                                        )}
                                                        <img src={shot.imageUrl} alt="Visual" className={`shadow-2xl rounded object-contain ${shot.aspectRatio === '9:16' ? 'h-full max-h-[500px]' : 'w-full max-w-[90%] h-auto'}`} onClick={() => setFullscreenImage(shot.imageUrl)} />
                                                        
                                                        {shot.imageHistory && shot.imageHistory.length > 1 && (
                                                            <div className="absolute bottom-4 left-4 z-20 flex gap-2 p-2 bg-black/60 backdrop-blur rounded-lg overflow-x-auto max-w-[60%] scrollbar-none">
                                                                {shot.imageHistory.map((url: string, i: number) => (
                                                                    <img 
                                                                        key={i} 
                                                                        src={url} 
                                                                        onClick={() => restoreImage(shot.id, 'shot', url)}
                                                                        className={`w-12 h-8 object-cover rounded cursor-pointer border-2 transition-all hover:scale-110 ${shot.imageUrl === url ? 'border-accent' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                                                             <button onClick={() => shot.imageUrl && setFullscreenImage(shot.imageUrl)} className="bg-black/80 text-white hover-text-accent p-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/10" title="Fullscreen"><Eye className="w-4 h-4" /></button>
                                                             <a href={shot.imageUrl} download={`shot-${shot.id}.png`} className="bg-black/80 text-white hover-text-accent p-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/10" title="Download"><Download className="w-4 h-4" /></a>
                                                             <button onClick={() => generateShotImage(shot.id)} className="bg-black/80 text-white hover-text-accent p-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/10" title="Regenerate Image"><RefreshCw className="w-4 h-4" /></button>
                                                             
                                                             <button 
                                                                onClick={() => setRefiningShot({id: shot.id, text: ''})} 
                                                                className="bg-black/80 text-white hover:bg-white hover:text-black p-2 rounded-full backdrop-blur-sm shadow-lg border border-white/10 transition-all"
                                                                title="Refine Image (Fix Anomalies)"
                                                             >
                                                                <Eraser className="w-4 h-4" />
                                                             </button>

                                                             <button 
                                                                onClick={() => generateVideoPrompt(shot.id)} 
                                                                disabled={shot.isGeneratingVideoPrompt}
                                                                className={`flex items-center gap-2 bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:brightness-110 px-4 py-2 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 font-black text-[10px] uppercase tracking-widest transition-all transform hover:scale-105`}
                                                                title="Generate Video Prompt"
                                                             >
                                                                {shot.isGeneratingVideoPrompt ? <Loader2 className="w-4 h-4 animate-spin"/> : <Video className="w-4 h-4"/>}
                                                                <span>Video Prompt</span>
                                                             </button>
                                                        </div>

                                                        {refiningShot?.id === shot.id && (
                                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 animate-fadeIn">
                                                                <h4 className="text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Eraser className="w-5 h-5 text-accent"/> Refine Image</h4>
                                                                <div className="w-full max-w-md bg-[#111] border border-[#333] rounded-xl p-4 shadow-2xl">
                                                                    <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wide">Perbaiki apapun yang ingin diperbaiki (Hapus objek, ganti sudut kamera, tambahkan objek, dsb)</p>
                                                                    <textarea 
                                                                        autoFocus
                                                                        value={refiningShot.text}
                                                                        onChange={(e) => setRefiningShot(prev => prev ? {...prev, text: e.target.value} : null)}
                                                                        className="w-full h-24 bg-black border border-[#333] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent resize-none mb-4"
                                                                        placeholder="Contoh: Hapus botol air di meja, ganti angle jadi low angle, buat pencahayaan lebih gelap..."
                                                                    />
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => setRefiningShot(null)} className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Batal</button>
                                                                        <button 
                                                                            onClick={() => handleShotRefinement(shot.id)} 
                                                                            disabled={!refiningShot.text.trim()}
                                                                            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${!refiningShot.text.trim() ? 'bg-[#333] text-neutral-600 cursor-not-allowed' : `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:bg-white hover:text-black`}`}
                                                                        >
                                                                            Refine Image
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        {shot.isGeneratingImage ? (
                                                            <div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div><span className="text-[10px] text-accent uppercase tracking-widest animate-pulse font-bold">Rendering Scene...</span></div>
                                                        ) : (
                                                            <button onClick={() => generateShotImage(shot.id)} disabled={!shot.prompt} className={`group flex flex-col items-center gap-3 transition-all ${!shot.prompt ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}><div className="w-16 h-16 rounded-xl bg-[#151515] flex items-center justify-center group-hover-bg-accent transition-colors shadow-xl border border-[#333] group-hover-border-accent"><ImageIcon className={`w-6 h-6 text-neutral-600 group-hover:${isDarkMode ? 'text-black' : 'text-white'}`} /></div><span className={`text-[10px] font-bold text-neutral-500 group-hover:${isDarkMode ? 'text-white' : 'text-black'} uppercase tracking-widest`}>{!shot.prompt ? "Prompt Required" : "Generate Shot"}</span></button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {videoPromptShot && (
                        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setVideoPromptShot(null)}>
                            <div className="bg-[#111] border border-[#333] rounded-xl p-6 max-lg w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                                <button className="absolute top-4 right-4 text-neutral-500 hover:text-white" onClick={() => setVideoPromptShot(null)}><X className="w-5 h-5"/></button>
                                <h3 className="text-xl font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2"><Video className="w-6 h-6"/> Video Prompt Generated</h3>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-4">Gunakan prompt ini di AI generate video</p>
                                
                                <div className="bg-black p-4 rounded-lg border border-[#333] mb-4">
                                    <p className="text-sm text-neutral-300 font-mono leading-relaxed">{videoPromptShot.text}</p>
                                </div>
                                
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(videoPromptShot.text); alert("Copied!"); }}
                                    className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:bg-white hover:text-black transition-all`}
                                >
                                    <Copy className="w-4 h-4"/> Copy Prompt
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audio' && (
                        <div className="max-w-4xl mx-auto animate-fadeIn space-y-8">
                            <div className="text-center mb-12">
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Soundtrack & <span className="text-accent">Voice</span></h2>
                                <p className="text-neutral-400 max-w-lg mx-auto text-sm">Generate instruksi musik (backsound) dan narasi suara otomatis.</p>
                            </div>

                            <div className="bg-[#111] border border-[#333] rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none"></div>
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className={`w-12 h-12 rounded-full bg-accent ${isDarkMode ? 'text-black' : 'text-white'} flex items-center justify-center shadow-lg`}>
                                        <Music className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Backsound Prompt Generator</h3>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Untuk Suno AI, Udio, atau Stable Audio</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-black/50 p-4 rounded-lg border border-[#333]">
                                        <p className="text-[10px] uppercase text-neutral-500 font-bold mb-1">Durasi Film</p>
                                        <p className="text-white font-mono text-lg">{formData.duration} Menit</p>
                                    </div>
                                    <div className="bg-black/50 p-4 rounded-lg border border-[#333]">
                                        <p className="text-[10px] uppercase text-neutral-500 font-bold mb-1">Mood & Genre</p>
                                        <p className="text-white font-mono text-lg">{formData.mood} / {formData.genres[0]}</p>
                                    </div>
                                </div>

                                {generatedData.audio.musicPrompt ? (
                                    <div className="bg-black p-6 rounded-xl border border-accent/30 relative">
                                        <p className="text-sm text-neutral-300 font-mono leading-relaxed whitespace-pre-wrap">{generatedData.audio.musicPrompt}</p>
                                        <button 
                                            onClick={() => { navigator.clipboard.writeText(generatedData.audio.musicPrompt); alert("Music Prompt Copied!"); }}
                                            className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                                            title="Copy"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-[#333] rounded-xl">
                                        <p className="text-neutral-600 text-xs uppercase tracking-widest mb-4">Belum ada prompt musik</p>
                                    </div>
                                )}

                                <button 
                                    onClick={generateMusicPrompt} 
                                    disabled={generatedData.audio.isGeneratingMusicPrompt}
                                    className={`w-full mt-6 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${generatedData.audio.isGeneratingMusicPrompt ? 'bg-[#222] text-neutral-500' : `bg-accent ${isDarkMode ? 'text-black' : 'text-white'} hover:scale-[1.02] shadow-lg`}`}
                                >
                                    {generatedData.audio.isGeneratingMusicPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                    {generatedData.audio.musicPrompt ? "Regenerate Music Prompt" : "Generate Music Prompt"}
                                </button>
                            </div>

                            <div className="bg-[#111] border border-[#333] rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none"></div>
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className={`w-12 h-12 rounded-full bg-[#222] text-white flex items-center justify-center shadow-lg border border-[#333]`}>
                                        <Mic className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Narasi Suara</h3>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Pilih karakter suara untuk membacakan sinopsis.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-2 tracking-widest">Karakter Suara</label>
                                        <select 
                                            value={audioSettings.voiceCharacter} 
                                            onChange={(e) => setAudioSettings(prev => ({...prev, voiceCharacter: e.target.value}))} 
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-3 text-white text-xs font-bold focus:border-accent focus:outline-none"
                                        >
                                            {voiceCharacters.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-2 tracking-widest">Emosi Suara</label>
                                        <select 
                                            value={audioSettings.voiceEmotion} 
                                            onChange={(e) => setAudioSettings(prev => ({...prev, voiceEmotion: e.target.value}))} 
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-3 text-white text-xs font-bold focus:border-accent focus:outline-none"
                                        >
                                            {voiceEmotions.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-2 tracking-widest">Usia Suara</label>
                                        <select 
                                            value={audioSettings.voiceAge} 
                                            onChange={(e) => setAudioSettings(prev => ({...prev, voiceAge: e.target.value}))} 
                                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-3 text-white text-xs font-bold focus:border-accent focus:outline-none"
                                        >
                                            {voiceAges.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-black/50 p-4 rounded-lg border border-[#333] mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase text-neutral-500 font-bold">Teks Narasi (Edit Sesuai Kebutuhan)</p>
                                    </div>
                                    <textarea 
                                        value={audioSettings.narrationText}
                                        onChange={(e) => setAudioSettings(prev => ({...prev, narrationText: e.target.value}))}
                                        rows={6}
                                        className="w-full bg-transparent border-none text-neutral-300 text-sm italic focus:outline-none resize-none leading-relaxed p-0"
                                        placeholder="Teks narasi akan muncul di sini..."
                                    />
                                </div>

                                {generatedData.audio.narrationAudio && (
                                    <div className="flex items-center gap-4 bg-black p-4 rounded-xl border border-[#333] mb-6 animate-fadeIn">
                                        <button 
                                            onClick={playNarration}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500 text-white animate-pulse' : `bg-accent ${isDarkMode ? 'text-black' : 'text-white'}`}`}
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                        </button>
                                        <div className="flex-1">
                                            <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                                                <div className={`h-full bg-accent ${isPlaying ? 'animate-progress' : 'w-full'}`} style={{width: isPlaying ? '100%' : '100%'}}></div>
                                            </div>
                                        </div>
                                        <a 
                                            href={generatedData.audio.narrationAudio} 
                                            download={`narration-${formData.title}.wav`}
                                            className="p-3 hover:bg-[#222] rounded-full text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                )}

                                <button 
                                    onClick={generateNarration} 
                                    disabled={generatedData.audio.isGeneratingNarration}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all bg-[#151515] border border-[#333] hover:border-white hover:text-white text-neutral-400`}
                                >
                                    {generatedData.audio.isGeneratingNarration ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                                    {generatedData.audio.narrationAudio ? "Regenerate Voiceover" : "Generate Voiceover"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
                
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        {workflowStep === 'concept_review' && activeTab === 'concept' && (
                            <button onClick={generateCasting} className={`bg-accent hover:bg-white hover:text-black ${isDarkMode ? 'text-black' : 'text-white'} font-black py-3 px-8 rounded-full flex items-center gap-3 shadow-2xl transform hover:-translate-y-1 transition-all uppercase tracking-widest text-xs border border-accent`}>
                                <Users className="w-4 h-4" /> Start AI Casting <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                        {workflowStep === 'character_design' && activeTab === 'characters' && (
                            <button onClick={generateShotlist} className="bg-white hover-bg-accent text-black font-black py-3 px-8 rounded-full flex items-center gap-3 shadow-2xl transform hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">
                                <Save className="w-4 h-4" /> Lock Casting & Build Shotlist <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                        {workflowStep === 'shotlist_review' && activeTab === 'shotlist' && (
                            <button 
                                onClick={() => { setWorkflowStep('audio_generation'); setActiveTab('audio'); }} 
                                className={`bg-accent hover:bg-white ${isDarkMode ? 'text-black' : 'text-white'} hover:text-black font-black py-3 px-8 rounded-full flex items-center gap-3 shadow-2xl transform hover:-translate-y-1 transition-all uppercase tracking-widest text-xs border border-accent`}
                            >
                                <Music className="w-4 h-4" /> Generate Audio <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* PERSISTENT GLOBAL FOOTER */}
      <footer className="w-full py-3 border-t border-white/5 bg-black/80 backdrop-blur-sm z-30 text-center print:hidden">
          <div className="flex items-center justify-center gap-2">
              <Logo className="w-4 h-4" />
              <p className="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-bold">
                  APLIKASI INI DIBUAT OLEH <span className="text-white">SINERGI</span>, © 2025
              </p>
          </div>
      </footer>

      <div className="hidden print:block bg-white text-black p-8 w-full">
          {generatedData.concept && (
              <>
                <div className="mb-8 border-b-4 border-black pb-4">
                    <h1 className="text-4xl font-black uppercase mb-2">{generatedData.concept.title}</h1>
                    <p className="text-xl italic text-gray-600">{formData.logline}</p>
                    <div className="mt-4 flex gap-4 text-sm font-bold uppercase">
                        <span>Duration: {formData.duration} Min</span>
                        <span>•</span>
                        <span>Genre: {formData.genres.join(", ")}</span>
                        <span>•</span>
                        <span>Style: {formData.stylePreset}</span>
                    </div>
                </div>

                {generatedData.concept.imageUrl && (
                    <div className="mb-8 w-full h-[400px] overflow-hidden rounded-xl border border-gray-300">
                        <img src={generatedData.concept.imageUrl} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-2xl font-bold uppercase border-b border-black mb-4 pb-2">Synopsis</h2>
                    {generatedData.concept.synopsis.map((p: string, i: number) => (
                        <p key={i} className="mb-2 text-justify leading-relaxed">{p}</p>
                    ))}
                </div>

                <div className="mb-8 break-inside-avoid">
                    <h2 className="text-2xl font-bold uppercase border-b border-black mb-4 pb-2">Character Design</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {generatedData.characterProfiles.map(c => (
                            <div key={c.id} className="border border-gray-300 rounded p-2 break-inside-avoid">
                                {c.imageUrl && <img src={c.imageUrl} className="w-full h-40 object-cover mb-2 rounded" />}
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                <p className="text-xs text-gray-600">{c.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold uppercase border-b border-black mb-4 pb-2">Shotlist</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="p-2 w-16">#</th>
                                <th className="p-2 w-24">Time</th>
                                <th className="p-2">Action & Visuals</th>
                                <th className="p-2 w-32">Shot</th>
                                <th className="p-2 w-48">Visual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedData.shots.map(shot => (
                                <tr key={shot.id} className="border-b border-gray-200 break-inside-avoid">
                                    <td className="p-2 font-bold">{shot.id}</td>
                                    <td className="p-2 text-sm">{shot.time}</td>
                                    <td className="p-2 text-sm">{shot.action}</td>
                                    <td className="p-2 text-xs font-mono uppercase">
                                        {shot.shotSize}<br/>{shot.cameraAngle}
                                    </td>
                                    <td className="p-2">
                                        {shot.imageUrl && <img src={shot.imageUrl} className="w-32 h-20 object-cover rounded border border-gray-300" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </>
          )}
      </div>
    </div>
  );
}