// Tipos de Usuarios y Roles
export enum UserRole {
  ESTUDIANTE = 'ESTUDIANTE',
  PROFESOR = 'PROFESOR',
  BIBLIOTECARIO = 'BIBLIOTECARIO',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  identification: string;
  code: string;
  fullName: string;
  email: string;
  role: UserRole;
  academicPlan?: string;
  semester?: number;
  password?: string;
  createdById?: string;
  createdBy?: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos de Colecciones y Recursos
export enum CollectionType {
  GENERAL = 'General',
  RESERVA = 'Reserva',
  REFERENCIA = 'Referencia',
  HEMEROTECA = 'Hemeroteca',
  MAPOTECA = 'Mapoteca',
  TECNOTECA = 'Tecnoteca',
}

export enum ResourceStatus {
  DISPONIBLE = 'Disponible',
  PRESTADO = 'Prestado',
  RESERVADO = 'Reservado',
  PERDIDO = 'Perdido',
  DADO_DE_BAJA = 'Dado de baja',
}

export interface GeneralBook {
  id: string;
  resourceId: string;
  isbn?: string;
  author: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  pages?: number;
}

export interface ReserveBook {
  id: string;
  resourceId: string;
  courseCode: string;
  courseName: string;
  professorName: string;
  academicDepartment: string;
  semester?: string;
  maxLoanHours: number;
}

export interface ReferenceMaterial {
  id: string;
  resourceId: string;
  volumeNumber?: string;
  subjectArea: string;
  publisher?: string;
  consultationOnly: boolean;
}

export interface Periodical {
  id: string;
  resourceId: string;
  issn?: string;
  issueNumber?: string;
  volume?: string;
  publicationDate?: string;
  periodicity?: string;
}

export interface MapItem {
  id: string;
  resourceId: string;
  scale: string;
  geographicArea: string;
  projectionType?: string;
  cartographer?: string;
  dimensions?: string;
}

export enum TechDeviceType {
  LAPTOP = 'LAPTOP',
  TABLET = 'TABLET',
}

export interface TechDevice {
  id: string;
  resourceId: string;
  deviceType: TechDeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  hasCharger: boolean;
  hasStylus: boolean;
  specifications?: string;
}

export interface Resource {
  id: string;
  title: string;
  code: string;
  collection: CollectionType;
  status: ResourceStatus;
  location?: string;
  acquisitionDate?: string;
  generalBook?: GeneralBook;
  reserveBook?: ReserveBook;
  referenceMaterial?: ReferenceMaterial;
  periodical?: Periodical;
  mapItem?: MapItem;
  techDevice?: TechDevice;
  createdAt: string;
  updatedAt: string;
}

// Gestión de Préstamos
export enum LoanStatus {
  ACTIVO = 'ACTIVO',
  DEVUELTO = 'DEVUELTO',
  VENCIDO = 'VENCIDO',
}

export interface Loan {
  id: string;
  userId: string;
  user?: User;
  resourceId: string;
  resource?: Resource;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cola de Reservaciones
export enum ReservationStatus {
  PENDIENTE = 'PENDIENTE',
  ASIGNADA = 'ASIGNADA',
  CANCELADA = 'CANCELADA',
  EXPIRADA = 'EXPIRADA',
}

export interface Reservation {
  id: string;
  userId: string;
  user?: User;
  resourceId?: string;
  resource?: Resource;
  category: string;
  queuePosition: number;
  status: ReservationStatus;
  reservationDate: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Renovaciones
export interface Renewal {
  id: string;
  loanId: string;
  loan?: Loan;
  renewalDate: string;
  previousDueDate: string;
  newDueDate: string;
  renewalNumber: number;
  createdAt: string;
}

// Multas y Moras
export enum FineStatus {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  CONDONADA = 'CONDONADA',
}

export interface Fine {
  id: string;
  userId: string;
  user?: User;
  loanId?: string;
  loan?: Loan;
  daysOverdue: number;
  amount: number;
  status: FineStatus;
  reason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Respuestas de API estándar
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// Interfaces de Autenticación
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

