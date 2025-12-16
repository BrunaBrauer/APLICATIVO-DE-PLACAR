# 🏀 Aplicativo de Placar de Basquete 3x3

Aplicativo completo para controle de placar de basquete na modalidade 3x3, com todas as funcionalidades necessárias para gerenciar um jogo profissional.

## ✨ Funcionalidades

### ⚙️ Configurações
- **Tempo de Jogo**: Configurável em minutos
- **Tempo de Posse**: Configurável em segundos (padrão: 12s)
- **Tempo de Timeout**: Configurável em segundos (padrão: 30s)
- **Quantidade de Timeouts**: Configurável por time

### ⏱️ Temporizadores
- **Timer de Jogo**: Controle completo (iniciar, pausar, resetar)
- **Timer de Posse**: Controle por time com seleção de qual time está com a posse
- **Timer de Timeout**: Controle automático com limite por time

### 🔔 Avisos Sonoros
- **Fim de Jogo**: Som longo e grave
- **Fim de Posse**: Som curto e agudo
- **Fim de Timeout**: Som médio (toca duas vezes)

### 👥 Gerenciamento de Jogadores
- Cadastro de até **4 jogadores por time**
- Identificação por número (0-99)
- Registro de pontos por jogador
- Pontos do jogador somam automaticamente ao time
- Visualização de pontos individuais

### 📊 Controle de Placar
- Placar por time
- Controle de faltas por time
- Controle de timeouts usados por time
- Histórico completo de pontos

### 🖥️ Interface
- **Página de Controle**: Para gerenciar o jogo
- **Página de Exibição**: Tela standalone para mostrar o placar (ideal para projetores/TVs)
- Sincronização automática entre as páginas
- Design moderno e responsivo

### 📤 Exportação
- **Exportar CSV**: Dados completos do jogo em formato CSV
- **Exportar PDF**: Relatório completo em PDF com:
  - Placar final
  - Estatísticas dos times
  - Pontos por jogador
  - Histórico de pontos

## 🚀 Como Usar

1. Abra o arquivo `index.html` no navegador
2. Configure os tempos desejados na seção "Configurações do Jogo"
3. Cadastre os jogadores de cada time (máximo 4 por time)
4. Use os controles para gerenciar o jogo:
   - Adicione pontos pelos botões +1, +2, +3 em cada jogador
   - Ou altere o placar diretamente pelos botões +/-
   - Controle faltas e timeouts
   - Gerencie os temporizadores
5. Clique em "Abrir Tela de Placar" para exibir em outra tela
6. Ao final, exporte o jogo em CSV ou PDF

## 📁 Estrutura de Arquivos

```
.
├── index.html      # Página principal de controle
├── display.html    # Página de exibição do placar
├── script.js       # Lógica principal do aplicativo
├── display.js      # Lógica da página de exibição
├── styles.css      # Estilos do aplicativo
└── README.md       # Este arquivo
```

## 💾 Armazenamento

Todos os dados são salvos automaticamente no **localStorage** do navegador, permitindo:
- Persistência entre recarregamentos
- Sincronização entre páginas
- Continuidade do jogo

## 🎨 Características Técnicas

- **HTML5/CSS3/JavaScript puro** (sem dependências externas, exceto jsPDF para PDF)
- **Web Audio API** para sons
- **LocalStorage** para persistência
- **Design responsivo** para diferentes tamanhos de tela
- **Sincronização em tempo real** entre páginas

## 📝 Notas

- Os sons são gerados programaticamente usando Web Audio API
- A página de exibição atualiza automaticamente a cada segundo
- O histórico de pontos é mantido durante todo o jogo
- Os dados são salvos automaticamente a cada alteração

## 🔄 Próximas Melhorias Possíveis

- Modo escuro/claro
- Mais estatísticas (rebotes, assistências, etc.)
- Histórico de jogos anteriores
- Compartilhamento online do placar

---

Desenvolvido para facilitar o controle de jogos de basquete 3x3 de forma profissional e intuitiva! 🏀

