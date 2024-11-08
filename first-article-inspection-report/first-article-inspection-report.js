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

		node.addEventListener('keydown', function(event) {
			if (event.key === "Enter") {
				event.preventDefault()

				let nextInput = goToNextInput(node)
				if (nextInput) {
					nextInput.focus()
				}
			}
		})
	}
}

/** Finds the next input in the same column of the following row in the table, allowing
 *  users to navigate to the next input by pressing the 'Enter' key.
 *
 * This function is used to enable keyboard navigation within a table, moving to the next
 * input field directly below the current one.
 *
 * @param {object} currentInput - The current input DOM element where 'Enter' is pressed.
*/
function goToNextInput(currentInput) {
	// Get the current row and column of the current input
	let currentRow = currentInput.closest('tr')
	let currentColumn = Array.from(currentInput.closest('td').parentNode.children)
	let currentColumnIndex = currentColumn.indexOf(currentInput.closest('td'))

	let tableBody = currentRow.closest('tbody')

	let allRows = Array.from(tableBody.querySelectorAll('tr'))

	let currentRowIndex = allRows.indexOf(currentRow)

	// Check if there is a next row
	if (currentRowIndex < allRows.length - 1) {
		let nextRow = allRows[currentRowIndex + 1]

		// Get the next input in the same column in the next row
		let nextInput = nextRow.cells[currentColumnIndex].querySelector('input[type="text"]')

		if (nextInput) {
			return nextInput
		}
	}

	return null
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
	const itemNumCell = row.cells[0].querySelector('.itemnum')
	if (itemNumCell) {
		itemNumCell.value = row.rowIndex
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
	let rowAppendButton = document.getElementById('rowAppend')
	let rowAppendNumInput = document.getElementById('rowAppendNum')


	rowAppendButton.addEventListener( "click", function() {
		let append_this_many_rows = parseInt(rowAppendNumInput.value, 10) || 1

		table_main.appendRows("body",
		                      append_this_many_rows,
		                      table_main.heads.get("head").rows[0].cells.length,
		                      rowFunc,
		                      arrayToGenerator(table_main_cells, Infinity) )

		table_main.serialNumberCol("body", 0, 1)
		} )

	/**
	 * Handles the deletion of specific rows from the table based on user input.
	 *
	 * Users can specify rows to delete by inputting single numbers, multiple numbers separated by commas, or ranges of numbers.
	 *
	 * This function listens for a button click to trigger row deletions, parses the
	 * input, finds the inputted integer and removes them from the table.
	 *
	 * @param {Event} event - The button click even triggering the row deletion.
	 */
	let rowDeleteButton = document.getElementById('rowDelete')
	let rowDeleteNumInput = document.getElementById('rowDeleteInput')


	rowDeleteButton.addEventListener('click', function(event) {
		event.preventDefault()

		let delete_these_rows_input = (rowDeleteNumInput.value.trim())

		// Do nothing if input is blank
		if (!delete_these_rows_input) return

		let itemNumbersToDelete = []

		// Deletion of multiple rows indicated by comma separation
		let delete_range = delete_these_rows_input.split(',')

		for (let range of delete_range) {
			// Checking if input contains a hyphen, indicating a specified range of rows based on item numbers
			if (range.includes('-')) {
				// Split the range string into start and end values, and converting them to numbers
				let [start, end] = range.split('-').map(Number)

				// Make sure start and end values are in fact numbers/integers
				if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0) {
					for (let i = start; i <= end; i++) {
						itemNumbersToDelete.push(i)
					}
				}
			} else {
				// For single number input deletion
				let itemNumber = Number(range.trim())
				if (!isNaN(itemNumber) && itemNumber > 0) {
					itemNumbersToDelete.push(itemNumber)
				}
			}
		}

		// Using a Set to store unique values, this makes sure that any duplicate values will not be considered/added, thus no duplicate row number deletions.
		let uniqueItemNumbersToDelete = [...new Set(itemNumbersToDelete)].sort((a, b) => b - a)

		let successfullyDeleted = []

		// Select all rows in the table body
		const rows = document.querySelectorAll('#table_main tbody tr')

		// Delete rows based on item number
		uniqueItemNumbersToDelete.forEach((itemNumber) => {
			// Find the row with the matching item number
			let rowIndex = Array.from(rows).findIndex((row) => {
				return Number(row.cells[0].textContent.trim()) === itemNumber
			})

			// If the row exists, delete it
			if (rowIndex !== -1) {
				rows[rowIndex].remove()
				successfullyDeleted.push(itemNumber)
			} else {
				console.error(`Item Number ${itemNumber} does not exist.`)
			}
		})

		if(successfullyDeleted.length > 0) {
			successfullyDeleted.sort((a, b) => a - b)
			console.error(`Deleted Item Numbers: ${successfullyDeleted.join(', ')}`)
		}

		// Clear the input box after button click
		rowDeleteNumInput.value = ''

		// Comment in this line if you want to renumber rows
		table_main.serialNumberCol("body", 0, 1)
	})

	/**
	 * Finds the state of "Reason" checkboxes and stores them in an object.
	 *
	 * Each checkbox's id is used as a key in the object, with its checked status as the
	 * value.
	 *
	 * This function is intended to be used to create a JSON object representing the
	 * checkbox where 'true' indicates a checked checkbox and 'false' indicates an
	 * unchecked checkbox.
	 *
	 * @returns {object} - An object representing each checkbox's checked state using boolean values, 'true' for checked and 'false' for unchecked.
	 */
	function reasonCheckboxes() {
		let reasons = {}
		document.querySelectorAll('.reasoncheckbox').forEach((checkbox) => {
			reasons[checkbox.id] = checkbox.checked
		})
		return reasons
	}

	/**
	 * Exports data from part info and main inspection tables, along with additional
	 * information to a JSON file.
	 *
	 * Each table's data is collected by row and the JSON object includes checkboxes
	 * states, part information, inspection data, and comments.
	 *
	 * If any of the inputs are left blank, they are stored in the JSON object as an empty
	 * string ''.
	 *
	 * The JSON file is then downloaded as 'first_article_inspection_report.json'.
	 */
	function exportToJson() {
		// Collect data from part info table and also allows for blank inputs
		let partInfoTable = document.getElementById("table_part_info")
		let partInfoData = Array.from(partInfoTable.rows).slice(1).map(row => ({
			partNum: row.cells[0].querySelector('.partnum') ? row.cells[0].querySelector('.partnum').value : '',
			partRev: row.cells[1].querySelector('.partrev') ? row.cells[1].querySelector('.partrev').value : '',
			partDesc: row.cells[2].querySelector('.partdesc') ? row.cells[2].querySelector('.partdesc').value : '',
			partPO: row.cells[3].querySelector('.partpo') ? row.cells[3].querySelector('.partpo').value : '',
			partSerial: row.cells[4].querySelector('.partserial') ? row.cells[4].querySelector('.partserial').value : '',
		}))

		// Collect data from main inspection table and also allows for blank inputs
		let mainTable = document.getElementById("table_main")
		let mainData = Array.from(mainTable.rows).slice(1).map(row => ({
			itemNum: row.rowIndex,
			pageNum: row.cells[1].querySelector('.pagenum') ? row.cells[1].querySelector('.pagenum').value : '',
			location: row.cells[2].querySelector('.loc') ? row.cells[2].querySelector('.loc').value : '',
			param: row.cells[3].querySelector('.param') ? row.cells[3].querySelector('.param').value : '',
			actual: row.cells[4].querySelector('.actual') ? row.cells[4].querySelector('.actual').value : '',
			inspTool: row.cells[5].querySelector('.insptool') ? row.cells[5].querySelector('.insptool').value : '',
		}))

		// JSON object
		let jsonData = {
			reasons: reasonCheckboxes(),
			partInfo: partInfoData,
			mainData: mainData,
			comments: document.getElementById("commentTextBox") ? document.getElementById("commentTextBox").value : ''
		}

		let jsonString = JSON.stringify(jsonData, null, 2)

		// Create a blob and download the file
		let blob = new Blob([jsonString], { type: "application/json" })
		let url = URL.createObjectURL(blob)

		let downloadJsonFile = document.createElement("a")
		downloadJsonFile.href = url
		downloadJsonFile.download = "first_article_inspection_report.json"
		downloadJsonFile.click()

		URL.revokeObjectURL(url)
	}

	document.getElementById("exportToJson").addEventListener("click", exportToJson)

	/**
	 * Handles importing data from a JSON file and populating the form fields based on
	 * the JSON content.
	 *
	 * When triggered by the button click, this function opens a file window, allowing
	 * the user to select a JSON file.
	 *
	 * Data is read from the file, parsed, and used to fill out checkboxes, tables, and
	 * comments in the form.
	 *
	 */
	function importJson(event) {
		event.preventDefault()

		// Trigger the hidden file input click
		document.getElementById("jsonFileInput").click()
	}

	document.getElementById("jsonFileInput").addEventListener("change", function(event) {
		const file = event.target.files[0]

		if (file) {
			const reader = new FileReader()

			// Read the file as text and get the data as a string value
			reader.onload = function(event) {
				const jsonString = event.target.result
				if (jsonString) {
					// Parse the JSON data only if the string is not empty
					const jsonData = JSON.parse(jsonString)

					if (jsonData.reasons) {
						Object.keys(jsonData.reasons).forEach(reasonId => {
							const checkbox = document.getElementById(reasonId)
							if (checkbox) {
								checkbox.checked = jsonData.reasons[reasonId]
							}
						})
					}

					// Populate the part info table
					const partInfoTable = document.getElementById("table_part_info")
					jsonData.partInfo.forEach((part, index) => {
						if (index < partInfoTable.rows.length - 1) {
							partInfoTable.rows[index + 1].cells[0].querySelector('.partnum').value = part.partNum
							partInfoTable.rows[index + 1].cells[1].querySelector('.partrev').value = part.partRev
							partInfoTable.rows[index + 1].cells[2].querySelector('.partdesc').value = part.partDesc
							partInfoTable.rows[index + 1].cells[3].querySelector('.partpo').value = part.partPO
							partInfoTable.rows[index + 1].cells[4].querySelector('.partserial').value = part.partSerial
						}
					})

					// Populate the main inspection table
					const mainTable = document.getElementById("table_main")
					jsonData.mainData.forEach((item, index) => {
						if (index < mainTable.rows.length - 1) {
							mainTable.rows[index + 1].cells[0].textContent = item.itemNum
							mainTable.rows[index + 1].cells[1].querySelector('.pagenum').value = item.pageNum
							mainTable.rows[index + 1].cells[2].querySelector('.loc').value = item.location
							mainTable.rows[index + 1].cells[3].querySelector('.param').value = item.param
							mainTable.rows[index + 1].cells[4].querySelector('.actual').value = item.actual
							mainTable.rows[index + 1].cells[5].querySelector('.insptool').value = item.inspTool
						}
					})

					// Populate comments
					const commentTextBox = document.getElementById("commentTextBox")
					if (commentTextBox) {
						commentTextBox.value = jsonData.comments || ''
					}
				}
			}

			reader.readAsText(file)
		}
	})

	document.getElementById("importJsonButton").addEventListener("click", importJson)


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
