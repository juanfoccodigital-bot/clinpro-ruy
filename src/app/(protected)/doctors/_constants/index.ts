export enum ProfessionalSpecialty {
  // Medicina
  ALERGOLOGIA = "Alergologia",
  ANESTESIOLOGIA = "Anestesiologia",
  ANGIOLOGIA = "Angiologia",
  CANCEROLOGIA = "Cancerologia",
  CARDIOLOGIA = "Cardiologia",
  CIRURGIA_CARDIOVASCULAR = "Cirurgia Cardiovascular",
  CIRURGIA_CABECA_PESCOCO = "Cirurgia de Cabeça e Pescoço",
  CIRURGIA_DIGESTIVA = "Cirurgia do Aparelho Digestivo",
  CIRURGIA_GERAL = "Cirurgia Geral",
  CIRURGIA_PEDIATRICA = "Cirurgia Pediátrica",
  CIRURGIA_PLASTICA = "Cirurgia Plástica",
  CIRURGIA_TORACICA = "Cirurgia Torácica",
  CIRURGIA_VASCULAR = "Cirurgia Vascular",
  CLINICA_MEDICA = "Clínica Médica",
  DERMATOLOGIA = "Dermatologia",
  ENDOCRINOLOGIA = "Endocrinologia e Metabologia",
  ENDOSCOPIA = "Endoscopia",
  GASTROENTEROLOGIA = "Gastroenterologia",
  GERIATRIA = "Geriatria",
  GINECOLOGIA_OBSTETRICIA = "Ginecologia e Obstetrícia",
  HEMATOLOGIA = "Hematologia e Hemoterapia",
  HEPATOLOGIA = "Hepatologia",
  HOMEOPATIA = "Homeopatia",
  INFECTOLOGIA = "Infectologia",
  MASTOLOGIA = "Mastologia",
  MEDICINA_DE_EMERGENCIA = "Medicina de Emergência",
  MEDICINA_DO_ESPORTO = "Medicina do Esporte",
  MEDICINA_DO_TRABALHO = "Medicina do Trabalho",
  MEDICINA_DE_FAMILIA = "Medicina de Família e Comunidade",
  MEDICINA_FISICA_REABILITACAO = "Medicina Física e Reabilitação",
  MEDICINA_INTENSIVA = "Medicina Intensiva",
  MEDICINA_LEGAL = "Medicina Legal e Perícia Médica",
  NEFROLOGIA = "Nefrologia",
  NEUROCIRURGIA = "Neurocirurgia",
  NEUROLOGIA = "Neurologia",
  NUTROLOGIA = "Nutrologia",
  OFTALMOLOGIA = "Oftalmologia",
  ONCOLOGIA_CLINICA = "Oncologia Clínica",
  ORTOPEDIA_TRAUMATOLOGIA = "Ortopedia e Traumatologia",
  OTORRINOLARINGOLOGIA = "Otorrinolaringologia",
  PATOLOGIA = "Patologia",
  PATOLOGIA_CLINICA = "Patologia Clínica/Medicina Laboratorial",
  PEDIATRIA = "Pediatria",
  PNEUMOLOGIA = "Pneumologia",
  PSIQUIATRIA = "Psiquiatria",
  RADIOLOGIA = "Radiologia e Diagnóstico por Imagem",
  RADIOTERAPIA = "Radioterapia",
  REUMATOLOGIA = "Reumatologia",
  UROLOGIA = "Urologia",

  // Odontologia
  ODONTOLOGIA_GERAL = "Odontologia Geral",
  ORTODONTIA = "Ortodontia",
  ENDODONTIA = "Endodontia",
  PERIODONTIA = "Periodontia",
  IMPLANTODONTIA = "Implantodontia",
  ODONTOPEDIATRIA = "Odontopediatria",
  PROTESE_DENTARIA = "Prótese Dentária",
  CIRURGIA_BUCOMAXILOFACIAL = "Cirurgia Bucomaxilofacial",

  // Estética
  ESTETICA_FACIAL = "Estética Facial",
  ESTETICA_CORPORAL = "Estética Corporal",
  DERMATOLOGIA_ESTETICA = "Dermatologia Estética",
  HARMONIZACAO_FACIAL = "Harmonização Facial",

  // Fisioterapia
  FISIOTERAPIA = "Fisioterapia",
  FISIOTERAPIA_ORTOPEDICA = "Fisioterapia Ortopédica",
  FISIOTERAPIA_RESPIRATORIA = "Fisioterapia Respiratória",
  PILATES = "Pilates",

  // Psicologia
  PSICOLOGIA = "Psicologia",
  PSICOLOGIA_CLINICA = "Psicologia Clínica",
  NEUROPSICOLOGIA = "Neuropsicologia",

  // Nutrição
  NUTRICAO = "Nutrição",
  NUTRICAO_ESPORTIVA = "Nutrição Esportiva",

  // Outras áreas da saúde
  FONOAUDIOLOGIA = "Fonoaudiologia",
  TERAPIA_OCUPACIONAL = "Terapia Ocupacional",
  ACUPUNTURA = "Acupuntura",
  QUIROPRAXIA = "Quiropraxia",
  PODOLOGIA = "Podologia",
}

export const professionalSpecialties = Object.entries(ProfessionalSpecialty).map(
  ([key, value]) => ({
    value: ProfessionalSpecialty[key as keyof typeof ProfessionalSpecialty],
    label: value,
  }),
);
