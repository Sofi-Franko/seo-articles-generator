export const transformList = (currentIndex, parsed, cursorIndex) => {
    const listTokens = [];
    let nestingLevel = 0;

    for (let j = currentIndex; j < parsed.length; j++) {
        const listToken = parsed[j];
        listTokens.push(listToken);

        if (listToken.type === 'bullet_list_open') nestingLevel++;
        if (listToken.type === 'bullet_list_close') nestingLevel--;

        if (nestingLevel === 0) break;
    }

   return processList(listTokens, cursorIndex);
}

export const processList = (tokens, cursorIndex) => {
    let listStartIndex = cursorIndex;
    const styles = []
    const texts = []

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'bullet_list_open') {
            // Add a newline to start the bullet list
            texts.push({
                insertText: {
                    location: { index: listStartIndex },
                    text: '\n',
                },
            });

            listStartIndex += 1
        } else if (token.type === 'list_item_open') {
            // Add a bullet point for each list item
            texts.push({
                insertText: {
                    location: { index: listStartIndex },
                    text: `${token.markup}`,
                },
            });

            listStartIndex += 1
        } else if (token.type === 'inline' && token.children) {
            // const {
            //     newCursorIndex,
            //     newStyleUpdateRequests,
            //     newInsertTextRequests
            // } = linkText(token, listStartIndex);
            //
            // listStartIndex = newCursorIndex
            // styles.push(...newStyleUpdateRequests)
            // texts.push(...newInsertTextRequests)
        } else if (token.type === 'list_item_close') {
            // Add a newline after each list item
            texts.push({
                insertText: {
                    location: { index: listStartIndex },
                    text: '\n',
                },
            });

            listStartIndex += 1
        } else if (token.type === 'bullet_list_close') {
            // Add a final newline to close the bullet list
            texts.push({
                insertText: {
                    location: { index: listStartIndex },
                    text: '\n',
                },
            });

            listStartIndex += 1
        }
    }

    return {
        newCursorIndex: listStartIndex,
        newStyleUpdateRequests: styles,
        newInsertTextRequests: texts
    }
};
