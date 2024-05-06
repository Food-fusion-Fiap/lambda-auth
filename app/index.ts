import 'source-map-support/register';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { Client } from 'pg';

// Configuração do ambiente
const env = process.env.NODE_ENV || 'development';

// Configuração do cliente SSM
const ssmClient = new SSMClient({ region: 'us-east-1' });

// Função para obter parâmetro do SSM
async function getSSMParameter(parameterName: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: `/food_fusion/${parameterName}`,
    WithDecryption: true
  });

  const response = await ssmClient.send(command);

  if (!response.Parameter?.Value) {
    throw new Error(`Não foi possível encontrar o parâmetro ${parameterName} no SSM.`);
  }

  return response.Parameter.Value;
}

async function getConfig() {
  if (env === 'development') {
    return {
      RDS_ENDPOINT: 'localhost',
      RDS_DATABASE_NAME: 'postgres',
      RDS_USER: 'postgres',
      RDS_PASSWORD: '12345678',
    }
  }

  const RDS_ENDPOINT = await getSSMParameter('db_host');
  const RDS_DATABASE_NAME = await getSSMParameter('db_name');
  const RDS_USER = await getSSMParameter('db_username');
  const RDS_PASSWORD = await getSSMParameter('db_password');

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
  const { cpf } = event;

  const config = await getConfig();

  // Configurações do banco de dados
  const client = new Client({
    host: config.RDS_ENDPOINT,
    database: config.RDS_DATABASE_NAME,
    user: config.RDS_USER,
    password: config.RDS_PASSWORD,
    port: 5432,
  });
  await client.connect();

  try {
    // INSERT
    const insertQuery = 'INSERT INTO users (cpf) VALUES ($1)';
    await client.query(insertQuery, [cpf]);
    const query = 'SELECT * FROM users WHERE cpf = $1';
    const result = await client.query(query, [cpf]);

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
}