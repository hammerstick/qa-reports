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
			throw new TypeError(`Argument is of invalid type`)
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
// Menu class
/* ******************** */

/** Class representing a menu of things */
class Menu {
	/**
	 * Create an object that represents a menu,.
	 *
	 * @param {object} menuElem - DOM element that contains the menu.
	 */
	constructor(menuElem) {
		this.menuElem = menuElem

		/** All descendant <button> elements should be added to this Map */
		this.buttons = new Map()

		/** All descendant <input> elements go here */
		this.inputs = new Map()
	}

	/**
	 * Add all direct children <button> elements of menuElem to the `this.buttons` Map.
	 * Each Map entry is keyed to the button's "id" attribute.
	 */
	regAllChildrenButtons() {
		for (let i = 0; i < this.menuElem.children.length; i++) {
			let elem = this.menuElem.children[i]
			if (elem.nodeName == "BUTTON") {
				this.buttons.set(elem.id, elem)
			}
		}
	}

	/** Add all direct children <input> elements of menuElem to the `this.inputs` Map.
	 * Each Map entry is keyed to the input's "id" attribute.
	 */
	regAllChildrenInputs() {
		for (let i = 0; i < this.menuElem.children.length; i++) {
			let elem = this.menuElem.children[i]
			if (elem.nodeName == "INPUT") {
				this.inputs.set(elem.id, elem)
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

function replaceSubstringMap(theString, mapper) {
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
// Main
/* ******************** */

// This map is used to allow the user to input math symbols commonly used in inspection reports.
let mathMap = new Map()
mathMap.set("\\pm\\","±")
mathMap.set("\\dia\\","⌀")
mathMap.set("\\deg\\","°")
mathMap.set("\\perp\\","⊥")
mathMap.set("\\paragram\\","▱")
mathMap.set("\\paral\\","∥")
mathMap.set("\\ang\\","∠")
mathMap.set("\\circcon\\","◎")
mathMap.set("\\circhalf\\","⌓")
mathMap.set("\\circcros\\","⌖")
mathMap.set("\\circlin\\","⌭")
mathMap.set("\\circarc\\","⌒")
mathMap.set("\\circ\\","○")
mathMap.set("\\nearrow2\\","⌰")
mathMap.set("\\nearrow\\","↗")



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
 *
 * This function is designed for use as an argument of `Table.appendRows`
 * such that this function is called every time a new row is added to the table.
 *
 * @param {object} row - The table row DOM element that will have a child menu appended.
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

	let table_menu = new Menu(table_menu_elem)
	table_menu.regAllChildrenButtons()

	row.append(table_menu_elem)

}

/**
 * Replace the text in all cells of a table row according to a Map,
 * 	when the text's container blurs (loses focus).
 * 	Only the cells matching CSS selector "input[type=text]" are affected.
 *
 * This function is designed for use as an argument of `Table.appendRows`
 * such that this function is called every time a new row is added to the table.
 *
 * @param {object} row - The table row DOM element holding children nodes with 'type=text' attribute.
 */
function parseCellText(row) {
	let typeTextNodes = row.querySelectorAll("input[type=text]")
	for (let node of typeTextNodes) {
		node.addEventListener("blur", function() {
			node.value = replaceSubstringMap(node.value, mathMap)
		})
	}
}

/**
 * This function simply runs other functions that should be called on rows in a table.
 *
 * This function is designed for use as an argument of `Table.appendRows`
 * such that this function is called every time a new row is added to the table.
 *
 * @param {object} row - The table row DOM element passed to the other functions
 */

function rowFunc(row) {
	addFloatingMenuToRow(row)
	parseCellText(row)
}

window.onload = function() {

	table_main = new Table(document.getElementById("table_main"))
	table_main.regHead(document.getElementById("table_main").tHead, "head")
	table_main.regBody(document.getElementById("table_main").getElementsByTagName("tbody")[0], "body")

	// Initially insert approximately enough rows in the main table to fill a page if printed
	table_main.appendRows("body",
	                      rowNumInitial,
	                      table_main.heads.get("head").rows[0].cells.length,
	                      rowFunc,
	                      genArray(table_main_cells, Infinity)
	                      )

	// Number all existing rows.
	// The first row is numbered 1 (instead of 0) because 1-indexing is more intuitive to non-programmers.
	table_main.serialNumberCol("body", 0, 1)

	/* Set up main table menu that appears below the main table */
	const table_menu = new Menu(document.getElementById("table_main_menu"))
	table_menu.regAllChildrenButtons()
	table_menu.regAllChildrenInputs()

	// "Insert new row" button processing
	table_menu.buttons.get("rowAppend").addEventListener( "click", function() {
		let append_this_many_rows = table_menu.inputs.get("rowAppendNum").value

		table_main.appendRows("body",
		                      append_this_many_rows,
		                      table_main.heads.get("head").rows[0].cells.length,
		                      rowFunc,
		                      genArray(table_main_cells, Infinity) )
		table_main.serialNumberCol("body", 0, 1)
		} )

}
