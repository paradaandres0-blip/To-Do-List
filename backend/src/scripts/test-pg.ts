import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'workflow_academy',
  user: 'postgres',
  password: '1234',
});

const testConnection = async (): Promise<void> => {
  try {
    console.log('Testing database connection with pg...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Test query successful:', result.rows[0]);
    
    await client.end();
    console.log('✅ Database disconnected successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

testConnection();
