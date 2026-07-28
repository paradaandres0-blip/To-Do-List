import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Hash de contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Verificar contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generar access token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRATION as any });
};

// Generar refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION as any });
};

// Verificar access token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

// Verificar refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

// Registrar usuario
export const register = async (email: string, password: string, name: string, role?: string) => {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hash de la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: (role as any) || 'STUDENT',
    },
  });

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  const student = await prisma.student.findUnique({ where: { userId: user.id } });

  // Generar tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teacherId: teacher?.id,
      studentId: student?.id,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

// Login
export const login = async (email: string, password: string) => {
  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar contraseña
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  const student = await prisma.student.findUnique({ where: { userId: user.id } });

  const normalizeStatus = (status?: string | null): string => {
    const upper = (status ?? '').toUpperCase();
    if (upper === 'ACTIVO' || upper === 'ACTIVE') return 'Activo';
    if (upper === 'INACTIVO' || upper === 'INACTIVE') return 'Inactivo';
    if (upper === 'LICENCIA') return 'Licencia';
    return status ?? 'Activo';
  };

  if (teacher) {
    const normalizedStatus = normalizeStatus(teacher.status);
    if (normalizedStatus !== 'Activo') {
      throw new Error('El docente se encuentra inactivo y no puede ingresar al sistema');
    }
  }

  if (student) {
    if (!student.active) {
      throw new Error('El centro se encuentra desactivado por lo tanto el usuario no puede ingresar a su tablero');
    }

    const group = await prisma.group.findFirst({
      where: { name: student.group },
      select: { center: { select: { active: true } } },
    });

    if (group?.center?.active === false) {
      throw new Error('El centro se encuentra desactivado por lo tanto el usuario no puede ingresar a su tablero');
    }
  }

  // Generar tokens
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teacherId: teacher?.id,
      studentId: student?.id,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

// Refresh token
export const refreshToken = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
    const student = await prisma.student.findUnique({ where: { userId: user.id } });

    // Generar nuevos tokens
    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teacherId: teacher?.id,
        studentId: student?.id,
      },
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

// Logout (en una implementación real, invalidaríamos el refresh token en una blacklist)
export const logout = async () => {
  // En una implementación con blacklist de tokens, aquí agregaríamos el token a la lista negra
  return { message: 'Logout exitoso' };
};

// Forgot password (generar token de reset)
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Por seguridad, no revelamos si el email existe o no
    return { message: 'Si el email existe, se enviará un correo de recuperación' };
  }

  // Generar token de reset (en producción, esto se enviaría por email)
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // En una implementación real, aquí enviaríamos el email con el token
  console.log(`Reset token for ${email}: ${resetToken}`);

  return { message: 'Si el email existe, se enviará un correo de recuperación' };
};

// Reset password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Change password (requiere autenticación)
export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isPasswordValid = await verifyPassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Hash de la nueva contraseña
  const hashedPassword = await hashPassword(newPassword);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Contraseña actualizada exitosamente' };
};
