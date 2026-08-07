import React, { useState } from 'react';
import { DEPLOYMENT_STEPS } from '../data/deploymentGuide';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Download,
  FolderOpen,
  Play,
  Key,
  Globe,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const DeploymentGuideModal: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeStep = DEPLOYMENT_STEPS.find((s) => s.id === activeStepId) || DEPLOYMENT_STEPS[0];

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStepIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Download className="w-4 h-4" />;
      case 2:
        return <FolderOpen className="w-4 h-4" />;
      case 3:
        return <Play className="w-4 h-4" />;
      case 4:
        return <Key className="w-4 h-4" />;
      case 5:
        return <Globe className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-950">
          <BookOpen className="w-3.5 h-3.5" /> Guía Didáctica 100% para Principiantes
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Cómo Instalar, Usar y Subir tu Web a Internet (Paso a Paso Sin Saber Código)
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
          ¡No te preocupes si nunca has programado! En esta guía te explicamos en español sencillo cómo instalar los programas gratuitos necesarios, encender esta aplicación en tu propia computadora y subirla a internet gratis en menos de 10 minutos.
        </p>
      </div>

      {/* Step Navigator Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        {DEPLOYMENT_STEPS.map((step) => {
          const isActive = step.id === activeStepId;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`p-3 rounded-xl flex flex-col items-center text-center space-y-1.5 transition ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-700/50'}`}>
                {getStepIcon(step.id)}
              </div>
              <span className="text-xs font-medium line-clamp-1">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">Paso {activeStep.id} de 5</span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{activeStep.title}</h3>
          <p className="text-sm text-slate-300 mt-1">{activeStep.shortDesc}</p>
        </div>

        {/* Concept Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">¿Qué es esto?</span>
            <p className="text-xs text-slate-300 leading-relaxed">{activeStep.detailedContent.whatIsIt}</p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">¿Para qué sirve?</span>
            <p className="text-xs text-slate-300 leading-relaxed">{activeStep.detailedContent.whyNeeded}</p>
          </div>
        </div>

        {/* Instruction List */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Pasos sencillos a seguir:
          </h4>
          <div className="space-y-2.5">
            {activeStep.detailedContent.steps.map((st, idx) => (
              <div key={idx} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Snippets if present */}
        {activeStep.detailedContent.codeSnippets && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-white">Comandos para copiar y pegar en la consola:</h4>
            {activeStep.detailedContent.codeSnippets.map((snippet, sIdx) => (
              <div key={sIdx} className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{snippet.title}</span>
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                  <span>{snippet.code}</span>
                  <button
                    onClick={() => handleCopyCode(snippet.code, sIdx)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs transition"
                  >
                    {copiedIndex === sIdx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === sIdx ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tips */}
        {activeStep.detailedContent.proTips && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 space-y-1">
            {activeStep.detailedContent.proTips.map((tip, tIdx) => (
              <p key={tIdx} className="leading-relaxed">{tip}</p>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveStepId(Math.max(1, activeStepId - 1))}
            disabled={activeStepId === 1}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-xl transition disabled:opacity-40"
          >
            ← Paso Anterior
          </button>

          <span className="text-xs text-slate-500">Paso {activeStepId} de 5</span>

          <button
            onClick={() => setActiveStepId(Math.min(5, activeStepId + 1))}
            disabled={activeStepId === 5}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>Siguiente Paso</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preguntas Frecuentes para Principiantes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" /> Preguntas Frecuentes (Sin Código)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ¿Por qué LinkedIn no se postula 100% automáticamente?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              LinkedIn tiene sistemas muy estrictos anti-robots. Si un programa se postula automáticamente por ti en LinkedIn, pueden bloquear o suspender tu cuenta personal. Por eso esta aplicación te busca los trabajos de LinkedIn y te da el botón directo para ir a la publicación en 1 clic de forma segura.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ¿Tengo que pagar por la Inteligencia Artificial Gemini?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              ¡No! Google te regala un plan gratuito en AI Studio con miles de consultas mensuales. Es completamente suficiente para buscar trabajo, redactar tus cartas y analizar tu CV todos los días sin pagar nada.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              ¿Cuesta dinero subir la web a Vercel?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Tampoco. Vercel ofrece un plan gratuito para proyectos personales. Te dará un enlace permanente accesible desde tu teléfono celular o cualquier computadora.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              ¿Puedo modificar mis datos en cualquier momento?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Sí, en la pestaña "Mi Perfil y CV" puedes actualizar tu experiencia, teléfono o expectativas salariales las veces que quieras. La IA se adaptará al instante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
