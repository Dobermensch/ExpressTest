const Cell = require("../Cell").getCell();

/*

Class for housing functions that process the game

*/

class GameService {
  constructor(io) {
    this.game_board = [];
    this.game_running = false;
    this.live_cells = {};
    this.i_o = io;
    this.neighbours = [
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1]
    ];
  }

  /*
    Getter & Setters
  */

  get board() {
    return this.game_board;
  }

  set board(arr_of_arr) {
    this.game_board = arr_of_arr;
  }

  get gameRunning() {
    return this.game_running;
  }

  set gameRunning(boolean) {
    this.game_running = boolean;
  }

  get liveCells() {
    return this.live_cells;
  }

  set liveCells(obj_of_cells) {
    return (this.live_cells = obj_of_cells);
  }

  get io() {
    return this.i_o;
  }

  set io(socketIOGL) {
    this.i_o = socketIOGL;
  }

  /*
    params: none
    desc: creates a new board by dynammically adding 100 arrays of 
        size 100 to the 'game_board' instance variable
  */
  createNewBoard() {
    for (let i = 0; i < 50; i++) {
      this.game_board.push(new Array(50));
    }
  }

  /*
    params: none
    desc: populates 'game_board' instance variable with instances of Cells
  */
  setBoard() {
    for (let r = 0; r < 50; r++) {
      for (let c = 0; c < 50; c++) {
        this.game_board[r][c] = new Cell(r, c, 255, 255, 255, 0);
      }
    }
  }

  /*
    params: none
    desc: wrapper function to call relevant initialization functions
  */
  setup() {
    this.createNewBoard();
    this.setBoard();
  }

  /*
    params: none
    desc: returns the values of instance variable object 'live_cells'
    returned value: array of Cell objects
  */
  getLiveCells() {
    return Object.values(this.live_cells);
  }

  /*
    params: nb => indexes of neighbour in form [x, y] where x & y are integers
            cell => indexes of cell in form [x, y] where x & y are integers
    desc: checks whether the addition of coordinates of neighbour and cell are within board
    returned value: boolean value 
  */
  withinBoard(nb, cell) {
    let new_row = nb[0] + cell[0];
    let new_col = nb[1] + cell[1];

    return [new_row, new_col].every(val => val >= 0 && val < 50);
  }

  /*
    params: cells => array of Cell objects representing cells that are alive currently
    desc: This function finds which live cells should die and which ones will remain
    returned value: an array containing arrays of cells (Cell Objects) that should die and remain
  */
  classifyCells(cells) {
    let deadCells = [];
    let survivingCells = [];
    const current_this = this;

    cells.map(cell => {
      let live_nbs = 0;
      let row = cell.index[0];
      let col = cell.index[1];

      current_this.neighbours.map(nb => {
        if (current_this.withinBoard(nb, cell.index)) {
          let new_row = nb[0] + row;
          let new_col = nb[1] + col;
          if (this.game_board[new_row][new_col].alive === 1) {
            live_nbs++;
          }
        }
      });

      if (live_nbs < 2 || live_nbs > 3) {
        deadCells.push(cell);
      } else if (live_nbs === 2 || live_nbs === 3) {
        survivingCells.push(cell);
      } else {
      }
    });

    return [deadCells, survivingCells];
  }

  /*
    params: cells => array of Cells (Cell Objects) that remain alive
    desc: this function checks the neighbours of surviving cells to 
    determine whether they should come to life
    returned value: array of dead cells (Cell index & color) that should come to life
  */
  breathOfLife(cells) {
    let live_and_let_live = [];
    const current_this = this;

    cells.map(cell => {
      let dead_neighbas = [];
      current_this.neighbours.map(nb => {
        if (
          current_this.withinBoard(nb, cell.index) &&
          this.game_board[nb[0] + cell.index[0]][nb[1] + cell.index[1]]
            .alive === 0
        ) {
          dead_neighbas.push([nb[0] + cell.index[0], nb[1] + cell.index[1]]);
        }
      });

      dead_neighbas.map(ind => {
        let to_be_or_not_to_be = 0;
        let tally = [];
        current_this.neighbours.map(nb => {
          if (current_this.withinBoard(nb, ind)) {
            if (this.game_board[ind[0] + nb[0]][ind[1] + nb[1]].alive === 1) {
              to_be_or_not_to_be++;
              tally.push(this.game_board[ind[0] + nb[0]][ind[1] + nb[1]].color);
            }
          }
        });

        if (to_be_or_not_to_be === 3) {
          // to be
          let colors = [0, 1, 2].map(n =>
            Math.floor(
              tally.map(col => col[n]).reduce((a, b) => a + b, 0) / tally.length
            )
          );
          live_and_let_live.push({ index: ind, color: colors });
        }
      });
    });

    return live_and_let_live;
  }

  /*
    params: none
    desc: wrapper function, it ultimately carries out killing and bring
    cells to life and sending the information to clients if necessary.
  */
  checkBoard() {
    let deadCells;
    let survivingCells;
    let aliveCells = this.getLiveCells();
    [deadCells, survivingCells] = this.classifyCells(aliveCells);
    let newborns = this.breathOfLife(survivingCells);

    // Actually killing the cells
    deadCells.map(cell => {
      cell.color = [255, 255, 255];
      cell.alive = 0;
      let x, y;
      [x, y] = cell.index;
      delete this.live_cells[this.get_key(x, y)];
    });

    // Actually bringing cells to life
    newborns.map(obj => {
      let r, c;
      [r, c] = obj.index;
      this.game_board[r][c].alive = 1;
      this.game_board[r][c].color = obj.color;
      this.live_cells[this.get_key(r, c)] = this.game_board[r][c];
    });

    let changedCells = [deadCells, newborns].map((arr, a_i) =>
      arr.map(cell => ({
        ind: cell.index,
        color: cell.color
      }))
    );

    if (changedCells.some(arr => arr.length > 0)) {
      this.i_o.emit("changedCells", changedCells);
    }
  }

  /*
    params: none
    desc: function that calls checkBoard every couple of seconds
  */
  runGame() {
    const current_this = this;
    this.game_running = setInterval(function() {
      current_this.checkBoard();
      let clientCount = current_this.i_o.sockets.server.engine.clientsCount;
      if (clientCount === 0) {
        clearInterval(current_this.game_running);
        current_this.game_running = null;
        current_this.live_cells = {};
        current_this.setBoard();
        console.log("ended game");
      }
      console.log("tick");
    }, 10000);
  }

  /*
    params: none
    desc: returns the cells currently alive
    returned value: array of Cells (Cell index & color) of cells currently alive
  */
  getCurrentGameState() {
    const liveCells = this.getLiveCells();

    return liveCells.map(cell => ({ ind: cell.index, color: cell.color }));
  }

  /*
    params: n => integer, p => integer
    desc: helper to avoid writing string interpolation repetitively
    returned value: string concatenation of params
  */
  get_key(n, p) {
    return `${n}${p}`;
  }
}

exports.getGameService = function() {
  return GameService;
};
