# Minhas Despesas - Microservices

<p>🚀 Aplicação voltada para administração de despesas</p>

---

### Descrição dos Microsserviços

## 🧑‍💼 Account Service

Responsável pelo gerenciamento da autenticação e credenciais dos usuários, garantindo segurança e controle de acesso.

- Autenticação
- Gerenciamento de credenciais (e-mail e senha)
- Recuperação de senha
- Exclusão

## 📊 Profile Service

Responsável por armazenar e gerenciar as informações do perfil.

- Criação e atualização de informações do perfil
- Consulta do perfil

## 💳 Subscription Service

Responsável pelo gerenciamento das assinaturas dos usuários.

- Cadastro, atualização e cancelamento de assinaturas

## 💰 Expense Service

Gerencia as despesas dos usuários, permitindo o controle e acompanhamento de gastos.

- Cadastro, Atualização, Leitura e Exclusão de Despesas
- Gerenciamento de Pagamento das Despesas

## 🔔 Notification Service

Responsável por enviar notificações aos usuários, garantindo a comunicação de eventos relevantes.

- Envio de notificações por e-mail

---

# Tecnologias
- Node
- Typescript
- DynamoDB
- SQS
- SNS
- S3
- Middy
- Jest
