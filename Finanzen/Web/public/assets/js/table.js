/**
 * Creats a table from a REST API response with only the collums given in TableHeadData
 * @param {array} TableHeadData
 * @param {array} TableData
 * @param {string} TableName
 * @returns {string} HTML-Formaded Table String
 */
function CreateTable(TableHeadData, TableData, TableName) {
	var TableElements = [];
	TableHeadData.map(part => {
		TableElements.push(`<th>${translate(`Tabeles.${TableName}.${part}`)}</th>`)
	});
	var TableHead = `<thead><tr>${TableElements.join("")}</tr></thead>`;
	var TableString = `<div class="table-wrapper"><table class="fl-table">${TableHead}`;
	var TableEnd = `</table></div>`;

	var TableBody = [];
	var TableBodyDataPart = [];
	TableData.map(Data => {
		for (const [key, value] of Object.entries(Data)) {
			if(TableHeadDatas.includes(key)){
			let index = TableHeadData.indexOf(key);
				TableBodyDataPart.splice(index, 0, `<td>${value}</td>`)
			}
		}
		TableBody.push(`<tbody><tr>${TableBodyDataPart.join("")}</tr></tbody>`);
		TableBodyDataPart = [];
	});

	return `${TableString}${TableBody.join("")}${TableEnd}`
}