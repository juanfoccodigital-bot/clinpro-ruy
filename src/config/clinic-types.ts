import { ProfessionalSpecialty } from "@/app/(protected)/doctors/_constants";

export type ClinicType =
  | "medical_clinic"
  | "dental"
  | "aesthetics"
  | "physiotherapy"
  | "psychology"
  | "other";

export interface ClinicTerminology {
  patients: string;
  patient: string;
  professionals: string;
  professional: string;
  appointment: string;
  appointments: string;
  medicalRecords: string;
  specialty: string;
}

interface ClinicTypeConfig {
  label: string;
  terminology: ClinicTerminology;
  specialties: string[];
}

const allSpecialties = Object.values(ProfessionalSpecialty);

export const CLINIC_TYPES: Record<ClinicType, ClinicTypeConfig> = {
  medical_clinic: {
    label: "Clinica Medica",
    terminology: {
      patients: "Pacientes",
      patient: "Paciente",
      professionals: "Medicos",
      professional: "Medico",
      appointment: "Consulta",
      appointments: "Consultas",
      medicalRecords: "Prontuarios",
      specialty: "Especialidade",
    },
    specialties: [
      ProfessionalSpecialty.ALERGOLOGIA,
      ProfessionalSpecialty.ANESTESIOLOGIA,
      ProfessionalSpecialty.ANGIOLOGIA,
      ProfessionalSpecialty.CANCEROLOGIA,
      ProfessionalSpecialty.CARDIOLOGIA,
      ProfessionalSpecialty.CIRURGIA_CARDIOVASCULAR,
      ProfessionalSpecialty.CIRURGIA_CABECA_PESCOCO,
      ProfessionalSpecialty.CIRURGIA_DIGESTIVA,
      ProfessionalSpecialty.CIRURGIA_GERAL,
      ProfessionalSpecialty.CIRURGIA_PEDIATRICA,
      ProfessionalSpecialty.CIRURGIA_PLASTICA,
      ProfessionalSpecialty.CIRURGIA_TORACICA,
      ProfessionalSpecialty.CIRURGIA_VASCULAR,
      ProfessionalSpecialty.CLINICA_MEDICA,
      ProfessionalSpecialty.DERMATOLOGIA,
      ProfessionalSpecialty.ENDOCRINOLOGIA,
      ProfessionalSpecialty.ENDOSCOPIA,
      ProfessionalSpecialty.GASTROENTEROLOGIA,
      ProfessionalSpecialty.GERIATRIA,
      ProfessionalSpecialty.GINECOLOGIA_OBSTETRICIA,
      ProfessionalSpecialty.HEMATOLOGIA,
      ProfessionalSpecialty.HEPATOLOGIA,
      ProfessionalSpecialty.HOMEOPATIA,
      ProfessionalSpecialty.INFECTOLOGIA,
      ProfessionalSpecialty.MASTOLOGIA,
      ProfessionalSpecialty.MEDICINA_DE_EMERGENCIA,
      ProfessionalSpecialty.MEDICINA_DO_ESPORTO,
      ProfessionalSpecialty.MEDICINA_DO_TRABALHO,
      ProfessionalSpecialty.MEDICINA_DE_FAMILIA,
      ProfessionalSpecialty.MEDICINA_FISICA_REABILITACAO,
      ProfessionalSpecialty.MEDICINA_INTENSIVA,
      ProfessionalSpecialty.MEDICINA_LEGAL,
      ProfessionalSpecialty.NEFROLOGIA,
      ProfessionalSpecialty.NEUROCIRURGIA,
      ProfessionalSpecialty.NEUROLOGIA,
      ProfessionalSpecialty.NUTROLOGIA,
      ProfessionalSpecialty.OFTALMOLOGIA,
      ProfessionalSpecialty.ONCOLOGIA_CLINICA,
      ProfessionalSpecialty.ORTOPEDIA_TRAUMATOLOGIA,
      ProfessionalSpecialty.OTORRINOLARINGOLOGIA,
      ProfessionalSpecialty.PATOLOGIA,
      ProfessionalSpecialty.PATOLOGIA_CLINICA,
      ProfessionalSpecialty.PEDIATRIA,
      ProfessionalSpecialty.PNEUMOLOGIA,
      ProfessionalSpecialty.PSIQUIATRIA,
      ProfessionalSpecialty.RADIOLOGIA,
      ProfessionalSpecialty.RADIOTERAPIA,
      ProfessionalSpecialty.REUMATOLOGIA,
      ProfessionalSpecialty.UROLOGIA,
    ],
  },
  dental: {
    label: "Odontologia",
    terminology: {
      patients: "Pacientes",
      patient: "Paciente",
      professionals: "Dentistas",
      professional: "Dentista",
      appointment: "Consulta",
      appointments: "Consultas",
      medicalRecords: "Prontuarios",
      specialty: "Especialidade",
    },
    specialties: [
      ProfessionalSpecialty.ODONTOLOGIA_GERAL,
      ProfessionalSpecialty.ORTODONTIA,
      ProfessionalSpecialty.ENDODONTIA,
      ProfessionalSpecialty.PERIODONTIA,
      ProfessionalSpecialty.IMPLANTODONTIA,
      ProfessionalSpecialty.ODONTOPEDIATRIA,
      ProfessionalSpecialty.PROTESE_DENTARIA,
      ProfessionalSpecialty.CIRURGIA_BUCOMAXILOFACIAL,
    ],
  },
  aesthetics: {
    label: "Estetica",
    terminology: {
      patients: "Clientes",
      patient: "Cliente",
      professionals: "Profissionais",
      professional: "Profissional",
      appointment: "Atendimento",
      appointments: "Atendimentos",
      medicalRecords: "Fichas",
      specialty: "Especialidade",
    },
    specialties: [
      ProfessionalSpecialty.ESTETICA_FACIAL,
      ProfessionalSpecialty.ESTETICA_CORPORAL,
      ProfessionalSpecialty.DERMATOLOGIA_ESTETICA,
      ProfessionalSpecialty.HARMONIZACAO_FACIAL,
    ],
  },
  physiotherapy: {
    label: "Fisioterapia",
    terminology: {
      patients: "Pacientes",
      patient: "Paciente",
      professionals: "Fisioterapeutas",
      professional: "Fisioterapeuta",
      appointment: "Sessao",
      appointments: "Sessoes",
      medicalRecords: "Prontuarios",
      specialty: "Especialidade",
    },
    specialties: [
      ProfessionalSpecialty.FISIOTERAPIA,
      ProfessionalSpecialty.FISIOTERAPIA_ORTOPEDICA,
      ProfessionalSpecialty.FISIOTERAPIA_RESPIRATORIA,
      ProfessionalSpecialty.PILATES,
    ],
  },
  psychology: {
    label: "Psicologia",
    terminology: {
      patients: "Pacientes",
      patient: "Paciente",
      professionals: "Psicologos",
      professional: "Psicologo",
      appointment: "Sessao",
      appointments: "Sessoes",
      medicalRecords: "Prontuarios",
      specialty: "Abordagem",
    },
    specialties: [
      ProfessionalSpecialty.PSICOLOGIA,
      ProfessionalSpecialty.PSICOLOGIA_CLINICA,
      ProfessionalSpecialty.NEUROPSICOLOGIA,
    ],
  },
  other: {
    label: "Outra",
    terminology: {
      patients: "Clientes",
      patient: "Cliente",
      professionals: "Profissionais",
      professional: "Profissional",
      appointment: "Atendimento",
      appointments: "Atendimentos",
      medicalRecords: "Fichas",
      specialty: "Especialidade",
    },
    specialties: allSpecialties,
  },
};

const defaultTerminology = CLINIC_TYPES.medical_clinic.terminology;

export function getClinicConfig(clinicType?: string | null): ClinicTypeConfig {
  return CLINIC_TYPES[(clinicType as ClinicType) || "medical_clinic"] ?? CLINIC_TYPES.medical_clinic;
}

export function getTerminology(clinicType?: string | null): ClinicTerminology {
  return getClinicConfig(clinicType).terminology ?? defaultTerminology;
}

export function getSpecialties(clinicType?: string | null): { value: string; label: string }[] {
  const config = getClinicConfig(clinicType);
  return config.specialties.map((s) => ({ value: s, label: s }));
}
