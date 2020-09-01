/**
 * @file Dynamic content for the First Article Inspection Report.
 */

"use strict";


/* ******************** */
// Main
/* ******************** */

/** Initial number of rows in the main table.
 * This number should be set such that the page fits on a single letter-size page when printed.
 */
const rowNumInitial = 28

// The row of the table containing part information (part number, part description, etc.) will contain these cells
let table_part_info_cells = [
                             "<label><input type=\"text\" class=\"partnum\" ></input></label>",
					         "<label><input type=\"text\" class=\"partrev\" ></input></label>",
					         "<label><input type=\"text\" class=\"partdesc\" ></input></label>",
					         "<label><input type=\"text\" class=\"partpo\" ></input></label>",
					         "<label><input type=\"text\" class=\"partserial\" ></input></label>"
                            ]

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
function parseInputCellsInRow(row) {
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
	parseInputCellsInRow(row)
}

window.onload = function() {
	table_part_info = new Table(document.getElementById("table_part_info"))
	table_part_info.regHead(document.getElementById("table_part_info").tHead, "head")
	table_part_info.regBody(document.getElementById("table_part_info").getElementsByTagName("tbody")[0], "body")

	table_part_info.appendRows("body",
	                           1,
	                           table_part_info.heads.get("head").rows[0].cells.length,
	                           parseInputCellsInRow,
	                           arrayToGenerator(table_part_info_cells, Infinity)
	                           )


	table_main = new Table(document.getElementById("table_main"))
	table_main.regHead(document.getElementById("table_main").tHead, "head")
	table_main.regBody(document.getElementById("table_main").getElementsByTagName("tbody")[0], "body")

	// Initially insert approximately enough rows in the main table to fill a page if printed
	table_main.appendRows("body",
	                      rowNumInitial,
	                      table_main.heads.get("head").rows[0].cells.length,
	                      rowFunc,
	                      arrayToGenerator(table_main_cells, Infinity)
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
		                      arrayToGenerator(table_main_cells, Infinity) )

		table_main.serialNumberCol("body", 0, 1)
		} )

	// Floating info box
	let info_escaped_text = new Table(document.getElementById("info_escaped_text"))
	info_escaped_text.regHead(info_escaped_text.tableElem.getElementsByTagName("thead")[0], "head")
	info_escaped_text.regBody(info_escaped_text.tableElem.getElementsByTagName("tbody")[0], "body")

	info_escaped_text.appendRows("body",
	                             mathMap.size,
	                             info_escaped_text.heads.get("head").rows[0].cells.length,
	                             null,
	                             mapToGenerator(mathMap)
	                            )

}
