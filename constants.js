import dotenv from 'dotenv';
dotenv.config();

// API KEYS
export const API_KEYS = {
    openAi: process.env.API_KEY_OPENAI,
    serpApi: process.env.SERP_API
}

export const USER_EMAILS = JSON.parse(process.env.USER_EMAILS);
export const TOPICS_FIELD = process.env.TOPICS_FIELD // name of the topics field (for better context understanding)

// TODO: currently is not supported 
export const DOMAINS = [
  { search: 'moz.gov.ua', filter: 'moz.gov.ua' },
  { search: 'onclinic.ua', filter: 'onclinic.ua' },
//   { search: 'uk.wikipedia.org', filter: 'uk.wikipedia.org' }
];

class SheetInfoConstants {
    SHEET_ID = process.env.SHEET_ID // id from URL
    SUB_SHEET_ID = process.env.SUB_SHEET_ID // name of specific sheet in the whole Spreadsheet file

    getRange() {
        return `${this.SUB_SHEET_ID}!A:F`
    }

    updateRange() {
        return `${this.SUB_SHEET_ID}!F`
    }

    updateUnparsedDocRange() {
        return `${this.SUB_SHEET_ID}!G`
    }

    addErrorLog() {
        return `${this.SUB_SHEET_ID}!H`
    }
}

export const SheetInfo = new SheetInfoConstants()