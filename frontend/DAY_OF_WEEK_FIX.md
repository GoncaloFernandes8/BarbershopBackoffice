# 🔧 Correção: Alinhamento de dayOfWeek com ISO-8601

## 🐛 **Problema**

Os dias da semana estavam **desalinhados** entre o Backoffice e o Backend/Frontend de Cliente.

### **Antes da Correção:**

| Dia | Backoffice (ERRADO) | Backend/Frontend (CORRETO) |
|-----|---------------------|----------------------------|
| Domingo | **1** ❌ | **7** ✅ |
| Segunda | **2** ❌ | **1** ✅ |
| Terça | **3** ❌ | **2** ✅ |
| Quarta | **4** ❌ | **3** ✅ |
| Quinta | **5** ❌ | **4** ✅ |
| Sexta | **6** ❌ | **5** ✅ |
| Sábado | **7** ❌ | **6** ✅ |

### **Resultado do Bug:**

**Exemplo Real:**
1. No **Backoffice**, administrador cria: "João trabalha Sexta-feira 09:00-12:00"
2. Backoffice envia: `dayOfWeek = 6`
3. **Backend armazena** `6` (que no padrão ISO-8601 = Sábado!)
4. **Frontend de Cliente** busca horários para "Sábado" (dia 6 no calendário)
5. **Encontra o horário** que foi cadastrado como "Sexta" no backoffice
6. ❌ **Cliente vê**: "João trabalha até 12h no Sábado"
7. ❌ **Backoffice mostra**: "João trabalha até 12h na Sexta"

**Diferença de 1 dia em todos os registros!**

---

## ✅ **Solução Aplicada**

### **Padronização com ISO-8601** (Java `DayOfWeek`)

**Novo sistema (CORRETO):**

| Dia | Número | Padrão |
|-----|--------|--------|
| Segunda-feira | 1 | ISO-8601 / Java DayOfWeek |
| Terça-feira | 2 | ISO-8601 / Java DayOfWeek |
| Quarta-feira | 3 | ISO-8601 / Java DayOfWeek |
| Quinta-feira | 4 | ISO-8601 / Java DayOfWeek |
| Sexta-feira | 5 | ISO-8601 / Java DayOfWeek |
| Sábado | 6 | ISO-8601 / Java DayOfWeek |
| Domingo | 7 | ISO-8601 / Java DayOfWeek |

---

## 🔧 **Alterações Técnicas**

### **Arquivo:** `frontend/src/app/pages/schedule/schedule.ts`

#### **1. Função `getDayName()` (linha 109-113)**

**ANTES:**
```typescript
getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayOfWeek - 1] || 'N/A';  // ❌ Domingo=1
}
```

**DEPOIS:**
```typescript
getDayName(dayOfWeek: number): string {
  // ISO-8601: Monday=1, Sunday=7 (same as Java DayOfWeek)
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  return days[dayOfWeek - 1] || 'N/A';  // ✅ Segunda=1
}
```

#### **2. Dialog de Criação de Horários (linhas 211-218)**

**ANTES:**
```html
<mat-option [value]="1">Domingo</mat-option>       ❌
<mat-option [value]="2">Segunda-feira</mat-option>
<mat-option [value]="3">Terça-feira</mat-option>
<mat-option [value]="4">Quarta-feira</mat-option>
<mat-option [value]="5">Quinta-feira</mat-option>
<mat-option [value]="6">Sexta-feira</mat-option>
<mat-option [value]="7">Sábado</mat-option>       ❌
```

**DEPOIS:**
```html
<mat-option [value]="1">Segunda-feira</mat-option> ✅
<mat-option [value]="2">Terça-feira</mat-option>
<mat-option [value]="3">Quarta-feira</mat-option>
<mat-option [value]="4">Quinta-feira</mat-option>
<mat-option [value]="5">Sexta-feira</mat-option>
<mat-option [value]="6">Sábado</mat-option>
<mat-option [value]="7">Domingo</mat-option>       ✅
```

---

## 🎯 **Agora Está Alinhado**

### **Backend** (Java `DayOfWeek`):
```java
// AvailabilityService.java linha 39
day.getDayOfWeek()  // Retorna: MONDAY=1, TUESDAY=2, ..., SUNDAY=7
```

### **Frontend de Cliente** (JavaScript `Date`):
```typescript
// Usa LocalDate no backend que automaticamente usa ISO-8601
// Quando passa YYYY-MM-DD, o Java converte corretamente
```

### **Backoffice** (Agora Correto):
```typescript
// Segunda=1, Terça=2, ..., Domingo=7 ✅
```

---

## 📊 **Resultado**

### **✅ ANTES DA CORREÇÃO:**
- Backoffice: "Sexta até 12h" → Envia `dayOfWeek=6`
- Backend armazena: `6` (Sábado no ISO-8601)
- Cliente vê: "Sábado até 12h" ❌

### **✅ DEPOIS DA CORREÇÃO:**
- Backoffice: "Sexta até 12h" → Envia `dayOfWeek=5`
- Backend armazena: `5` (Sexta no ISO-8601)
- Cliente vê: "Sexta até 12h" ✅

---

## ⚠️ **IMPORTANTE: Dados Existentes**

Se já existem **Working Hours cadastrados** antes desta correção, eles estarão com os dias **errados**!

### **Solução:**

#### **Opção 1: Apagar e Recriar** (Recomendado se há poucos registros)
1. Vai ao Backoffice → Horários
2. Apaga todos os horários existentes
3. Cria novamente com o sistema correto

#### **Opção 2: Migração SQL** (Se há muitos registros)

```sql
-- ATENÇÃO: Apenas execute se souber o que está a fazer!
-- Isto converte os dias de Domingo=1 para Segunda=1

UPDATE working_hours
SET day_of_week = CASE 
  WHEN day_of_week = 1 THEN 7  -- Domingo: 1 → 7
  WHEN day_of_week = 2 THEN 1  -- Segunda: 2 → 1
  WHEN day_of_week = 3 THEN 2  -- Terça: 3 → 2
  WHEN day_of_week = 4 THEN 3  -- Quarta: 4 → 3
  WHEN day_of_week = 5 THEN 4  -- Quinta: 5 → 4
  WHEN day_of_week = 6 THEN 5  -- Sexta: 6 → 5
  WHEN day_of_week = 7 THEN 6  -- Sábado: 7 → 6
  ELSE day_of_week
END;
```

---

## 📚 **Referências**

- **ISO-8601:** https://en.wikipedia.org/wiki/ISO_8601#Week_dates
- **Java DayOfWeek:** https://docs.oracle.com/javase/8/docs/api/java/time/DayOfWeek.html
  - `MONDAY` = 1
  - `TUESDAY` = 2
  - `WEDNESDAY` = 3
  - `THURSDAY` = 4
  - `FRIDAY` = 5
  - `SATURDAY` = 6
  - `SUNDAY` = 7

---

## ✅ **Checklist de Verificação**

Depois da correção:

- [x] Backoffice usa Segunda=1, Domingo=7
- [x] Backend usa Java DayOfWeek (ISO-8601)
- [x] Frontend de Cliente recebe dados corretos
- [ ] **Dados antigos foram migrados ou apagados**
- [ ] Testado: Criar horário "Segunda" no backoffice
- [ ] Verificado: Aparece em "Segunda" no frontend de cliente

---

**🎉 Bug Resolvido!**  
**📅 Data:** Outubro 2025  
**🔧 Commit:** `5707f76 - fix: Align dayOfWeek with ISO-8601 standard`

