import {throwCustomError} from "./error-handling.js";

export async function fetchSheetData(sheets, sheetId, range) {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
            ranges: [range],
            includeGridData: true
        });

        // Exclude sheet header
        const result = response.data.sheets[0].data[0].rowData || []
        return result.slice(1)
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error;
    }
}

export async function addLinkToTheDocument(sheets, sheetId, range, documentId, parsed = true) {
    const isParsedDoc = parsed ? "PARSED" : "NOT_PARSED"
    try {
        const documentLink = `https://docs.google.com/document/d/${documentId}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[documentLink]],
            },
        });

        console.log(
            `Successfully added link to the ${isParsedDoc} Google Doc: ${documentId}, for Range: ${range}`
        );
    } catch (error) {
        console.error(`Error adding link to the ${isParsedDoc} google doc ---${documentId}---, for Range: ${range}. Message: `, error);

        throw throwCustomError(
            "ADD_LINK_TO_GOOGLE_DOC_FAILED",
            error.message,
            `adding link to the ${isParsedDoc} Google Doc: ${documentId}`
        )
    }
}

export async function addErrorLogToTheRow(sheets, sheetId, range, errorObj) {
    try {
        const errorText = errorObj.code + "\n" + errorObj.message;

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[errorText]],
            },
        });

        console.log(`Successfully added Error Log text: ${JSON.stringify(errorObj)}, for Range: ${range}`);
    } catch (error) {
        console.error(`Error adding Error Log text ---${JSON.stringify(errorObj)}---, for Range: ${range}. Message: `, error);
        throw error;
    }
}
