## lambda-auth

Este repositório contém o código para duas funções Lambda que desempenham papéis essenciais em um sistema de autenticação e autorização:

1. **`authenticate`**: Esta função Lambda verifica se um usuário está autenticado e retorna as informações do JWT.

2. **`authorizer`**: Esta função Lambda consulta um banco de dados RDS PostgreSQL para verificar se um usuário existe.

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado localmente
- Acesso ao AWS Console para configurar as Lambdas, o RDS PostgreSQL e outros recursos necessários.

### Configuração

1. Clone o repositório:

    ```bash
    git clone https://github.com/Food-Fusion-Fiap/lambda-auth.git
    ```

2. Instale as dependências:

    ```bash
    cd lambda-auth
    npm install
    ```

### Uso

Para implantar as funções Lambda, você pode usar o repositório [terraform-lambda](https://github.com/Food-Fusion-Fiap/terraform-lambda/) ou implantá-las manualmente no AWS Lambda Console.

### Detalhes da Implementação

#### Função `authenticate`

Esta função recebe um CPF como entrada e retorna um token JWT válido se o usuário estiver autenticado.

#### Função `authorizer`

Esta função consulta o banco de dados RDS PostgreSQL para verificar se um usuário com o CPF fornecido existe.

### Contribuição

Contribuições são bem-vindas! Se você encontrar algum problema ou quiser adicionar novos recursos, sinta-se à vontade para abrir uma issue ou enviar um pull request.

### Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
