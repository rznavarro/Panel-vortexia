/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  PenTool, 
  MessageSquare, 
  Plus, 
  Search, 
  Bell, 
  Clock, 
  Copy, 
  Check, 
  ChevronRight, 
  LogOut, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Send,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURACIÓN INICIAL ---
const CONFIG = {
  businessName: "Vortexia Demo",        // nombre del negocio del cliente
  businessType: "Agencia Digital",     // coach / agencia / ecommerce / restaurante / otro
  ownerName: "Alex",                   // nombre del empresario
  primaryColor: "#B8972A",             // color de marca del cliente
  logoUrl: "",                         // URL del logo o vacío
  language: "auto",                    // detecta idioma del navegador automáticamente
  vortexiaContact: {
    name: "Vortexia",
    phone: "+1 (000) 000-0000",
    email: "hola@vortexia.com"
  }
};

// --- TYPES ---
interface BusinessData {
  revenueLastMonth: string;
  activeClients: string;
  biggestProblem: string;
  offer: string;
  teamSize: string;
  revenueGoal: string;
  onboardingComplete: boolean;
  geminiKey?: string;
}

interface Client {
  id: string;
  name: string;
  status: 'Nuevo' | 'Activo' | 'En riesgo' | 'Cobro pendiente';
  lastContactDays: number;
  value: number;
  history: string;
  effort: number; // 1-10
  recurrence: number; // months
}

interface Expense {
  id: string;
  category: string;
  amount: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  isAiSuggested: boolean;
}

// --- UTILS ---
const getLanguage = () => {
  if (CONFIG.language !== "auto") return CONFIG.language;
  const lang = navigator.language || 'en';
  return lang.startsWith('es') ? 'es' : 'en';
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat(getLanguage() === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

// --- COMPONENTS ---

const Antigravity: React.FC<{ color: string }> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number, y: number, size: number, speedX: number, speedY: number, opacity: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = 50;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.05 + 0.02
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="antigravity-container" />;
};

export default function App() {
  const [businessData, setBusinessData] = useState<BusinessData>(() => {
    const saved = localStorage.getItem('vortexia_business_data');
    return saved ? JSON.parse(saved) : {
      revenueLastMonth: "",
      activeClients: "",
      biggestProblem: "",
      offer: "",
      teamSize: "",
      revenueGoal: "",
      onboardingComplete: false,
      geminiKey: ""
    };
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('vortexia_clients');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Juan Pérez', status: 'Activo', lastContactDays: 2, value: 1500, history: 'Cliente recurrente desde hace 6 meses.', effort: 3, recurrence: 12 },
      { id: '2', name: 'Empresa ABC', status: 'Cobro pendiente', lastContactDays: 8, value: 3000, history: 'Proyecto finalizado, factura enviada.', effort: 7, recurrence: 3 },
      { id: '3', name: 'María García', status: 'En riesgo', lastContactDays: 12, value: 800, history: 'No responde a los últimos correos.', effort: 9, recurrence: 1 },
    ];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('vortexia_expenses');
    return saved ? JSON.parse(saved) : [
      { id: '1', category: 'Marketing', amount: 500 },
      { id: '2', category: 'Herramientas', amount: 200 },
      { id: '3', category: 'Sueldos', amount: 2000 },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('vortexia_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Revisar facturas pendientes', completed: false, isAiSuggested: false },
      { id: '2', text: 'Llamar a Empresa ABC', completed: false, isAiSuggested: true },
    ];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'clients' | 'expenses'>('dashboard');
  const [presentationMode, setPresentationMode] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model', text: string }>>([]);
  const [activeContentGenerator, setActiveContentGenerator] = useState<'posts' | 'proposal' | 'email' | 'faq' | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingInput, setOnboardingInput] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [aiFinanceAdvice, setAiFinanceAdvice] = useState("");
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);

  const lang = getLanguage();

  const generateContent = async (type: string, input: any) => {
    const ai = getGemini();
    if (!ai) return;
    setIsGenerating(true);
    setGeneratedContent("");
    try {
      let prompt = "";
      if (type === 'posts') {
        prompt = `Genera un post para ${input.platform} con el objetivo de ${input.goal} sobre el tema: ${input.topic}. 
        Incluye el post, 3 hashtags y una sugerencia de imagen. Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`;
      } else if (type === 'proposal') {
        prompt = `Genera una propuesta de venta profesional de unas 300 palabras para ${input.prospect} que necesita ${input.needs} con un presupuesto de ${input.budget}. 
        Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`;
      } else if (type === 'email') {
        prompt = `Escribe un email de seguimiento para el cliente ${input.clientName} con el contexto: ${input.context}. 
        Tono: Profesional y cercano. Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`;
      } else if (type === 'faq') {
        prompt = `Genera respuestas profesionales para estas preguntas frecuentes: ${input.questions}. 
        Tono de marca: ${CONFIG.businessType}. Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setGeneratedContent(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PROACTIVE AI CHECKS ---
  useEffect(() => {
    if (!businessData.onboardingComplete) return;

    const checkProactivity = async () => {
      const ai = getGemini();
      if (!ai) return;

      const pendingTasks = tasks.filter(t => !t.completed).length;
      const urgentClients = clients.filter(c => c.lastContactDays > 7).length;

      if (urgentClients > 0) {
        setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: lang === 'es' 
            ? `Hola ${CONFIG.ownerName}, he notado que tienes ${urgentClients} clientes que necesitan seguimiento urgente. ¿Quieres que redacte los mensajes ahora?` 
            : `Hi ${CONFIG.ownerName}, I noticed you have ${urgentClients} clients needing urgent follow-up. Want me to draft the messages now?` 
        }]);
        setChatOpen(true);
      } else if (pendingTasks > 5) {
        setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: lang === 'es' 
            ? `Tienes muchas tareas acumuladas (${pendingTasks}). ¿Te ayudo a priorizar las 3 más importantes?` 
            : `You have many accumulated tasks (${pendingTasks}). Should I help you prioritize the 3 most important ones?` 
        }]);
        setChatOpen(true);
      }
    };

    const timer = setTimeout(checkProactivity, 5000);
    return () => clearTimeout(timer);
  }, [businessData.onboardingComplete]);

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'es' ? "Copiado al portapapeles" : "Copied to clipboard");
  };

  const calculateLTV = (client: Client) => {
    return client.value * (client.recurrence || 1);
  };

  const addClient = (name: string, value: number, effort: number, recurrence: number) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      status: 'Nuevo',
      lastContactDays: 0,
      value,
      history: 'Nuevo cliente añadido.',
      effort,
      recurrence
    };
    setClients([...clients, newClient]);
    setShowAddClient(false);
  };

  const addExpense = (category: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      category,
      amount
    };
    setExpenses([...expenses, newExpense]);
    setShowAddExpense(false);
  };

  const [aiPortfolioAdvice, setAiPortfolioAdvice] = useState("");
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);

  const generatePortfolioAdvice = async () => {
    const ai = getGemini();
    if (!ai) return;
    setIsPortfolioLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza esta lista de clientes y da un consejo estratégico breve (20 palabras) para mejorar la retención y el LTV.
        Clientes: ${JSON.stringify(clients)}.
        Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`,
      });
      setAiPortfolioAdvice(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      isAiSuggested: false
    };
    setTasks([...tasks, newTask]);
    setShowAddTask(false);
  };

  const generateFinanceAdvice = async () => {
    const ai = getGemini();
    if (!ai) return;
    setIsFinanceLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza estos gastos y da un consejo financiero breve (20 palabras) para optimizar la rentabilidad.
        Gastos: ${JSON.stringify(expenses)}. Ingresos: ${businessData.revenueLastMonth}.
        Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`,
      });
      setAiFinanceAdvice(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsFinanceLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.status.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // --- RENDER HELPERS ---

  useEffect(() => {
    localStorage.setItem('vortexia_business_data', JSON.stringify(businessData));
    localStorage.setItem('vortexia_clients', JSON.stringify(clients));
    localStorage.setItem('vortexia_expenses', JSON.stringify(expenses));
    localStorage.setItem('vortexia_tasks', JSON.stringify(tasks));
  }, [businessData, clients, expenses, tasks]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGemini = () => {
    const key = businessData.geminiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  };

  const generateAiSummary = async () => {
    const ai = getGemini();
    if (!ai) return;
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza estos datos de negocio y genera UNA SOLA FRASE corta y directa (máximo 15 palabras) sobre el estado actual.
        Ingresos: ${businessData.revenueLastMonth}, Meta: ${businessData.revenueGoal}, Clientes activos: ${clients.length}, Tareas: ${tasks.filter(t => !t.completed).length}.
        Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`,
      });
      setAiSummary(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (businessData.onboardingComplete) {
      generateAiSummary();
    }
  }, [businessData.onboardingComplete]);

  // --- HANDLERS ---
  const handleOnboardingNext = async () => {
    const steps = [
      "revenueLastMonth",
      "activeClients",
      "biggestProblem",
      "offer",
      "teamSize",
      "revenueGoal"
    ];

    const currentKey = steps[onboardingStep];
    const newData = { ...businessData, [currentKey]: onboardingInput };
    
    if (onboardingStep < steps.length - 1) {
      setBusinessData(newData);
      setOnboardingStep(onboardingStep + 1);
      setOnboardingInput("");
    } else {
      // Final step: Profile business with AI
      const ai = getGemini();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analiza estas respuestas de onboarding y genera un perfil de negocio breve (3 frases) que resuma el estado actual y el enfoque.
            Respuestas: ${JSON.stringify(newData)}. Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`,
          });
          // We could save this profile if we had a field for it
          console.log("Business Profile:", response.text);
        } catch (e) {
          console.error(e);
        }
      }
      newData.onboardingComplete = true;
      setBusinessData(newData);
    }
  };

  const handleSendMessage = async (text: string) => {
    const ai = getGemini();
    if (!ai) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text }];
    setChatMessages(newMessages);

    try {
      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: `Eres el asistente de negocios personal de ${CONFIG.ownerName}, dueño de ${CONFIG.businessName}, un negocio de ${CONFIG.businessType}. 
          Sus métricas actuales son: Ingresos ${businessData.revenueLastMonth}, Meta ${businessData.revenueGoal}, Clientes ${clients.length}.
          Responde siempre en ${lang === 'es' ? 'Español' : 'Inglés'}.
          Sé directo, práctico y habla como un socio de negocios que conoce bien la empresa. Nunca uses jerga financiera. 
          Máximo 3 párrafos por respuesta a menos que se pida más.`,
        }
      });

      const result = await chat.sendMessage({ message: text });
      setChatMessages([...newMessages, { role: 'model' as const, text: result.text || "" }]);
    } catch (e) {
      console.error(e);
    }
  };

  // --- RENDER HELPERS ---
  const onboardingQuestions = [
    lang === 'es' ? "¿Cuánto facturaste el mes pasado aproximadamente?" : "How much did you invoice last month approximately?",
    lang === 'es' ? "¿Cuántos clientes activos tienes ahora?" : "How many active clients do you have now?",
    lang === 'es' ? "¿Cuál es tu mayor problema hoy en tu negocio?" : "What is your biggest problem in your business today?",
    lang === 'es' ? "¿Qué vendes exactamente y a qué precio?" : "What exactly do you sell and at what price?",
    lang === 'es' ? "¿Tienes equipo o trabajas solo?" : "Do you have a team or do you work alone?",
    lang === 'es' ? "¿Cuál es tu meta de ingresos para este mes?" : "What is your income goal for this month?"
  ];

  if (!businessData.onboardingComplete) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        <Antigravity color={CONFIG.primaryColor} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 w-full max-w-lg text-center"
        >
          {CONFIG.logoUrl ? (
            <img src={CONFIG.logoUrl} alt="Logo" className="h-16 mx-auto mb-12" />
          ) : (
            <div className="text-4xl font-serif mb-12 tracking-tight">{CONFIG.businessName}</div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-12"
            >
              <div className="label-caps mb-4">Paso {onboardingStep + 1} de 6</div>
              <h2 className="text-3xl mb-8 leading-tight">{onboardingQuestions[onboardingStep]}</h2>
              
              <input 
                autoFocus
                type="text"
                value={onboardingInput}
                onChange={(e) => setOnboardingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onboardingInput && handleOnboardingNext()}
                className="w-full bg-transparent border-b border-sidebar/20 py-4 text-xl focus:outline-none focus:border-sidebar transition-colors mb-8"
                placeholder={lang === 'es' ? "Escribe tu respuesta..." : "Type your answer..."}
              />

              <button 
                onClick={() => onboardingInput && handleOnboardingNext()}
                disabled={!onboardingInput}
                className="w-full py-4 bg-sidebar text-white uppercase tracking-widest text-xs font-semibold hover:bg-sidebar/90 transition-colors disabled:opacity-50"
              >
                {onboardingStep === 5 ? (lang === 'es' ? "FINALIZAR" : "FINISH") : (lang === 'es' ? "SIGUIENTE" : "NEXT")}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <footer className="fixed bottom-8 text-[10px] text-sidebar/40 uppercase tracking-widest">
          Desarrollado por {CONFIG.vortexiaContact.name} · {CONFIG.vortexiaContact.phone} · {CONFIG.vortexiaContact.email}
        </footer>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const revenueNum = parseFloat(businessData.revenueLastMonth.replace(/[^0-9.]/g, '')) || 0;
  const goalNum = parseFloat(businessData.revenueGoal.replace(/[^0-9.]/g, '')) || 0;
  const progress = goalNum > 0 ? (revenueNum / goalNum) * 100 : 0;
  const netProfit = revenueNum - totalExpenses;

  return (
    <div className={`min-h-screen flex ${presentationMode ? 'presentation-mode' : ''}`}>
      <Antigravity color={CONFIG.primaryColor} />

      {/* Sidebar */}
      <aside className="sidebar w-64 bg-sidebar text-white fixed h-full z-20 flex flex-col">
        <div className="p-8">
          {CONFIG.logoUrl ? (
            <img src={CONFIG.logoUrl} alt="Logo" className="h-8" />
          ) : (
            <div className="text-2xl font-serif tracking-tight">{CONFIG.businessName}</div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`sidebar-item w-full ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            {lang === 'es' ? 'Dashboard' : 'Dashboard'}
          </button>
          <button onClick={() => setActiveTab('content')} className={`sidebar-item w-full ${activeTab === 'content' ? 'active' : ''}`}>
            <PenTool size={18} />
            {lang === 'es' ? 'Contenido' : 'Content'}
          </button>
        </nav>

        <div className="p-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono">
              {CONFIG.ownerName[0]}
            </div>
            <div className="text-xs uppercase tracking-widest opacity-60">{CONFIG.ownerName}</div>
          </div>
          <button 
            onClick={() => {
              if (confirm(lang === 'es' ? '¿Cerrar sesión?' : 'Logout?')) {
                setBusinessData({ ...businessData, onboardingComplete: false });
              }
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <LogOut size={12} />
            {lang === 'es' ? 'Salir' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content flex-1 ml-64 min-h-screen relative z-10 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <div className="label-caps mb-1">{currentTime.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div className="text-2xl font-serif">{currentTime.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 ai-status-pulse" />
              <div className="label-caps">IA ACTIVA</div>
            </div>
            
            <button 
              onClick={() => setPresentationMode(!presentationMode)}
              className="flex items-center gap-2 px-4 py-2 border border-sidebar/10 rounded-[4px] text-[10px] uppercase tracking-widest hover:bg-sidebar/5 transition-colors"
            >
              {presentationMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {presentationMode ? (lang === 'es' ? 'Salir' : 'Exit') : (lang === 'es' ? 'Modo Presentación' : 'Presentation Mode')}
            </button>
          </div>
        </header>

        {/* Smart Alert Bar */}
        <AnimatePresence>
          {progress < 50 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-amber-50 border border-amber-200 p-3 flex items-center gap-3 text-amber-800 text-xs uppercase tracking-widest">
                <AlertTriangle size={14} />
                <span>{lang === 'es' ? 'Alerta: Vas por debajo del 50% de tu meta mensual. Revisa tus cierres.' : 'Alert: You are below 50% of your monthly goal. Review your closings.'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-12"
            >
              {/* Section A: Pulse */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card p-8 kpi-card">
                    <div className="label-caps mb-4">{lang === 'es' ? 'Ingresos vs Meta' : 'Revenue vs Goal'}</div>
                    <div className="text-2xl font-mono mb-4 kpi-value">{formatCurrency(revenueNum)}</div>
                    <div className="w-full bg-sidebar/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-sidebar h-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">{progress.toFixed(0)}% DEL OBJETIVO</div>
                  </div>

                  <div className="glass-card p-8 kpi-card">
                    <div className="label-caps mb-4">{lang === 'es' ? 'Ganancia Neta' : 'Net Profit'}</div>
                    <div className="text-2xl font-mono kpi-value">{formatCurrency(netProfit)}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-widest text-green-600">ESTIMADO REAL</div>
                  </div>

                  <div className="glass-card p-8 kpi-card">
                    <div className="label-caps mb-4">{lang === 'es' ? 'Tareas Hoy' : 'Tasks Today'}</div>
                    <div className="text-2xl font-mono kpi-value">{tasks.filter(t => !t.completed).length}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">{tasks.filter(t => t.isAiSuggested).length} SUGERIDAS POR IA</div>
                  </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-sidebar">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sidebar/5 flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="label-caps mb-1">{lang === 'es' ? 'PULSO DEL NEGOCIO' : 'BUSINESS PULSE'}</div>
                      <div className="text-lg italic font-serif">
                        {isAiLoading ? "..." : aiSummary || (lang === 'es' ? "Analizando datos..." : "Analyzing data...")}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section B: Tasks */}
              <div className="no-presentation">
                <section>
                  <h3 className="text-2xl mb-6">{lang === 'es' ? 'Tareas Prioritarias' : 'Priority Tasks'}</h3>
                  <div className="glass-card p-8 space-y-4">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-4 p-4 border border-border-soft/50 hover:border-sidebar/20 transition-colors">
                        <button 
                          onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                          className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${task.completed ? 'bg-sidebar border-sidebar text-white' : 'border-sidebar/20'}`}
                        >
                          {task.completed && <Check size={12} />}
                        </button>
                        <div className="flex-1">
                          <div className={`text-sm ${task.completed ? 'line-through opacity-40' : ''}`}>{task.text}</div>
                          {task.isAiSuggested && <div className="text-[9px] uppercase tracking-widest text-sidebar/40 mt-1">SUGERIDO POR IA</div>}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowAddTask(true)} className="w-full py-3 border border-dashed border-sidebar/20 text-[10px] uppercase tracking-widest hover:bg-sidebar/5 transition-colors">
                      + {lang === 'es' ? 'Añadir Tarea' : 'Add Task'}
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl">{lang === 'es' ? 'Generador de Contenido IA' : 'AI Content Generator'}</h2>
                {activeContentGenerator && (
                  <button onClick={() => { setActiveContentGenerator(null); setGeneratedContent(""); }} className="label-caps hover:opacity-60">
                    {lang === 'es' ? 'VOLVER' : 'BACK'}
                  </button>
                )}
              </div>
              
              {!activeContentGenerator ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveContentGenerator('posts')} className="glass-card p-8 hover:border-sidebar transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-sidebar/5 flex items-center justify-center mb-6 group-hover:bg-sidebar group-hover:text-white transition-colors">
                      <LayoutDashboard size={24} />
                    </div>
                    <h4 className="text-xl mb-2">{lang === 'es' ? 'Posts para Redes' : 'Social Media Posts'}</h4>
                    <p className="text-sm opacity-60 mb-6">{lang === 'es' ? 'Crea contenido para Instagram o LinkedIn en segundos.' : 'Create content for Instagram or LinkedIn in seconds.'}</p>
                    <div className="label-caps flex items-center gap-2">EMPEZAR <ChevronRight size={12} /></div>
                  </div>

                  <div onClick={() => setActiveContentGenerator('proposal')} className="glass-card p-8 hover:border-sidebar transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-sidebar/5 flex items-center justify-center mb-6 group-hover:bg-sidebar group-hover:text-white transition-colors">
                      <Briefcase size={24} />
                    </div>
                    <h4 className="text-xl mb-2">{lang === 'es' ? 'Propuesta de Venta' : 'Sales Proposal'}</h4>
                    <p className="text-sm opacity-60 mb-6">{lang === 'es' ? 'Genera propuestas profesionales personalizadas.' : 'Generate customized professional proposals.'}</p>
                    <div className="label-caps flex items-center gap-2">EMPEZAR <ChevronRight size={12} /></div>
                  </div>

                  <div onClick={() => setActiveContentGenerator('email')} className="glass-card p-8 hover:border-sidebar transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-sidebar/5 flex items-center justify-center mb-6 group-hover:bg-sidebar group-hover:text-white transition-colors">
                      <Send size={24} />
                    </div>
                    <h4 className="text-xl mb-2">{lang === 'es' ? 'Email de Seguimiento' : 'Follow-up Email'}</h4>
                    <p className="text-sm opacity-60 mb-6">{lang === 'es' ? 'Reactiva clientes o cierra ventas pendientes.' : 'Reactivate clients or close pending sales.'}</p>
                    <div className="label-caps flex items-center gap-2">EMPEZAR <ChevronRight size={12} /></div>
                  </div>

                  <div onClick={() => setActiveContentGenerator('faq')} className="glass-card p-8 hover:border-sidebar transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-sidebar/5 flex items-center justify-center mb-6 group-hover:bg-sidebar group-hover:text-white transition-colors">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-xl mb-2">{lang === 'es' ? 'Respuestas FAQ' : 'FAQ Responses'}</h4>
                    <p className="text-sm opacity-60 mb-6">{lang === 'es' ? 'Respuestas rápidas y profesionales para tus clientes.' : 'Quick and professional answers for your clients.'}</p>
                    <div className="label-caps flex items-center gap-2">EMPEZAR <ChevronRight size={12} /></div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12">
                  {activeContentGenerator === 'posts' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="label-caps block mb-2">Plataforma</label>
                          <select id="post-platform" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none">
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                          </select>
                        </div>
                        <div>
                          <label className="label-caps block mb-2">Objetivo</label>
                          <select id="post-goal" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none">
                            <option value="Vender">Vender</option>
                            <option value="Educar">Educar</option>
                            <option value="Conectar">Conectar</option>
                            <option value="Inspirar">Inspirar</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label-caps block mb-2">Tema</label>
                        <input id="post-topic" type="text" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none" placeholder="Ej: Importancia del SEO" />
                      </div>
                      <button 
                        onClick={() => generateContent('posts', { 
                          platform: (document.getElementById('post-platform') as HTMLSelectElement).value,
                          goal: (document.getElementById('post-goal') as HTMLSelectElement).value,
                          topic: (document.getElementById('post-topic') as HTMLInputElement).value
                        })}
                        className="w-full py-4 bg-sidebar text-white label-caps hover:bg-sidebar/90"
                      >
                        {isGenerating ? 'GENERANDO...' : 'GENERAR POST'}
                      </button>
                    </div>
                  )}

                  {activeContentGenerator === 'proposal' && (
                    <div className="space-y-6">
                      <div>
                        <label className="label-caps block mb-2">Prospecto</label>
                        <input id="prop-prospect" type="text" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none" placeholder="Nombre del cliente" />
                      </div>
                      <div>
                        <label className="label-caps block mb-2">Necesidad</label>
                        <input id="prop-needs" type="text" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none" placeholder="Qué necesita" />
                      </div>
                      <div>
                        <label className="label-caps block mb-2">Presupuesto</label>
                        <input id="prop-budget" type="text" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none" placeholder="Presupuesto aprox" />
                      </div>
                      <button 
                        onClick={() => generateContent('proposal', { 
                          prospect: (document.getElementById('prop-prospect') as HTMLInputElement).value,
                          needs: (document.getElementById('prop-needs') as HTMLInputElement).value,
                          budget: (document.getElementById('prop-budget') as HTMLInputElement).value
                        })}
                        className="w-full py-4 bg-sidebar text-white label-caps hover:bg-sidebar/90"
                      >
                        {isGenerating ? 'GENERANDO...' : 'GENERAR PROPUESTA'}
                      </button>
                    </div>
                  )}

                  {activeContentGenerator === 'email' && (
                    <div className="space-y-6">
                      <div>
                        <label className="label-caps block mb-2">Cliente</label>
                        <select id="email-client" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none">
                          {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-caps block mb-2">Contexto</label>
                        <select id="email-context" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none">
                          <option value="Post-reunión">Post-reunión</option>
                          <option value="Sin respuesta">Sin respuesta</option>
                          <option value="Cobro">Cobro</option>
                          <option value="Reactivar">Reactivar</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => generateContent('email', { 
                          clientName: (document.getElementById('email-client') as HTMLSelectElement).value,
                          context: (document.getElementById('email-context') as HTMLSelectElement).value
                        })}
                        className="w-full py-4 bg-sidebar text-white label-caps hover:bg-sidebar/90"
                      >
                        {isGenerating ? 'GENERANDO...' : 'GENERAR EMAIL'}
                      </button>
                    </div>
                  )}

                  {activeContentGenerator === 'faq' && (
                    <div className="space-y-6">
                      <div>
                        <label className="label-caps block mb-2">Preguntas (una por línea)</label>
                        <textarea id="faq-questions" className="w-full bg-transparent border border-sidebar/20 p-4 h-32 focus:outline-none" placeholder="Escribe las preguntas aquí..."></textarea>
                      </div>
                      <button 
                        onClick={() => generateContent('faq', { 
                          questions: (document.getElementById('faq-questions') as HTMLTextAreaElement).value
                        })}
                        className="w-full py-4 bg-sidebar text-white label-caps hover:bg-sidebar/90"
                      >
                        {isGenerating ? 'GENERANDO...' : 'GENERAR RESPUESTAS'}
                      </button>
                    </div>
                  )}

                  {generatedContent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-8 bg-bone border border-border-soft relative"
                    >
                      <button 
                        onClick={() => copyToClipboard(generatedContent)}
                        className="absolute top-4 right-4 p-2 hover:bg-sidebar/5 rounded transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{generatedContent}</div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-border-soft text-[10px] text-sidebar/40 uppercase tracking-widest flex justify-between items-center">
          <div>Desarrollado por {CONFIG.vortexiaContact.name} · {CONFIG.vortexiaContact.phone} · {CONFIG.vortexiaContact.email}</div>
          <div>© {new Date().getFullYear()} {CONFIG.businessName}</div>
        </footer>
      </main>

      {/* Floating Proactive AI */}
      <div className="fixed bottom-8 right-8 z-50 no-presentation">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-80 h-[450px] glass-card shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-sidebar text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 ai-status-pulse" />
                  <div className="label-caps text-white">VORTEXIA AI</div>
                </div>
                <button onClick={() => setChatOpen(false)} className="opacity-60 hover:opacity-100"><X size={16} /></button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bone/50">
                {chatMessages.length === 0 && (
                  <div className="text-sm italic opacity-60 text-center mt-12">
                    {lang === 'es' ? `Hola ${CONFIG.ownerName}, ¿en qué puedo ayudarte hoy con ${CONFIG.businessName}?` : `Hi ${CONFIG.ownerName}, how can I help you today with ${CONFIG.businessName}?`}
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 text-sm ${msg.role === 'user' ? 'bg-sidebar text-white rounded-l-lg rounded-tr-lg' : 'bg-white border border-border-soft rounded-r-lg rounded-tl-lg'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border-soft bg-white">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={lang === 'es' ? "Pregunta algo..." : "Ask something..."}
                    className="flex-1 text-sm bg-transparent focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleSendMessage(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <button className="text-sidebar opacity-60 hover:opacity-100 transition-opacity">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: CONFIG.primaryColor }}
        >
          <MessageSquare size={24} />
        </button>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {(showAddTask) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sidebar/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-12 w-full max-w-md relative"
            >
              <button onClick={() => { setShowAddTask(false); }} className="absolute top-6 right-6 opacity-40 hover:opacity-100"><X size={20} /></button>
              
              {showAddTask && (
                <div>
                  <h3 className="text-3xl mb-8">{lang === 'es' ? 'Nueva Tarea' : 'New Task'}</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="label-caps block mb-2">Descripción</label>
                      <input id="new-task-text" type="text" className="w-full bg-transparent border-b border-sidebar/20 py-2 focus:outline-none" />
                    </div>
                    <button 
                      onClick={() => addTask((document.getElementById('new-task-text') as HTMLInputElement).value)}
                      className="w-full py-4 bg-sidebar text-white label-caps"
                    >
                      {lang === 'es' ? 'GUARDAR TAREA' : 'SAVE TASK'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
