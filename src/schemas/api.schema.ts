import { z } from 'zod';

// ── Helper: alias para z.record compatible con Zod v3+ ──
const stringArrayRecord = z.object({}).passthrough() as z.ZodType<Record<string, string[]>>;

// ── Esquema para ApiResponse<T> ──
// Usamos `z.unknown()` para el campo `data` porque T es genérico.
// Luego se puede refinar con un esquema específico según el endpoint.
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    success: z.boolean(),
  });

// ── Esquema para PaginatedResponse<T> ──
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

// ── Esquema para ApiError ──
export const apiErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number().int(),
  errors: stringArrayRecord.optional(),
});

// ── Esquema genérico de respuesta (sin tipado específico de data) ──
export const genericApiResponseSchema = z.object({
  data: z.unknown(),
  message: z.string(),
  success: z.boolean(),
});

// ── Esquema genérico de respuesta paginada ──
export const genericPaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// ── Tipo inferido ──
export type ValidatedApiResponse = z.infer<typeof genericApiResponseSchema>;
export type ValidatedPaginatedResponse = z.infer<typeof genericPaginatedResponseSchema>;
export type ValidatedApiError = z.infer<typeof apiErrorSchema>;