/**
 * Script para resetear las contraseñas de los 3 usuarios de prueba.
 * Ejecutar con: node backend/scripts/reset-test-users.js
 *
 * Los usuarios se registran en la base de datos con la contraseña: 123456
 * (que es la que muestra la pantalla de login del frontend).
 *
 * Usa pg directamente para evitar problemas con Prisma Client.
 * La conexión se hace a través del puerto 5432 del contenedor Docker.
 */
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Probar diferentes contraseñas para el contenedor Docker
const passwords = ['1234', 'postgres123', 'postgres', 'password', 'admin'];

async function tryConnect() {
  for (const pwd of passwords) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'workflow_academy',
      user: 'postgres',
      password: pwd,
    });
    try {
      await client.connect();
      console.log(`✅ Conexión exitosa con password: ${pwd}`);
      return client;
    } catch (e) {
      // Intentar siguiente
    }
  }
  throw new Error('No se pudo conectar con ninguna contraseña');
}

async function main() {
  const client = await tryConnect();

  const hash = await bcrypt.hash('123456', 10);

  const users = [
    { email: 'admin@workflow.academy', name: 'Administrador', role: 'ADMIN' },
    { email: 'docente@workflow.academy', name: 'Docente Demo', role: 'INSTRUCTOR' },
    { email: 'estudiante@workflow.academy', name: 'Estudiante Demo', role: 'STUDENT' },
  ];

  for (const u of users) {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);

    if (existing.rows.length > 0) {
      await client.query(
        'UPDATE users SET password = $1, name = $2, role = $3 WHERE email = $4',
        [hash, u.name, u.role, u.email]
      );
      console.log(`✅ ${u.email} -> password actualizada: 123456`);
    } else {
      await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        [u.email, hash, u.name, u.role]
      );
      console.log(`✅ ${u.email} -> usuario creado con password: 123456`);
    }
  }

  console.log('\n🎉 Listo. Los 3 usuarios están registrados con la contraseña: 123456');
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(async () => {
    try { await client.end(); } catch {}
  });