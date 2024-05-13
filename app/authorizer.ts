import jwt from 'jsonwebtoken';
import { getSSMParameter } from './ssm';
import { AuthorizerEvent, AuthorizerResponse, UserPayload } from './types';

// Obtém as configurações da lambda, incluindo o segredo JWT
async function getConfig(): Promise<{ JWT_SECRET: string }> {
  console.log('Obtendo configurações da lambda...');

  try {
    // Em ambiente de desenvolvimento, o segredo é obtido do ambiente
    if (process.env.NODE_ENV === 'development') {
      return {
        JWT_SECRET: process.env.JWT_SECRET || '',
      };
    }

    // Em outros ambientes, o segredo é obtido do SSM
    const JWT_SECRET = await getSSMParameter('jwt_secret');

    return {
      JWT_SECRET,
    };
  } catch (error) {
    console.error('Erro ao obter configurações do banco de dados:', error);
    throw new Error('Ocorreu um erro ao buscar as configurações do banco de dados.');
  }
}

// Função de autorização
export const handler = async (event: AuthorizerEvent): Promise<AuthorizerResponse> => {
  console.log('Iniciando função Lambda...', event);

  // Obtém as configurações da lambda
  const config = await getConfig();
  console.log('Configurações da lambda', config);

  // Define as políticas de autorização
  const DenyPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Deny",
        "Resource": event.methodArn,
      }
    ]
  };

  const AllowPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Allow",
        "Resource": event.methodArn,
      }
    ]
  };

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(event.authorizationToken, config.JWT_SECRET) as UserPayload;
    console.log('Token válido:', decoded);

    // Retorna uma resposta de autorização bem-sucedida
    return {
      principalId: "user",
      policyDocument: AllowPolicy,
      context: {
        "userId": decoded.userId,
      }
    };
  } catch (err: any) {
    // Retorna uma resposta de autorização negada
    console.error('Erro ao verificar o token:', err.message);

    return {
      principalId: "user",
      policyDocument: DenyPolicy,
      context: {
        "userId": null,
      }
    };
  }
};
