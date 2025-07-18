# seo-articles-generator
Generating seo-oriented articles using some magic of open ai and google sheets/docs api 
<pr>
Designed to streamline content creation and reduce repetitive manual work :)

## How to launch:
1. Create Spreadsheet and fill in the structure as mentioned below
2. Provide `credentials.json` from your <b>google service account</b> in the root dir to activate Google Api instance (see `credentials-example.json`)
3. Provide `.env` in the root dir to define nesessary keys (see `.env-example`)
4. Call `npm i`
5. Call `node index.js`
6. See uploaded files in your Spreadsheet in real time 🔥


#### 🧾 Required Columns Structure

| Column Name     | Description                                                                            |
|-----------------|----------------------------------------------------------------------------------------|
| **Topic**       | General category or niche for the article (e.g. "Dentistry: is it hard to jump into?") |
| **Title**       | The target SEO title for the article                                                   |
| **Description** | Meta description or introductory sentence                                              |
| **H1**          | Main heading of the article (H1 tag)                                                   |
| **Keywords**    | Comma-separated SEO keywords to include in the article                                 |
| **Ready Text**. | This will be automatically filled with the generated article                           |
| **Unparsed**    | Raw or fallback content, optionally used for debugging                                 |
| **Error log**   | Captures any issues during article generation                                          |

> ✅ Make sure the first 5 columns (**Topic → Keywords**) are filled in before starting the script.  
> 🛑 Do **not** modify the "Ready Text", "Unparsed", or "Error log" columns manually.

### Important notes:
- if one of the cells: **Ready Text** or **Unparsed** in the row are filled in - script will skip this row
- if **Topic** cell is empty - script will finish the execution
- if there was an error occured while parcing AI response to the google doc - script will keep unparsed version of it in **Unparsed** cell + add error log to the **Error log** cell

## Good luck!
