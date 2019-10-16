/*
    Simple Unit Tests
*/

const GameService = require("../ServerDependencies/services/game-service").getGameService();
const Cell = require("../ServerDependencies/Cell").getCell();

beforeEach(() => {
  io_mock = { emit: jest.fn() };
  GS = new GameService(io_mock);
});

test("get_key", () => {
  expect(GS.get_key(1, 2)).toBe("12");
});

test("createNewBoard", () => {
  expect(GS.board).toHaveLength(0);

  GS.createNewBoard();

  expect(GS.board).toHaveLength(50);
  for (let i = 0; i < GS.board.length; i++) {
    expect(GS.board[i]).toHaveLength(50);
  }
});

test("setBoard", () => {
  GS.createNewBoard();
  GS.setBoard();
  for (let r = 0; r < GS.board.length; r++) {
    for (let c = 0; c < GS.board[r].length; c++) {
      expect(GS.board[r][c]).toBeInstanceOf(Cell);
    }
  }
});

test("getLiveCells", () => {
  GS.liveCells = { "12": new Cell(1, 1, 255, 255, 255, 1) };

  const val = GS.getLiveCells();

  expect(val).toHaveLength(1);
  expect(val).to;
  expect(val[0]).toBeInstanceOf(Cell);
});

test("withinBoard", () => {
  const res = GS.withinBoard([1, 1], [2, 2]);
  expect(res).toBeTruthy();

  const res2 = GS.withinBoard([100, 1], [200, 2]);
  expect(res2).toBeFalsy();
});

test("classifyCells", () => {
  GS.setup();

  // creating a lonely cell that will die
  GS.board[10][10].alive = 1;
  GS.liveCells["1010"] = GS.board[10][10];

  let returned_vals = GS.classifyCells(GS.getLiveCells());

  expect(returned_vals[0]).toHaveLength(1);
  expect(returned_vals[1]).toHaveLength(0);

  // creating two cells around previous cell so it lives
  // but the two created cells die
  GS.board[10][9].alive = 1;
  GS.liveCells["109"] = GS.board[10][9];

  GS.board[10][11].alive = 1;
  GS.liveCells["1011"] = GS.board[10][11];

  let returned_vals2 = GS.classifyCells(GS.getLiveCells());
  let deadCells = returned_vals2[0];
  let survivingCells = returned_vals2[1];

  expect(deadCells).toHaveLength(2);
  expect(survivingCells).toHaveLength(1);
});

test("breathOfLife", () => {
  GS.setup();

  // creating three live cells
  GS.board[10][10].alive = 1;
  GS.liveCells["1010"] = GS.board[10][10];

  GS.board[10][9].alive = 1;
  GS.liveCells["109"] = GS.board[10][9];

  GS.board[10][11].alive = 1;
  GS.liveCells["1011"] = GS.board[10][11];

  // breath of life should make Cells at indexes [11, 10] and [9,10] alive
  let survivingCells = GS.classifyCells(GS.getLiveCells())[1];
  let newBorns = GS.breathOfLife(survivingCells);

  expect(Array.isArray(newBorns)).toBe(true);
  expect(newBorns).toHaveLength(2);
  let indexes = newBorns.map(cell => cell.index[0]);
  expect(indexes).toContain(9);
  expect(indexes).toContain(11);
});

test("checkBoard", () => {
  GS.setup();

  // creating three live cells
  GS.board[10][10].alive = 1;
  GS.liveCells["1010"] = GS.board[10][10];

  GS.board[10][9].alive = 1;
  GS.liveCells["109"] = GS.board[10][9];

  GS.board[10][11].alive = 1;
  GS.liveCells["1011"] = GS.board[10][11];

  GS.checkBoard();
  expect(io_mock.emit).toHaveBeenCalledTimes(2);
  expect(io_mock.emit).toHaveBeenCalledWith("deadCells", [[10, 9], [10, 11]]);
  expect(io_mock.emit).toHaveBeenCalledWith("newCells", [
    { ind: [9, 10], color: [255, 255, 255] },
    { ind: [11, 10], color: [255, 255, 255] }
  ]);
});

test("getCurrentGameState", () => {
  GS.setup();
  GS.board[10][10].alive = 1;
  GS.liveCells["1010"] = GS.board[10][10];

  let val = GS.getCurrentGameState();
  expect(val).toEqual([{ ind: [10, 10], color: [255, 255, 255] }]);
});
