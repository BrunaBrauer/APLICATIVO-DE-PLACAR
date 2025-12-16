// Estado do jogo (sincronizado com a página principal)
let gameState = null;

// Carregar estado inicial
function loadState() {
    const saved = localStorage.getItem('basketball3x3_state');
    if (saved) {
        gameState = JSON.parse(saved);
        updateDisplay();
    }
}

// Atualizar exibição
function updateDisplay() {
    if (!gameState) return;
    
    // Placar
    document.getElementById('scoreADisplay').textContent = gameState.teamA.score;
    document.getElementById('scoreBDisplay').textContent = gameState.teamB.score;
    
    // Faltas
    document.getElementById('foulsADisplay').textContent = gameState.teamA.fouls;
    document.getElementById('foulsBDisplay').textContent = gameState.teamB.fouls;
    
    // Timeouts
    document.getElementById('timeoutsADisplay').textContent = gameState.teamA.timeouts;
    document.getElementById('timeoutsBDisplay').textContent = gameState.teamB.timeouts;
    
    // Timers
    updateTimersDisplay();
}

// Atualizar exibição dos timers
function updateTimersDisplay() {
    if (!gameState) return;
    
    // Timer de jogo
    const gameMinutes = Math.floor(gameState.timers.game.time / 60);
    const gameSeconds = gameState.timers.game.time % 60;
    document.getElementById('gameTimerDisplay').textContent = 
        `${gameMinutes.toString().padStart(2, '0')}:${gameSeconds.toString().padStart(2, '0')}`;
    
    const gameTimerPanel = document.getElementById('gameTimerPanel');
    if (gameState.timers.game.running) {
        gameTimerPanel.classList.add('active');
        if (gameState.timers.game.time <= 60) {
            gameTimerPanel.classList.add('warning');
        } else {
            gameTimerPanel.classList.remove('warning');
        }
    } else {
        gameTimerPanel.classList.remove('active', 'warning');
    }
    
    // Timer de posse
    document.getElementById('possessionTimerDisplay').textContent = gameState.timers.possession.time;
    
    const possessionTimerPanel = document.getElementById('possessionTimerPanel');
    if (gameState.timers.possession.running) {
        possessionTimerPanel.classList.add('active');
        if (gameState.timers.possession.time <= 5) {
            possessionTimerPanel.classList.add('warning');
        } else {
            possessionTimerPanel.classList.remove('warning');
        }
    } else {
        possessionTimerPanel.classList.remove('active', 'warning');
    }
}

// Escutar mensagens da janela principal
window.addEventListener('message', (event) => {
    gameState = event.data;
    updateDisplay();
});

// Atualizar a cada segundo
setInterval(() => {
    loadState();
}, 1000);

// Carregar estado inicial
loadState();

