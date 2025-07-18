import {transformInline} from "./inline.js";

export const transformTable = (PARSED_DATA, dataLoopIndex, cursorIndex) => {
    const headers = [];
    const rows = [];
    let currentRow = [];
    let isHeader = true;

    for (let i = dataLoopIndex + 1; i < PARSED_DATA.length; i++) {
        const tableToken = PARSED_DATA[i];

        if (tableToken.type === 'tr_open') {
            currentRow = [];
        } else if (tableToken.type === 'th_open' || tableToken.type === 'td_open') {
            const inlineToken = PARSED_DATA[i + 2];
            if (inlineToken?.type === 'inline') {
                const {newInsertTextRequests} = transformInline(inlineToken, cursorIndex);
                const cellContent = newInsertTextRequests[0].insertText.text;

                currentRow.push(cellContent);
            }
        } else if (tableToken.type === 'tr_close') {
            if (isHeader) {
                headers.push(...currentRow);
                isHeader = false;
            } else {
                rows.push(currentRow);
            }
        } else if (tableToken.type === 'table_close') {
            return {
                ...insertTable(headers, rows, cursorIndex - 1),
                skipUntilIndex: i
            }
        }
    }
}

export const insertTable = (headers, rows, cursorIndex) => {
    const insertTextRequests = [];
    const styleUpdateRequests = [];
    let cursor = cursorIndex

    insertTextRequests.push({
        insertText: {
            location: {index: cursor},
            text: '\n',
        },
    });

    insertTextRequests.push({
        insertTable: {
            rows: rows.length + 1,
            columns: headers.length,
            location: {index: cursor},
        },
    });

    cursor += 4;

    headers.forEach((token) => {
        const {
            newCursorIndex,
            newStyleUpdateRequests,
            newInsertTextRequests
        } = transformInline(token, cursor)

        insertTextRequests.push(...newInsertTextRequests)
        styleUpdateRequests.push(...newStyleUpdateRequests)

        cursor = newCursorIndex + 1;
    });

    cursor += 1;

    rows.forEach(row => {
        row.forEach((token) => {
            const {
                newCursorIndex,
                newStyleUpdateRequests,
                newInsertTextRequests
            } = transformInline(token, cursor)

            insertTextRequests.push(...newInsertTextRequests)
            styleUpdateRequests.push(...newStyleUpdateRequests)

            cursor = newCursorIndex + 1;
        });

        cursor += 1
    });

    insertTextRequests.push({
        insertText: {
            location: {index: cursor},
            text: '\n',
        },
    });

    cursor += 1;

    return {
        newCursorIndex: cursor,
        newInsertTextRequests: insertTextRequests,
        newStyleUpdateRequests: styleUpdateRequests,
    };
};
