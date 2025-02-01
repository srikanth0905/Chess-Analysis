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

// Initialize move history container
const moveHistoryContainer = document.getElementById("moveHistory");

function updateMoveHistory() {
    const moves = chess.history({ verbose: true });
    let formattedMoves = "<strong>Scoresheet</strong>";
    
    formattedMoves += `<table style="width:100%; border-collapse: collapse;">
                            <tr>
                                <th style="text-align: left;">#</th>
                                <th style="text-align: left;">White</th>
                                <th style="text-align: left;">Black</th>
                            </tr>`;

    for (let i = 0; i < moves.length; i += 2) {
        let moveNumber = Math.floor(i / 2) + 1;
        let whiteMove = moves[i] ? moves[i].san : "";
        let blackMove = moves[i + 1] ? moves[i + 1].san : "";

        formattedMoves += `<tr>
                              <td>${moveNumber}.</td>
                              <td>${whiteMove}</td>
                              <td>${blackMove}</td>
                           </tr>`;
    }

    formattedMoves += "</table>";
    document.getElementById("moveHistory").innerHTML = formattedMoves;
}


// Modify existing onDrop function to include move history update
function handleMove(source, target) {
    let move = chess.move({ from: source, to: target });

    if (move === null) return "snapback"; // Invalid move

    board.position(chess.fen());
    updateMoveHistory();
    analyzePosition();
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
