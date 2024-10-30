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

		node.addEventListener('keydown', function(e) {
			if (e.key === "Enter") {
				e.preventDefault()

				let nextInput = goToNextInput(node);
				if (nextInput) {
					nextInput.focus()
				}
			}
		})
	}
}

// Function to check if there's another input to go to using the 'Enter' key
function goToNextInput(currentInput) {
	let table = currentInput.closest('table');
	let inputs = Array.from(table.querySelectorAll('input[type=text]'));
	let currentIndex = inputs.indexOf(currentInput);

	// Get the current row
	let currentRow = currentInput.closest('tr');

	for (let i = currentIndex + 1; i < inputs.length; i++) {
		if (inputs[i].parentElement.cellIndex === currentInput.parentElement.cellIndex) {
			let itemNumber = currentRow.rowIndex;
			// console.log(`Currently viewing Item #${itemNumber}`);
			return inputs[i];
		}
	}

	return null;
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
	// addFloatingMenuToRow(row)
	const itemNumCell = row.cells[0].querySelector('.itemnum');
	if (itemNumCell) {
		itemNumCell.value = row.rowIndex;
	}
	parseInputCellsInRow(row)
}

window.onload = function() {
	let table_part_info = new Table(document.getElementById("table_part_info"))
	table_part_info.regHead(document.getElementById("table_part_info").tHead, "head")
	table_part_info.regBody(document.getElementById("table_part_info").getElementsByTagName("tbody")[0], "body")

	table_part_info.appendRows("body",
	                           1,
	                           table_part_info.heads.get("head").rows[0].cells.length,
	                           parseInputCellsInRow,
	                           arrayToGenerator(table_part_info_cells, Infinity)
	                           )


	let table_main = new Table(document.getElementById("table_main"))
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


	// Delete row(s) button
	table_menu.buttons.get('rowDelete').addEventListener('click', function(e) {
		e.preventDefault();

		let delete_these_rows_input = table_menu.inputs.get('rowDeleteInput').value.trim();

		// Do nothing if input is blank
		if (!delete_these_rows_input) return;

		let itemNumbersToDelete = [];

		// Deletion of multiple rows indicated by comma separation
		let delete_range = delete_these_rows_input.split(',');

		for (let range of delete_range) {
			// Checking if input contains a hyphen, indicating a specified range of rows based on item numbers
			if (range.includes('-')) {
				// Split the range string into start and end values, and converting them to numbers
				let [start, end] = range.split('-').map(Number);

				// Make sure start and end values are in fact numbers/integers
				if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0) {
					for (let i = start; i <= end; i++) {
						itemNumbersToDelete.push(i);
					}
				}
			} else {
				// For single number input deletion
				let itemNumber = Number(range.trim());
				if (!isNaN(itemNumber) && itemNumber > 0) {
					itemNumbersToDelete.push(itemNumber);
				}
			}
		}

		// Using a Set to store unique values, this makes sure that any duplicate values will not be considered/added, thus no duplicate row number deletions.
		let uniqueItemNumbersToDelete = [...new Set(itemNumbersToDelete)].sort((a, b) => b - a);

		let successfullyDeleted = [];

		// Select all rows in the table body
		const rows = document.querySelectorAll('#table_main tbody tr');

		// Delete rows based on item number
		uniqueItemNumbersToDelete.forEach((itemNumber) => {
			// Find the row with the matching item number
			let rowIndex = Array.from(rows).findIndex((row) => {
				return Number(row.cells[0].textContent.trim()) === itemNumber;
			});

			// If the row exists, delete it
			if (rowIndex !== -1) {
				rows[rowIndex].remove();
				successfullyDeleted.push(itemNumber);
			} else {
				console.error(`Item Number ${itemNumber} does not exist.`)
			}
		});

		if(successfullyDeleted.length > 0) {
			successfullyDeleted.sort((a, b) => a - b)
			console.error(`Deleted Item Numbers: ${successfullyDeleted.join(', ')}`)
		}

		// Clear the input box after button click
		table_menu.inputs.get('rowDeleteInput').value = '';

		// Comment in this line if you want to renumber rows
		table_main.serialNumberCol("body", 0, 1);
	});


	// Function that exports this JS file to a JSON file
	function exportToJson() {
		// Collect data from part info table and also allows for blank inputs
		const partInfoTable = document.getElementById("table_part_info");
		const partInfoData = Array.from(partInfoTable.rows).slice(1).map(row => ({
			partNum: row.cells[0].querySelector('.partnum') ? row.cells[0].querySelector('.partnum').value : '',
			partRev: row.cells[1].querySelector('.partrev') ? row.cells[1].querySelector('.partrev').value : '',
			partDesc: row.cells[2].querySelector('.partdesc') ? row.cells[2].querySelector('.partdesc').value : '',
			partPO: row.cells[3].querySelector('.partpo') ? row.cells[3].querySelector('.partpo').value : '',
			partSerial: row.cells[4].querySelector('.partserial') ? row.cells[4].querySelector('.partserial').value : '',
		}));

		// Collect data from main inspection table and also allows for blank inputs
		const mainTable = document.getElementById("table_main");
		const mainData = Array.from(mainTable.rows).slice(1).map(row => ({
			itemNum: row.rowIndex,
			pageNum: row.cells[1].querySelector('.pagenum') ? row.cells[1].querySelector('.pagenum').value : '',
			location: row.cells[2].querySelector('.loc') ? row.cells[2].querySelector('.loc').value : '',
			param: row.cells[3].querySelector('.param') ? row.cells[3].querySelector('.param').value : '',
			actual: row.cells[4].querySelector('.actual') ? row.cells[4].querySelector('.actual').value : '',
			inspTool: row.cells[5].querySelector('.insptool') ? row.cells[5].querySelector('.insptool').value : '',
		}));

		// JSON object
		const jsonData = {
			partInfo: partInfoData,
			mainData: mainData,
			comments: document.getElementById("commentTextBox") ? document.getElementById("commentTextBox").value : ''
		};

		const jsonString = JSON.stringify(jsonData, null, 2);

		// Create a blob and download the file
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "first_article_inspection_report.json";
		a.click();

		URL.revokeObjectURL(url);
	}

	document.getElementById("exportToJson").addEventListener("click", exportToJson);


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
