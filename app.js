let game;
let ui;

function newGame() {
    localStorage.removeItem('results');
    document.getElementById('app').innerHTML = '';
    game = new Game();
    ui = new UI(game);
}

newGame();






