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

Responsável por armazenar e gerenciar as informações do perfil do usuário.

- Criação e atualização de informações do perfil
- Consulta de dados do usuário

## 💳 Subscription Service

Responsável pelo gerenciamento das assinaturas dos usuários, incluindo controle de planos e status de renovação.

- Cadastro, atualização e cancelamento de assinaturas
- Controle de planos (ex: GOLD, DIAMOND)
- Gerenciamento de ciclos de renovação

## 💰 Expense Service

Gerencia as despesas dos usuários, permitindo o controle e acompanhamento de gastos.

- Cadastro, Atualização, Leitura e Exclusão
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
