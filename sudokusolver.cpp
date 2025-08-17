#include <bits/stdc++.h>
using namespace std;

#define N 9

// ---------- Utility Functions ----------

// Check if placing num at board[row][col] is safe
bool isSafe(int board[N][N], int row, int col, int num) {
    // Row
    for (int x = 0; x < N; x++)
        if (board[row][x] == num) return false;
    // Col
    for (int x = 0; x < N; x++)
        if (board[x][col] == num) return false;
    // 3x3 grid
    int gridrSt = (row / 3) * 3;
    int gridcSt = (col / 3) * 3;
    for (int i = gridrSt; i < gridrSt + 3; i++) {
        for (int j = gridcSt; j < gridcSt + 3; j++) {
            if (board[i][j] == num) return false;
        }
    }
    return true;
}

// ---------- Solver (Backtracking) ----------

bool helper(int board[N][N], int row, int col) {
    if (row == 9) return true;

    int nRow = row, nCol = col + 1;
    if (nCol == 9) { nRow = row + 1; nCol = 0; }

    if (board[row][col] != 0) return helper(board, nRow, nCol);

    for (int dig = 1; dig <= 9; dig++) {
        if (isSafe(board, row, col, dig)) {
            board[row][col] = dig;
            if (helper(board, nRow, nCol)) return true;
            board[row][col] = 0; // backtrack
        }
    }
    return false;
}

void solveSudoku(int board[N][N]) {
    helper(board, 0, 0);
}

// ---------- Generator ----------

// Fill board completely with valid solution
bool fillBoard(int board[N][N], int row, int col) {
    if (row == N - 1 && col == N) return true;
    if (col == N) { row++; col = 0; }
    if (board[row][col] != 0) return fillBoard(board, row, col + 1);

    vector<int> numbers = {1,2,3,4,5,6,7,8,9};
    random_shuffle(numbers.begin(), numbers.end());

    for (int num : numbers) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board, row, col + 1)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

// Remove K cells to create puzzle
void removeDigits(int board[N][N], int K) {
    while (K > 0) {
        int i = rand() % N;
        int j = rand() % N;
        if (board[i][j] != 0) {
            board[i][j] = 0;
            K--;
        }
    }
}

// Print board
void printBoard(int board[N][N]) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            if (board[i][j] == 0) cout << ". ";
            else cout << board[i][j] << " ";
        }
        cout << "\n";
    }
}

// ---------- Main ----------

int main() {
    srand(time(0));

    int board[N][N] = {0};

    // Step 1: Generate solved Sudoku
    fillBoard(board, 0, 0);

    // cout << "Generated Complete Sudoku Solution:\n";
    // printBoard(board);

    // Step 2: Remove digits for puzzle
    int K = 40; // easy/medium/hard adjust
    int puzzle[N][N];
    memcpy(puzzle, board, sizeof(board));//copying the correct filled sudoku and then removing the changes
    removeDigits(puzzle, K);

    cout << "\nGenerated Puzzle:\n";
    printBoard(puzzle);

    // Step 3: Solve puzzle
    cout << "\nSolving Puzzle...\n";
    solveSudoku(puzzle);
    printBoard(puzzle);

    return 0;
}
