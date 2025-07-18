
import {google} from 'googleapis';
import OpenAI from 'openai';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import { markdownItTable } from 'markdown-it-table';

import {
  fetchSheetData,
  addLinkToTheDocument,
  addErrorLogToTheRow
} from './helpers/sheets-api.js';

import { generateText } from './helpers/generate-ai-text.js';
import {
  createGoogleDoc,
  insertText,
  insertPlainText
} from './helpers/document-api.js';

import { shareDocument } from './helpers/share-doc.js';
import { formattedArticles } from './helpers/articles-rows-helper.js';
import { searchLinks } from './helpers/search-links-api.js';

import {
  API_KEYS,
  USER_EMAILS,
  DOMAINS,
  SheetInfo
} from './constants.js';

import credentials from './credentials.json' with { type: 'json' };

// ------Initialization of instances here------
const openai = new OpenAI({ apiKey: API_KEYS.openAi });

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive'
    ]
});

const docs = google.docs({version: 'v1', auth});
const drive = google.drive({version: 'v3', auth});
const sheets = google.sheets({version: 'v4', auth});

const md = new MarkdownIt("commonmark", {linkify: true})
    .use(markdownItTable)
    .use(markdownItAnchor) 
    .use(markdownItLinkAttributes, {
        attrs: {
            target: '_blank', // Open links in a new tab
            rel: 'noopener noreferrer', // Add security attributes
        },
    });;
// ------Initialization of instances here------

// Script itself
(async function processArticles() {
    const startTime = Date.now();

    try {
        const rows = await fetchSheetData(sheets, SheetInfo.SHEET_ID, SheetInfo.getRange());

        const articles = formattedArticles(rows)

        console.log(`Fetched ${articles.length} articles.`);

        for (const article of articles) {
            const {topic, title, keywords, docExists, rowIndex} = article;

            if (docExists) continue;

            let docId = "",
                text = "",
                links = []
            try {
                // links = await searchLinks(DOMAINS, topic)

                const promptData = {
                    topic, 
                    field: SheetInfo.SUB_SHEET_ID, 
                    links
                }
                text = await generateText(openai, promptData);
                console.log(`\n`)

                docId = await createGoogleDoc(auth, docs, topic.trim());
                console.log(`docId -> ${docId} \n`)

                await insertText(auth, docs, md, docId, text)
                console.log(`\n`)

                await shareDocument(drive, docId, USER_EMAILS);
                console.log(`\n`)

                const cellToUpdate = SheetInfo.updateRange() + rowIndex
                await addLinkToTheDocument(sheets, SheetInfo.SHEET_ID, cellToUpdate, docId)

                console.log(`\n\n`)

            } catch (error) {
                console.error(`Error processing article titled: ${article.topic}. Message --->`, error.message);

                if (error.code === "INSERT_TEXT_INTO_GOOGLE_DOC_FAILED") {
                    await insertPlainText(auth, docs, docId, text)
                    console.log(`\n`)

                    await shareDocument(drive, docId, USER_EMAILS);
                    console.log(`\n`)

                    const cellToUpdate = SheetInfo.updateUnparsedDocRange() + rowIndex
                    await addLinkToTheDocument(sheets, SheetInfo.SHEET_ID, cellToUpdate, docId, false)
                    console.log(`\n`)
                }

                await addErrorLogToTheRow(sheets, SheetInfo.SHEET_ID, SheetInfo.addErrorLog() + rowIndex, error)
            } finally {
                // TODO case when insertPlainText throws error
            }
        }

        console.log(`-------------------------FINISHED-------------------------`,)
    } catch (error) {
        console.error('Error in main process:', error);
    }

    const endTime = Date.now(); // End time
    const durationInSeconds = ((endTime - startTime) / 1000).toFixed(3); // Calculate time spent
    console.log(`Total time spent: ${durationInSeconds} seconds`);
})();
