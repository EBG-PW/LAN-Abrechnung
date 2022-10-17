/**
 * Creats a table from a REST API response with only the collums given in TableHeadData  
 * --!!-- Note, only Numbers below 100K will be prossed as numbers, if Convert is active!!
 * @param {array} TableHeadData Define here what data should be in the table
 * @param {array} TableData Table Data as Array of Objects
 * @param {string} TableName Table Name to require the strings (translations)
 * @param {boolean} Convert If True, Timestrings and Booleans will be converted
 * @returns {string} HTML-Formaded Table String  
 */
function CreateTable(TableHeadData, TableData, TableName, Convert) {
	var TableElements = [];
	TableHeadData.map(part => {
		TableElements.push(`<th>${translate(`Tabeles.${TableName}.${part}`)}</th>`)
	});
	var TableHead = `<thead><tr>${TableElements.join("")}</tr></thead>`;
	var TableString = `<div class="table-wrapper"><table>${TableHead}`;
	var TableEnd = `</table></div>`;

	var TableBody = [];
	var TableBodyDataPart = [];
	TableData.map(Data => {
		for (const [key, value] of Object.entries(Data)) {
			if(TableHeadData.includes(key)){
			let index = TableHeadData.indexOf(key);
				TableBodyDataPart.splice(index, 0, `<td>${ConvertString(value, Convert)}</td>`)
			}
		}
		TableBody.push(`<tbody><tr>${TableBodyDataPart.join("")}</tr></tbody>`);
		TableBodyDataPart = [];
	});

	return `${TableString}${TableBody.join("")}${TableEnd}`
}

/**
 * Creats a table from a REST API response with only the collums given in TableHeadData and can use buttons  
 * --!!-- Note, only Numbers below 100K will be prossed as numbers, if Convert is active!!
 * @param {array} TableHeadData Define here what data should be in the table
 * @param {array} KeyButtonList List all Keys that should be renderd as buttons (Needs other data structure!!)
 * @param {array} TableData Table Data as Array of Objects
 * @param {string} TableName Table Name to require the strings (translations)
 * @param {boolean} Convert If True, Timestrings and Booleans will be converted
 * @returns {string} HTML-Formaded Table String  
 */
 function ButtonCreateTable(TableHeadData, KeyButtonList, TableData, TableName, Convert) {
	var TableElements = [];
	TableHeadData.map(part => {
		TableElements.push(`<th>${translate(`Tabeles.${TableName}.${part}`)}</th>`)
	});
	var TableHead = `<thead><tr>${TableElements.join("")}</tr></thead>`;
	var TableString = `<div class="table-wrapper"><table>${TableHead}`;
	var TableEnd = `</table></div>`;

	var TableBody = [];
	var TableBodyDataPart = [];
	TableData.map(Data => {
		for (const [key, value] of Object.entries(Data)) {
			if(TableHeadData.includes(key)){
			let index = TableHeadData.indexOf(key);
				if(KeyButtonList.includes(key)){
					TableBodyDataPart.splice(index, 0, `<td><button type="button" style="${value.style}" onclick="${value.function}('${value.functionVar}')">${ConvertString(value.text, value.Convert)}</button></td>`)
				}else{
					TableBodyDataPart.splice(index, 0, `<td>${ConvertString(value, Convert)}</td>`)
				}
			}
		}
		TableBody.push(`<tbody><tr>${TableBodyDataPart.join("")}</tr></tbody>`);
		TableBodyDataPart = [];
	});

	return `${TableString}${TableBody.join("")}${TableEnd}`
}

/**
 * Creats a table from a REST API response with only the collums given in TableHeadData and can use buttons  
 * --!!-- Note, only Numbers below 100K will be prossed as numbers, if Convert is active!!
 * @param {array} TableHeadData Define here what data should be in the table
 * @param {object} [OptionsList] List all Keys that should be renderd as special html elements (Needs other data structure!!)
 * @param {array} TableData Table Data as Array of Objects
 * @param {string} TableName Table Name to require the strings (translations)
 * @param {boolean} Convert If True, Timestrings and Booleans will be converted
 * @returns {string} HTML-Formaded Table String  
 */
 function CustomCreateTable(TableHeadData, OptionsList = {}, TableData, TableName, Convert) {
	var TableElements = [];
	TableHeadData.map(part => {
		TableElements.push(`<th>${translate(`Tabeles.${TableName}.${part}`)}</th>`)
	});
	var TableHead = `<thead><tr>${TableElements.join("")}</tr></thead>`;
	var TableString = `<div class="table-wrapper"><table>${TableHead}`;
	var TableEnd = `</table></div>`;

	var TableBody = [];
	var TableBodyDataPart = [];
	TableData.map(Data => {
		for (const [key, value] of Object.entries(Data)) {
			if(TableHeadData.includes(key)){
			let index = TableHeadData.indexOf(key);
				if(OptionsList?.KeyButtonList?.includes(key)){
					TableBodyDataPart.splice(index, 0, `<td style="vertical-align: middle;"><button type="button" style="${value.style}" onclick="${value.function}('${value.functionVar}')">${ConvertString(value.text, value.Convert)}</button></td>`)
				}else if(OptionsList?.KeyDropdownList?.includes(key)){
					let OptionsString = "";
					value.options.map(option => {
						OptionsString += `<option style="vertical-align: middle;" title="${option.tooltip}" value="${option.value}">${option.text}</option>`
					});
					TableBodyDataPart.splice(index, 0, `<td style="vertical-align: middle;"><select id="${value.id}" onchange="${value.function}('${value.functionVar}', '${value.id}')" style="${value.style}">${OptionsString}</select></td>`)
				}else if(OptionsList?.KeyInputList?.includes(key)){
					TableBodyDataPart.splice(index, 0, `<td style="vertical-align: middle;"><input id="${value.id}" type="${value.type}" value="${value.value}" style="${value.style}" onchange="${value.function}('${value.functionVar}', '${value.id}')"></td>`)
				}else{
					TableBodyDataPart.splice(index, 0, `<td style="vertical-align: middle;">${ConvertString(value, Convert)}</td>`)
				}
			}
		}
		TableBody.push(`<tbody><tr>${TableBodyDataPart.join("")}</tr></tbody>`);
		TableBodyDataPart = [];
	});

	return `${TableString}${TableBody.join("")}${TableEnd}`
}

function ConvertString(D, C) {
    if(C){
        if(D === true || D === 'true'){
            return "✅";
        }else if(D === false || D === 'false'){
            return "❌";
        }else if(!isNaN(new Date(D).getTime()) && new Date(D).getTime() >= 100000){
            return `${translate(`Tage.Short.${new Date(D).getDay()}`)} - ${new Date(D).toLocaleDateString('de-DE')}`
        }else{
            return D
        }
    }else{
        return D
    }
}