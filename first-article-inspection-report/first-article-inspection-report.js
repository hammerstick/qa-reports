"use strict";

/* ******************** */
// Table functions
/* ******************** */

/**
 * Append some number of rows to a table.
 *
 * The HTML of the cells of the new rows can be specified.
 *
 * @param {object} tableBody - A reference to the table body element that will have rows appended.
 * @param {number} numRows - The number of rows to append.
 * @param {number} numCols - The number of columns in a row.
 * @param {Generator|string|number} [cellHTML = ""] - Each new cell will have this HTML text. If this is a string, all cell contents will contain this same string. If this is a Generator, each cell's contents will be populated from what the Generator yields.
 */
function tableAppendRows(tableBody, numRows, numCols, cellHTML = "") {
	let newrow;
	let newcell;
	for (let i = 0; i < numRows; i++) {
		newrow = tableBody.insertRow(-1);
		for (var j = 0; j < numCols; j++) {

			newcell = newrow.insertCell(-1); // Inserting from end looks more intuitive then inserting from beginning
			if (typeof(cellHTML.next) == "function") { // If `cellHTML` is a generator...
				newcell.innerHTML = cellHTML.next().value;
			} else { // Otherwise, assume the `cellHTML` is a string or number
				newcell.innerHTML = cellHTML;
			}

		}
	}
}

/**
 * Delete a single row or a group of rows from a table body.
 *
 * @param {object} tableBody - A reference to the table body element
 * @param {Number|Number[]} rowDelete - Single number or Array of the row index numbers to delete from the table
 */
function tableDeleteRows(tableBody, rowDelete) {
	let rowsArray = []

	if (typeof(rowDelete) === "number") {
		rowsArray = [rowDelete]
	} else if (Array.isArray(rowDelete)) {
		rowsArray = rowDelete
	} else {
		throw new InvalidArgumentException(`Argument is of invalid type`)
	}

	for (let rowIndex of rowsArray) {
		tableBody.deleteRow(rowIndex)
	}
}

/**
 * Fills a column of cells in a table with consecutive numbers.
 *
 *
 * @param {object} tElem - A reference to the HTML tbody or thead element.
 * @param {number} colIndex - The index number of the column in the table element.
 * @param {number} [start = 0] - The auto-number will begin at this number.
 */
function autoNumberCol(tElem, colIndex, start = 0) {
	let numRows = tElem.rows.length;

	let numGen = genArray(range(start,numRows+1));

	for (let row of tElem.rows) {
		row.cells[colIndex].textContent = numGen.next().value;
	}
}




/* ******************** */
// TableMenu class
/* ******************** */

/** Class representing a menu of things that modify a table */
class TableMenu {
	/**
	 * Create an object that represents a menu that contains useful functions for table manipulations (e.g. a div containing buttons that add and remove rows in a table).
	 *
	 * TableMenu.buttons {Map}:
	 * On class instantiation, all `<button>` HTML objects will be added to the `this.buttons` map and are keyed by the HTML ID of the button.
	 *
	 *
	 * @param {object} menuElem - DOM element that contains the menu.
	 *
	 */
	constructor(menuElem) {
		this.menuElem = menuElem
		this.buttons = new Map()

		this.addAllChildrenButtons()
	}

	/**
	 * Add all direct children button elements of the menu elements to the `buttons` Map.
	 * Each Map entry is keyed to the button's HTML ID.
	 */
	addAllChildrenButtons() {
		for (let i = 0; i < this.menuElem.children.length; i++) {
			let elem = this.menuElem.children[i]
			if (elem.type == "button") {
				this.buttons.set(elem.id, elem)
			}
		}
	}
}

/* ******************** */
// Utility functions
/* ******************** */

/**
 * Create a Generator from an Array.
 *
 * The generator will loop through all elements of the array.
 * The generator may loop through any number of times, including infinitely many times.
 *
 * @param {Array} the_array - The array to loop through.
 * @param {number} [loops = 1] - Number of times to loop through the array. May be Infinity.
 * @yields {object} The next element in the array.
 */
function* genArray(the_array, loops = 1) {
	for (let i = 0; i < loops; i++) {
		for (let elem of the_array) {
			yield elem
		}
	}
}

/**
 * Create a "range" of numbers as an Array.
 *
 * This acts similarly to Python's `range()` function.
 *
 * @param {number} start - The Array will start with this number
 * @param {number} end - The Array will stop at the number *right before* this number
 * @param {number} [step = 1] - Consecutive elements have this difference
 * @returns {Array} An Array of numbers beginning with `start`, with `step` step size, and ending before `end`
 */
function range(start, end, step = 1) {
	return [...Array(Math.floor( (end-start)/step )).keys()].map(x => step * x + start);
}

/* ******************** */
// Exceptions definitions
/* ******************** */

let errorProto = Object.create(Error.prototype)

// `InvalidArgumentException` taken from `https://stackoverflow.com/a/27724419`
function InvalidArgumentException(message) {
    this.message = message
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, InvalidArgumentException)
    else
        this.stack = (new Error()).stack
}

InvalidArgumentException.prototype = errorProto;
InvalidArgumentException.prototype.name = "InvalidArgumentException"
InvalidArgumentException.prototype.constructor = InvalidArgumentException


/* ******************** */
// Main
/* ******************** */

// Each row of the main table will contain these HTML lines in the cells, in this order.
let table_main_cells = [
                       "<label><input class=\"itemnum\" ></input></label>",
                       "<label><input class=\"pagenum\" ></input></label>",
                       "<label><input class=\"loc\" ></input></label>",
                       "<label><input class=\"param\" ></input></label>",
                       "<label><input class=\"actual\" ></input></label>",
                       "<label><input class=\"insptool\" ></input></label>"
                       ]

window.onload = function() {

	const table_main = document.getElementById("table_main")
	const table_main_body = table_main.getElementsByTagName("tbody")[0]

	// Insert 23 rows in the main table
	tableAppendRows(table_main_body,
	                23,
	                table_main.tHead.rows[0].cells.length,
	                genArray(table_main_cells, Infinity)
	                );

	// Auto-number all existing rows.
	// The first row is numbered 1 (instead of 0) because 1-indexing is more intuitive to non-programmers.
	autoNumberCol(table_main_body, 0, 1);

	/* Set up main table menu that appears below the main table */
	const table_menu = new TableMenu(document.getElementById("table_main_menu"));

	// Insert new row button
	table_menu.buttons.get("rowAppend").addEventListener( "click", function() {
		tableAppendRows( table_main_body,1,table_main.tHead.rows[0].cells.length,genArray(table_main_cells, Infinity) )
		autoNumberCol(table_main_body, 0, 1)
		} )

	/* For every row, insert a floating menu that appears when hovering over a row. */
	for (let row of table_main_body.rows) {
		let tableMenuFloatElem = document.createElement("div")
		tableMenuFloatElem.classList.add("table_menu_float")
		tableMenuFloatElem.classList.add("no-print")

		let rowDeleteButton = document.createElement("button")
		rowDeleteButton.type = "button"
		rowDeleteButton.classList.add("rowDelete")
		rowDeleteButton.textContent = "Delete Row"
		rowDeleteButton.addEventListener("click", function() {
			row.parentNode.removeChild(row)
			autoNumberCol(table_main_body, 0, 1)
			})

		tableMenuFloatElem.append(rowDeleteButton)

		row.appendChild(tableMenuFloatElem)
	}
}
