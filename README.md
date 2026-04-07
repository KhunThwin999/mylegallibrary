# Myanmar Legal Book Library

A professional, production-ready digital library for Myanmar legal books. Built with pure HTML, CSS, and JavaScript.

## Features
- **Dual Data Source**: Supports local `books.json` and Google Sheets API.
- **Search System**: Live search by title, author, or category.
- **Alphabet Filter**: Quick filtering from A to Z.
- **Legal Categories**: Organized sections for Civil, Criminal, Business law, etc.
- **Book Details**: Comprehensive view with description and metadata.
- **Google Drive Integration**: Read PDF files using Drive preview and download via direct links.
- **Responsive Design**: Fully optimized for mobile and desktop.

## Project Structure
```
/legal-book-library
├── index.html      # Homepage
├── book.html       # Book detail page
├── style.css       # Global styles
├── script.js       # Frontend logic (Search, Filter, API)
├── books.json      # Local data source
├── README.md       # Documentation
└── /images         # Folder for local book covers
```

## How to use Google Sheets as Data Source
1. Create a Google Sheet with headers: `title`, `author`, `category`, `year`, `description`, `cover`, `read`, `file`, `featured`.
2. Make the sheet public: **File > Share > Share with others > Anyone with the link**.
3. Copy the Spreadsheet ID from the URL.
4. Open `script.js` and update `CONFIG.GOOGLE_SHEET_URL`:
   ```javascript
   GOOGLE_SHEET_URL: 'https://opensheet.elk.sh/YOUR_SPREADSHEET_ID/Sheet1'
   ```

## How to add Google Drive PDF Links
### For Reading (Preview)
1. Right-click your PDF in Google Drive > **Get link**.
2. Set access to **Anyone with the link**.
3. Copy the File ID from the link.
4. Use this format: `https://drive.google.com/file/d/FILE_ID/preview`

### For Downloading (Direct Link)
1. Use the same File ID.
2. Use this format: `https://drive.google.com/uc?export=download&id=FILE_ID`

## Deployment Instructions

### 1. Upload to GitHub
1. Create a new repository on GitHub.
2. Initialize your local folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Link to your GitHub repo and push:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

### 2. Connect to Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub repository.
4. **Build settings**:
   - **Framework preset**: None
   - **Build command**: (Leave empty)
   - **Build output directory**: (Leave empty or root `/`)
5. Click **Save and Deploy**.

## Customization
To add more books locally, update `books.json`. For dynamic updates, use the Google Sheets method described above.
