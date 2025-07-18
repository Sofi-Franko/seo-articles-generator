export const transformInline = (token, cursorIndex) => {
    const linkRanges = [],
        boldRanges = [],
        codeRanges = []
    let processedContent = '';

    token.children.forEach((childToken) => {
        if (childToken.type === 'link_open') {
            const href = childToken.attrs.find(attr => attr[0] === 'href')[1];

            const textToken = token.children[token.children.indexOf(childToken) + 1];
            if (textToken?.type === 'text') {
                const linkText = textToken.content;

                const start = processedContent.length;
                const end = start + linkText.length;

                linkRanges.push({href, start, end});
            }
        } else if (childToken.type === 'strong_open') {
            const textToken = token.children[token.children.indexOf(childToken) + 1];
            if (textToken?.type === 'text') {
                const text = textToken.content;

                const start = processedContent.length;
                const end = start + text.length;

                boldRanges.push({start, end});
            }
        } else if (childToken.type === 'code_inline') {
            const text = childToken.content;

            const start = processedContent.length;
            const end = start + text.length;

            codeRanges.push({ start, end });
            processedContent += text;
        } else if (childToken.type === 'text' && childToken.content) {
            const text = childToken.content.replace(/(\S)—(\S)/g, '$1 — $2'); // Add space before and after em dash

            processedContent += text;
        }
    });

    const newInsertTextRequests = [{
        insertText: {
            location: {index: cursorIndex},
            text: processedContent.length ? processedContent : "\n",
        },
    }]

    const linkRequests = linkRanges.map(({href, start, end}) => {
        return {
            updateTextStyle: {
                range: {
                    startIndex: cursorIndex + start,
                    endIndex: cursorIndex + end,
                },
                textStyle: {link: {url: href}},
                fields: 'link',
            },
        }
    });

    const boldRequests = boldRanges.map(({start, end}) => {
        return {
            updateTextStyle: {
                range: {
                    startIndex: cursorIndex + start,
                    endIndex: cursorIndex + end,
                },
                textStyle: { bold: true },
                fields: 'bold',
            },
        }
    })

    const codeRequests = codeRanges.map(({start, end}) => {
        return {
            updateTextStyle: {
                range: {
                    startIndex: cursorIndex + start,
                    endIndex: cursorIndex + end,
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
        }
    })

    return {
        newCursorIndex: cursorIndex + processedContent.length + 1,
        newStyleUpdateRequests: [...linkRequests, ...boldRequests, ...codeRequests],
        newInsertTextRequests
    }
};

export const transformToHeadingText = (token, prevToken, cursorIndex) => {
    const level = prevToken.tag.replace('h', ''); // Extract heading level (e.g., h1 -> 1)
    const newInsertTextRequests = [{
        insertText: {
            location: {index: cursorIndex},
            text: `${token.content}\n\n`,
        },
    }]

    const newStyleUpdateRequests = [{
        updateParagraphStyle: {
            range: {startIndex: cursorIndex, endIndex: cursorIndex + token.content.length},
            paragraphStyle: {namedStyleType: `HEADING_${level}`},
            fields: 'namedStyleType',
        },
    }]

    return {
        newCursorIndex: cursorIndex + token.content.length + 1,
        newStyleUpdateRequests,
        newInsertTextRequests
    }
}
