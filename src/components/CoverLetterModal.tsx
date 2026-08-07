import React, { useState } from 'react';
import { JobOffer, UserCVProfile } from '../types';
import { X, Sparkles, Send, Copy, Check, ExternalLink, Building2, User, Zap, Mail, ShieldAlert } from 'lucide-react';

interface CoverLetterModalProps {
  job: JobOffer;
  profile: UserCVProfile;
  coverLetterText: string;
  setCoverLetterText: (val: string) => void;
  onClose: () => void;
  onConfirmApply: (coverLetter: string, isManual?: boolean) => void;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  job,
  profile,
  coverLetterText,
  setCoverLetterText,
  onClose,
  onConfirmApply,
  isGenerating,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);

  const isAutomated = Boolean(job.contactEmail || job.portal === 'direct');

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualApplyAndOpen = () => {
    handleCopy();
    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
    onConfirmApply(coverLetterText, true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Redactado con IA Gemini</span>
            </span>

            {isAutomated ? (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Postulación Automática (1-Clic)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ExternalLink className="w-3 h-3 text-amber-400" />
                <span>Postulación Manual en Portal</span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white pt-1">
            {isAutomated ? 'Postulación Automática y Carta de Presentación' : 'Asistente para Postulación Manual en Portal'}
          </h3>
          <p className="text-xs text-slate-400">
            Puesto: <strong className="text-sky-300">{job.title}</strong> en <strong className="text-sky-300">{job.company}</strong>.
          </p>
        </div>

        {/* Mode explanation alert */}
        {isAutomated ? (
          <div className="bg-emerald-950/30 border border-emerald-800/50 p-3.5 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-emerald-300">Modo Directo / Automático disponible:</strong>
              Esta oferta incluye un contacto directo ({job.contactEmail || 'Vía Formulario'}). La plataforma enviará automáticamente tu CV y esta carta personalizada.
            </div>
          </div>
        ) : (
          <div className="bg-amber-950/30 border border-amber-800/50 p-3.5 rounded-xl text-xs text-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-300">Postulación Manual Requerida:</strong>
              Este portal ({job.portal.toUpperCase()}) requiere inicio de sesión con tus credenciales. La IA te generó la carta perfecta: haz clic en "Copiar Carta y Abrir Portal" para completar la postulación en 30 segundos.
            </div>
          </div>
        )}

        {/* Info pill */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>Empresa: <strong>{job.company}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>Candidato: <strong>{profile.fullName || 'Tu Perfil'}</strong></span>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          {isGenerating ? (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 min-h-[220px]">
              <Sparkles className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-sm font-medium text-slate-200">Gemini IA redactando tu carta personalizada...</p>
              <p className="text-xs text-slate-400">Adaptando experiencia para {job.company}</p>
            </div>
          ) : (
            <textarea
              rows={9}
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans leading-relaxed shadow-inner"
              placeholder="Carta de presentación..."
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Regenerar con IA</span>
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-xl transition"
            >
              Cancelar
            </button>

            {isAutomated ? (
              <button
                onClick={() => onConfirmApply(coverLetterText, false)}
                disabled={isGenerating || !coverLetterText.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Enviar Postulación Automática</span>
              </button>
            ) : (
              <button
                onClick={handleManualApplyAndOpen}
                disabled={isGenerating || !coverLetterText.trim()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-sky-500/25 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <span>Copiar Carta y Abrir Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

