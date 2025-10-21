# Barbershop Backoffice

Sistema completo de gestão para barbearia com frontend Angular e backend Spring Boot.

## 🚀 Funcionalidades Implementadas

### 📊 Dashboard
- **Visão geral** com métricas em tempo real
- **Gráficos interativos** de marcações e serviços
- **Marcações recentes** do dia
- **Estatísticas** de clientes, receita e serviços

### 📅 Calendário
- **Visualização mensal** das marcações
- **Criação de marcações** com seleção de barbeiro, cliente e serviço
- **Filtros por barbeiro** e data
- **Painel lateral** com detalhes das marcações

### 📋 Gestão de Marcações
- **Listagem completa** com filtros por barbeiro e data
- **Criação, edição e cancelamento** de marcações
- **Status das marcações** (Confirmado, Pendente, Cancelado)
- **Tabela responsiva** com ações rápidas

### 👥 Gestão de Barbeiros
- **CRUD completo** para barbeiros
- **Status ativo/inativo** dos barbeiros
- **Formulários de criação e edição**
- **Listagem com ações** (editar, desativar)

### 👤 Gestão de Clientes
- **CRUD completo** para clientes
- **Dados pessoais** (nome, telefone, email)
- **Sistema de autenticação** integrado
- **Formulários validados**

### 🔧 Gestão de Serviços
- **CRUD completo** para serviços
- **Configuração de duração** e preços
- **Buffer entre serviços**
- **Status ativo/inativo**

## 🛠️ Tecnologias Utilizadas

### Frontend (Angular 20)
- **Angular Material** para componentes UI
- **Chart.js** para gráficos
- **date-fns** para manipulação de datas
- **RxJS** para programação reativa
- **TypeScript** para tipagem estática

### Backend (Spring Boot 3.4.8)
- **Spring Data JPA** para persistência
- **Spring Security** para autenticação
- **JWT** para tokens de acesso
- **PostgreSQL** para produção
- **H2** para desenvolvimento
- **Flyway** para migrações

## 📁 Estrutura do Projeto

```
BarbershopBackoffice/
├── frontend/                 # Aplicação Angular
│   ├── src/app/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais
│   │   │   ├── dashboard/   # Dashboard principal
│   │   │   ├── calendar/     # Calendário de marcações
│   │   │   ├── appointments/ # Gestão de marcações
│   │   │   ├── barbers/      # Gestão de barbeiros
│   │   │   ├── customers/    # Gestão de clientes
│   │   │   └── services/     # Gestão de serviços
│   │   └── services/        # Serviços Angular
│   └── dist/                # Build de produção
└── backend/                 # API Spring Boot (BarbershopAPI)
    └── src/main/java/
        └── barbershopAPI/
            ├── controllers/ # Controladores REST
            ├── entities/   # Entidades JPA
            ├── services/   # Lógica de negócio
            └── repositories/ # Repositórios JPA
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ e npm
- Java 17+
- PostgreSQL (para produção)

### Frontend
```bash
cd frontend
npm install
npm start
```
Acesse: http://localhost:4200

### Backend
```bash
cd ../BarbershopAPI
./mvnw spring-boot:run
```
API disponível em: http://localhost:8000

## 🔧 Configuração

### Variáveis de Ambiente
- **Frontend**: URL da API configurada em `src/app/services/api.ts`
- **Backend**: Configurações em `application.properties`

### Banco de Dados
- **Desenvolvimento**: H2 (memória)
- **Produção**: PostgreSQL
- **Migrações**: Flyway automático

## 📱 Funcionalidades por Página

### Dashboard
- ✅ Métricas em tempo real
- ✅ Gráficos de marcações por semana
- ✅ Gráfico de serviços populares
- ✅ Lista de marcações recentes

### Calendário
- ✅ Visualização mensal
- ✅ Criação de marcações
- ✅ Filtros por barbeiro
- ✅ Painel de detalhes

### Marcações
- ✅ Listagem com filtros
- ✅ Criação de marcações
- ✅ Cancelamento de marcações
- ✅ Status das marcações

### Barbeiros
- ✅ Listagem de barbeiros
- ✅ Criação de barbeiros
- ✅ Edição de barbeiros
- ✅ Desativação de barbeiros

### Clientes
- ✅ Listagem de clientes
- ✅ Criação de clientes
- ✅ Edição de clientes
- ✅ Exclusão de clientes

### Serviços
- ✅ Listagem de serviços
- ✅ Criação de serviços
- ✅ Edição de serviços
- ✅ Desativação de serviços

## 🎨 Design System

- **Material Design** com Angular Material
- **Cores personalizadas** para a barbearia
- **Responsivo** para mobile e desktop
- **Acessibilidade** seguindo padrões WCAG

## 🔒 Segurança

- **Autenticação JWT** no backend
- **Validação de formulários** no frontend
- **CORS configurado** para desenvolvimento
- **Sanitização de dados** de entrada

## 📈 Performance

- **Lazy loading** de componentes
- **Otimização de imagens**
- **Cache de dados** no frontend
- **Paginação** em listagens grandes

## 🧪 Testes

- **Testes unitários** para componentes
- **Testes de integração** para APIs
- **Validação de formulários**
- **Testes de responsividade**

## 🚀 Deploy

### Frontend
```bash
npm run build
# Deploy do conteúdo da pasta dist/
```

### Backend
```bash
./mvnw clean package
java -jar target/barbershopAPI-0.0.1-SNAPSHOT.jar
```

## 📝 Próximos Passos

- [ ] Sistema de autenticação no frontend
- [ ] Notificações em tempo real
- [ ] Relatórios avançados
- [ ] Integração com pagamentos
- [ ] App mobile

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para barbearias modernas**