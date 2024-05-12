import { Client } from 'pg';

// Configuração do ambiente
const env = process.env.NODE_ENV || 'development';

async function getConfig() {
  if (env === 'development') {
    return {
      RDS_ENDPOINT: 'postgres.cl4qcumy8f7j.us-east-1.rds.amazonaws.com',
      RDS_DATABASE_NAME: 'postgres',
      RDS_USER: 'postgres',
      RDS_PASSWORD: 'foobarbaz',
    }
  }

  console.log('Obtendo configurações do banco de dados...');

  const RDS_ENDPOINT = process.env.RDS_ENDPOINT.replace(':5432', '');
  const RDS_DATABASE_NAME = process.env.RDS_DATABASE_NAME;
  const RDS_USER = process.env.RDS_USER;
  const RDS_PASSWORD = process.env.RDS_PASSWORD;

  return {
    RDS_ENDPOINT,
    RDS_DATABASE_NAME,
    RDS_USER,
    RDS_PASSWORD,
  };
}

type EventData = {
  cpf: string;
};

// Função Lambda
export const handler = async (event: EventData) => {
  console.log('Iniciando função Lambda...', event);

  let config;

  // Obter configurações do banco de dados
  try {
    config = await getConfig();
  } catch (error) {
    console.error('Erro ao obter configurações do banco de dados:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ocorreu um erro ao buscar as configurações do banco de dados.' }),
    };
  }

  // Conecta ao banco de dados
  const client = new Client({
    host: config.RDS_ENDPOINT,
    database: config.RDS_DATABASE_NAME,
    user: config.RDS_USER,
    password: config.RDS_PASSWORD,
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);

    throw error;
  }

  console.log('Conexão com o banco de dados estabelecida.');

  try {
    const query = 'SELECT * FROM users WHERE cpf = $1';
    const result = await client.query(query, [event.cpf]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Usuário não encontrado.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Erro ao buscar o usuário:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ocorreu um erro ao buscar o usuário.' }),
    };
  } finally {
    await client.end();
  }
};

if (env === 'development') {
  handler({ cpf: '12345678900' }).then(console.log);
  handler({ cpf: '123' }).then(console.log);
}
