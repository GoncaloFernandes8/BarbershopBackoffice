# 🎨 Referência Rápida de Cores - Backoffice

## 🚦 **Quando Usar Cada Cor**

### **🤍 BRANCO/CLARO - Texto Normal**
```css
color: #e9eef7;        /* Texto principal */
color: #cbd4e6;        /* Texto secundário */
color: #a0a7b4;        /* Texto terciário */
```

**Exemplos de uso:**
- ✅ Títulos de páginas
- ✅ Nomes de clientes
- ✅ Descrições de serviços
- ✅ Labels de formulários
- ✅ Conteúdo em geral

**HTML:**
```html
<h1>Dashboard</h1>              <!-- #e9eef7 -->
<p>Bem-vindo ao sistema</p>     <!-- #cbd4e6 -->
<span class="muted">Info</span> <!-- #a0a7b4 -->
```

---

### **💚 VERDE NEON - Ações e Destaques**
```css
color: #C3FF5A;        /* Verde neon */
color: #b8ff47;        /* Verde hover */
```

**Exemplos de uso:**
- ✅ Botões de ação (guardar, confirmar)
- ✅ Links ativos
- ✅ Menu ativo
- ✅ Hover em elementos interativos
- ✅ Ícones importantes
- ✅ Borders em foco

**HTML:**
```html
<button class="primary">Guardar</button>     <!-- Fundo verde -->
<a class="active">Marcações</a>              <!-- Texto verde -->
<div class="card focused">...</div>          <!-- Border verde -->
```

**CSS Comum:**
```css
/* Botão primário */
.btn-primary {
  background: #C3FF5A;
  color: #000;  /* Preto para contraste */
}

/* Link ativo */
.nav-link.active {
  color: #C3FF5A;
}

/* Hover */
.card:hover {
  border-color: #C3FF5A;
}
```

---

### **🔵 AZUL - Status "Pendente" ou "Info"**
```css
background: rgba(33, 150, 243, 0.15);
color: #64b5f6;
```

**Exemplos de uso:**
- ✅ Badge "Pendente"
- ✅ Notificações informativas
- ✅ Status neutro
- ✅ Chips de informação

**HTML:**
```html
<span class="status-primary">Pendente</span>
<span class="status-primary">Confirmado</span>
```

---

### **🟠 LARANJA - Status "Atenção" ou "Em Progresso"**
```css
background: rgba(255, 152, 0, 0.15);
color: #ffb74d;
```

**Exemplos de uso:**
- ✅ Badge "Em Progresso"
- ✅ Avisos
- ✅ Itens que precisam atenção
- ✅ Status de espera

**HTML:**
```html
<span class="status-accent">Em Progresso</span>
<span class="status-accent">Atenção</span>
```

---

### **🔴 VERMELHO - Status "Erro" ou "Cancelado"**
```css
background: rgba(239, 68, 68, 0.15);
color: #ef5350;
```

**Exemplos de uso:**
- ✅ Badge "Cancelado"
- ✅ Mensagens de erro
- ✅ Alertas críticos
- ✅ Status de falha

**HTML:**
```html
<span class="status-warn">Cancelado</span>
<span class="status-warn">Erro</span>
```

---

### **🟢 VERDE - Status "Sucesso" ou "Completo"**
```css
background: rgba(16, 185, 129, 0.15);
color: #4ade80;
```

**Exemplos de uso:**
- ✅ Badge "Concluído"
- ✅ Mensagens de sucesso
- ✅ Confirmações
- ✅ Status completo

**HTML:**
```html
<span class="status-success">Concluído</span>
<span class="status-success">Sucesso</span>
```

---

## 📋 **Tabela de Decisão Rápida**

| Se precisa de... | Use... | Cor |
|------------------|--------|-----|
| Título ou cabeçalho | Texto branco | `#e9eef7` |
| Descrição ou parágrafo | Texto cinza claro | `#cbd4e6` |
| Info secundária | Texto cinza | `#a0a7b4` |
| Botão de ação principal | Fundo verde neon | `#C3FF5A` |
| Link ou item ativo | Texto verde neon | `#C3FF5A` |
| Status pendente/info | Badge azul | `.status-primary` |
| Status atenção/progresso | Badge laranja | `.status-accent` |
| Status erro/cancelado | Badge vermelho | `.status-warn` |
| Status sucesso/completo | Badge verde | `.status-success` |
| Hover em card/item | Border verde | `#C3FF5A` |
| Input em foco | Border verde | `#C3FF5A` |

---

## 🎯 **Exemplos Práticos**

### **Exemplo 1: Card de Marcação**
```html
<div class="appointment-card">
  <h3>João Silva</h3>                    <!-- #e9eef7 - branco -->
  <p>Corte + Barba</p>                   <!-- #cbd4e6 - cinza claro -->
  <span class="time">14:30</span>        <!-- #a0a7b4 - cinza -->
  <span class="status-primary">         <!-- badge azul -->
    Confirmado
  </span>
</div>
```

### **Exemplo 2: Botão de Ação**
```html
<button class="btn-primary">            <!-- #C3FF5A - verde -->
  <mat-icon>save</mat-icon>
  Guardar Alterações
</button>
```

### **Exemplo 3: Menu Navegação**
```html
<nav>
  <a href="/dashboard" class="nav-link active">  <!-- #C3FF5A - verde -->
    Dashboard
  </a>
  <a href="/appointments" class="nav-link">       <!-- #cbd4e6 - cinza -->
    Marcações
  </a>
</nav>
```

### **Exemplo 4: Lista de Status**
```html
<div class="status-list">
  <span class="status-primary">Pendente</span>      <!-- azul -->
  <span class="status-accent">Em Progresso</span>   <!-- laranja -->
  <span class="status-success">Concluído</span>     <!-- verde -->
  <span class="status-warn">Cancelado</span>        <!-- vermelho -->
</div>
```

---

## 🧪 **Como Testar no Browser**

### **1. Inspecionar Elemento**
1. Clique direito no texto/elemento
2. Selecione "Inspecionar"
3. Veja a aba "Computed" → "color"

### **2. Verificar Contraste**
```javascript
// Cole no console:
const el = document.querySelector('.status-primary');
const styles = getComputedStyle(el);
console.log('Background:', styles.backgroundColor);
console.log('Color:', styles.color);
```

### **3. Verificar Todas as Cores**
```javascript
// Ver todas as cores usadas:
document.querySelectorAll('[class*="status-"]').forEach(el => {
  const styles = getComputedStyle(el);
  console.log(el.className, '→', styles.color);
});
```

---

## 🔧 **Resolver Problemas Comuns**

### **Problema 1: "Não consigo ler o texto"**
**Causa:** Contraste insuficiente  
**Solução:** 
- ✅ Use `#e9eef7` para texto principal
- ✅ Use fundos escuros (`rgba(X, Y, Z, 0.15)`)
- ❌ Nunca use cores claras em fundos claros

### **Problema 2: "Verde aparece em alguns lugares e não em outros"**
**Causa:** Verde neon (`#C3FF5A`) é apenas para elementos ativos/destacados  
**Solução:**
- ✅ Verde = Ação/Hover/Ativo
- ✅ Branco = Texto normal
- ✅ Use verde apenas onde faz sentido

### **Problema 3: "Badge está invisível"**
**Causa:** Usando classes antigas ou cores claras  
**Solução:**
```css
/* ❌ ERRADO */
.status { background: #e3f2fd; color: #1976d2; }

/* ✅ CORRETO */
.status-primary { 
  background: rgba(33, 150, 243, 0.15); 
  color: #64b5f6; 
}
```

---

## 📊 **Resumo Visual**

```
┌──────────────────────────────────────────────┐
│  HIERARQUIA DE CORES                         │
├──────────────────────────────────────────────┤
│                                              │
│  1️⃣  VERDE NEON (#C3FF5A)                   │
│      → Botões, Links ativos, Hover          │
│                                              │
│  2️⃣  BRANCO (#e9eef7)                       │
│      → Títulos, Cabeçalhos                  │
│                                              │
│  3️⃣  CINZA CLARO (#cbd4e6)                  │
│      → Descrições, Parágrafos               │
│                                              │
│  4️⃣  CINZA (#a0a7b4)                        │
│      → Info auxiliar                        │
│                                              │
│  5️⃣  CORES DE STATUS                        │
│      → Azul, Laranja, Vermelho, Verde       │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🎨 **Copiar & Colar**

### **Badge Azul (Pendente)**
```html
<span class="status-primary">Pendente</span>
```

### **Badge Laranja (Atenção)**
```html
<span class="status-accent">Em Progresso</span>
```

### **Badge Vermelho (Erro)**
```html
<span class="status-warn">Cancelado</span>
```

### **Badge Verde (Sucesso)**
```html
<span class="status-success">Concluído</span>
```

### **Botão Verde Neon**
```html
<button class="btn-primary">
  <mat-icon>check</mat-icon>
  Confirmar
</button>
```

### **Título Branco**
```html
<h1>Dashboard</h1>
```

### **Texto Secundário**
```html
<p class="text-secondary">Descrição aqui</p>
```

---

**💡 Dica Final:** Sempre que tiver dúvida, pensa:
- **Ação?** → Verde Neon (`#C3FF5A`)
- **Texto?** → Branco/Cinza (`#e9eef7`, `#cbd4e6`)
- **Status?** → Badge colorida (`.status-*`)

---

**📚 Documentação Completa:** `CSS_FIXES_GUIDE.md`  
**📊 Sumário:** `CSS_IMPROVEMENTS_SUMMARY.md`  
**🎨 Este Guia:** `QUICK_COLOR_REFERENCE.md`

