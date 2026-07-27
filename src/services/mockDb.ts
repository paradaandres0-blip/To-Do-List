import type { AuthUser } from './authService';

/**
 * Base de datos mock compartida entre servicios.
 * Cuando el admin crea un docente/estudiante, también se crea su cuenta de login aquí.
 */

export interface MockAccount {
  email: string;
  password: string;
  user: AuthUser;
}

// Almacenamiento compartido
let accounts: MockAccount[] = [];

// Inicializar con cuentas demo
const initAccounts = () => {
  accounts = [
    {
      email: 'admin@workflow.academy',
      password: '123456',
      user: {
        id: '1',
        name: 'Super Admin',
        email: 'admin@workflow.academy',
        role: 'admin',
      },
    },
    {
      email: 'docente@workflow.academy',
      password: 'docente123',
      user: {
        id: 'u-t1',
        name: 'Docente Demo',
        email: 'docente@workflow.academy',
        role: 'instructor',
        teacherId: 't1',
        phone: '+57 300 555 0101',
        city: 'Bogotá',
      },
    },
    {
      email: 'estudiante@workflow.academy',
      password: 'estudiante123',
      user: {
        id: 'u-s1',
        name: 'Estudiante Demo',
        email: 'estudiante@workflow.academy',
        role: 'student',
        phone: '+57 320 555 0303',
        city: 'Bogotá',
      },
    },
  ];
};

initAccounts();

export const getMockAccounts = (): MockAccount[] => accounts;

/**
 * Busca una cuenta por email. Útil para login.
 */
export const findMockAccount = (email: string): MockAccount | undefined =>
  accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());

/**
 * Agrega una nueva cuenta mock (cuando se crea un docente/estudiante desde el admin).
 * Genera una contraseña aleatoria de 8 caracteres.
 */
export const addMockAccount = (
  email: string,
  name: string,
  role: 'instructor' | 'student',
  teacherId?: string,
): { password: string } => {
  // Generar contraseña aleatoria: 2 mayúsculas + 4 minúsculas + 2 números
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  let password = '';
  for (let i = 0; i < 2; i++) password += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) password += lower[Math.floor(Math.random() * lower.length)];
  for (let i = 0; i < 2; i++) password += nums[Math.floor(Math.random() * nums.length)];

  // Mezclar
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  // Evitar duplicados - si ya existe, actualizar nombre
  const existing = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    existing.user.name = name;
    return { password: existing.password };
  }

  const newAccount: MockAccount = {
    email: email.trim().toLowerCase(),
    password,
    user: {
      id: `u-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role,
      ...(teacherId ? { teacherId } : {}),
    },
  };
  accounts.push(newAccount);
  return { password };
};

/**
 * Obtiene la contraseña de una cuenta (para mostrarla al admin después de crear un usuario).
 */
export const getPasswordForAccount = (email: string): string | null => {
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  return account?.password ?? null;
};

export const removeMockAccount = (email: string): void => {
  accounts = accounts.filter((a) => a.email.toLowerCase() !== email.trim().toLowerCase());
};