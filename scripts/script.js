// Initialize Stockfish
const stockfish = new Worker("scripts/stockfish.js");

stockfish.onmessage = function(event) {
    let data = event.data;
    console.log("Stockfish says:", data);

    if (data.includes("bestmove")) {
        let bestMove = data.split("bestmove ")[1].split(" ")[0];
        document.getElementById("stockfishOutput").innerText = `Best Move: ${bestMove}`;
    }
};

// Initialize Chess.js
let chess = new Chess(); 

// Initialize Chessboard.js
const board = ChessBoard("board", {
    draggable: true,  // Enable piece dragging
    dropOffBoard: "trash",  // Allow pieces to be dropped off the board (optional)
    sparePieces: true,  // Enable spare pieces (optional)
    position: "start",  // Set the initial position to the start of the game
    onDrop: (source, target) => {
        let move = chess.move({ from: source, to: target });
        if (move) {
            updateBoard();
            analyzePosition();
        } else {
            return "snapback"; // Invalid move, snap the piece back
        }
    }
});

// Update the Chessboard UI
function updateBoard() {
    board.position(chess.fen());
    updateMoveHistory();
}

// Update the move history
function updateMoveHistory() {
    const history = chess.history();
    document.getElementById("moveHistory").innerText = history.join("\n");
}

// Analyze the current position using Stockfish
function analyzePosition() {
    const moves = chess.history({ verbose: true }).map(m => m.from + m.to).join(" ");
    stockfish.postMessage("position startpos moves " + moves);
    stockfish.postMessage("go depth 15");
}

// Handle user text input for moves
function userMove() {
    const moveInput = document.getElementById("moveInput").value.trim();
    let move = chess.move(moveInput, { sloppy: true });

    if (move) {
        updateBoard();
        analyzePosition();
    } else {
        alert("Invalid move! Use standard notation (e.g., e4, Nf3, O-O).");
    }
}
