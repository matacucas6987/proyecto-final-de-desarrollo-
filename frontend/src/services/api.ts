import apiClient from '../api/client';
import {
  ApiResponse,
  User,
  Resource,
  Loan,
  Reservation,
  Renewal,
  Fine,
  CollectionType,
  ResourceStatus,
  LoanStatus,
  FineStatus,
  ReservationStatus,
  AuthResponse,
  LoginCredentials,
} from '../types';

// Servicios para Autenticación
export const authService = {
  login: async (credentials: LoginCredentials) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data.data;
  },
};

// Servicios para Usuarios
export const usersService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },
  getByCode: async (code: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/code/${code}`);
    return res.data.data;
  },
  create: async (data: Partial<User>) => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<User>) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return res.data.data;
  },
};

// Servicios para Recursos
export const resourcesService = {
  getAll: async (collection?: CollectionType, status?: ResourceStatus) => {
    const params: Record<string, string> = {};
    if (collection) params.collection = collection;
    if (status) params.status = status;
    const res = await apiClient.get<ApiResponse<Resource[]>>('/resources', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<Resource> & { collectionData?: Record<string, unknown> }) => {
    const res = await apiClient.post<ApiResponse<Resource>>('/resources', data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: ResourceStatus) => {
    const res = await apiClient.patch<ApiResponse<Resource>>(`/resources/${id}/status`, { status });
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/resources/${id}`);
    return res.data.data;
  },
};

// Servicios para Préstamos
export const loansService = {
  getAll: async (status?: LoanStatus) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await apiClient.get<ApiResponse<Loan[]>>('/loans', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data.data;
  },
  getByUser: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<Loan[]>>(`/loans/user/${userId}`);
    return res.data.data;
  },
  create: async (data: { userId: string; resourceId: string; dueDate: string; notes?: string }) => {
    const res = await apiClient.post<ApiResponse<Loan>>('/loans', data);
    return res.data.data;
  },
  returnResource: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Loan>>(`/loans/${id}/return`);
    return res.data.data;
  },
};

// Servicios para Reservas
export const reservationsService = {
  getAll: async (status?: ReservationStatus) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await apiClient.get<ApiResponse<Reservation[]>>('/reservations', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Reservation>>(`/reservations/${id}`);
    return res.data.data;
  },
  create: async (data: { userId: string; resourceId?: string; category?: string }) => {
    const res = await apiClient.post<ApiResponse<Reservation>>('/reservations', data);
    return res.data.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}/cancel`);
    return res.data.data;
  },
  updateStatus: async (id: string, status: ReservationStatus) => {
    const res = await apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}/status`, { status });
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/reservations/${id}`);
    return res.data.data;
  },
};

// Servicios para Renovaciones
export const renewalsService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Renewal[]>>('/renewals');
    return res.data.data;
  },
  getByLoan: async (loanId: string) => {
    const res = await apiClient.get<ApiResponse<Renewal[]>>(`/renewals/loan/${loanId}`);
    return res.data.data;
  },
  create: async (data: { loanId: string; newDueDate: string }) => {
    const res = await apiClient.post<ApiResponse<Renewal>>('/renewals', data);
    return res.data.data;
  },
};

// Servicios para Multas
export const finesService = {
  getAll: async (status?: FineStatus) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await apiClient.get<ApiResponse<Fine[]>>('/fines', { params });
    return res.data.data;
  },
  getByUser: async (userId: string) => {
    const res = await apiClient.get<ApiResponse<Fine[]>>(`/fines/user/${userId}`);
    return res.data.data;
  },
  create: async (data: {
    userId: string;
    loanId?: string;
    daysOverdue?: number;
    amount: number;
    reason?: string;
    status?: FineStatus;
  }) => {
    const res = await apiClient.post<ApiResponse<Fine>>('/fines', data);
    return res.data.data;
  },
  payFine: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Fine>>(`/fines/${id}/pay`);
    return res.data.data;
  },
  waiveFine: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Fine>>(`/fines/${id}/waive`);
    return res.data.data;
  },
};
