# Arquitetura de Sub-Controllers

## Visão Geral

O `AppController` foi refatorado de **1314 linhas** para uma arquitetura distribuída com **6 sub-controllers especializados**.

```
controller/
├── AppController.js         (350 linhas) - Coordenador Central
├── SearchController.js      (280 linhas) - Busca e API
├── SelectionController.js   (320 linhas) - Seleções e Filtros
├── NavigationController.js  (300 linhas) - Navegação e Breadcrumbs
├── ReceitaController.js     (130 linhas) - Prescrição
├── SidebarController.js     (100 linhas) - Menus Laterais
└── UIController.js          (150 linhas) - UI Geral
```

## Princípio Fundamental

> **"Sub-controllers nunca conversam diretamente entre si. AppController escuta eventos e delega."**

```
┌─────────────────────────────────────────────────────────────┐
│                     AppController                           │
│                   (Coordenador Central)                     │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Search  │  │Selection│  │  Nav    │  │ Receita │        │
│  │Controller│  │Controller│  │Controller│  │Controller│        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                         ▲                                   │
│                         │ eventos                           │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Models / Views                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Comunicação

### Exemplo: Usuário seleciona um filtro

```
1. CardView emite 'click'
          ↓
2. AppController.handleCardClick() 
          ↓
3. Delega para SelectionController.handleConfigSelection()
          ↓
4. SelectionController emite 'filtroAdicionado'
          ↓
5. AppController escuta e chama SearchController.buscarComFiltrosAtuais()
          ↓
6. SearchController emite 'buscaConcluida'
          ↓
7. AppController escuta e chama UIController.mostrarBotaoFlutuante()
```

## Responsabilidades

### AppController (Coordenador)
- Instancia Models, Views e Sub-Controllers
- Escuta eventos de todos os sub-controllers
- Coordena comunicação entre eles
- **NÃO** contém lógica de negócio

### SearchController
- Executa buscas com filtros
- Monta payloads para API
- Processa resultados
- Gerencia debounce

### SelectionController
- Gerencia seleções de filtros
- Identifica tipos de configuração
- Descobre contexto (visão, marca, família)
- Registra seleções de navegação

### NavigationController
- Processa eventos de navegação
- Atualiza breadcrumbs
- Renderiza nível atual
- Navega para configurações

### ReceitaController
- Salva/limpa receita
- Copia OD para OE
- Atualiza botão na toolbar

### SidebarController
- Renderiza menus
- Processa clicks nos itens

### UIController
- Botão flutuante
- Toast/notificações
- Viewport
- Loader

## Eventos por Controller

### SearchController
| Evento | Dados | Quando |
|--------|-------|--------|
| `buscaConcluida` | `{ resultados, quantidade }` | Busca terminou |
| `buscaErro` | `{ error }` | Erro na busca |
| `semReceita` | - | Tentou buscar sem receita |

### SelectionController
| Evento | Dados | Quando |
|--------|-------|--------|
| `filtroAdicionado` | `{ tipo, item }` | Filtro adicionado |
| `filtroRemovido` | `{ tipo, id }` | Filtro removido |
| `produtoAdicionado` | `{ produto }` | Produto adicionado |
| `produtoRemovido` | `{ marca }` | Produto removido |
| `selecoesLimpas` | - | Tudo limpo |
| `selecaoAlterada` | `selecoes` | Qualquer alteração |

### NavigationController
| Evento | Dados | Quando |
|--------|-------|--------|
| `navegou` | `{ node, type, isRoot }` | Navegação |
| `voltou` | `{ node, breadcrumbs, isRoot }` | Voltou nível |
| `foiParaHome` | - | Foi para raiz |
| `pulou` | `{ node, index, breadcrumbs }` | Pulou nível |

### ReceitaController
| Evento | Dados | Quando |
|--------|-------|--------|
| `receitaSalva` | `{ dados }` | Receita salva |
| `receitaLimpa` | - | Receita limpa |
| `receitaCopiada` | - | OD copiado para OE |

### SidebarController
| Evento | Dados | Quando |
|--------|-------|--------|
| `itemConfigClicado` | `{ id }` | Click em config |
| `itemCategoriaClicado` | `{ id }` | Click em categoria |

### UIController
| Evento | Dados | Quando |
|--------|-------|--------|
| `botaoFlutuanteClicado` | `{ quantidade }` | Click no botão |

## Como Adicionar Funcionalidade

### 1. Adicionar em Sub-Controller existente

```javascript
// Em SearchController.js
novoMetodo() {
    // ... lógica
    this.emit('novoEvento', { dados });
}
```

```javascript
// Em AppController.js (bindCoordination)
this.controllers.search.on('novoEvento', ({ dados }) => {
    this.controllers.outro.fazerAlgo(dados);
});
```

### 2. Criar novo Sub-Controller

```javascript
// NovoController.js
import EventEmitter from '../util/EventEmitter.js';

export default class NovoController extends EventEmitter {
    constructor({ dependencias }) {
        super();
        // ...
    }
}
```

```javascript
// Em AppController.js
import NovoController from './NovoController.js';

// Em initControllers()
this.controllers.novo = new NovoController({ ... });

// Em bindCoordination()
this.controllers.novo.on('evento', () => { ... });
```

## Vantagens

1. **Arquivos menores** - Cada controller cabe em uma tela
2. **Fácil localização** - Sabe exatamente onde está cada lógica
3. **Testável** - Controllers isolados são fáceis de testar
4. **Manutenível** - Modificar busca não afeta navegação
5. **Escalável** - Adicionar funcionalidade é simples
6. **Consistente** - Segue padrão MVC estabelecido

## Migração

A refatoração é **drop-in replacement**. Basta substituir o AppController.js antigo pelos novos arquivos. A interface pública (`init()`, eventos emitidos) permanece a mesma.
