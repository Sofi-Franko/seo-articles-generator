export const formattedArticles = (rows) => {
    let startIndexRow = 2

    const articles = [];
    for (const row of rows) {
        const cells = row.values || [];
        const [topic, title, description, h1, keywords, doc, plainTextDoc, errorLog] = cells

        if (!topic?.formattedValue) break;

        articles.push({ 
            topic: topic.formattedValue.trim(),
                // keywords: keywords?.split(';')
                //         .map(k => k.trim())
                //         .filter(k => k.length > 0)
                //         .join("; ")
                //     || [],
            docExists: doc?.formattedValue || plainTextDoc?.formattedValue,
            rowIndex: startIndexRow++
        })
    }

    return articles
}