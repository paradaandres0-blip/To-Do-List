/**
 * Extrae un mensaje legible a partir de un error lanzado por la capa de
 * servicios (axios o un objeto plano `{ response: { data: { message } } }`).
 *
 * Evita el uso de `any` y centraliza la lógica de "¿qué mensaje muestro?".
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const e = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (e.response?.data?.message) return e.response.data.message;
    if (typeof e.message === 'string' && e.message.length > 0) return e.message;
  }
  return fallback;
};