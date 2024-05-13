import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Configuração do cliente SSM
const ssmClient = new SSMClient({ region: 'us-east-1' });

// Função para obter parâmetro do SSM
export async function getSSMParameter(parameterName: string): Promise<string> {
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
