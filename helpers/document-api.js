import {transformToHeadingText, transformInline} from "./tokens-transformation/inline.js";
import {transformList} from "./tokens-transformation/list.js";
import {insertTable} from "./tokens-transformation/table.js";
import {transformCodeBlock} from "./tokens-transformation/code-block.js";
import {throwCustomError} from "./error-handling.js";

export async function createGoogleDoc(auth, docs, title) {
    try {
        const response = await docs.documents.create({
            requestBody: {
                title: title
            }
        });

        const documentId = response.data.documentId
        console.log(`Document created: ${title}, Doc ID: ${documentId}`);


        return documentId
    } catch (error) {
        console.error(`Error creating Google Doc for title: ${title}`);

        throw throwCustomError("CREATE_GOOGLE_DOC_FAILED", error.message, "creating the Google Doc")
    }
}

export async function insertText(auth, docs, md, documentId, rawText) {
    try {
        const PARSED_DATA = md.parse(rawText, {});
        const insertTextRequests = [],
            styleUpdateRequests = [];
        let cursorIndex = 1; // Start of the document
        let skipUntilIndex = -1;

        // console.log(`\n\nPARSED-------------------> `, JSON.stringify(PARSED_DATA, null, 2), "\n\n")

        PARSED_DATA.forEach((token, index) => {
            if (index <= skipUntilIndex) {
                return;
            }

            if (token.type === 'heading_open' && token.tag !== "h1") {
                insertTextRequests.push({
                    insertText: {
                        location: {index: cursorIndex},
                        text: '\n\n',
                    },
                });

                cursorIndex += 1
            } else if (token.type === 'paragraph_open' && PARSED_DATA[index - 1]?.type !== 'list_item_open' && PARSED_DATA[index - 1]?.type !== 'th_open' && PARSED_DATA[index - 1]?.type !== 'td_open') {
                insertTextRequests.push({
                    insertText: {
                        location: {index: cursorIndex},
                        text: '\n\n',
                    },
                });

                cursorIndex += 1
            } else if (token.type === 'inline' && PARSED_DATA[index - 1]?.type === 'heading_open') {
                const {
                    newCursorIndex,
                    newStyleUpdateRequests,
                    newInsertTextRequests
                } = transformToHeadingText(token, PARSED_DATA[index - 1], cursorIndex)

                cursorIndex = newCursorIndex
                insertTextRequests.push(...newInsertTextRequests)
                styleUpdateRequests.push(...newStyleUpdateRequests)
            }
            if (token.type === 'table_open') {
                // Prepare headers and rows
                const headers = [];
                const rows = [];
                let currentRow = [];
                let isHeader = true;

                for (let i = index + 1; i < PARSED_DATA.length; i++) {
                    const tableToken = PARSED_DATA[i];

                    if (tableToken.type === 'tr_open') {
                        currentRow = [];
                    } else if (tableToken.type === 'th_open' || tableToken.type === 'td_open') {
                        const inlineToken = PARSED_DATA[i + 2];
                        if (inlineToken?.type === 'inline') {
                            currentRow.push(inlineToken);
                        }
                    } else if (tableToken.type === 'tr_close') {
                        if (isHeader) {
                            headers.push(...currentRow);
                            isHeader = false;
                        } else {
                            rows.push(currentRow);
                        }
                    } else if (tableToken.type === 'table_close') {
                        const {
                            newCursorIndex,
                            newInsertTextRequests,
                            newStyleUpdateRequests,
                        } = insertTable(headers, rows, cursorIndex - 1);

                        cursorIndex = newCursorIndex;
                        insertTextRequests.push(...newInsertTextRequests);
                        styleUpdateRequests.push(...newStyleUpdateRequests);

                        skipUntilIndex = i;
                        break;
                    }
                }
            } else if (token.type === 'fence') {
                const {
                    newCursorIndex,
                    newStyleUpdateRequests,
                    newInsertTextRequests
                } = transformCodeBlock(token, cursorIndex)

                cursorIndex = newCursorIndex
                insertTextRequests.push(...newInsertTextRequests)
                styleUpdateRequests.push(...newStyleUpdateRequests)
            } else if (token.type === 'bullet_list_open' || token.type === 'bullet_list_close') {
                insertTextRequests.push({
                    insertText: {
                        location: {index: cursorIndex},
                        text: '\n\n',
                    },
                });

                cursorIndex += 1
            } else if (token.type === 'list_item_open') {
                insertTextRequests.push({
                    insertText: {
                        location: {index: cursorIndex},
                        text: `\n ${token.markup} `,
                    },
                });

                cursorIndex += 3
            } else if (token.type === 'list_item_close' && PARSED_DATA[index + 1]?.type === 'bullet_list_close') {
                insertTextRequests.push({
                    insertText: {
                        location: {index: cursorIndex},
                        text: `\n`,
                    },
                });

                cursorIndex += 1
            } else if (token.type === 'inline' && PARSED_DATA[index - 1]?.type === 'paragraph_open') {
                const {
                    newCursorIndex,
                    newStyleUpdateRequests,
                    newInsertTextRequests
                } = transformInline(token, cursorIndex)

                cursorIndex = newCursorIndex
                insertTextRequests.push(...newInsertTextRequests)
                styleUpdateRequests.push(...newStyleUpdateRequests)
            }

        });

        // console.log(`the-------------------> insertTextRequests`, JSON.stringify(insertTextRequests, null, 2));
        // console.log(`the-------------------> styleUpdateRequests`, JSON.stringify(styleUpdateRequests, null, 2));

        await docs.documents.batchUpdate({
            auth,
            documentId,
            requestBody: {
                requests: [...insertTextRequests, ...styleUpdateRequests],
            },
        });

        console.log(`Document text inserted, Doc ID: ${documentId}`)
    } catch (error) {
        console.error(`Error inserting prettified text into Google Doc for Doc ID: ${documentId}`);

        throw throwCustomError(
            "INSERT_TEXT_INTO_GOOGLE_DOC_FAILED",
            error.message,
            "inserting prettified text into Google Doc"
        )
    }
}

export const insertPlainText = async (auth, docs, documentId, text) => {
    try {
        await docs.documents.batchUpdate({
            auth,
            documentId,
            requestBody: {
                requests: [{
                    insertText: {
                        location: {index: 1},
                        text,
                    },
                }],
            },
        });

        console.log(`Plain text inserted, Doc ID: ${documentId}`)
    } catch (error) {
        console.error(`Error inserting plain text into Google Doc: ${documentId}`);

        throw throwCustomError(
            "INSERT_PLAIN_TEXT_INTO_GOOGLE_DOC_FAILED",
            error.message,
            "inserting plain text into Google Doc"
        )
    }
}
