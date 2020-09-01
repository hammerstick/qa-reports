/**
 * @file Library of several classes and functions useful for documents used in machining.
 */

"use strict";

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
	 * @param {number} numCols - The number of columns in the rows to append.
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

		let numGen = arrayToGenerator(range(start,numRows+1))

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
	 * Create an object that represents a menu.
	 *
	 * "input" and "button" DOM elements are to be 'registered' in Maps that are created in this constructor.
	 *
	 * The Maps are not automatically populated by any existing DOM elements when this constructor is called. Call the methods `regAllChildrenButtons()` and `regAllChildrenInputs()` to do so.
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
function* arrayToGenerator(the_array, loops = 1) {
	for (let i = 0; i < loops; i++) {
		for (let elem of the_array) {
			yield elem
		}
	}
}

/**
 * Yield the keys and values of a Map one by one, in the pattern:
 *
 * key0, value0, key1, value1, ... , keyN, valueN
 *
 * where N is the number of key-value pairs in the map.
 *
 * @param {Map} theMap - Map whose keys and values will be yielded
 * @yields {object} The next key or value in `theMap`
 */
function* mapToGenerator(theMap) {
	for (let [key, value] of theMap.entries()) {
		yield key
		yield value
	}
}
