// -------- Sudoku Utilities & Solver --------

const newGrid = (size) => {
    const arr = Array.from({ length: size }, () => Array(size).fill(CONSTANT.UNASSIGNED));
    return arr;
};

// Row/Col/Box checks
const isRowSafe = (grid, row, value) => {
    for (let col = 0; col < CONSTANT.GRID_SIZE; col++) if (grid[row][col] === value) return false;
    return true;
};

const isColSafe = (grid, col, value) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) if (grid[row][col] === value) return false;
    return true;
};

const isBoxSafe = (grid, boxRow, boxCol, value) => {
    for (let r = 0; r < CONSTANT.BOX_SIZE; r++) {
        for (let c = 0; c < CONSTANT.BOX_SIZE; c++) {
            if (grid[boxRow + r][boxCol + c] === value) return false;
        }
    }
    return true;
};

// `isSafe(board,row,col,dig)`
const isSafe = (grid, row, col, value) => {
    if (value === CONSTANT.UNASSIGNED) return false;
    return isRowSafe(grid, row, value) && isColSafe(grid, col, value) &&
           isBoxSafe(grid, row - (row % 3), col - (col % 3), value);
};

// Find next unassigned position
const findUnassignedPos = (grid) => {
    for (let r = 0; r < CONSTANT.GRID_SIZE; r++) {
        for (let c = 0; c < CONSTANT.GRID_SIZE; c++) {
            if (grid[r][c] === CONSTANT.UNASSIGNED) return { row: r, col: c };
        }
    }
    return null;
};

// Backtracking solver, `helper`
const helper = (grid) => {
    const pos = findUnassignedPos(grid);
    if (!pos) return true; // solved
    const { row, col } = pos;

    for (let d = 1; d <= 9; d++) {
        if (isSafe(grid, row, col, d)) {
            grid[row][col] = d;
            if (helper(grid)) return true;
            grid[row][col] = CONSTANT.UNASSIGNED; // backtrack
        }
    }
    return false;
};

// Exposed `solveSudoku(board)` that mutates `board` in-place
const solveSudoku = (board) => helper(board);

// Validate a player's grid: all cells filled and all constraints satisfied
const sudokuCheck = (grid) => {
    // Check all filled
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const v = grid[r][c];
            if (v === 0) return false;
        }
    }
    // Validate rows/cols/boxes
    const seenRow = Array.from({length:9},()=>new Set());
    const seenCol = Array.from({length:9},()=>new Set());
    const seenBox = Array.from({length:9},()=>new Set());

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const v = grid[r][c];
            if (v < 1 || v > 9) return false;
            const b = Math.floor(r/3)*3 + Math.floor(c/3);
            if (seenRow[r].has(v) || seenCol[c].has(v) || seenBox[b].has(v)) return false;
            seenRow[r].add(v); seenCol[c].add(v); seenBox[b].add(v);
        }
    }
    return true;
};

// Fisher-Yates shuffle
const shuffleArray = (arr) => {
    let i = arr.length;
    while (i) {
        const j = Math.floor(Math.random() * i--);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Fill a complete solved grid (generator uses backtracking with random order)
const sudokuCreate = (grid) => {
    const pos = findUnassignedPos(grid);
    if (!pos) return true;
    const { row, col } = pos;
    const nums = shuffleArray([...CONSTANT.NUMBERS]);

    for (const num of nums) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (sudokuCreate(grid)) return true;
            grid[row][col] = CONSTANT.UNASSIGNED;
        }
    }
    return false;
};

const rand = () => Math.floor(Math.random() * CONSTANT.GRID_SIZE);

// Remove `level` cells at random 
const removeCells = (grid, level) => {
    const res = grid.map(row => row.slice());
    let attempts = level;
    while (attempts > 0) {
        let r = rand(), c = rand();
        while (res[r][c] === CONSTANT.UNASSIGNED) { r = rand(); c = rand(); }
        res[r][c] = CONSTANT.UNASSIGNED;
        attempts--;
    }
    return res;
};

// Public API: generate puzzle { original, question }
const sudokuGen = (level) => {
    const sudoku = newGrid(CONSTANT.GRID_SIZE);
    if (sudokuCreate(sudoku)) {
        const question = removeCells(sudoku, level);
        return { original: sudoku, question };
    }
    return undefined;
};

// Expose to global scope (optional, for debugging from console)
window.sudokuUtils = { newGrid, isSafe, helper, solveSudoku, sudokuCheck, sudokuGen };
