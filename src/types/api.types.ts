// ── Respuesta estándar de la API ──
export interface ApiResponse<T> {
  data:    T;
  message: string;
  success: boolean;
}

// ── Error estándar ──
export interface ApiError {
  message:    string;
  statusCode: number;
  errors?:    Record<string, string[]>;
}

// ── Paginación ──
export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
}
