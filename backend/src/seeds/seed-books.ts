import * as dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import { DataSource } from 'typeorm';
import { Resource } from '../modules/resources/entities/resource.entity';
import { GeneralBook } from '../modules/resources/entities/general-book.entity';
import { ReserveBook } from '../modules/resources/entities/reserve-book.entity';
import { ReferenceMaterial } from '../modules/resources/entities/reference-material.entity';
import { Periodical } from '../modules/resources/entities/periodical.entity';
import { MapItem } from '../modules/resources/entities/map-item.entity';
import { TechDevice } from '../modules/resources/entities/tech-device.entity';
import { CollectionType } from '../modules/resources/enums/collection-type.enum';
import { ResourceStatus } from '../modules/resources/enums/resource-status.enum';

interface SeedBook {
  title: string;
  code: string;
  collection: CollectionType;
  location: string;
  career: string;
  generalData?: {
    isbn: string;
    author: string;
    publisher: string;
    publicationYear: number;
    edition: string;
    pages: number;
  };
  reserveData?: {
    courseCode: string;
    courseName: string;
    professorName: string;
    academicDepartment: string;
    semester: string;
    maxLoanHours: number;
  };
  referenceData?: {
    subjectArea: string;
    volumeNumber?: string;
    publisher: string;
    consultationOnly: boolean;
  };
}

const booksToSeed: SeedBook[] = [
  // ==========================================
  // INGENIERÍA (13 Libros)
  // ==========================================
  {
    title: 'Ingeniería de Software: Un Enfoque Práctico',
    code: 'ING-SOF-001',
    collection: CollectionType.GENERAL,
    location: 'Estante A-1, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-607-15-0314-5',
      author: 'Roger S. Pressman, Bruce R. Maxim',
      publisher: 'McGraw-Hill Interamericana',
      publicationYear: 2021,
      edition: '8va Edición',
      pages: 896,
    },
  },
  {
    title: 'Estructuras de Datos y Algoritmos en Java',
    code: 'ING-SOF-002',
    collection: CollectionType.GENERAL,
    location: 'Estante A-1, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-84-481-5631-2',
      author: 'Michael T. Goodrich, Roberto Tamassia',
      publisher: 'John Wiley & Sons',
      publicationYear: 2022,
      edition: '6ta Edición',
      pages: 720,
    },
  },
  {
    title: 'Inteligencia Artificial Moderna y Redes Neuronales',
    code: 'ING-RES-003',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Técnica',
    career: 'Ingeniería',
    reserveData: {
      courseCode: 'ING-701',
      courseName: 'Inteligencia Artificial Avanzada',
      professorName: 'Dr. Fernando Silva',
      academicDepartment: 'Departamento de Ingeniería Informática',
      semester: '2026-1',
      maxLoanHours: 3,
    },
  },
  {
    title: 'Sistemas Operativos Distribuidos y Tiempo Real',
    code: 'ING-SOF-004',
    collection: CollectionType.GENERAL,
    location: 'Estante A-2, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-013-359162-0',
      author: 'Andrew S. Tanenbaum, Herbert Bos',
      publisher: 'Pearson Educación',
      publicationYear: 2020,
      edition: '4ta Edición',
      pages: 1104,
    },
  },
  {
    title: 'Fundamentos de Termodinámica para Ingenieros',
    code: 'ING-MEC-005',
    collection: CollectionType.GENERAL,
    location: 'Estante A-3, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-607-15-1123-2',
      author: 'Yunus A. Çengel, Michael A. Boles',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      edition: '9na Edición',
      pages: 1024,
    },
  },
  {
    title: 'Cálculo Multivariable y Métodos Numéricos',
    code: 'ING-RES-006',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Ciencias Básicas',
    career: 'Ingeniería',
    reserveData: {
      courseCode: 'MAT-301',
      courseName: 'Cálculo Avanzado para Ingeniería',
      professorName: 'Dra. Beatriz Morales',
      academicDepartment: 'Departamento de Matemáticas y Física',
      semester: '2026-1',
      maxLoanHours: 2,
    },
  },
  {
    title: 'Mecánica de Suelos y Cimentaciones Especiales',
    code: 'ING-CIV-007',
    collection: CollectionType.GENERAL,
    location: 'Estante A-4, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-607-526-646-6',
      author: 'Braja M. Das, Khaled Sobhan',
      publisher: 'Cengage Learning',
      publicationYear: 2021,
      edition: '9na Edición',
      pages: 848,
    },
  },
  {
    title: 'Diseño de Circuitos Digitales y Microprocesadores',
    code: 'ING-ELE-008',
    collection: CollectionType.GENERAL,
    location: 'Estante A-5, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-012-394424-5',
      author: 'David Money Harris, Sarah L. Harris',
      publisher: 'Morgan Kaufmann',
      publicationYear: 2022,
      edition: '3ra Edición',
      pages: 750,
    },
  },
  {
    title: 'Arquitectura de Software y Patrones de Microservicios',
    code: 'ING-SOF-009',
    collection: CollectionType.GENERAL,
    location: 'Estante A-2, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-149-204345-4',
      author: 'Mark Richards, Neal Ford',
      publisher: "O'Reilly Media",
      publicationYear: 2023,
      edition: '2da Edición',
      pages: 480,
    },
  },
  {
    title: 'Manual de Resistencia de Materiales y Vigas Estructurales',
    code: 'ING-REF-010',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Técnica - Mesa 3',
    career: 'Ingeniería',
    referenceData: {
      subjectArea: 'Ingeniería Estructural y Materiales',
      volumeNumber: 'Volumen II',
      publisher: 'Editorial Reverté',
      consultationOnly: true,
    },
  },
  {
    title: 'Robótica Industrial y Control de Procesos Automatizados',
    code: 'ING-IND-011',
    collection: CollectionType.GENERAL,
    location: 'Estante A-6, Nivel 2',
    career: 'Ingeniería',
    generalData: {
      isbn: '978-84-267-2780-0',
      author: 'Mikell P. Groover',
      publisher: 'Marcombo',
      publicationYear: 2020,
      edition: '5ta Edición',
      pages: 660,
    },
  },
  {
    title: 'Ciberseguridad Defensiva y Criptografía Aplicada',
    code: 'ING-RES-012',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Técnica',
    career: 'Ingeniería',
    reserveData: {
      courseCode: 'SEG-801',
      courseName: 'Seguridad Informática y Auditoría',
      professorName: 'Ing. Carlos Mendoza',
      academicDepartment: 'Departamento de Ingeniería Informática',
      semester: '2026-1',
      maxLoanHours: 4,
    },
  },
  {
    title: 'Diccionario Enciclopédico de Ingeniería y Tecnología',
    code: 'ING-REF-013',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Técnica - Mesa 1',
    career: 'Ingeniería',
    referenceData: {
      subjectArea: 'Ingeniería General y Tecnologías de Información',
      volumeNumber: 'Tomo Único',
      publisher: 'Díaz de Santos',
      consultationOnly: true,
    },
  },

  // ==========================================
  // PSICOLOGÍA (13 Libros)
  // ==========================================
  {
    title: 'Fundamentos de la Psicología Cognitiva Contemporánea',
    code: 'PSI-COG-001',
    collection: CollectionType.GENERAL,
    location: 'Estante B-1, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-84-9035-498-8',
      author: 'Robert J. Sternberg, Karin Sternberg',
      publisher: 'Cengage Learning',
      publicationYear: 2020,
      edition: '7ma Edición',
      pages: 624,
    },
  },
  {
    title: 'Manual Diagnóstico y Estadístico de Trastornos Mentales (DSM-5-TR)',
    code: 'PSI-REF-002',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Ciencias Humanas',
    career: 'Psicología',
    referenceData: {
      subjectArea: 'Psicología Clínica y Psiquiatría',
      volumeNumber: 'Texto Revisado',
      publisher: 'American Psychiatric Association (APA)',
      consultationOnly: true,
    },
  },
  {
    title: 'Psicología del Desarrollo: De la Infancia a la Vejez',
    code: 'PSI-DEV-003',
    collection: CollectionType.GENERAL,
    location: 'Estante B-2, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-607-15-1468-4',
      author: 'Diane E. Papalia, Gabriela Martorell',
      publisher: 'McGraw-Hill',
      publicationYear: 2021,
      edition: '14ta Edición',
      pages: 812,
    },
  },
  {
    title: 'Neuropsicología Clínica y Evaluación de Funciones Ejecutivas',
    code: 'PSI-RES-004',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Psicología',
    career: 'Psicología',
    reserveData: {
      courseCode: 'PSI-502',
      courseName: 'Neuropsicología Aplicada',
      professorName: 'Dra. Elena Valenzuela',
      academicDepartment: 'Departamento de Psicología Clínica',
      semester: '2026-1',
      maxLoanHours: 3,
    },
  },
  {
    title: 'Teorías de la Personalidad y Evaluación Psicodinámica',
    code: 'PSI-PER-005',
    collection: CollectionType.GENERAL,
    location: 'Estante B-3, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-607-526-289-5',
      author: 'Jess Feist, Gregory J. Feist',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      edition: '9na Edición',
      pages: 680,
    },
  },
  {
    title: 'Psicología Social y Procesos de Dinámica Grupal',
    code: 'PSI-SOC-006',
    collection: CollectionType.GENERAL,
    location: 'Estante B-4, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-84-481-9876-3',
      author: 'David G. Myers, Jean M. Twenge',
      publisher: 'McGraw-Hill Education',
      publicationYear: 2022,
      edition: '13ra Edición',
      pages: 736,
    },
  },
  {
    title: 'Terapia Cognitivo-Conductual: Protocolos Clínicos Prácticos',
    code: 'PSI-RES-007',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Psicología',
    career: 'Psicología',
    reserveData: {
      courseCode: 'PSI-604',
      courseName: 'Intervención Psicoterapéutica I',
      professorName: 'Mg. Andrés Restrepo',
      academicDepartment: 'Departamento de Psicología',
      semester: '2026-1',
      maxLoanHours: 2,
    },
  },
  {
    title: 'Psicopatología General y Modelos Etiológicos',
    code: 'PSI-PAT-008',
    collection: CollectionType.GENERAL,
    location: 'Estante B-3, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-84-9113-210-3',
      author: 'David H. Barlow, Vincent Mark Durand',
      publisher: 'Cengage',
      publicationYear: 2021,
      edition: '8va Edición',
      pages: 792,
    },
  },
  {
    title: 'Psicología Organizacional y Gestión del Talento Humano',
    code: 'PSI-ORG-009',
    collection: CollectionType.GENERAL,
    location: 'Estante B-5, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-607-32-4412-1',
      author: 'Michael G. Aamodt',
      publisher: 'Pearson',
      publicationYear: 2020,
      edition: '8va Edición',
      pages: 560,
    },
  },
  {
    title: 'Psicoanálisis y Estructura del Aparato Psíquico',
    code: 'PSI-ANA-010',
    collection: CollectionType.GENERAL,
    location: 'Estante B-6, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-84-375-0678-4',
      author: 'Sigmund Freud, Jean Laplanche',
      publisher: 'Amorrortu Editores',
      publicationYear: 2018,
      edition: 'Edición Conmemorativa',
      pages: 432,
    },
  },
  {
    title: 'Enciclopedia de Técnicas y Pruebas Psicométricas',
    code: 'PSI-REF-011',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Ciencias Humanas - Vitrina P',
    career: 'Psicología',
    referenceData: {
      subjectArea: 'Psicometría y Evaluación Psicológica',
      volumeNumber: 'Volumen I - Pruebas Proyectivas',
      publisher: 'Editorial El Manual Moderno',
      consultationOnly: true,
    },
  },
  {
    title: 'Psicología Positiva: Resiliencia y Bienestar Subjetivo',
    code: 'PSI-POS-012',
    collection: CollectionType.GENERAL,
    location: 'Estante B-5, Nivel 1',
    career: 'Psicología',
    generalData: {
      isbn: '978-84-9788-912-3',
      author: 'Martin E. P. Seligman',
      publisher: 'Editorial Paidós',
      publicationYear: 2022,
      edition: '3ra Edición',
      pages: 384,
    },
  },
  {
    title: 'Métodos Cuantitativos y Análisis de Datos en Psicología',
    code: 'PSI-RES-013',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Psicología',
    career: 'Psicología',
    reserveData: {
      courseCode: 'INV-402',
      courseName: 'Metodología de la Investigación Conductual',
      professorName: 'Dr. Germán Osorio',
      academicDepartment: 'Departamento de Investigación Psicológica',
      semester: '2026-1',
      maxLoanHours: 3,
    },
  },

  // ==========================================
  // MERCADEO (12 Libros)
  // ==========================================
  {
    title: 'Principios de Marketing Estratégico y Global',
    code: 'MER-EST-001',
    collection: CollectionType.GENERAL,
    location: 'Estante C-1, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-607-32-5201-0',
      author: 'Philip Kotler, Gary Armstrong',
      publisher: 'Pearson Educación',
      publicationYear: 2021,
      edition: '18va Edición',
      pages: 740,
    },
  },
  {
    title: 'Marketing Digital, Estrategia SEO y Redes Sociales',
    code: 'MER-DIG-002',
    collection: CollectionType.GENERAL,
    location: 'Estante C-1, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-84-415-4299-0',
      author: 'Dave Chaffey, Fiona Ellis-Chadwick',
      publisher: 'Anaya Multimedia',
      publicationYear: 2023,
      edition: '7ma Edición',
      pages: 580,
    },
  },
  {
    title: 'Comportamiento del Consumidor y Neuromarketing Aplicado',
    code: 'MER-RES-003',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Ciencias Económicas',
    career: 'Mercadeo',
    reserveData: {
      courseCode: 'MER-401',
      courseName: 'Comportamiento y Psicología del Consumidor',
      professorName: 'Mg. Valentina Duarte',
      academicDepartment: 'Departamento de Mercadeo y Publicidad',
      semester: '2026-1',
      maxLoanHours: 2,
    },
  },
  {
    title: 'Gestión Estratégica de Marca: Creación de Branding de Valor',
    code: 'MER-BRA-004',
    collection: CollectionType.GENERAL,
    location: 'Estante C-2, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-607-32-1563-3',
      author: 'Kevin Lane Keller, Vanitha Swaminathan',
      publisher: 'Pearson',
      publicationYear: 2020,
      edition: '5ta Edición',
      pages: 610,
    },
  },
  {
    title: 'Investigación de Mercados y Analítica de Datos Comerciales',
    code: 'MER-INV-005',
    collection: CollectionType.GENERAL,
    location: 'Estante C-2, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-607-526-890-3',
      author: 'Naresh K. Malhotra',
      publisher: 'Pearson Educación',
      publicationYear: 2021,
      edition: '7ma Edición',
      pages: 824,
    },
  },
  {
    title: 'Publicidad Creativa y Estrategias de Comunicación B2B',
    code: 'MER-PUB-006',
    collection: CollectionType.GENERAL,
    location: 'Estante C-3, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-84-205-5812-7',
      author: 'William F. Arens, Michael F. Weigold',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      edition: '15ta Edición',
      pages: 672,
    },
  },
  {
    title: 'Fijación de Precios Estratégicos y Modelos de Rentabilidad',
    code: 'MER-RES-007',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Ciencias Económicas',
    career: 'Mercadeo',
    reserveData: {
      courseCode: 'MER-503',
      courseName: 'Pricing y Modelos Financieros de Marketing',
      professorName: 'Dr. Roberto Zambrano',
      academicDepartment: 'Departamento de Mercadeo',
      semester: '2026-1',
      maxLoanHours: 3,
    },
  },
  {
    title: 'Trade Marketing, Merchandising y Canales Retail',
    code: 'MER-TRA-008',
    collection: CollectionType.GENERAL,
    location: 'Estante C-3, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-84-1718-490-2',
      author: 'Enrique C. Díez de Castro',
      publisher: 'Pirámide Ediciones',
      publicationYear: 2022,
      edition: '4ta Edición',
      pages: 416,
    },
  },
  {
    title: 'Diccionario Enciclopédico de Mercadeo y Comunicación Comercial',
    code: 'MER-REF-009',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Comercial - Mesa 2',
    career: 'Mercadeo',
    referenceData: {
      subjectArea: 'Mercadotecnia, Publicidad y Ventas',
      volumeNumber: 'Tomo de Términos Globales',
      publisher: 'ESIC Editorial',
      consultationOnly: true,
    },
  },
  {
    title: 'Growth Hacking: Tácticas de Tracción y Conversión Rápida',
    code: 'MER-GRO-010',
    collection: CollectionType.GENERAL,
    location: 'Estante C-4, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-84-1799-012-1',
      author: 'Sean Ellis, Morgan Brown',
      publisher: 'Conecta',
      publicationYear: 2021,
      edition: '2da Edición',
      pages: 352,
    },
  },
  {
    title: 'Relaciones Públicas y Gestión de Crisis Corporativas',
    code: 'MER-RRPP-011',
    collection: CollectionType.GENERAL,
    location: 'Estante C-4, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-84-309-7811-0',
      author: 'Dennis L. Wilcox, Glen T. Cameron',
      publisher: 'Pearson Alianza',
      publicationYear: 2020,
      edition: '10ma Edición',
      pages: 520,
    },
  },
  {
    title: 'Marketing de Experiencias y Gestión de Fidelidad del Cliente (CX)',
    code: 'MER-EXP-012',
    collection: CollectionType.GENERAL,
    location: 'Estante C-4, Nivel 2',
    career: 'Mercadeo',
    generalData: {
      isbn: '978-607-744-890-1',
      author: 'Bernd H. Schmitt',
      publisher: 'Deusto Ediciones',
      publicationYear: 2023,
      edition: '1ra Edición en Español',
      pages: 390,
    },
  },

  // ==========================================
  // DERECHO (12 Libros)
  // ==========================================
  {
    title: 'Derecho Constitucional General y Teoría del Estado',
    code: 'DER-CON-001',
    collection: CollectionType.GENERAL,
    location: 'Estante D-1, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-958-35-1200-4',
      author: 'Vladimiro Naranjo Mesa',
      publisher: 'Editorial Temis',
      publicationYear: 2021,
      edition: '11va Edición',
      pages: 780,
    },
  },
  {
    title: 'Código Civil Comentado, Concordado y Jurisprudencial',
    code: 'DER-REF-002',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Jurídica - Estante Central',
    career: 'Derecho',
    referenceData: {
      subjectArea: 'Derecho Civil y Obligaciones',
      volumeNumber: 'Tomo I - Personas y Bienes',
      publisher: 'Editorial Legis',
      consultationOnly: true,
    },
  },
  {
    title: 'Teoría General del Proceso y Oralidad Judicial',
    code: 'DER-RES-003',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Ciencias Jurídicas',
    career: 'Derecho',
    reserveData: {
      courseCode: 'DER-302',
      courseName: 'Derecho Procesal General',
      professorName: 'Dr. Hernando Devis Echandía (Cátedra)',
      academicDepartment: 'Departamento de Derecho Procesal',
      semester: '2026-1',
      maxLoanHours: 2,
    },
  },
  {
    title: 'Derecho Penal: Fundamentos de Tipicidad y Culpabilidad',
    code: 'DER-PEN-004',
    collection: CollectionType.GENERAL,
    location: 'Estante D-2, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-950-574-320-1',
      author: 'Claus Roxin, Manuel Gómez Tomillo',
      publisher: 'Civitas Thomson Reuters',
      publicationYear: 2020,
      edition: '4ta Edición',
      pages: 940,
    },
  },
  {
    title: 'Derecho Laboral Individual, Colectivo y Seguridad Social',
    code: 'DER-LAB-005',
    collection: CollectionType.GENERAL,
    location: 'Estante D-2, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-958-767-890-3',
      author: 'Guillermo Camacho Henríquez',
      publisher: 'Editorial Leyer',
      publicationYear: 2022,
      edition: '7ma Edición',
      pages: 690,
    },
  },
  {
    title: 'Derecho Comercial, Sociedades y Títulos Valores',
    code: 'DER-COM-006',
    collection: CollectionType.GENERAL,
    location: 'Estante D-3, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-958-35-1456-5',
      author: 'José Ignacio Narváez García',
      publisher: 'Legis Editores',
      publicationYear: 2021,
      edition: '10ma Edición',
      pages: 820,
    },
  },
  {
    title: 'Derecho Administrativo y Contratación Pública',
    code: 'DER-ADM-007',
    collection: CollectionType.GENERAL,
    location: 'Estante D-3, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-958-710-901-2',
      author: 'Jaime Orlando Santofimio Gamboa',
      publisher: 'Universidad Externado de Colombia',
      publicationYear: 2021,
      edition: '5ta Edición',
      pages: 760,
    },
  },
  {
    title: 'Derecho Internacional Público, Tratados y Jurisdicción Penal Global',
    code: 'DER-RES-008',
    collection: CollectionType.RESERVA,
    location: 'Ventanilla de Reserva Ciencias Jurídicas',
    career: 'Derecho',
    reserveData: {
      courseCode: 'DER-601',
      courseName: 'Derecho Internacional Público y DDHH',
      professorName: 'Dra. Patricia Arismendi',
      academicDepartment: 'Departamento de Derecho Internacional',
      semester: '2026-1',
      maxLoanHours: 3,
    },
  },
  {
    title: 'Diccionario Panhispánico del Español Jurídico (DPEJ)',
    code: 'DER-REF-009',
    collection: CollectionType.REFERENCIA,
    location: 'Sala de Referencia Jurídica - Estante A',
    career: 'Derecho',
    referenceData: {
      subjectArea: 'Terminología y Hermenéutica Jurídica',
      volumeNumber: 'Edición General',
      publisher: 'Real Academia Española (RAE) y Tirant lo Blanch',
      consultationOnly: true,
    },
  },
  {
    title: 'Derecho Tributario Sustantivo y Procedimientos Fiscales',
    code: 'DER-TRI-010',
    collection: CollectionType.GENERAL,
    location: 'Estante D-4, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-958-749-612-4',
      author: 'César García Novoa',
      publisher: 'Marcial Pons',
      publicationYear: 2020,
      edition: '3ra Edición',
      pages: 590,
    },
  },
  {
    title: 'Filosofía del Derecho y Argumentación Jurídica Contemporánea',
    code: 'DER-FIL-011',
    collection: CollectionType.GENERAL,
    location: 'Estante D-4, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-84-8155-780-9',
      author: 'Manuel Atienza',
      publisher: 'Editorial Trotta',
      publicationYear: 2022,
      edition: '6ta Edición',
      pages: 448,
    },
  },
  {
    title: 'Propiedad Intelectual, Marcas y Derecho Digital en la Web',
    code: 'DER-INT-012',
    collection: CollectionType.GENERAL,
    location: 'Estante D-5, Nivel 1',
    career: 'Derecho',
    generalData: {
      isbn: '978-84-9148-311-9',
      author: 'Carlos Rogel Vide',
      publisher: 'Reus Editorial',
      publicationYear: 2023,
      edition: '2da Edición',
      pages: 412,
    },
  },
];

async function seed() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_ybzU3jFdJMr0@ep-royal-union-b4vlro3o-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false },
    entities: [
      Resource,
      GeneralBook,
      ReserveBook,
      ReferenceMaterial,
      Periodical,
      MapItem,
      TechDevice,
    ],
    synchronize: true,
  });

  console.log('🔄 Conectando a la base de datos PostgreSQL en Neon...');
  await dataSource.initialize();
  console.log('✅ Conexión establecida con éxito.');

  const resourceRepo = dataSource.getRepository(Resource);
  const generalBookRepo = dataSource.getRepository(GeneralBook);
  const reserveBookRepo = dataSource.getRepository(ReserveBook);
  const referenceRepo = dataSource.getRepository(ReferenceMaterial);

  let insertedCount = 0;
  let existingCount = 0;

  for (const item of booksToSeed) {
    const existing = await resourceRepo.findOne({
      where: { code: item.code },
    });

    if (existing) {
      existingCount++;
      continue;
    }

    const resource = resourceRepo.create({
      title: item.title,
      code: item.code,
      collection: item.collection,
      status: ResourceStatus.DISPONIBLE,
      location: item.location,
      acquisitionDate: '2026-02-15',
    });

    const savedResource = await resourceRepo.save(resource);

    if (item.collection === CollectionType.GENERAL && item.generalData) {
      const generalBook = generalBookRepo.create({
        ...item.generalData,
        resourceId: savedResource.id,
      });
      await generalBookRepo.save(generalBook);
    } else if (item.collection === CollectionType.RESERVA && item.reserveData) {
      const reserveBook = reserveBookRepo.create({
        ...item.reserveData,
        resourceId: savedResource.id,
      });
      await reserveBookRepo.save(reserveBook);
    } else if (item.collection === CollectionType.REFERENCIA && item.referenceData) {
      const refMaterial = referenceRepo.create({
        ...item.referenceData,
        resourceId: savedResource.id,
      });
      await referenceRepo.save(refMaterial);
    }

    insertedCount++;
  }

  console.log(
    `📚 Sembrado finalizado: ${insertedCount} libros nuevos creados, ${existingCount} ya existían. Total en lote: ${booksToSeed.length}.`,
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Error durante la siembra de libros:', err);
  process.exit(1);
});
