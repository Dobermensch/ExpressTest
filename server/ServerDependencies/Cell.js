/*

This class represents a cell with various attributes and methods to access/set them and 
manipulate them

*/

class Cell {
  constructor(row, col, r, g, b, alive) {
    this.row = row;
    this.col = col;
    this.r = r;
    this.g = g;
    this.b = b;
    this.isAlive = alive;
  }

  get color() {
    return [this.r, this.g, this.b];
  }

  get alive() {
    return this.isAlive;
  }

  get index() {
    return [this.row, this.col];
  }

  set color(arr) {
    this.r = arr[0];
    this.g = arr[1];
    this.b = arr[2];
  }

  set alive(val) {
    this.isAlive = val;
  }
}

exports.getCell = function() {
  return Cell;
};
