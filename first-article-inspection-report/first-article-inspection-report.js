"use strict";

/** Initial number of rows in the main table.
 * This number should be set such that the page fits on a single letter-size page when printed.
 */
const rowNumInitial = 28


/* ******************** */
// Table class
/* ******************** */

/** Class representing a table. */
class Table {
	/**
	 * Create an object that represents a table.
	 *
	 * @param {object} tableElem - <table> DOM element
	 */
	constructor(tableElem) {
		/** <table> DOM element */
		this.tableElem = tableElem

		/** Heads of the table (<thead> DOM elements) are stored in this Map */
		this.heads = new Map()

		/** Bodies of the table (<tbody> DOM elements) are stored in this Map */
		this.bodies = new Map()
	}

	/**
	 * Register a <thead> DOM element to the class instance's Map of <thead> elements.
	 * @param {object} headElem - The <thead> DOM element to register
	 * @param {*} keyName - The key to use for this <thead> element in the Map
	 */
	regHead (headElem, keyName) {
		this.heads.set(keyName, headElem)
	}

	/**
	 * Register a <tbody> DOM element to the class instance's Map of <tbody> elements.
	 * @param {object} bodyElem - The <tbody> DOM element to register
	 * @param {*} keyName - The key to use for this <tbody> element in the Map
	 */
	regBody (bodyElem, keyName) {
		this.bodies.set(keyName, bodyElem)
	}

	/**
	 * Append some number of new rows to a table body.
	 *
	 * The HTML of the cells of the new rows can be specified.
	 *
	 * @param {object} tableBodyKey - New rows will be append to the table body with this key name in the `bodies` Map.
	 * @param {number} numRows - The number of rows to append.
	 * @param {number} numCols - The number of columns in a row.
	 * @param {?Function} rowFunc - After a row is create, this function is called as `rowFunc(rowElem)`, where `rowElem` is the row DOM element.
	 * @param {Generator|string|number} [cellHTML = ""] - Each new cell will have this HTML text. If this is a string, all cell contents will contain this same string. If this is a Generator, each cell's contents will be populated from what the Generator yields.
	 */
	appendRows(tableBodyKey, numRows, numCols, rowFunc=null, cellHTML = "") {
		let newrow;
		let newcell;
		for (let i = 0; i < numRows; i++) {
			newrow = this.bodies.get(tableBodyKey).insertRow(-1)
			for (var j = 0; j < numCols; j++) {

				newcell = newrow.insertCell(-1) // Inserting from end looks more intuitive then inserting from beginning
				if (typeof(cellHTML.next) == "function") { // If `cellHTML` is a generator...
					newcell.innerHTML = cellHTML.next().value
				} else { // Otherwise, assume the `cellHTML` is a string or number
					newcell.innerHTML = cellHTML
				}

			}
			if (rowFunc)
				rowFunc(newrow)
		}
	}

	/**
	 * Delete a single row or a group of rows from a table body.
	 *
	 * @param {object} bodyKey - A reference to the table body element
	 * @param {Number|Number[]} rowDelete - Single number or Array of the row index numbers to delete from the table
	 */
	deleteRows(bodyKey, rowDelete) {
		let rowsArray = []

		if (typeof(rowDelete) === "number") {
			rowsArray = [rowDelete]
		} else if (Array.isArray(rowDelete)) {
			rowsArray = rowDelete
		} else {
			throw new InvalidArgumentException(`Argument is of invalid type`)
		}

		for (let rowIndex of rowsArray) {
			this.bodies.get(bodyKey).deleteRow(rowIndex)
		}
	}

	/**
	 * Fills a column of cells in a table body with consecutive numbers.
	 *
	 * @param {object} bodyKey - The key of the table body element
	 * @param {number} colIndex - The index number of the column in the table element.
	 * @param {number} [start = 0] - The auto-number will begin at this number.
	 */
	serialNumberCol(bodyKey, colIndex, start = 0) {
		let tElem = this.bodies.get(bodyKey)
		let numRows = tElem.rows.length;

		let numGen = genArray(range(start,numRows+1))

		for (let row of tElem.rows) {
			row.cells[colIndex].textContent = numGen.next().value
		}
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
	 * On class instantiation, all existing `<button>` HTML objects will be added to the `this.buttons` map and are keyed by the HTML ID of the button.
	 *
	 *
	 * @param {object} menuElem - DOM element that contains the menu.
	 *
	 */
	constructor(menuElem) {
		this.menuElem = menuElem
		this.buttons = new Map()
	}

	/**
	 * Add all direct children button elements of the menu elements to the `this.buttons` Map.
	 * Each Map entry is keyed to the button's "id" attribute.
	 */
	regAllChildrenButtons() {
		for (let i = 0; i < this.menuElem.children.length; i++) {
			let elem = this.menuElem.children[i]
			if (elem.type == "button") {
				this.buttons.set(elem.id, elem)
			}
		}
	}
}

/* ******************** */
// String processing functions
/* ******************** */

/**
 * Replace substrings in a string based on a Map.
 *
 * @param {String} theString - The string to process.
 * @param {Map<String, String>} mapper - All keys from this Map found in theString will be replaced by their values.
 * @returns {String} - A new String, which is theString with all keys found in mapper replaced by their values.
 */

function applyMapToString(theString, mapper) {
	let newString = theString
	for (let [key, value] of mapper) {
		newString = newString.replace(key, value)
	}
	return newString
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

// This map is used to allow the user to input math symbols commonly used in inspection reports.
let mathMap = new Map()
mathMap.set("\\pm","±")
mathMap.set("\\dia","⌀")
mathMap.set("\\deg","°")
mathMap.set("\\perp","⊥")
mathMap.set("\\paragram","▱")
mathMap.set("\\paral","∥")
mathMap.set("\\ang","∠")
mathMap.set("\\circcon","◎")
mathMap.set("\\circhalf","⌓")
mathMap.set("\\circcros","⌖")
mathMap.set("\\circlin","⌭")
mathMap.set("\\circarc","⌒")
mathMap.set("\\circ","○")
mathMap.set("\\nearrow2","⌰")
mathMap.set("\\nearrow","↗")



// Each row of the main table will contain these HTML lines in the cells, in this order.
let table_main_cells = [
                       "<label><input type=\"text\" class=\"itemnum\" ></input></label>",
                       "<label><input type=\"text\" class=\"pagenum\" ></input></label>",
                       "<label><input type=\"text\" class=\"loc\" ></input></label>",
                       "<label><input type=\"text\" class=\"param\" ></input></label>",
                       "<label><input type=\"text\" class=\"actual\" ></input></label>",
                       "<label><input type=\"text\" class=\"insptool\" ></input></label>"
                       ]

/**
 * Add a new floating menu as a child to a row in a table.
 * This function is designed for use as an argument of `Table.appendRows`
 * such that this function is called every time a new row is added to the table.
 */
function addFloatingMenuToRow(row) {
	let table_menu_elem = document.createElement("div")
	table_menu_elem.classList.add("table_menu_float")
	table_menu_elem.classList.add("no-print")

	// Put a "Delete row" button in the menu
	let row_delete_button = document.createElement("button")
	row_delete_button.type = "button"
	row_delete_button.classList.add("rowDelete")
	row_delete_button.textContent = "Delete row"
	row_delete_button.addEventListener("click", function() {
		row.parentNode.removeChild(row)
		table_main.serialNumberCol("body", 0, 1)
	})
	table_menu_elem.append(row_delete_button)

	let table_menu = new TableMenu(table_menu_elem)
	table_menu.regAllChildrenButtons()

	row.append(table_menu_elem)

}

window.onload = function() {

	table_main = new Table(document.getElementById("table_main"))
	table_main.regHead(document.getElementById("table_main").tHead, "head")
	table_main.regBody(document.getElementById("table_main").getElementsByTagName("tbody")[0], "body")

	// Initially insert approximately enough rows in the main table to fill a page if printed
	table_main.appendRows("body",
	                      rowNumInitial,
	                      table_main.heads.get("head").rows[0].cells.length,
	                      addFloatingMenuToRow,
	                      genArray(table_main_cells, Infinity)
	                      )

	// Auto-number all existing rows.
	// The first row is numbered 1 (instead of 0) because 1-indexing is more intuitive to non-programmers.
	table_main.serialNumberCol("body", 0, 1)

	/* Set up main table menu that appears below the main table */
	const table_menu = new TableMenu(document.getElementById("table_main_menu"))
	table_menu.regAllChildrenButtons()

	// "Insert new row" button processing
	table_menu.buttons.get("rowAppend").addEventListener( "click", function() {
		table_main.appendRows("body",
		                      1,
		                      table_main.heads.get("head").rows[0].cells.length,
		                      addFloatingMenuToRow,
		                      genArray(table_main_cells, Infinity) )
		table_main.serialNumberCol("body", 0, 1)
		} )

	// "Parse input text" button processing
	table_menu.buttons.get("parseInputText").addEventListener("click", function() {
		// This variable needs to be rebuilt every time this function is called
		// because `querySelectorAll` returns a static view, not a live view.
		let inputTextAll = document.querySelectorAll("[type=text]")
		for (let node of inputTextAll) {
			node.value = applyMapToString(node.value, mathMap)
		}

	})

}
