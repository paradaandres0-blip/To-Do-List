/**
 * Perfil de Docente (Teacher)
 *
 * Contrato pensado para un backend real con PostgreSQL.
 * El service consume `/teachers` y el shape se mantiene.
 *
 * Tabla sugerida (PostgreSQL):
 *   teachers (
 *     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name         VARCHAR(120) NOT NULL,
 *     email        VARCHAR(180) NOT NULL UNIQUE,
 *     phone        VARCHAR(40)  NOT NULL,
 *     city         VARCHAR(100) NOT NULL,
 *     specialties  TEXT[]       NOT NULL DEFAULT '{}',
 *     status       VARCHAR(20)  NOT NULL DEFAULT 'Activo',
 *     created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 *     updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
 *   )
 *
 * En la API JSON se usa camelCase; el backend puede mapear a snake_case.
 */

export type TeacherStatus = 'Activo' | 'Inactivo' | 'Licencia';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  specialties: string[];
  status: TeacherStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload para crear docente (admin). */
export type CreateTeacherPayload = {
  name: string;
  email: string;
  phone: string;
  city: string;
  specialties?: string[];
  status?: TeacherStatus;
  password?: string;
};

/** Payload parcial para actualizar / completar el perfil. */
export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;

/** Formulario de creación / edición en UI. */
export type TeacherFormValues = {
  name: string;
  email: string;
  phone: string;
  city: string;
  specialties: string[];
  status: TeacherStatus;
  password?: string;
};
