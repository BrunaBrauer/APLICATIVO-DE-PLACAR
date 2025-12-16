// Estado do jogo
let gameState = {
    teamA: {
        score: 0,
        fouls: 0,
        timeouts: 0,
        players: []
    },
    teamB: {
        score: 0,
        fouls: 0,
        timeouts: 0,
        players: []
    },
    config: {
        gameTime: 10, // minutos
        possessionTime: 12, // segundos
        timeoutTime: 30, // segundos
        timeoutsPerTeam: 1
    },
    timers: {
        game: {
            running: false,
            time: 600, // segundos
            interval: null
        },
        possession: {
            running: false,
            time: 12,
            team: 'A',
            interval: null
        },
        timeout: {
            running: false,
            time: 30,
            team: null,
            interval: null
        }
    },
    gameHistory: []
};

// Carregar estado do localStorage
function loadState() {
    const saved = localStorage.getItem('basketball3x3_state');
    if (saved) {
        gameState = JSON.parse(saved);
        updateUI();
    }
}

// Salvar estado no localStorage
function saveState() {
    localStorage.setItem('basketball3x3_state', JSON.stringify(gameState));
    // Notificar página de exibição
    if (window.displayWindow && !window.displayWindow.closed) {
        window.displayWindow.postMessage(gameState, '*');
    }
}

// Atualizar UI
function updateUI() {
    // Placar
    document.getElementById('scoreA').textContent = gameState.teamA.score;
    document.getElementById('scoreB').textContent = gameState.teamB.score;
    
    // Faltas
    document.getElementById('foulsA').textContent = gameState.teamA.fouls;
    document.getElementById('foulsB').textContent = gameState.teamB.fouls;
    
    // Timeouts
    document.getElementById('timeoutsA').textContent = gameState.teamA.timeouts;
    document.getElementById('timeoutsB').textContent = gameState.teamB.timeouts;
    
    // Configurações
    document.getElementById('gameTime').value = gameState.config.gameTime;
    document.getElementById('possessionTime').value = gameState.config.possessionTime;
    document.getElementById('timeoutTime').value = gameState.config.timeoutTime;
    document.getElementById('timeoutsPerTeam').value = gameState.config.timeoutsPerTeam;
    
    // Jogadores
    renderPlayers('A');
    renderPlayers('B');
    
    // Timers
    updateGameTimer();
    updatePossessionTimer();
    updateTimeoutTimer();
    
    // Botões de timeout
    updateTimeoutButtons();
}

// Renderizar jogadores
function renderPlayers(team) {
    const container = document.getElementById(`players${team}`);
    const players = gameState[`team${team}`].players;
    
    container.innerHTML = '';
    
    players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `
            <span class="player-number">#${player.number}</span>
            <span class="player-points">${player.points} pts</span>
            <div class="player-actions">
                <button onclick="addPlayerPoints('${team}', ${player.number}, 1)">+1</button>
                <button onclick="addPlayerPoints('${team}', ${player.number}, 2)">+2</button>
                <button onclick="addPlayerPoints('${team}', ${player.number}, 3)">+3</button>
                <button onclick="removePlayer('${team}', ${player.number})" class="btn-remove">×</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Adicionar jogador
function addPlayer(team) {
    const input = document.getElementById(`playerNumber${team}`);
    const number = parseInt(input.value);
    
    if (!number || number < 0 || number > 99) {
        alert('Número inválido! Use números de 0 a 99.');
        return;
    }
    
    const players = gameState[`team${team}`].players;
    
    if (players.length >= 4) {
        alert('Máximo de 4 jogadores por time!');
        return;
    }
    
    if (players.find(p => p.number === number)) {
        alert('Jogador já cadastrado!');
        return;
    }
    
    players.push({ number, points: 0 });
    players.sort((a, b) => a.number - b.number);
    
    input.value = '';
    renderPlayers(team);
    saveState();
}

// Remover jogador
function removePlayer(team, number) {
    const players = gameState[`team${team}`].players;
    const index = players.findIndex(p => p.number === number);
    if (index > -1) {
        players.splice(index, 1);
        renderPlayers(team);
        saveState();
    }
}

// Adicionar pontos ao jogador
function addPlayerPoints(team, number, points) {
    const players = gameState[`team${team}`].players;
    const player = players.find(p => p.number === number);
    
    if (player) {
        player.points += points;
        gameState[`team${team}`].score += points;
        
        // Registrar no histórico
        gameState.gameHistory.push({
            time: new Date().toISOString(),
            team,
            player: number,
            points,
            type: 'points'
        });
        
        renderPlayers(team);
        updateUI();
        saveState();
    }
}

// Alterar placar diretamente
function changeScore(team, delta) {
    gameState[`team${team}`].score = Math.max(0, gameState[`team${team}`].score + delta);
    updateUI();
    saveState();
}

// Alterar faltas
function changeFouls(team, delta) {
    gameState[`team${team}`].fouls = Math.max(0, gameState[`team${team}`].fouls + delta);
    updateUI();
    saveState();
}

// Atualizar configurações
function updateConfig() {
    gameState.config.gameTime = parseInt(document.getElementById('gameTime').value);
    gameState.config.possessionTime = parseInt(document.getElementById('possessionTime').value);
    gameState.config.timeoutTime = parseInt(document.getElementById('timeoutTime').value);
    gameState.config.timeoutsPerTeam = parseInt(document.getElementById('timeoutsPerTeam').value);
    
    // Atualizar timers se não estiverem rodando
    if (!gameState.timers.game.running) {
        gameState.timers.game.time = gameState.config.gameTime * 60;
    }
    if (!gameState.timers.possession.running) {
        gameState.timers.possession.time = gameState.config.possessionTime;
    }
    if (!gameState.timers.timeout.running) {
        gameState.timers.timeout.time = gameState.config.timeoutTime;
    }
    
    updateUI();
    saveState();
}

// Timer de jogo
function startGameTimer() {
    if (gameState.timers.game.running) return;
    
    gameState.timers.game.running = true;
    document.getElementById('gameTimerBtn').textContent = 'Rodando...';
    document.getElementById('gameTimerBtn').disabled = true;
    
    gameState.timers.game.interval = setInterval(() => {
        gameState.timers.game.time--;
        updateGameTimer();
        saveState();
        
        if (gameState.timers.game.time <= 0) {
            stopGameTimer();
            playSound('gameEndSound');
            alert('Tempo de jogo acabou!');
        }
    }, 1000);
}

function pauseGameTimer() {
    if (!gameState.timers.game.running) return;
    
    clearInterval(gameState.timers.game.interval);
    gameState.timers.game.running = false;
    document.getElementById('gameTimerBtn').textContent = 'Iniciar';
    document.getElementById('gameTimerBtn').disabled = false;
    saveState();
}

function resetGameTimer() {
    pauseGameTimer();
    gameState.timers.game.time = gameState.config.gameTime * 60;
    updateGameTimer();
    saveState();
}

function updateGameTimer() {
    const minutes = Math.floor(gameState.timers.game.time / 60);
    const seconds = gameState.timers.game.time % 60;
    document.getElementById('gameTimer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Timer de posse
function startPossessionTimer() {
    if (gameState.timers.possession.running) return;
    
    gameState.timers.possession.running = true;
    gameState.timers.possession.time = gameState.config.possessionTime;
    document.getElementById('possessionTimerBtn').textContent = 'Rodando...';
    document.getElementById('possessionTimerBtn').disabled = true;
    
    gameState.timers.possession.interval = setInterval(() => {
        gameState.timers.possession.time--;
        updatePossessionTimer();
        saveState();
        
        if (gameState.timers.possession.time <= 0) {
            stopPossessionTimer();
            playSound('possessionEndSound');
        }
    }, 1000);
}

function stopPossessionTimer() {
    if (!gameState.timers.possession.running) return;
    
    clearInterval(gameState.timers.possession.interval);
    gameState.timers.possession.running = false;
    document.getElementById('possessionTimerBtn').textContent = 'Iniciar';
    document.getElementById('possessionTimerBtn').disabled = false;
    saveState();
}

function resetPossessionTimer() {
    stopPossessionTimer();
    gameState.timers.possession.time = gameState.config.possessionTime;
    updatePossessionTimer();
    saveState();
}

function updatePossessionTimer() {
    document.getElementById('possessionTimer').textContent = gameState.timers.possession.time;
}

function updatePossessionTeam() {
    const team = document.getElementById('possessionTeam').value;
    gameState.timers.possession.team = team;
    saveState();
}

// Timer de timeout
function startTimeout(team) {
    if (gameState.timers.timeout.running) {
        alert('Já existe um timeout em andamento!');
        return;
    }
    
    const timeouts = gameState[`team${team}`].timeouts;
    const maxTimeouts = gameState.config.timeoutsPerTeam;
    
    if (timeouts >= maxTimeouts) {
        alert(`Time ${team} já usou todos os timeouts disponíveis!`);
        return;
    }
    
    gameState.timers.timeout.running = true;
    gameState.timers.timeout.team = team;
    gameState.timers.timeout.time = gameState.config.timeoutTime;
    gameState[`team${team}`].timeouts++;
    
    document.getElementById('stopTimeoutBtn').disabled = false;
    document.getElementById(`timeoutBtn${team}`).disabled = true;
    
    updateTimeoutButtons();
    updateUI();
    
    gameState.timers.timeout.interval = setInterval(() => {
        gameState.timers.timeout.time--;
        updateTimeoutTimer();
        saveState();
        
        if (gameState.timers.timeout.time <= 0) {
            stopTimeout();
            playSound('timeoutEndSound');
        }
    }, 1000);
}

function stopTimeout() {
    if (!gameState.timers.timeout.running) return;
    
    clearInterval(gameState.timers.timeout.interval);
    gameState.timers.timeout.running = false;
    gameState.timers.timeout.team = null;
    gameState.timers.timeout.time = gameState.config.timeoutTime;
    
    document.getElementById('stopTimeoutBtn').disabled = true;
    updateTimeoutButtons();
    updateTimeoutTimer();
    saveState();
}

function updateTimeoutTimer() {
    if (gameState.timers.timeout.running) {
        document.getElementById('timeoutTimer').textContent = 
            gameState.timers.timeout.time.toString().padStart(2, '0');
        document.getElementById('timeoutTeamDisplay').textContent = `Time ${gameState.timers.timeout.team}`;
    } else {
        document.getElementById('timeoutTimer').textContent = '00';
        document.getElementById('timeoutTeamDisplay').textContent = 'Nenhum';
    }
}

function updateTimeoutButtons() {
    const maxTimeouts = gameState.config.timeoutsPerTeam;
    document.getElementById('timeoutBtnA').disabled = 
        gameState.teamA.timeouts >= maxTimeouts || gameState.timers.timeout.running;
    document.getElementById('timeoutBtnB').disabled = 
        gameState.teamB.timeouts >= maxTimeouts || gameState.timers.timeout.running;
}

// Tocar som usando Web Audio API
function playSound(soundType) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let frequency, duration, type;
        
        switch(soundType) {
            case 'gameEndSound':
                // Som longo e grave para fim de jogo
                frequency = 200;
                duration = 1.5;
                type = 'sine';
                break;
            case 'possessionEndSound':
                // Som curto e agudo para fim de posse
                frequency = 800;
                duration = 0.3;
                type = 'square';
                break;
            case 'timeoutEndSound':
                // Som médio para fim de timeout
                frequency = 400;
                duration = 0.8;
                type = 'triangle';
                break;
            default:
                return;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        // Para timeout, tocar duas vezes
        if (soundType === 'timeoutEndSound') {
            setTimeout(() => {
                const oscillator2 = audioContext.createOscillator();
                const gainNode2 = audioContext.createGain();
                
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);
                
                oscillator2.frequency.value = frequency;
                oscillator2.type = type;
                
                gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator2.start(audioContext.currentTime);
                oscillator2.stop(audioContext.currentTime + duration);
            }, 300);
        }
    } catch (e) {
        console.log('Erro ao tocar som:', e);
    }
}

// Abrir tela de exibição
function openDisplay() {
    window.displayWindow = window.open('display.html', 'Placar', 'width=1400,height=900');
}

// Resetar jogo
function resetGame() {
    if (!confirm('Tem certeza que deseja iniciar um novo jogo? Todos os dados serão perdidos.')) {
        return;
    }
    
    gameState = {
        teamA: { score: 0, fouls: 0, timeouts: 0, players: [] },
        teamB: { score: 0, fouls: 0, timeouts: 0, players: [] },
        config: {
            gameTime: 10,
            possessionTime: 12,
            timeoutTime: 30,
            timeoutsPerTeam: 1
        },
        timers: {
            game: { running: false, time: 600, interval: null },
            possession: { running: false, time: 12, team: 'A', interval: null },
            timeout: { running: false, time: 30, team: null, interval: null }
        },
        gameHistory: []
    };
    
    pauseGameTimer();
    stopPossessionTimer();
    stopTimeout();
    
    updateUI();
    saveState();
}

// Exportar CSV
function exportCSV() {
    const rows = [
        ['Time', 'Jogador', 'Pontos', 'Tipo'],
        ...gameState.gameHistory.map(h => [
            `Time ${h.team}`,
            `#${h.player}`,
            h.points,
            h.type
        ]),
        [],
        ['Resumo do Jogo'],
        ['Time A', 'Pontos', gameState.teamA.score],
        ['Time A', 'Faltas', gameState.teamA.fouls],
        ['Time A', 'Timeouts', gameState.teamA.timeouts],
        ['Time B', 'Pontos', gameState.teamB.score],
        ['Time B', 'Faltas', gameState.teamB.fouls],
        ['Time B', 'Timeouts', gameState.teamB.timeouts],
        [],
        ['Jogadores Time A'],
        ['Número', 'Pontos'],
        ...gameState.teamA.players.map(p => [p.number, p.points]),
        [],
        ['Jogadores Time B'],
        ['Número', 'Pontos'],
        ...gameState.teamB.players.map(p => [p.number, p.points])
    ];
    
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `placar_basquete_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Exportar PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório do Jogo - Basquete 3x3', 105, y, { align: 'center' });
    y += 15;
    
    // Data
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, y, { align: 'center' });
    y += 15;
    
    // Placar
    doc.setFontSize(16);
    doc.text('PLACAR FINAL', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(14);
    doc.text(`Time A: ${gameState.teamA.score} pontos`, 20, y);
    doc.text(`Time B: ${gameState.teamB.score} pontos`, 120, y);
    y += 10;
    
    // Estatísticas
    doc.setFontSize(12);
    doc.text(`Time A - Faltas: ${gameState.teamA.fouls} | Timeouts: ${gameState.teamA.timeouts}`, 20, y);
    y += 8;
    doc.text(`Time B - Faltas: ${gameState.teamB.fouls} | Timeouts: ${gameState.teamB.timeouts}`, 20, y);
    y += 15;
    
    // Jogadores Time A
    doc.setFontSize(14);
    doc.text('Jogadores Time A', 20, y);
    y += 8;
    doc.setFontSize(10);
    gameState.teamA.players.forEach(player => {
        doc.text(`#${player.number}: ${player.points} pontos`, 25, y);
        y += 6;
    });
    y += 5;
    
    // Jogadores Time B
    doc.setFontSize(14);
    doc.text('Jogadores Time B', 20, y);
    y += 8;
    doc.setFontSize(10);
    gameState.teamB.players.forEach(player => {
        doc.text(`#${player.number}: ${player.points} pontos`, 25, y);
        y += 6;
    });
    
    // Histórico
    if (gameState.gameHistory.length > 0) {
        y += 10;
        doc.setFontSize(14);
        doc.text('Histórico de Pontos', 20, y);
        y += 8;
        doc.setFontSize(8);
        gameState.gameHistory.slice(-20).forEach(h => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(`Time ${h.team} - Jogador #${h.player}: +${h.points}`, 25, y);
            y += 5;
        });
    }
    
    doc.save(`placar_basquete_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Exportar jogo completo
function exportGame() {
    const choice = confirm('Escolha o formato:\nOK = PDF\nCancelar = CSV');
    if (choice) {
        exportPDF();
    } else {
        exportCSV();
    }
}

// Inicializar
loadState();
updateUI();

// Atualizar a cada segundo para sincronizar com display
setInterval(() => {
    if (gameState.timers.game.running || gameState.timers.possession.running || gameState.timers.timeout.running) {
        saveState();
    }
}, 1000);

