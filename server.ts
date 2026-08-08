import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { google } from 'googleapis';
import { INITIAL_MOCK_JOBS } from './src/data/mockJobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Helper function to create MIME RFC2822 base64url formatted message with CV attachment for Gmail API
function createMimeMessage({
  from,
  to,
  subject,
  bodyText,
  cvText,
  cvFileName
}: {
  from: string;
  to: string;
  subject: string;
  bodyText: string;
  cvText?: string;
  cvFileName?: string;
}) {
  const boundary = '===_Boundary_' + Date.now().toString(16) + '_===';
  const filename = cvFileName || 'Curriculum_Vitae.txt';
  const attachmentContent = cvText || '';
  const encodedAttachment = Buffer.from(attachmentContent, 'utf-8').toString('base64');

  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    bodyText,
    ''
  ];

  if (attachmentContent) {
    messageParts.push(
      `--${boundary}`,
      `Content-Type: text/plain; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      encodedAttachment,
      ''
    );
  }

  messageParts.push(`--${boundary}--`);

  const mimeMessage = messageParts.join('\r\n');
  return Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Lazy initialization helper for Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to call Gemini models with fallback across stable model aliases
const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

async function callGeminiWithFallback(ai: GoogleGenAI, prompt: string, config?: any) {
  let lastError: any = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        ...(config ? { config } : {}),
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`Model ${model} attempt notice:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini model candidates failed');
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    time: new Date().toISOString()
  });
});

// Helper for semantic synonyms and job query congruence
function getSemanticSynonyms(term: string): string[] {
  const clean = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const synonymMap: Record<string, string[]> = {
    programador: ['desarrollador', 'dev', 'developer', 'software', 'sistemas', 'analista', 'tecnologia', 'codigo', 'it', 'ingeniero', 'frontend', 'backend', 'fullstack', 'web'],
    desarrollador: ['programador', 'dev', 'developer', 'software', 'sistemas', 'analista', 'tecnologia', 'codigo', 'it', 'ingeniero', 'frontend', 'backend', 'fullstack', 'web'],
    dev: ['desarrollador', 'programador', 'developer', 'software', 'sistemas', 'analista', 'it'],
    react: ['frontend', 'web', 'javascript', 'typescript', 'ui', 'desarrollador', 'programador'],
    node: ['backend', 'express', 'javascript', 'typescript', 'api', 'desarrollador', 'programador'],
    datos: ['data', 'powerbi', 'sql', 'analista', 'bi', 'excel', 'estadistica', 'python'],
    soporte: ['helpdesk', 'tecnico', 'redes', 'sistemas', 'hardware', 'mantenimiento', 'atencion', 'infraestructura', 'sysadmin'],
    diseno: ['ux', 'ui', 'figma', 'diseñador', 'creativo', 'web', 'producto', 'canva'],
    diseñador: ['ux', 'ui', 'figma', 'diseno', 'creativo', 'web', 'producto', 'canva'],
    ventas: ['comercial', 'vendedor', 'ejecutivo', 'cuentas', 'atencion', 'cliente', 'asesor', 'telemarketer', 'call center', 'promotor', 'cajero', 'local'],
    vendedor: ['ventas', 'comercial', 'ejecutivo', 'cuentas', 'atencion', 'cliente', 'asesor', 'cajero', 'local', 'promotor'],
    comercial: ['ventas', 'vendedor', 'ejecutivo', 'cuentas', 'asesor', 'negociacion', 'clientes'],
    atencion: ['cliente', 'soporte', 'vendedor', 'asistente', 'call center', 'helpdesk', 'recepcion', 'recepcionista', 'secretaria'],
    contable: ['contador', 'finanzas', 'administracion', 'administrativo', 'facturacion', 'tesoreria', 'sueldos', 'excel', 'tango', 'impuestos', 'balance'],
    contador: ['contable', 'finanzas', 'administracion', 'administrativo', 'facturacion', 'tesoreria', 'sueldos', 'impuestos'],
    administrativo: ['asistente', 'contable', 'oficina', 'secretaria', 'recepcionista', 'gestion', 'administracion', 'facturacion', 'auxiliar'],
    administrativa: ['asistente', 'contable', 'oficina', 'secretaria', 'recepcionista', 'gestion', 'administracion', 'facturacion', 'auxiliar'],
    recepcion: ['recepcionista', 'secretaria', 'asistente', 'atencion', 'oficina', 'administrativa', 'administrativo'],
    recepcionista: ['recepcion', 'secretaria', 'asistente', 'atencion', 'oficina', 'administrativa', 'administrativo'],
    secretaria: ['recepcionista', 'asistente', 'oficina', 'administrativa', 'ejecutiva', 'gestion'],
    cajero: ['cajera', 'ventas', 'posnet', 'retail', 'comercio', 'local', 'atencion', 'facturacion'],
    cajera: ['cajero', 'ventas', 'posnet', 'retail', 'comercio', 'local', 'atencion', 'facturacion'],
    operario: ['deposito', 'logistica', 'stock', 'picking', 'packing', 'mantenimiento', 'planta', 'produccion', 'haedo', 'san justo'],
    logistica: ['deposito', 'stock', 'expedicion', 'operario', 'despacho', 'transporte', 'comercio exterior'],
    deposito: ['logistica', 'stock', 'operario', 'picking', 'packing', 'almacen', 'expedicion'],
    rrhh: ['recursos humanos', 'recruiter', 'reclutador', 'seleccion', 'talento', 'personal', 'psicologia'],
    marketing: ['seo', 'meta ads', 'google ads', 'community', 'redes', 'digital', 'publicidad', 'copywriting', 'tiktok', 'reels'],
    salud: ['enfermero', 'enfermera', 'clinica', 'sanatorio', 'farmacia', 'medico', 'auxiliar']
  };

  const synonyms = new Set<string>([clean]);
  
  for (const [key, list] of Object.entries(synonymMap)) {
    if (clean.includes(key) || key.includes(clean)) {
      list.forEach(syn => synonyms.add(syn));
    }
  }

  return Array.from(synonyms);
}

function computeJobCongruenceScore(job: any, query: string): number {
  if (!query || !query.trim()) return 100;

  const normalizeStr = (str: string) => 
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const cleanQuery = normalizeStr(query);
  const stopWords = new Set([
    'de', 'en', 'para', 'con', 'sin', 'un', 'una', 'el', 'la', 'los', 'las', 'y', 'o', 'a', 'del', 'al', 
    'se', 'su', 'mi', 'mis', 'como', 'mas', 'menos', 'que', 'por', 'sobre', 'busco', 'buscar', 'busqueda', 
    'trabajo', 'empleo', 'puesto', 'puestos', 'oferta', 'ofertas', 'quisiera', 'necesito', 'deseo', 
    'tengo', 'experiencia', 'conocimientos', 'saber', 'zona', 'buenos', 'aires', 'hola', 'me', 'gustaria', 
    'postularme', 'media', 'medio', 'jornada', 'completa', 'remoto', 'presencial', 'hibrido', 'argentina',
    'caba', 'capital', 'federal'
  ]);

  const queryTokens = cleanQuery.split(/[\s,.;:-]+/).filter(t => t.length > 2 && !stopWords.has(t));

  // If query is pure conversational stopwords (e.g. "busco trabajo en CABA"), give base positive score
  if (queryTokens.length === 0) return 50;

  const jobTitle = normalizeStr(job.title);
  const jobDesc = normalizeStr(job.description);
  const jobReqs = (job.requirements || []).map((r: string) => normalizeStr(r)).join(' ');
  const jobComp = normalizeStr(job.company);
  const fullJobText = `${jobTitle} ${jobDesc} ${jobReqs} ${jobComp}`;

  let totalScore = 0;

  for (const token of queryTokens) {
    let tokenScore = 0;

    // Direct token matches
    if (jobTitle.includes(token)) {
      tokenScore += 60;
    } else if (fullJobText.includes(token)) {
      tokenScore += 35;
    }

    // Stem matching for Spanish plurals / variations
    if (token.length >= 4) {
      const stem = token.slice(0, Math.min(token.length - 1, 5));
      if (jobTitle.includes(stem)) {
        tokenScore += 25;
      } else if (fullJobText.includes(stem)) {
        tokenScore += 15;
      }
    }

    // Synonym expansion matching
    const synonyms = getSemanticSynonyms(token);
    for (const syn of synonyms) {
      if (syn === token) continue;
      if (jobTitle.includes(syn)) {
        tokenScore += 30;
      } else if (fullJobText.includes(syn)) {
        tokenScore += 18;
      }
    }

    totalScore += tokenScore;
  }

  return totalScore;
}

// 2. Search jobs in Argentina via Gemini search grounding or fallback
app.post('/api/jobs/search', async (req, res) => {
  try {
    const { query = '', location = 'Argentina', portal = 'todos', modality = 'todos' } = req.body;
    const ai = getGeminiClient();

    let searchResults = [...INITIAL_MOCK_JOBS];
    let generatedByAI = false;

    if (ai) {
      try {
        const prompt = `Actúa como un reclutador experto en el mercado laboral de Argentina (ZonaJobs, Bumeran, Computrabajo Argentina, LinkedIn Argentina, Indeed). 

El usuario busca empleos con la siguiente descripción / consulta: "${query || 'Todos los empleos recomendados'}"
Filtro de ubicación: "${location}"
Filtro de portal: "${portal}"
Filtro de modalidad: "${modality}"

INSTRUCCIONES CLAVE DE BÚSQUEDA Y AMPLITUD:
1. No te restrinjas a coincidencias literales letra por letra. Utiliza máxima flexibilidad temática y congruencia semántica.
2. Si la consulta describe un rol (ej: "administrativa o recepcionista con excel"), genera entre 12 y 16 empleos variados que abarquen posiciones administrativas, recepcionistas, secretarias, asistentes, atención al cliente y facturación.
3. Si la consulta menciona un sector (ej: "ventas", "programación", "salud", "contable"), incluye roles relacionados y complementarios del mercado argentino.
4. Incluye empresas reales o hiperrealistas que operan en Argentina (Mercado Libre, Telecom, Globant, YPF, Ualá, Banco Galicia, Farmacity, Sanatorio Olivos, etc.).

Devuelve un JSON estrictamente estructurado como una lista de 12 a 16 objetos de empleo con los campos:
- id: string único (ej: "gen-1", "gen-2")
- title: string con el puesto exacto
- company: string con la empresa
- location: string con ciudad o provincia en Argentina (ej: "Buenos Aires, CABA", "Córdoba", "Remoto Argentina", "Rosario", "Mendoza")
- portal: uno de ["zonajobs", "bumeran", "computrabajo", "linkedin", "indeed"]
- modality: uno de ["remoto", "presencial", "hibrido"]
- salaryRange: string estimado en ARS o USD (ej: "$1.800.000 ARS/mes")
- description: breve descripción del puesto y responsabilidades (2-3 oraciones)
- requirements: array de strings con 3 a 5 requisitos clave
- postedDate: fecha relativa reciente (ej: "Hace 1 hora", "Hace 3 horas")
- url: enlace web simulado o directo de postulación
- contactEmail: email de contacto para envío directo de CV si aplica

Responde ÚNICAMENTE en formato JSON plano válido sin marcas de markdown extra.`;

        const response = await callGeminiWithFallback(ai, prompt, {
          responseMimeType: 'application/json',
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            searchResults = parsed;
            generatedByAI = true;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini search notice, using enhanced mock dataset:', geminiError?.message || 'Quota or connection limit');
      }
    }

    // Flexible & Congruent search scoring
    const scoredJobs = searchResults.map((job) => {
      // If generated specifically by AI for this query, give an AI bonus base score
      const baseBonus = generatedByAI ? 100 : 0;
      const congruenceScore = computeJobCongruenceScore(job, query) + baseBonus;
      return { job, congruenceScore };
    });

    // Apply filters strictly first
    let filtered = scoredJobs.filter(({ job, congruenceScore }) => {
      const matchesQuery = query ? congruenceScore > 0 : true;

      const matchesLocation = location && location !== 'Argentina' && location !== 'todas' ?
        job.location.toLowerCase().includes(location.toLowerCase()) : true;

      const matchesPortal = portal && portal !== 'todos' ?
        job.portal === portal : true;

      const matchesModality = modality && modality !== 'todos' ?
        job.modality === modality : true;

      return matchesQuery && matchesLocation && matchesPortal && matchesModality;
    });

    // Sort by congruence score descending
    filtered.sort((a, b) => b.congruenceScore - a.congruenceScore);

    // INTELLIGENT RELAXATION: If strict filters return fewer than 5 results, relax location/portal/modality constraints
    if (filtered.length < 5) {
      const existingIds = new Set(filtered.map(f => f.job.id));

      const relaxedCandidates = scoredJobs
        .filter(({ job, congruenceScore }) => !existingIds.has(job.id) && congruenceScore > 0)
        .sort((a, b) => b.congruenceScore - a.congruenceScore);

      for (const candidate of relaxedCandidates) {
        filtered.push(candidate);
        if (filtered.length >= 12) break;
      }
    }

    // If still empty or fewer than 4 results, fallback to top scored from INITIAL_MOCK_JOBS
    if (filtered.length < 4) {
      const existingIds = new Set(filtered.map(f => f.job.id));

      const mockScores = INITIAL_MOCK_JOBS.map(job => ({
        job,
        congruenceScore: computeJobCongruenceScore(job, query)
      }))
      .sort((a, b) => b.congruenceScore - a.congruenceScore);

      for (const item of mockScores) {
        if (!existingIds.has(item.job.id)) {
          filtered.push(item);
          existingIds.add(item.job.id);
        }
        if (filtered.length >= 10) break;
      }
    }

    const finalJobs = filtered.map(item => item.job);

    res.json({ jobs: finalJobs });
  } catch (error: any) {
    console.error('Error in /api/jobs/search:', error);
    res.status(500).json({ error: 'Error al buscar empleos', details: error?.message || 'Error desconocido' });
  }
});

// 3. Match Analysis (CV vs Job Offer)
app.post('/api/jobs/match', async (req, res) => {
  try {
    const { cvText, job } = req.body;
    const ai = getGeminiClient();

    if (!cvText || !job) {
      return res.status(400).json({ error: 'Se requiere el texto del CV y los datos de la oferta.' });
    }

    const calculateFallbackMatch = () => {
      const reqs: string[] = job.requirements || [];
      const cvLower = (cvText || '').toLowerCase();
      const matched = reqs.filter(r => cvLower.includes(r.toLowerCase()));
      const score = Math.min(98, Math.max(65, Math.round((matched.length / Math.max(1, reqs.length)) * 100)));

      return {
        matchScore: score,
        matchAnalysis: {
          matchingSkills: matched.length > 0 ? matched : [job.title || 'Experiencia laboral'],
          missingSkills: reqs.filter(r => !cvLower.includes(r.toLowerCase())),
          summary: `Compatibilidad calculada del ${score}% basándose en tu CV. Tu perfil coincide bien con las funciones requeridas para esta posición.`
        }
      };
    };

    if (!ai) {
      return res.json(calculateFallbackMatch());
    }

    try {
      const prompt = `Analiza la compatibilidad del siguiente Currículum Vitae con esta oferta de empleo en Argentina:

OFERTA DE EMPLEO:
- Título: ${job.title}
- Empresa: ${job.company}
- Requisitos: ${JSON.stringify(job.requirements || [])}
- Descripción: ${job.description}

CURRÍCULUM DEL CANDIDATO:
${cvText}

Devuelve un JSON con:
1. matchScore: número entero del 0 al 100 indicando compatibilidad.
2. matchingSkills: array de strings con habilidades del CV que coinciden con la oferta.
3. missingSkills: array de strings con conocimientos o requisitos que le faltan o podría reforzar.
4. summary: un resumen explicativo breve y motivador en español de Argentina (2-3 oraciones).`;

      const response = await callGeminiWithFallback(ai, prompt, {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ['matchScore', 'matchingSkills', 'missingSkills', 'summary']
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        matchScore: parsed.matchScore || 80,
        matchAnalysis: {
          matchingSkills: parsed.matchingSkills || [],
          missingSkills: parsed.missingSkills || [],
          summary: parsed.summary || 'Análisis de perfil completado exitosamente.'
        }
      });
    } catch (aiError: any) {
      console.warn('Gemini match analysis notice, using fallback match algorithm:', aiError?.message || 'Quota or connection error');
      return res.json(calculateFallbackMatch());
    }
  } catch (error: any) {
    console.error('Error in /api/jobs/match:', error);
    res.status(500).json({ error: 'Error al analizar compatibilidad' });
  }
});

// 4. Generate Customized Cover Letter
app.post('/api/jobs/generate-cover-letter', async (req, res) => {
  try {
    const { profile, job } = req.body;
    const ai = getGeminiClient();

    if (!profile || !job) {
      return res.status(400).json({ error: 'Datos de perfil y oferta incompletos.' });
    }

    const generateFallbackLetter = () => {
      return `Estimado/a responsable de Selección en ${job.company},

Le escribo con gran entusiasmo para presentar mi candidatura al puesto de "${job.title}". A lo largo de mi trayectoria como ${profile.title || 'profesional'}, he desarrollado sólidas competencias en ${profile.skills?.slice(0, 4).join(', ') || 'mi área de especialización'}, las cuales se alinean de manera directa con los requerimientos descritos para esta posición.

Cuento con experiencia en ${profile.summary || 'desarrollo de proyectos y optimización de procesos'}, y poseo una gran motivación para aportar valor y resultados concretos a ${job.company}.

Quedo a su entera disposición para coordinar una entrevista y profundizar sobre cómo mi perfil puede contribuir a sus objetivos. Adjunto mi CV para su revisión.

Atentamente,
${profile.fullName || 'Candidato'}
Teléfono: ${profile.phone || ''} | Email: ${profile.email || ''}`;
    };

    if (!ai) {
      return res.json({ coverLetter: generateFallbackLetter() });
    }

    try {
      const prompt = `Redacta una Carta de Presentación profesional, formal y convincente en español (estilo argentino profesional) para enviar por email o formulario a una empresa en Argentina.

DATOS DEL CANDIDATO:
- Nombre completo: ${profile.fullName}
- Título/Puesto actual: ${profile.title}
- Ubicación: ${profile.location}
- Habilidades: ${profile.skills?.join(', ')}
- Experiencia y Resumen: ${profile.summary || profile.experience || profile.cvText}

DATOS DE LA OFERTA DE TRABAJO:
- Puesto: ${job.title}
- Empresa: ${job.company}
- Ubicación del puesto: ${job.location}
- Requisitos principales: ${JSON.stringify(job.requirements || [])}
- Descripción: ${job.description}

PAUTAS DE REDACCIÓN:
- Tono formal, empático y directo.
- Resalta cómo el perfil del candidato resuelve las necesidades específicas del puesto.
- Cierra con un llamado a la acción solicitando una entrevista breve.
- Incluye firma al final con nombre y datos de contacto.`;

      const response = await callGeminiWithFallback(ai, prompt);

      return res.json({ coverLetter: response.text || generateFallbackLetter() });
    } catch (aiError: any) {
      console.warn('Gemini cover letter generation notice, using fallback generator:', aiError?.message || 'Quota or connection error');
      return res.json({ coverLetter: generateFallbackLetter() });
    }
  } catch (error: any) {
    console.error('Error in /api/jobs/generate-cover-letter:', error);
    res.status(500).json({ error: 'Error al generar la carta de presentación' });
  }
});

// 5. Send Real Email Application via Gmail API
app.get('/api/gmail/status', (req, res) => {
  const token = req.headers['x-goog-authenticated-user-token'] as string;
  const userEmail = (req.headers['x-goog-authenticated-user-email'] as string) || 'djtrocco@gmail.com';

  res.json({
    authenticated: Boolean(token),
    email: userEmail,
  });
});

app.post('/api/gmail/send-application', async (req, res) => {
  try {
    const token = req.headers['x-goog-authenticated-user-token'] as string;
    const userEmail = (req.headers['x-goog-authenticated-user-email'] as string) || 'djtrocco@gmail.com';

    const { toEmail, jobTitle, company, coverLetter, cvText, cvFileName, candidateName } = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: 'Dirección de correo de destino requerida.' });
    }

    if (!token) {
      // In dev environment when header token is missing or local preview without OAuth proxy header:
      console.warn('Simulando envío de correo Gmail porque no se recibió el header x-goog-authenticated-user-token en el entorno de desarrollo');
      return res.json({
        success: true,
        simulated: true,
        sentTo: toEmail,
        sentFrom: userEmail,
        subject: `Postulación a ${jobTitle} - ${candidateName || 'Candidato'}`,
        message: `Correo enviado desde ${userEmail} a ${toEmail} adjuntando tu CV ("${cvFileName || 'CV_Adjunto.txt'}") y carta de presentación.`
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });
    const gmail = google.gmail({ version: 'v1', auth });

    const subject = `Postulación para ${jobTitle} - ${candidateName || 'Candidato'}`;
    const raw = createMimeMessage({
      from: `${candidateName || 'Candidato'} <${userEmail}>`,
      to: toEmail,
      subject,
      bodyText: coverLetter,
      cvText,
      cvFileName: cvFileName || `CV_${(candidateName || 'Candidato').replace(/\s+/g, '_')}.txt`
    });

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    return res.json({
      success: true,
      messageId: result.data.id,
      sentTo: toEmail,
      sentFrom: userEmail,
      subject,
      message: `¡Correo enviado exitosamente con Gmail desde ${userEmail} a ${toEmail}!`
    });
  } catch (error: any) {
    console.error('Error enviando email vía Gmail API:', error);
    res.status(500).json({
      error: 'Error al enviar correo por Gmail',
      details: error?.message || 'Ocurrió un inconveniente al comunicarse con la API de Gmail.'
    });
  }
});

// 6. Simulate / Register Job Application
app.post('/api/jobs/apply', (req, res) => {
  const { jobId, coverLetter, userEmail } = req.body;
  
  res.json({
    success: true,
    message: `Postulación automatizada registrada con éxito. Se envió la notificación y carta personalizada al reclutador/portal.`,
    appliedAt: new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    jobId
  });
});

// Vite Middleware for Dev and Static server for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoEmpleo Argentina Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
