/* SPDX-License-Identifier: GPL-3.0-only */

/* This file is part of qa-reports.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * @file Dynamic content for the First Article Inspection Report.
 */

"use strict";

/*
// JSON schema version
*/

/** This version of the First Article Inspection Report code is compatible with this version number, which is a simple natural number.
 * Any JSON exported will have this schema version number. When importing a JSON file, the file will only be supported if it has a version number equal to or less then this version number.
 * This version number should be incremented whenever the JSON schema changes.
 */
const json_schema_version = 2

/* ******************** */
// Main
/* ******************** */

/** Initial number of rows in the main table.
 * This number should be set such that the page fits on a single letter-size page when printed.
 */
const rowNumInitial = 28

//The row of the table containing the brand name
const table_brand_name_cell = [
							   "<label><input type=\"text\" id=\"partbrandname\" ></input></label>",
							  ]

// The row of the table containing part information (part number, part description, etc.) will contain these cells
const table_part_info_cells = [
                             "<label><input type=\"text\" class=\"partnum\" ></input></label>",
					         "<label><input type=\"text\" class=\"partrev\" ></input></label>",
					         "<label><input type=\"text\" class=\"partdesc\" ></input></label>",
					         "<label><input type=\"text\" class=\"partpo\" ></input></label>",
					         "<label><input type=\"text\" class=\"partserial\" ></input></label>"
                            ]

// Each row of the main table will contain these HTML lines in the cells, in this order.
const table_main_cells = [
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
	const table_menu_elem = document.createElement("div")
	table_menu_elem.classList.add("table_menu_float")
	table_menu_elem.classList.add("no-print")

	// Put a "Delete row" button in the menu
	const row_delete_button = document.createElement("button")
	row_delete_button.type = "button"
	row_delete_button.classList.add("rowDelete")
	row_delete_button.textContent = "Delete row"
	row_delete_button.addEventListener("click", function() {
		row.parentNode.removeChild(row)
		table_main.serialNumberCol("body", 0, 1)
	})
	table_menu_elem.append(row_delete_button)

	const table_menu = new Menu(table_menu_elem)
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
	const typeTextNodes = row.querySelectorAll("input[type=text]")
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
	// addFloatingMenuToRow(row)
	const itemNumCell = row.cells[0].querySelector('.itemnum')
	if (itemNumCell) {
		itemNumCell.value = row.rowIndex
	}
	parseInputCellsInRow(row)
}

window.onload = function() {
	const table_brand_name_info = new Table(document.getElementById("table_brand_name_info"))
	table_brand_name_info.regHead(document.getElementById("table_brand_name_info").thead, "head")
	table_brand_name_info.regBody(document.getElementById("table_brand_name_info").getElementsByTagName("tbody")[0], "body")

	table_brand_name_info.appendRows("body",
	                          1,
	                          1,
	                          parseInputCellsInRow,
	                          arrayToGenerator(table_brand_name_cell, 1)
	                          )

	const revealCheckBox = document.getElementById("revealcheckbox")

	/**
	 * This function controls the visibility of the brand name section in a table based on the state of the checkbox.
	 *
	 * When the `revealcheckbox` is checked, the function removes the "no-print" class from the brand name table section, making it visible when printing
	 * When unchecked, the function adds the "no-print" class from the brand name table section, hiding the entire section when printing.
	 */
	function brandNameVisibility() {

		const brandNameInput = document.getElementById("table_brand_name_section")
			if (revealCheckBox.checked) {
				brandNameInput.classList.remove("no-print")
			} else {
				brandNameInput.classList.add("no-print")
		}
	}

	brandNameVisibility()

	revealCheckBox.addEventListener("change", brandNameVisibility)

	const table_part_info = new Table(document.getElementById("table_part_info"))
	table_part_info.regHead(document.getElementById("table_part_info").tHead, "head")
	table_part_info.regBody(document.getElementById("table_part_info").getElementsByTagName("tbody")[0], "body")

	table_part_info.appendRows("body",
	                           1,
	                           table_part_info.heads.get("head").rows[0].cells.length,
	                           parseInputCellsInRow,
	                           arrayToGenerator(table_part_info_cells, Infinity)
	                           )


	const table_main = new Table(document.getElementById("table_main"))
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
	const rowAppendButton = document.getElementById('rowAppend')
	const rowAppendNumInput = document.getElementById('rowAppendNum')

	rowAppendNumInput.addEventListener('keydown', function(event) {
		if (event.key === "Enter") {
			event.preventDefault()
			rowAppendButton.click()
		}
	})

	rowAppendButton.addEventListener( "click", function() {
		const append_this_many_rows = parseInt(rowAppendNumInput.value, 10) || 1

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
	const rowDeleteButton = document.getElementById('rowDelete')
	const rowDeleteNumInput = document.getElementById('rowDeleteInput')

	rowDeleteNumInput.addEventListener('keydown', function(event) {
		if (event.key === "Enter") {
			event.preventDefault()
			rowDeleteButton.click()
		}
	})

	rowDeleteButton.addEventListener('click', function(event) {
		event.preventDefault()

		const delete_these_rows_input = (rowDeleteNumInput.value.trim())

		// Do nothing if input is blank
		if (!delete_these_rows_input) return

		const itemNumbersToDelete = []

		// Deletion of multiple rows indicated by comma separation
		const delete_range = delete_these_rows_input.split(',')

		for (let range of delete_range) {
			// Checking if input contains a hyphen, indicating a specified range of rows based on item numbers
			if (range.includes('-')) {
				// Split the range string into start and end values, and converting them to numbers
				const [start, end] = range.split('-').map(Number)

				// Make sure start and end values are in fact numbers/integers
				if (!isNaN(start) && !isNaN(end) && start > 0 && end > 0) {
					for (let i = start; i <= end; i++) {
						itemNumbersToDelete.push(i)
					}
				}
			} else {
				// For single number input deletion
				const itemNumber = Number(range.trim())
				if (!isNaN(itemNumber) && itemNumber > 0) {
					itemNumbersToDelete.push(itemNumber)
				}
			}
		}

		// Using a Set to store unique values, this makes sure that any duplicate values will not be considered/added, thus no duplicate row number deletions.
		const uniqueItemNumbersToDelete = [...new Set(itemNumbersToDelete)].sort((a, b) => b - a)

		const successfullyDeleted = []

		// Select all rows in the table body
		const rows = document.querySelectorAll('#table_main tbody tr')

		// Delete rows based on item number
		uniqueItemNumbersToDelete.forEach((itemNumber) => {
			// Find the row with the matching item number
			const rowIndex = Array.from(rows).findIndex((row) => {
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
		const reasons = {}
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
		const partInfoTable = document.getElementById("table_part_info")
		const partInfoData = Array.from(partInfoTable.rows).slice(1).map(row => ({
			partNum: row.cells[0].querySelector('.partnum') ? row.cells[0].querySelector('.partnum').value : '',
			partRev: row.cells[1].querySelector('.partrev') ? row.cells[1].querySelector('.partrev').value : '',
			partDesc: row.cells[2].querySelector('.partdesc') ? row.cells[2].querySelector('.partdesc').value : '',
			partPO: row.cells[3].querySelector('.partpo') ? row.cells[3].querySelector('.partpo').value : '',
			partSerial: row.cells[4].querySelector('.partserial') ? row.cells[4].querySelector('.partserial').value : '',
		}))

		// Collect data from brand name table and also allows for blank inputs
		const brandNameInput = document.getElementById("partbrandname")
		const brandNameValue = brandNameInput ? brandNameInput.value : ""

		/* Include the Reveal checkbox in the object
		If the checkbox is unchecked, the value will be false
		If the checkbox is checked, the value will be true
		*/
		const revealCheckBox = document.getElementById('revealcheckbox')
		const isRevealChecked = revealCheckBox.checked

		// let brandData = isRevealChecked ? brandNameValue : ""

		// Collect data from main inspection table and also allows for blank inputs
		const mainTable = document.getElementById("table_main")
		const mainData = Array.from(mainTable.rows).slice(1).map(row => ({
			itemNum: row.rowIndex,
			pageNum: row.cells[1].querySelector('.pagenum') ? row.cells[1].querySelector('.pagenum').value : '',
			location: row.cells[2].querySelector('.loc') ? row.cells[2].querySelector('.loc').value : '',
			param: row.cells[3].querySelector('.param') ? row.cells[3].querySelector('.param').value : '',
			actual: row.cells[4].querySelector('.actual') ? row.cells[4].querySelector('.actual').value : '',
			inspTool: row.cells[5].querySelector('.insptool') ? row.cells[5].querySelector('.insptool').value : '',
		}))

		// JSON object
		const jsonData = {
			meta: { schemaVersion: json_schema_version },
			reasons: reasonCheckboxes(),
			partInfo: partInfoData.map( info => ({
				partBrandName: {
					name: brandNameValue,
					reveal: isRevealChecked
				},
				...info,
			})),
			mainData: mainData,
			comments: document.getElementById("commentTextBox") ? document.getElementById("commentTextBox").value : ''
		}

		const jsonString = JSON.stringify(jsonData, null, 2)

		// Use kebab-case for the brand name to remove spaces in the export JSON file name
		const brandName = brandNameValue ? `_${brandNameValue}`.replace(" ", "-").toLowerCase() : ""

		const partNum = partInfoData[0]?.partNum || ""
		const partRev = partInfoData[0]?.partRev ? `rev${partInfoData[0]?.partRev}` : ""
		const currentDate = new Date().toISOString().split('T')[0]

		const fileName = `fair${brandName}_${partNum}${partRev}_${currentDate}.json`

		// Create a blob and download the file
		const blob = new Blob([jsonString], { type: "application/json" })
		const url = URL.createObjectURL(blob)

		const downloadJsonFile = document.createElement("a")
		downloadJsonFile.href = url
		downloadJsonFile.download = fileName
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

					// The JSON file must have a compatible schema version number.
					// Note: if it has a lower version number, a way to migrate the JSON schema to the current version should be provided.
					if ( jsonData.meta.schemaVersion > json_schema_version ) {
						window.alert(`ERROR: JSON file has incompatible version ${jsonData.meta.schemaVersion}. Only versions ${json_schema_version} and lower are supported.`)
						return
					}

					// Populate the brand name table
					const brandNameInput = document.getElementById("partbrandname")
					if (brandNameInput) {
						brandNameInput.value = jsonData.partInfo[0].partBrandName.name || ""
					}

					/**
					 * Populate the data for the state of the reveal checkbox
					 * If the checkbox is checked, the value will be true,
					 * If the checkbox is unchecked, the value will be false
					 * */
					const revealCheckBox = document.getElementById("revealcheckbox")
					if (revealCheckBox) {
						revealCheckBox.checked = jsonData.revealChecked || false
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
					const mainTableRowsCount = mainTable.rows.length - 1
					const neededRowsCount = jsonData.mainData.length

					// Remove any extra rows that are not in the imported file
					for (let i = mainTableRowsCount; i > neededRowsCount; i--) {
						mainTable.deleteRow(i)
					}

					// Append necessary new rows
					if (mainTableRowsCount < neededRowsCount) {
						table_main.appendRows("body",
						                      neededRowsCount - mainTableRowsCount,
						                      table_main.heads.get("head").rows[0].cells.length,
						                      rowFunc,
						                      arrayToGenerator(table_main_cells, Infinity)
						)
					}

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
	/**
	 * This global event listener enables moving down the input fields in the main table using the 'Enter' key via Event Delegation.
	 */
	document.getElementById("table_main").addEventListener("keydown", function(event) {
		if (event.target.tagName === "INPUT" && event.key === "Enter") {
		const currentInput = event.target
		const currentRow = currentInput.closest("tr")
		const nextRow = currentRow.nextElementSibling

		if (nextRow) {
			const columnIndex = [...currentRow.cells].indexOf(currentInput.closest("td"))
			const nextCell = nextRow.cells[columnIndex]

			if (nextCell) {
				const nextInput = nextCell.querySelector("input")
				if (nextInput) {
					nextInput.focus()
				}
			}
		}
		event.preventDefault()
		}
	})

	// Floating info box
	const info_escaped_text = new Table(document.getElementById("info_escaped_text"))
	info_escaped_text.regHead(info_escaped_text.tableElem.getElementsByTagName("thead")[0], "head")
	info_escaped_text.regBody(info_escaped_text.tableElem.getElementsByTagName("tbody")[0], "body")

	info_escaped_text.appendRows("body",
	                             mathMap.size,
	                             info_escaped_text.heads.get("head").rows[0].cells.length,
	                             null,
	                             mapToGenerator(mathMap)
	                            )

}
