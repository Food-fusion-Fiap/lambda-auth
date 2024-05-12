import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import jwt from 'jsonwebtoken';
import { Client } from 'pg';

// Configuração do ambiente
const env = process.env.NODE_ENV || 'development';

// Configuração do cliente SSM
const ssmClient = new SSMClient({ region: 'us-east-1' });

// Função para obter parâmetro do SSM
async function getSSMParameter(parameterName: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: `/food_fusion/${parameterName}`,
    WithDecryption: true,
  });

  const response = await ssmClient.send(command);

  if (!response.Parameter?.Value) {
    throw new Error(`Não foi possível encontrar o parâmetro ${parameterName} no SSM.`);
  }

  return response.Parameter.Value;
}

async function getConfig() {
  console.log('Obtendo configurações do banco de dados...');

  if (env === 'development') {
    return {
      RDS_ENDPOINT: process.env.RDS_ENDPOINT,
      RDS_DATABASE_NAME: process.env.RDS_DATABASE_NAME,
      RDS_USER: process.env.RDS_USER,
      RDS_PASSWORD: process.env.RDS_PASSWORD,
      JWT_SECRET: process.env.JWT_SECRET,
    }
  }

  const RDS_ENDPOINT = (await getSSMParameter('db_host')).replace(':5432', '');
  const RDS_DATABASE_NAME = await getSSMParameter('db_name');
  const RDS_USER = await getSSMParameter('db_username');
  const RDS_PASSWORD = await getSSMParameter('db_password');
  const JWT_SECRET = await getSSMParameter('jwt_secret');

  return {
    RDS_ENDPOINT,
    RDS_DATABASE_NAME,
    RDS_USER,
    RDS_PASSWORD,
    JWT_SECRET,
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
    console.log('Configurações do banco de dados', config);
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
    console.log('Conectando ao banco de dados...');
    await client.connect();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ocorreu um erro ao conectar ao banco de dados.' }),
    };
  }

  console.log('Conexão com o banco de dados estabelecida.');

  try {
    const query = 'SELECT * FROM users WHERE cpf = $1';
    const result = await client.query(query, [event.cpf]);

    const options: jwt.SignOptions = {
      expiresIn: '30m', // Token expires in 30 minutes
    };

    let payload = {
      userId: null as any,
    };

    if (result.rows.length) {
      payload.userId = result.rows[0].id;
    }

    const token = jwt.sign(payload, config.JWT_SECRET, options);

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
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
