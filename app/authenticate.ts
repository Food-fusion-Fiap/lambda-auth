import jwt from 'jsonwebtoken';
import { Client } from 'pg';
import { getSSMParameter } from './ssm';
import { AuthenticateEvent } from './types';

// Configuração do ambiente
const env = process.env.NODE_ENV || 'development';

// Obtém as configurações do banco de dados e JWT
async function getConfig() {
  console.log('Obtendo configurações do banco de dados...');

  try {
    if (env === 'development') {
      return {
        RDS_ENDPOINT: process.env.RDS_ENDPOINT,
        RDS_DATABASE_NAME: process.env.RDS_DATABASE_NAME,
        RDS_USER: process.env.RDS_USER,
        RDS_PASSWORD: process.env.RDS_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
      };
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
  } catch (error) {
    console.error('Erro ao obter configurações do banco de dados:', error);
    throw new Error('Ocorreu um erro ao buscar as configurações do banco de dados.');
  }
}

// Função Lambda
export const handler = async (event: AuthenticateEvent) => {
  console.log('Iniciando função Lambda...', event);

  try {
    // Obter configurações do banco de dados
    const config = await getConfig();
    console.log('Configurações do banco de dados', config);

    // Conectar ao banco de dados
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

    await client.connect();
    console.log('Conexão com o banco de dados estabelecida.');

    // Buscar usuário no banco de dados
    const query = 'SELECT * FROM users WHERE cpf = $1';
    const result = await client.query(query, [event.cpf]);

    // Verificar se o usuário foi encontrado
    let userId: string | null = null;

    if (result.rows.length) {
      userId = result.rows[0].id;
    }

    // Gerar token JWT
    const token = jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '30m' });

    // Retornar token JWT
    return {
      statusCode: 200,
      body: token,
    };
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Ocorreu um erro ao processar a solicitação.' }),
    };
  }
};

// Teste local (apenas em ambiente de desenvolvimento)
if (env === 'development') {
  handler({ cpf: '12345678900' }).then(console.log);
  handler({ cpf: '123' }).then(console.log);
}
