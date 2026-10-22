/**
 * Super Mario Jump - Lógica do Jogo e Integração com Ranking MySQL (Laragon)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Jogo
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('game-board');
    const coin = document.getElementById('coin');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');

    // Modais e Telas
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const rankingBody = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    // Variáveis de Estado
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;

    // Configurações da dificuldade
const velocidadeInicial = 2;
const aumentoPorNivel = 0.05;
const velocidadeMinima = 0.65;

let nivelAtual = 0;

    // Recupera último nome utilizado caso exista
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    /**
     * Inicia uma nova rodada
     */

    // Controla a dificuldade do jogo
function atualizarDificuldade() {
    let novoNivel = 0;

    // A partir de 100 pontos, começa a aumentar a dificuldade
    if (score >= 100 && score < 5000) {
        if (score < 1000) {
            novoNivel = 1;
        } else {
            novoNivel = Math.floor(score / 1000) + 1;
        }
    }

    // Depois de 5000 pontos, aumenta a cada 2500
    if (score >= 5000) {
        novoNivel = 6 + Math.floor((score - 5000) / 2500);
    }

    // Evita recalcular o mesmo nível
    if (novoNivel === nivelAtual) return;

    nivelAtual = novoNivel;

    // Quanto menor a duração, mais rápido o cano
    let novaDuracao =
        velocidadeInicial - nivelAtual * aumentoPorNivel;

    // A partir de 50000 pontos, o cano fica um pouco mais lento
    if (score >= 50000) {
        novaDuracao += 0.2;
    }

    // Limita a velocidade para não ficar rápida demais
    novaDuracao = Math.max(
        velocidadeMinima,
        Math.min(velocidadeInicial, novaDuracao)
    );

    // Aplica a nova velocidade ao cano
    pipe.style.animationDuration = `${novaDuracao}s`;
}

    function startGame() {
        // Limpa loops anteriores se existirem
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        // Reseta posições e visuais
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        // Reinicia a dificuldade
        nivelAtual = 0;
        pipe.style.animationDuration = '';
        hudPlayerName.textContent = currentPlayer || 'Jogador';

        // Ativa animações CSS do jogo
        gameBoard.classList.add('running');

        // Loop de pontuação progressiva (1 ponto a cada 100ms)
        scoreLoop = setInterval(() => {
    if (isPlaying) {
        score += 1;
        scoreDisplay.textContent = score;

        atualizarDificuldade();
    }
}, 100);

        // Loop de colisão
        gameLoop = setInterval(checkCollision, 10);
    }


    function resetElements() {
        // Reseta cano
        pipe.style.animation = '';
        pipe.style.left = '';

        // Reseta Mario
        mario.src = 'assets/mario.gif';
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove('jump');

        if (coin) {
    coin.style.visibility = 'visible';
    coin.style.animation = '';
    coin.style.right = '-40px';
}

        if (jumpTip) {
            jumpTip.style.opacity = '1';
        }
    }

    function jump() {
        if (!isPlaying) return;
        if (mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
    }

    function checkCollision() {
    if (!isPlaying) return;

    // Verifica se o Mario bateu no cano
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window
        .getComputedStyle(mario)
        .bottom.replace('px', '');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        triggerGameOver(pipePosition, marioPosition);
        return;
    }

    // Verifica se o Mario pegou a moeda
    if (coin && coin.style.visibility !== 'hidden') {
        const marioRect = mario.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();

        const coletouMoeda =
            marioRect.left < coinRect.right &&
            marioRect.right > coinRect.left &&
            marioRect.top < coinRect.bottom &&
            marioRect.bottom > coinRect.top;

        if (coletouMoeda) {
            score += 30;
scoreDisplay.textContent = score;
s
atualizarDificuldade();

            coin.style.visibility = 'hidden';

            setTimeout(() => {
                if (isPlaying) {
                    coin.style.animation = 'none';
                    coin.style.right = '-40px';
                    coin.style.visibility = 'visible';

                    void coin.offsetWidth;
                    coin.style.animation = '';
                }
            }, 700);
        }
    }
}

    function triggerGameOver(pipePosition, marioPosition) {
        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        
        gameBoard.classList.remove('running');

        
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        // Congela o Mario na altura exata e muda para a imagem de Game Over
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = 'assets/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        // Atualiza modal de Game Over
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        // Abre modal de Game Over
        gameoverModal.classList.add('active');

        // Salva a pontuação no banco MySQL via PHP
        saveScore(currentPlayer, score);
    }


    function saveScore(playerName, finalScore) {
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if (data.ranking) {
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else {
                saveStatusMsg.textContent = '⚠️ ' + (data.message || 'Erro ao registrar.');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição:', err);
            saveStatusMsg.textContent = '⚠️ Erro ao conectar ao servidor Laragon.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }

    /**
     * Busca o ranking atualizado no banco
     */
    function fetchRanking() {
        fetch('obter_ranking.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.ranking) {
                    renderRanking(data.ranking);
                }
            })
            .catch(err => console.error('Erro ao buscar ranking:', err));
    }

    /**
     * Atualiza a tabela HTML do ranking
     */
    function renderRanking(list, highlightName = null, highlightScore = null) {
        if (!rankingBody) return;
        rankingBody.innerHTML = '';

        if (!list || list.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td></tr>';
            return;
        }

        let highlighted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            // Destaca a pontuação atual recém-salva se coincidir
            if (!highlighted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore) {
                tr.classList.add('highlight-current');
                highlighted = true;
            }

            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2º';
            else if (index === 2) medal = '🥉 3º';

            tr.innerHTML = `
                <td class="ranking-pos">${medal}</td>
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td>${parseInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        });
    }

    /**
     * Função auxiliar para sanitizar strings no HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Submit do Formulário de Início (INICIAR JOGO)
    startForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const nameValue = playerInput.value.trim();
        if (!nameValue) {
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('mario_jump_player', currentPlayer);

        // Fecha tela de início e começa o jogo
        startModal.classList.remove('active');
        startGame();
    });

    // Botão "VER RANKING" na tela inicial
    btnViewRanking.addEventListener('click', () => {
        fetchRanking();
        finalScoreValue.textContent = '---';
        saveStatusMsg.textContent = '';
        startModal.classList.remove('active');
        gameoverModal.classList.add('active');
    });

    // Botão "JOGAR NOVAMENTE" no Game Over
    btnRestart.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        if (!currentPlayer) {
            startModal.classList.add('active');
            playerInput.focus();
        } else {
            startGame();
        }
    });

    // 4. Botão "TROCAR JOGADOR" no Game Over
    btnChangePlayer.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        resetElements();
        startModal.classList.add('active');
        playerInput.value = '';
        playerInput.focus();
    });

    // 5. Controle do Pulo por Teclado (Espaço ou Seta para Cima)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
            if (isPlaying) {
                e.preventDefault();
                jump();
            }
        }
    });
});