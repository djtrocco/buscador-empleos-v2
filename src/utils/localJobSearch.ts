import { JobOffer, UserCVProfile } from '../types';
import { INITIAL_MOCK_JOBS } from '../data/mockJobs';

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
  if (synonymMap[clean]) {
    synonymMap[clean].forEach(s => synonyms.add(s));
  }
  return Array.from(synonyms);
}

function computeJobCongruenceScore(job: JobOffer, query: string): number {
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

  if (queryTokens.length === 0) return 50;

  const jobTitle = normalizeStr(job.title);
  const jobDesc = normalizeStr(job.description);
  const jobReqs = normalizeStr(job.requirements?.join(' ') || '');
  const jobComp = normalizeStr(job.company);
  const fullJobText = `${jobTitle} ${jobDesc} ${jobReqs} ${jobComp}`;

  let totalScore = 0;

  for (const token of queryTokens) {
    let tokenScore = 0;

    if (jobTitle.includes(token)) {
      tokenScore += 60;
    } else if (fullJobText.includes(token)) {
      tokenScore += 35;
    }

    if (token.length >= 4) {
      const stem = token.slice(0, Math.min(token.length - 1, 5));
      if (jobTitle.includes(stem)) {
        tokenScore += 25;
      } else if (fullJobText.includes(stem)) {
        tokenScore += 15;
      }
    }

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

  return Math.min(100, Math.round((totalScore / (queryTokens.length * 60)) * 100));
}

export function searchJobsLocal(query: string, location: string, portal: string, modality: string): JobOffer[] {
  const scoredJobs = INITIAL_MOCK_JOBS.map((job) => ({
    job,
    congruenceScore: computeJobCongruenceScore(job, query)
  }));

  let filtered = scoredJobs.filter(({ job, congruenceScore }) => {
    const matchesQuery = query ? congruenceScore > 0 : true;

    const matchesLocation = location && location !== 'todas'
      ? job.location.toLowerCase().includes(location.toLowerCase()) ||
        (location === 'buenos_aires' && (job.location.toLowerCase().includes('caba') || job.location.toLowerCase().includes('buenos aires'))) ||
        (location === 'cordoba' && job.location.toLowerCase().includes('córdoba')) ||
        (location === 'rosario' && job.location.toLowerCase().includes('rosario')) ||
        (location === 'mendoza' && job.location.toLowerCase().includes('mendoza'))
      : true;

    const matchesPortal = portal && portal !== 'todos' ? job.portal === portal : true;
    const matchesModality = modality && modality !== 'todas' ? job.modality === modality : true;

    return matchesQuery && matchesLocation && matchesPortal && matchesModality;
  });

  filtered.sort((a, b) => b.congruenceScore - a.congruenceScore);

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

  if (filtered.length < 4) {
    const existingIds = new Set(filtered.map(f => f.job.id));
    for (const job of INITIAL_MOCK_JOBS) {
      if (!existingIds.has(job.id)) {
        filtered.push({ job, congruenceScore: 50 });
        existingIds.add(job.id);
      }
      if (filtered.length >= 10) break;
    }
  }

  return filtered.map(item => item.job);
}

export function generateCoverLetterLocal(profile: UserCVProfile, job: JobOffer): string {
  const name = profile.fullName || 'Candidato';
  const role = profile.title || 'profesional';
  const email = profile.email || 'contacto@email.com';
  const phone = profile.phone || '11 1234-5678';

  return `Estimado/a Equipo de Selección de ${job.company},

Me dirijo a ustedes con gran entusiasmo para presentar mi candidatura a la posición de "${job.title}".

Cuento con experiencia y conocimientos enfocados en ${role}, destacándome por mi compromiso, capacidad de adaptación y trabajo en equipo. Tras revisar atentamente los requisitos para el puesto en ${job.company}, estoy convencido/a de que mi perfil técnico y profesional puede aportar un valor diferencial directo a sus proyectos.

Entre mis competencias clave que se alinean con su búsqueda destacan:
${(job.requirements || []).slice(0, 3).map(req => `- Sólidos conocimientos en ${req}`).join('\n')}

Quedo a su entera disposición para mantener una entrevista y ampliar detalles sobre mi trayectoria y expectativas profesionales.

Agradezco de antemano su tiempo y consideración.

Atentamente,
${name}
${role}
Email: ${email} | Tel: ${phone}`;
}
