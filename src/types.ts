export type JobPortal = 'zonajobs' | 'bumeran' | 'computrabajo' | 'linkedin' | 'indeed' | 'direct';

export type JobModality = 'remoto' | 'presencial' | 'hibrido';

export type ApplicationState = 'guardado' | 'postulando' | 'postulado_auto' | 'postulado_manual' | 'pendiente_linkedin' | 'en_revision' | 'entrevista' | 'descartado';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string; // e.g. "Buenos Aires, CABA", "Córdoba", "Remoto (Argentina)"
  portal: JobPortal;
  modality: JobModality;
  salaryRange?: string; // e.g. "$1.200.000 - $1.800.000 ARS" or "USD 1.500/mes"
  description: string;
  requirements: string[];
  postedDate: string;
  url: string;
  contactEmail?: string;
  matchScore?: number;
  matchAnalysis?: {
    matchingSkills: string[];
    missingSkills: string[];
    summary: string;
  };
}

export interface UserCVProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  experience: string;
  education: string;
  skills: string[];
  salaryExpectation: string;
  cvText: string;
  cvFileName?: string;
}

export interface ApplicationLog {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  portal: JobPortal;
  appliedAt: string;
  state: ApplicationState;
  coverLetter?: string;
  notes?: string;
  matchScore?: number;
  recipientEmail?: string;
  gmailMessageId?: string;
  savedInSentFolder?: boolean;
  isRead?: boolean;
  readAt?: string;
}

export interface DeploymentStep {
  id: number;
  title: string;
  shortDesc: string;
  iconName: string;
  detailedContent: {
    whatIsIt: string;
    whyNeeded: string;
    steps: string[];
    codeSnippets?: { title: string; code: string }[];
    proTips?: string[];
  };
}
