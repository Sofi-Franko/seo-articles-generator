export const transformCodeBlock = (token, cursorIndex) => {
    const newInsertTextRequests = [],
        newStyleUpdateRequests = []

    const codeContent = token.content.trim();
    const languageText = `Language: ${token.info || 'Plain Text'}`;

    newInsertTextRequests.push({
        insertText: {
            location: {index: cursorIndex},
            text: '\n\n',
        },
    });

    cursorIndex += 2;

    newInsertTextRequests.push({
        insertText: {
            location: {index: cursorIndex},
            text: `${languageText}\n`,
        },
    });

    newStyleUpdateRequests.push({
        updateTextStyle: {
            range: {
                startIndex: cursorIndex,
                endIndex: cursorIndex + languageText.length,
            },
            textStyle: {
                italic: true,
                foregroundColor: {
                    color: {
                        rgbColor: {
                            red: 0.5,
                            green: 0.5,
                            blue: 0.5,
                        },
                    },
                },
            },
            fields: 'italic,foregroundColor',
        },
    });

    cursorIndex += languageText.length + 1;

    newInsertTextRequests.push({
        insertText: {
            location: {index: cursorIndex},
            text: codeContent + '\n',
        },
    });

    newStyleUpdateRequests.push({
        updateTextStyle: {
            range: {
                startIndex: cursorIndex,
                endIndex: cursorIndex + codeContent.length,
            },
            textStyle: {
                weightedFontFamily: {fontFamily: 'Courier New'},
                backgroundColor: {
                    color: {
                        rgbColor: {
                            red: 0.96,
                            green: 0.96,
                            blue: 0.96,
                        },
                    },
                },
            },
            fields: 'weightedFontFamily, backgroundColor',
        },
    });

    cursorIndex += codeContent.length + 1;

    return {
        newCursorIndex: cursorIndex,
        newStyleUpdateRequests,
        newInsertTextRequests
    }
}
