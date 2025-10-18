# 🪒 Barbershop Backoffice

Sistema de gestão administrativa para barbearia desenvolvido em Angular.

## 📋 Funcionalidades

### 🎯 **Dashboard**
- Métricas em tempo real
- Gráficos de receita e marcações
- Estatísticas de clientes
- Marcações recentes

### 📅 **Calendário**
- Visualização mensal de marcações
- Detalhes por dia
- Filtros por barbeiro/serviço
- Gestão de horários

### 👥 **Gestão de Clientes**
- Lista completa de clientes
- Histórico de marcações
- Dados de contacto
- Estatísticas por cliente

### 📝 **Gestão de Marcações**
- Lista de todas as marcações
- Filtros por status/data
- Aprovação/cancelamento
- Reagendamento

### ✂️ **Gestão de Serviços**
- CRUD de serviços
- Preços e durações
- Categorização
- Estatísticas de popularidade

### 👨‍💼 **Gestão de Barbeiros**
- Perfis dos barbeiros
- Horários de trabalho
- Especialidades
- Performance

## 🛠️ Tecnologias

- **Angular 18+** - Framework principal
- **Angular Material** - Componentes UI
- **Chart.js** - Gráficos e visualizações
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- API Backend rodando (BarbershopAPI)

### Instalação
```bash
# Navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
ng serve

# Acessar em http://localhost:4200
```

### Build para Produção
```bash
ng build --configuration production
```

## 📱 Páginas

- **/dashboard** - Dashboard principal
- **/calendar** - Calendário de marcações
- **/appointments** - Gestão de marcações
- **/customers** - Gestão de clientes
- **/services** - Gestão de serviços
- **/barbers** - Gestão de barbeiros

## 🎨 Design

- **Interface moderna** com Material Design
- **Tema escuro** para a sidebar
- **Responsivo** para mobile e desktop
- **Gráficos interativos** com Chart.js
- **Navegação intuitiva** com sidebar

## 📦 Estrutura do Projeto

```
frontend/
├── src/app/
│   ├── components/layout/    # Layout components
│   ├── pages/               # Páginas principais
│   ├── services/            # Serviços (API, auth)
│   └── models/              # Interfaces TypeScript
├── assets/                  # Recursos estáticos
└── styles/                  # Estilos globais
```

## 🔧 Configuração

O frontend está configurado para se conectar com a API backend existente (BarbershopAPI). Certifique-se de que:

1. A API backend esteja rodando na porta 8080
2. CORS esteja configurado na API
3. As rotas de autenticação estejam funcionando

## 📄 Licença

Projeto desenvolvido para fins educacionais e comerciais.
