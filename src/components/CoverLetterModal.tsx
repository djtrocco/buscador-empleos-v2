import React, { useState } from 'react';
import { JobOffer, UserCVProfile } from '../types';
import { X, Sparkles, Send, Copy, Check, ExternalLink, Building2, User, Zap, Mail, ShieldAlert, Paperclip, AtSign } from 'lucide-react';

interface CoverLetterModalProps {
  job: JobOffer;
  profile: UserCVProfile;
  coverLetterText: string;
  setCoverLetterText: (val: string) => void;
  onClose: () => void;
  onConfirmApply: (coverLetter: string, recipientEmail: string, isManual?: boolean) => void;
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
  const defaultRecipient = job.contactEmail || `busquedas@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}.com.ar`;
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipient);

  const senderEmail = profile.email || 'djtrocco@gmail.com';
  const cvFileName = profile.cvFileName || `CV_${(profile.fullName || 'Candidato').replace(/\s+/g, '_')}.txt`;

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

            <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>Envío directo por Email (Gmail API)</span>
            </span>
          </div>

          <h3 className="text-xl font-bold text-white pt-1">
            Postulación y Envío de CV por Correo Electrónico
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <p>
              Puesto: <strong className="text-sky-300">{job.title}</strong> en <strong className="text-sky-300">{job.company}</strong>.
            </p>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-mono text-[11px] underline bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/80"
                title="Ver oferta de trabajo original"
              >
                <ExternalLink className="w-3 h-3 text-sky-400" />
                <span>Ver Publicación Web ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Email Header Info Section */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5 text-emerald-400" /> Remitente (Tu Gmail conectado)
              </label>
              <div className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg text-emerald-300 font-mono text-xs flex items-center justify-between">
                <span>{senderEmail}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Conectado</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Destinatario (Email de la Búsqueda)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-lg text-sky-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                placeholder="email@empresa.com.ar"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Paperclip className="w-3.5 h-3.5 text-amber-400" />
              <span>CV Adjunto:</span>
              <strong className="text-amber-200 font-mono">{cvFileName}</strong>
            </div>
            <span className="text-slate-400">
              {profile.cvText ? `(${profile.cvText.length} caracteres de texto)` : 'Sin CV cargado'}
            </span>
          </div>
        </div>

        {/* Mode explanation alert */}
        <div className="bg-emerald-950/30 border border-emerald-800/50 p-3.5 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
          <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-emerald-300">Envío directo y guardado en carpeta de Enviados:</strong>
            Al hacer clic en "Enviar Postulación por Email", se enviará el correo a <strong>{recipientEmail}</strong> desde tu cuenta <strong>{senderEmail}</strong> con tu CV adjunto. Quedará guardado automáticamente en tu carpeta de <strong>Enviados</strong> de Gmail y se activará el seguimiento de lectura.
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
              rows={8}
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

            <button
              onClick={() => onConfirmApply(coverLetterText, recipientEmail, false)}
              disabled={isGenerating || !coverLetterText.trim() || !recipientEmail.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Enviar Postulación por Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

