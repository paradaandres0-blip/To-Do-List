import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';
import { studentSchema } from './student.schema';
import { teacherSchema } from './teacher.schema';

describe('schemas de autenticación', () => {
  it('rechaza credenciales incompletas o inválidas', () => {
    const result = loginSchema.safeParse({ email: 'correo-invalido', password: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain('Ingresa un correo electrónico válido');
  });

  it('requiere que la confirmación de registro coincida', () => {
    const result = registerSchema.safeParse({
      name: 'Ana Gómez', email: 'ana@example.com', password: 'secreta', confirm: 'otra',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Las contraseñas no coinciden');
  });
});

describe('schemas de gestión', () => {
  it('acepta un estudiante válido', () => {
    expect(studentSchema.safeParse({
      name: 'María García', email: 'maria@example.com', phone: '+57 300 000 0000',
      program: 'Mindfulness', group: 'Grupo A', status: 'Activo',
    }).success).toBe(true);
  });

  it('requiere al menos una especialidad para un docente', () => {
    const result = teacherSchema.safeParse({
      name: 'Ana Gómez', email: 'ana@example.com', phone: '+57 300 000 0000',
      city: 'Bogotá', specialties: [], status: 'Activo',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Selecciona al menos una especialidad');
  });
});
