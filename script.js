// Configuration
const CONFIG = {
    // User's Google Sheet URL
    GOOGLE_SHEET_URL: 'https://opensheet.elk.sh/1HCOpKGKhv_Ggm3r6dtvldqUynv5z6vLy98jjeOSrS4I/Sheet1', 
    LOCAL_JSON: 'books.json'
};

let allBooks = [];
let filteredBooks = [];
let isFetching = false;
let fetchPromise = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupAlphabetFilter();
    setupSearch();
});

async function initApp() {
    try {
        const detailContainer = document.getElementById('book-detail-content');
        const isDetailPage = !!detailContainer || window.location.pathname.toLowerCase().includes('book');
        
        showLoader(isDetailPage ? 'LOADING BOOK DETAILS...' : 'LOADING LEGAL LIBRARY...');
        
        const books = await fetchBooks();
        
        if (!books || books.length === 0) {
            if (isDetailPage && detailContainer) {
                detailContainer.innerHTML = '<div style="text-align: center; padding: 5rem;">Error: Could not load book data. Please check your connection.</div>';
            }
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        
        if (isDetailPage) {
            const bookId = urlParams.get('id');
            if (bookId) {
                await initDetailPage(bookId);
            } else {
                if (detailContainer) {
                    detailContainer.innerHTML = `
                        <div style="text-align: center; padding: 5rem;">
                            <h2>No book selected</h2>
                            <p>Please select a book from the library to view its details.</p>
                            <a href="index.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">Back to Library</a>
                        </div>
                    `;
                }
            }
        } else {
            // Homepage logic
            const authorParam = urlParams.get('author');
            if (authorParam && document.getElementById('book-grid')) {
                filterByAuthor(authorParam);
            }
        }
    } catch (e) {
        console.error('Error in initApp:', e);
        const detailContainer = document.getElementById('book-detail-content');
        if (detailContainer) {
            detailContainer.innerHTML = '<div style="text-align: center; padding: 5rem;">An unexpected error occurred. Please refresh the page.</div>';
        }
    } finally {
        hideLoader();
    }
}

// Remove the standalone detail page logic at the bottom
// and just keep the DOMContentLoaded listener

async function initDetailPage(bookId) {
    console.log('Initializing detail page for book ID:', bookId);
    try {
        // 1. Wait for books to be fully loaded
        const books = await fetchBooks(); 
        
        if (!books || books.length === 0) {
            throw new Error("No data received from Google Sheets");
        }

        // 2. Find the book (Ensure IDs are compared as Strings and trimmed)
        const book = books.find(b => String(b.id).trim() === String(bookId).trim());

        if (book) {
            console.log('Book found:', book.title);
            hideLoader(); // Kill the loader immediately
            renderBookDetail(book);
        } else {
            console.warn('Book not found for ID:', bookId);
            const container = document.getElementById('book-detail-content');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 5rem;">
                        <h2>Book ID ${bookId} not found.</h2>
                        <p>We couldn't find the book you're looking for.</p>
                        <a href="index.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">Back to Library</a>
                    </div>
                `;
            }
            hideLoader();
        }
    } catch (e) {
        console.error("Detail Page Error:", e);
        hideLoader();
        const container = document.getElementById('book-detail-content');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 5rem;">
                    <h2>Connection Error. Please refresh.</h2>
                    <p>${e.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Refresh Page</button>
                </div>
            `;
        }
    }
}

function renderBookDetail(book) {
    const container = document.getElementById('book-detail-content');
    if (!container) return;

    container.innerHTML = `
        <div class="detail-container">
            <div class="detail-cover">
                <img src="${book.cover}" alt="${book.title}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/400x600?text=No+Cover'">
            </div>
            <div class="detail-info">
                <h1>${book.title}</h1>
                <div class="detail-meta">
                    <p>Author: <span onclick="window.location.href='index.html?author=${encodeURIComponent(book.author)}'" style="cursor:pointer; color:var(--primary-color);">${book.author}</span></p>
                    <p>Category: <span>${book.category}</span></p>
                    <p>Publish Year: <span>${book.year}</span></p>
                </div>
                <div class="book-actions" style="max-width: 500px; gap: 15px; margin-top: 2rem;">
                    <button onclick="openReader('${book.read}')" class="btn btn-primary btn-large">Read Online (Primary)</button>
                    <a href="${book.file}" target="_blank" class="btn btn-outline">Download (Secondary)</a>
                </div>
            </div>
        </div>
    `;
}

function openReader(fileUrl) {
    const viewer = document.getElementById('pdf-viewer');
    const iframe = document.getElementById('pdf-iframe');
    if (!viewer || !iframe) return;

    iframe.src = fileUrl;
    viewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeReader() {
    const viewer = document.getElementById('pdf-viewer');
    const iframe = document.getElementById('pdf-iframe');
    if (!viewer || !iframe) return;

    viewer.style.display = 'none';
    iframe.src = '';
    document.body.style.overflow = 'auto';
}

function showLoader(text) {
    const loader = document.getElementById('loader');
    const loaderText = loader ? loader.querySelector('.loader-text') : null;
    if (loaderText && text) loaderText.textContent = text;
    if (loader) {
        loader.style.display = 'flex';
        // Force a reflow to ensure the transition works if we just set display: flex
        loader.offsetHeight; 
        loader.classList.remove('loader-hidden');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        // Wait for transition to finish before setting display none
        setTimeout(() => {
            if (loader.classList.contains('loader-hidden')) {
                loader.style.display = 'none';
            }
        }, 500);
    }
}

// Helper for fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Helper to fix Google Drive links if they are malformed
function fixDriveLink(url, type = 'preview') {
    if (!url) return '';
    
    // Extract ID from various Google Drive URL formats
    const idMatch = url.match(/[-\w]{25,}/);
    const fileId = idMatch ? idMatch[0] : null;

    if (fileId) {
        if (type === 'preview') {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (type === 'cover' || type === 'image') {
            // Use the most reliable direct image link format for Google Drive
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        } else if (type === 'thumbnail') {
            // Use Google Drive thumbnail service to get the first page of a PDF
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        } else {
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    
    return url;
}

async function fetchBooks() {
    if (allBooks.length > 0) return allBooks;
    if (isFetching) return fetchPromise;

    isFetching = true;
    fetchPromise = (async () => {
        try {
            let data = [];
            
            // Try fetching from Google Sheets if configured
            if (CONFIG.GOOGLE_SHEET_URL) {
                try {
                    // Use timeout for Google Sheets fetch as it can be slow/unreliable
                    const response = await fetchWithTimeout(CONFIG.GOOGLE_SHEET_URL, {}, 8000);
                    if (!response.ok) throw new Error('Network response was not ok');
                    data = await response.json();
                    if (!Array.isArray(data)) throw new Error('Data is not an array');
                } catch (e) {
                    console.warn('Google Sheets fetch failed or timed out, falling back to local JSON', e);
                    const response = await fetch(CONFIG.LOCAL_JSON);
                    data = await response.json();
                }
            } else {
                const response = await fetch(CONFIG.LOCAL_JSON);
                data = await response.json();
            }

            // Process data and fix links
            allBooks = data.map((book, index) => {
                const id = (book.id ? String(book.id).trim() : null) || String(index + 1);
                
                // Determine cover URL
                let coverUrl = '';
                if (book.cover && book.cover.trim() !== '') {
                    coverUrl = fixDriveLink(book.cover, 'cover');
                } else if (book.read || book.file) {
                    // Fallback: Use the first page of the PDF as the cover
                    coverUrl = fixDriveLink(book.read || book.file, 'thumbnail');
                }
                
                // Final fallback if still empty
                if (!coverUrl || coverUrl === '') {
                    coverUrl = `https://picsum.photos/seed/${id}/400/600`;
                }

                return {
                    ...book,
                    id: id,
                    // Fix links if they are full URLs instead of just IDs or malformed
                    read: fixDriveLink(book.read, 'preview'),
                    file: fixDriveLink(book.file, 'download'),
                    cover: coverUrl
                };
            }).sort((a, b) => {
                const yearA = parseInt(a.year) || 0;
                const yearB = parseInt(b.year) || 0;
                return yearB - yearA;
            });

            filteredBooks = [...allBooks];
            
            // Render homepage sections if on index.html
            if (document.getElementById('book-grid')) {
                renderHomepage();
            }
            
            renderCategories();
            return allBooks;
        } catch (error) {
            console.error('Error fetching books:', error);
            const grid = document.getElementById('book-grid');
            if (grid) grid.innerHTML = '<div class="error">Failed to load books. Please try again later.</div>';
            return [];
        } finally {
            isFetching = false;
        }
    })();

    return fetchPromise;
}

function renderHomepage() {
    // Determine featured books (either from 'featured' column or first 3)
    const featured = allBooks.filter(b => b.featured === 'TRUE' || b.featured === true || b.featured === '1');
    const featuredToDisplay = featured.length > 0 ? featured : allBooks.slice(0, 3);
    
    const featuredSection = document.getElementById('featured-section');
    const featuredGrid = document.getElementById('featured-grid');
    
    if (featuredSection && featuredGrid) {
        if (featuredToDisplay.length > 0) {
            featuredSection.style.display = 'block';
            featuredGrid.innerHTML = featuredToDisplay.map(book => createBookCard(book)).join('');
        } else {
            featuredSection.style.display = 'none';
        }
    }

    // Determine latest books (sorted by year descending)
    const latestBooks = [...allBooks].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    }).slice(0, 4); // Show top 4 latest books

    const latestSection = document.getElementById('latest-section');
    const latestGrid = document.getElementById('latest-grid');

    if (latestSection && latestGrid) {
        if (latestBooks.length > 0) {
            latestSection.style.display = 'block';
            latestGrid.innerHTML = latestBooks.map(book => createBookCard(book)).join('');
        } else {
            latestSection.style.display = 'none';
        }
    }
    
    // For the main grid, we show all or filtered
    renderBooks(filteredBooks);
}

function createBookCard(book) {
    return `
        <div class="book-card" data-id="${book.id}" onclick="window.location.href='book.html?id=${book.id}'" style="cursor: pointer;">
            <img src="${book.cover}" alt="${book.title}" class="book-cover" referrerPolicy="no-referrer" onerror="this.src='https://via.placeholder.com/400x600?text=No+Cover'">
            <div class="book-info">
                <span class="book-category">${book.category}</span>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author" onclick="event.stopPropagation(); filterByAuthor('${book.author}')" style="cursor:pointer; color:var(--primary-color);">By ${book.author}</p>
                <div class="book-actions" style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button onclick="event.stopPropagation(); openReader('${book.read}')" class="btn btn-primary" style="flex: 1;">Read Online</button>
                    <a href="${book.file}" target="_blank" class="btn btn-outline" style="flex: 1;" onclick="event.stopPropagation()">Download</a>
                </div>
            </div>
        </div>
    `;
}

function renderBooks(books) {
    const bookGrid = document.getElementById('book-grid');
    if (!bookGrid) return;

    if (books.length === 0) {
        bookGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">No books found matching your criteria.</div>';
        return;
    }

    bookGrid.innerHTML = books.map(book => createBookCard(book)).join('');
}

function renderCategories() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    const categories = ['All', ...new Set(allBooks.map(book => book.category))];
    
    categoryList.innerHTML = categories.map(cat => `
        <li class="category-item" onclick="filterByCategory('${cat}')">${cat}</li>
    `).join('');
}

function setupAlphabetFilter() {
    const filterGrid = document.getElementById('alphabet-grid');
    if (!filterGrid) return;

    // Myanmar Consonants
    const myanmarAlphabet = [
        'က', 'ခ', 'ဂ', 'ဃ', 'င',
        'စ', 'ဆ', 'ဇ', 'ဈ', 'ည',
        'ဋ', 'ဌ', 'ဍ', 'ဎ', 'ဏ',
        'တ', 'ထ', 'ဒ', 'ဓ', 'န',
        'ပ', 'ဖ', 'ဗ', 'ဘ', 'မ',
        'ယ', 'ရ', 'လ', 'ဝ', 'သ',
        'ဟ', 'ဠ', 'အ'
    ];
    
    filterGrid.innerHTML = `
        <button class="letter-btn active" onclick="filterByLetter('All', this)">အားလုံး</button>
        ${myanmarAlphabet.map(letter => `
            <button class="letter-btn" onclick="filterByLetter('${letter}', this)">${letter}</button>
        `).join('')}
    `;
}

function toggleAlphabetModal() {
    const overlay = document.getElementById('alphabet-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        // Prevent body scroll when modal is open
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    }
}

function filterByLetter(letter, btn) {
    document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update trigger button text
    const activeLabel = document.getElementById('active-letter');
    if (activeLabel) {
        activeLabel.textContent = `Filter by Letter: ${letter === 'All' ? 'အားလုံး' : letter}`;
    }

    // Clear search input when a letter is selected
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Reset category active states
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));

    if (letter === 'All') {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => {
            const title = book.title.trim();
            // Check if title starts with the Myanmar consonant
            return title.startsWith(letter);
        });
    }
    
    renderBooks(filteredBooks);
    
    // Auto-close modal
    toggleAlphabetModal();
    
    scrollToContent();
}

function filterByCategory(category) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === category) item.classList.add('active');
    });

    // Clear search input when a category is selected
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Reset alphabet active states
    document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
    const activeLabel = document.getElementById('active-letter');
    if (activeLabel) activeLabel.textContent = 'Filter by Letter: အားလုံး';

    if (category === 'All') {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => book.category === category);
    }
    renderBooks(filteredBooks);
    scrollToContent();
}

function filterByAuthor(author) {
    // Clear search input when an author is selected
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Reset other filters
    document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    const activeLabel = document.getElementById('active-letter');
    if (activeLabel) activeLabel.textContent = 'Filter by Letter: အားလုံး';

    filteredBooks = allBooks.filter(book => book.author === author);
    renderBooks(filteredBooks);
    
    const sectionTitle = document.getElementById('section-title');
    if (sectionTitle) sectionTitle.textContent = `Books by ${author}`;
    
    scrollToContent();
}

function scrollToContent() {
    const content = document.querySelector('.content');
    if (content) {
        window.scrollTo({
            top: content.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        // Auto-Reset Alphabet Filter Logic
        if (term.length > 0) {
            // 1. Remove 'active' class from all letter buttons
            document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
            
            // 2. Reset the label on the filter trigger
            const activeLabel = document.getElementById('active-letter');
            if (activeLabel) {
                activeLabel.textContent = 'Filter by Letter: အားလုံး';
            }
            
            // 3. Optional: Reset category active states if any
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        } else {
            // If search is cleared, we could potentially re-activate 'All'
            const allBtn = document.querySelector('.letter-btn[onclick*="\'All\'"]');
            if (allBtn) allBtn.classList.add('active');
        }

        // Filtering: Search through the entire allBooks array for a clean start
        filteredBooks = allBooks.filter(book => 
            (book.title && book.title.toLowerCase().includes(term)) ||
            (book.author && book.author.toLowerCase().includes(term)) ||
            (book.category && book.category.toLowerCase().includes(term))
        );
        
        renderBooks(filteredBooks);
    });
}
