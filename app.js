//Dark mode toggle
document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

// screens(DOM elements Grab)
const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');

const gridEl = document.querySelector('#grid');
let cells = null; // will be assigned after we build the grid

const name_input = document.querySelector('#input-name');
const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');
const result_time = document.querySelector('#result-time');

//Game
let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

// -------------- helpers --------------
const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

// build 9x9 cells dynamically
const buildGrid = () => {
    gridEl.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        const cell = document.createElement('div');
        cell.className = 'main-grid-cell';
        frag.appendChild(cell);
    }
    gridEl.appendChild(frag);
    // refresh NodeList
    cells = gridEl.querySelectorAll('.main-grid-cell');
};

// add spacing after each 3rd row/col
const initGameGrid = () => {
    let index = 0;
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';
        index++;
    }
};

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled','selected','hover','err','cell-err','zoom-in');
        cells[i].setAttribute('data-value','0');
    }
};

const initSudoku = () => {
    clearSudoku();
    resetBg();
    su = sudokuGen(level);
    su_answer = su ? su.question.map(r => r.slice()) : undefined;
    seconds = 0;
    saveGameInfo();

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        const v = su.question[row][col];
        cells[i].setAttribute('data-value', v);
        if (v !== 0) {
            cells[i].classList.add('filled');
            cells[i].textContent = v;
        } else {
            cells[i].textContent = '';
        }
    }
};

const loadSudoku = () => {
    let game = getGameInfo();
    game_level.textContent = CONSTANT.LEVEL_NAME[game.level];
    su = game.su;
    su_answer = su.answer;
    seconds = game.seconds;
    game_time.textContent = showTime(seconds);
    level_index = game.level;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        const v = su_answer[row][col];
        cells[i].setAttribute('data-value', v);
        cells[i].textContent = v !== 0 ? v : '';
        if (su.question[row][col] !== 0) cells[i].classList.add('filled');
    }
};

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) { cells[index - step].classList.add('hover'); step += 9; }
    step = 9;
    while (index + step < 81) { cells[index + step].classList.add('hover'); step += 9; }
    step = 1;
    while (index - step >= 9*row) { cells[index - step].classList.add('hover'); step += 1; }
    step = 1;
    while (index + step < 9*row + 9) { cells[index + step].classList.add('hover'); step += 1; }
};

const resetBg = () => { cells.forEach(e => e.classList.remove('hover')); };

const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err','cell-err');
            setTimeout(() => { cell.classList.remove('cell-err'); }, 500);
        }
    };

    let index = selected_cell;
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            if (!cell.classList.contains('selected')) addErr(cell);
        }
    }

    let step = 9;
    while (index - step >= 0) { addErr(cells[index - step]); step += 9; }
    step = 9;
    while (index + step < 81) { addErr(cells[index + step]); step += 9; }
    step = 1;
    while (index - step >= 9*row) { addErr(cells[index - step]); step += 1; }
    step = 1;
    while (index + step < 9*row + 9) { addErr(cells[index + step]); step += 1; }
};

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    };
    localStorage.setItem('game', JSON.stringify(game));
};

const removeGameInfo = () => {
    localStorage.removeItem('game');
    document.querySelector('#btn-continue').style.display = 'none';
};

const isGameWin = () => sudokuCheck(su_answer);

const showResult = () => {
    clearInterval(timer);
    result_screen.classList.add('active');
    result_time.textContent = showTime(seconds);
};

const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (selected_cell === -1) return;
            if (!cells[selected_cell].classList.contains('filled')) {
                cells[selected_cell].textContent = index + 1;
                cells[selected_cell].setAttribute('data-value', index + 1);
                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;
                saveGameInfo();
                removeErr();
                checkErr(index + 1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => { cells[selected_cell].classList.remove('zoom-in'); }, 500);
                if (isGameWin()) { removeGameInfo(); showResult(); }
            }
        });
    });
};

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));
                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        });
    });
};

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');
    player_name.textContent = name_input.value.trim();
    setPlayerName(name_input.value.trim());
    game_level.textContent = CONSTANT.LEVEL_NAME[level_index];
    showTime(seconds);
    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.textContent = showTime(seconds);
        }
    }, 1000);
};

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
};

// Button events
document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.textContent = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => { name_input.classList.remove('input-err'); name_input.focus(); }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => { name_input.classList.remove('input-err'); name_input.focus(); }, 500);
    }
});

document.querySelector('#btn-pause').addEventListener('click', () => { pause_screen.classList.add('active'); pause = true; });
document.querySelector('#btn-resume').addEventListener('click', () => { pause_screen.classList.remove('active'); pause = false; });
document.querySelector('#btn-new-game').addEventListener('click', () => { returnStartScreen(); });
document.querySelector('#btn-new-game-2').addEventListener('click', () => { returnStartScreen(); });

document.querySelector('#btn-delete').addEventListener('click', () => {
    if (selected_cell === -1) return;
    if (cells[selected_cell].classList.contains('filled')) return;
    cells[selected_cell].textContent = '';
    cells[selected_cell].setAttribute('data-value', 0);
    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;
    su_answer[row][col] = 0;
    removeErr();
});

// init
const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();
    document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';

    buildGrid();
    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
};

init();
