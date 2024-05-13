import jwt from 'jsonwebtoken';

export interface UserPayload extends jwt.JwtPayload {
  sub: string;
  name: string;
  iat: number;
  exp: number;
}

export type AuthenticateEvent = {
  cpf: string;
};

export type AuthorizerEvent = {
  type: string
  authorizationToken: string
  methodArn: string
  /* "version": string,
  "type": string,
  "routeArn": string,
  "identitySource": string[],
  "routeKey": string,
  "rawPath": string,
  "rawQueryString": string,
  "cookies": string[],
  "headers": Map<string,string>,
  "queryStringParameters": Map<string,string>,
  "requestContext": {
      "accountId": string,
      "apiId": string,
      "authentication": {
      "clientCert": {
          "clientCertPem": string,
          "subjectDN": string,
          "issuerDN": string,
          "serialNumber": string,
          "validity": {
          "notBefore": string,
          "notAfter": string,
          }
      }
      },
      "domainName": string,
      "domainPrefix": string,
      "http": {
      "method": string,
      "path": string,
      "protocol": string,
      "sourceIp": string,
      "userAgent": string
      },
      "requestId": string,
      "routeKey": string,
      "stage": string,
      "time": string,
      "timeEpoch": number
  },
  "pathParameters": Map<string,string>,
  "stageVariables": Map<string,string>,
  methodArn: string */
}

export type AuthorizerResponse = {
  "policyDocument": {
    "Version": string,
    "Statement": {
      Action: string,
      Effect: string,
      Resource: string
    }[]
  },
  "context": {
    userId: null | number
  },
  "principalId": string
}
