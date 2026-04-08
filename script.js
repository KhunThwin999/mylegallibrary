// Configuration
const CONFIG = {
    GOOGLE_SHEET_URL: 'https://opensheet.elk.sh/1HCOpKGKhv_Ggm3r6dtvldqUynv5z6vLy98jjeOSrS4I/Sheet1',
    LOCAL_JSON: 'books.json'
};

let allBooks = [];
let filteredBooks = [];
let isFetching = false;
let fetchPromise = null;

const CATEGORY_ICONS = {
    'All': 'fa-th-large',
    'Law & Constitution': 'fa-balance-scale',
    'Constitution Law': 'fa-balance-scale',
    'Police Procedure': 'fa-shield-alt',
    'Penal Code': 'fa-gavel',
    'Civil Law': 'fa-users',
    'Criminal Law': 'fa-user-secret',
    'Land Law': 'fa-map-marked-alt',
    'Business Law': 'fa-briefcase',
    'International Law': 'fa-globe',
    'Court Procedures': 'fa-gavel',
    'Myanmar Law': 'fa-landmark',
    'Default': 'fa-book'
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupAlphabetFilter();
    setupSearch();
    setupFilters();
    setupSidebarSearch();
});

async function initApp() {
    try {
        const detailContainer = document.getElementById('book-detail-content');
        const isDetailPage = !!detailContainer || window.location.pathname.toLowerCase().includes('book');
        
        if (!isDetailPage) {
            renderSkeletons();
        }
        
        showLoader(isDetailPage ? 'LOADING BOOK DETAILS...' : 'PREPARING LEGAL ARCHIVES...');
        
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
            } else {
                renderBooks(allBooks);
            }
            renderYearFilter();
        }
    } catch (e) {
        console.error('Error in initApp:', e);
    } finally {
        hideLoader();
    }
}

async function initDetailPage(bookId) {
    try {
        const books = await fetchBooks(); 
        const book = books.find(b => String(b.id).trim() === String(bookId).trim());

        if (book) {
            renderBookDetail(book);
        } else {
            const container = document.getElementById('book-detail-content');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 5rem;">
                        <h2>Book not found</h2>
                        <p>We couldn't find the book you're looking for.</p>
                        <a href="index.html" class="btn btn-primary" style="display: inline-block; margin-top: 1rem;">Back to Library</a>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error("Detail Page Error:", e);
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
                    <button onclick="openReader('${book.read}')" class="btn btn-primary btn-large">Read Online</button>
                    <a href="${book.file}" target="_blank" class="btn btn-outline">Download PDF</a>
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
        loader.classList.remove('loader-hidden');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        setTimeout(() => {
            if (loader.classList.contains('loader-hidden')) {
                loader.style.display = 'none';
            }
        }, 500);
    }
}

function renderSkeletons() {
    const grid = document.getElementById('book-grid');
    if (!grid) return;
    
    grid.innerHTML = Array(8).fill(0).map(() => `
        <div class="book-card">
            <div class="book-cover-wrapper skeleton"></div>
            <div class="book-info">
                <div class="skeleton" style="height: 12px; width: 40%; margin-bottom: 10px;"></div>
                <div class="skeleton" style="height: 20px; width: 90%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 15px;"></div>
                <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 20px;"></div>
                <div style="display: flex; gap: 10px;">
                    <div class="skeleton" style="height: 40px; flex: 1; border-radius: 8px;"></div>
                    <div class="skeleton" style="height: 40px; flex: 1; border-radius: 8px;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

function fixDriveLink(url, type = 'preview') {
    if (!url) return '';
    const idMatch = url.match(/[-\w]{25,}/);
    const fileId = idMatch ? idMatch[0] : null;
    if (fileId) {
        if (type === 'preview') return `https://drive.google.com/file/d/${fileId}/preview`;
        if (type === 'cover' || type === 'image') return `https://lh3.googleusercontent.com/d/${fileId}`;
        if (type === 'thumbnail') return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
            if (CONFIG.GOOGLE_SHEET_URL) {
                try {
                    const response = await fetchWithTimeout(CONFIG.GOOGLE_SHEET_URL, {}, 8000);
                    if (!response.ok) throw new Error('Network response was not ok');
                    data = await response.json();
                } catch (e) {
                    const response = await fetch(CONFIG.LOCAL_JSON);
                    data = await response.json();
                }
            } else {
                const response = await fetch(CONFIG.LOCAL_JSON);
                data = await response.json();
            }

            allBooks = data.map((book, index) => {
                const id = (book.id ? String(book.id).trim() : null) || String(index + 1);
                let coverUrl = book.cover ? fixDriveLink(book.cover, 'cover') : fixDriveLink(book.read || book.file, 'thumbnail');
                if (!coverUrl) coverUrl = `https://picsum.photos/seed/${id}/400/600`;

                return {
                    ...book,
                    id: id,
                    read: fixDriveLink(book.read, 'preview'),
                    file: fixDriveLink(book.file, 'download'),
                    cover: coverUrl
                };
            }).sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));

            filteredBooks = [...allBooks];
            renderCategories();
            return allBooks;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        } finally {
            isFetching = false;
        }
    })();
    return fetchPromise;
}

function createBookCard(book) {
    return `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover-wrapper" onclick="window.location.href='book.html?id=${book.id}'" style="cursor: pointer;">
                <img src="${book.cover}" alt="${book.title}" class="book-cover" referrerPolicy="no-referrer" onerror="this.src='https://via.placeholder.com/400x600?text=No+Cover'">
                ${book.featured === 'TRUE' ? '<span class="book-badge">Featured</span>' : ''}
            </div>
            <div class="book-info">
                <span class="book-category">${book.category}</span>
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <div class="book-actions">
                    <button onclick="openReader('${book.read}')" class="btn btn-primary">
                        <i class="fas fa-book-open"></i> Read
                    </button>
                    <a href="${book.file}" target="_blank" class="btn btn-outline">
                        <i class="fas fa-download"></i> PDF
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderBooks(books) {
    const bookGrid = document.getElementById('book-grid');
    const emptyState = document.getElementById('empty-state');
    if (!bookGrid) return;

    if (books.length === 0) {
        bookGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    bookGrid.style.display = 'grid';
    bookGrid.innerHTML = books.map(book => createBookCard(book)).join('');
}

function renderCategories() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;

    const categories = ['All', ...new Set(allBooks.map(book => book.category))];
    
    categoryList.innerHTML = categories.map(cat => {
        const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS['Default'];
        return `
            <li class="category-item ${cat === 'All' ? 'active' : ''}" onclick="filterByCategory('${cat}')">
                <i class="fas ${icon}"></i>
                <span>${cat}</span>
            </li>
        `;
    }).join('');
}

function renderYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    if (!yearFilter) return;

    const years = [...new Set(allBooks.map(book => book.year))].filter(Boolean).sort((a, b) => b - a);
    yearFilter.innerHTML = '<option value="All">All Years</option>' + 
        years.map(year => `<option value="${year}">${year}</option>`).join('');
}

function setupFilters() {
    const yearFilter = document.getElementById('year-filter');
    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            applyFilters();
        });
    }
}

function setupSidebarSearch() {
    const sidebarSearch = document.getElementById('sidebar-search-input');
    if (!sidebarSearch) return;

    sidebarSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
}

function setupAlphabetFilter() {
    const filterGrid = document.getElementById('alphabet-grid');
    if (!filterGrid) return;

    const myanmarAlphabet = ['က', 'ခ', 'ဂ', 'ဃ', 'င', 'စ', 'ဆ', 'ဇ', 'ဈ', 'ည', 'ဋ', 'ဌ', 'ဍ', 'ဎ', 'ဏ', 'တ', 'ထ', 'ဒ', 'ဓ', 'န', 'ပ', 'ဖ', 'ဗ', 'ဘ', 'မ', 'ယ', 'ရ', 'လ', 'ဝ', 'သ', 'ဟ', 'ဠ', 'အ'];
    
    filterGrid.innerHTML = `
        <button class="letter-btn active" onclick="filterByLetter('All', this)">All</button>
        ${myanmarAlphabet.map(letter => `
            <button class="letter-btn" onclick="filterByLetter('${letter}', this)">${letter}</button>
        `).join('')}
    `;
}

function toggleAlphabetModal() {
    const overlay = document.getElementById('alphabet-overlay');
    if (overlay) {
        overlay.classList.toggle('active');
        document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

function filterByLetter(letter, btn) {
    document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const activeLabel = document.getElementById('active-letter');
    if (activeLabel) activeLabel.textContent = letter === 'All' ? 'A-Z' : letter;

    applyFilters();
    toggleAlphabetModal();
}

function filterByCategory(category) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('span').textContent === category) item.classList.add('active');
    });
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = category === 'All' ? 'All Legal Books' : category;

    applyFilters();
    
    // Close mobile sidebar if open
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('active');
}

function filterByAuthor(author) {
    resetFilters(false);
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = `Books by ${author}`;
    
    filteredBooks = allBooks.filter(book => book.author === author);
    renderBooks(filteredBooks);
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedYear = document.getElementById('year-filter')?.value || 'All';
    const activeCategoryItem = document.querySelector('.category-item.active');
    const selectedCategory = activeCategoryItem ? activeCategoryItem.querySelector('span').textContent : 'All';
    const activeLetterBtn = document.querySelector('.letter-btn.active');
    const selectedLetter = activeLetterBtn ? activeLetterBtn.textContent : 'All';

    filteredBooks = allBooks.filter(book => {
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm);
        
        const matchesYear = selectedYear === 'All' || book.year === selectedYear;
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        const matchesLetter = selectedLetter === 'All' || book.title.trim().startsWith(selectedLetter);

        return matchesSearch && matchesYear && matchesCategory && matchesLetter;
    });

    renderBooks(filteredBooks);
}

function resetFilters(render = true) {
    const searchInput = document.getElementById('search-input');
    const yearFilter = document.getElementById('year-filter');
    if (searchInput) searchInput.value = '';
    if (yearFilter) yearFilter.value = 'All';
    
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    const allCat = document.querySelector('.category-item:first-child');
    if (allCat) allCat.classList.add('active');
    
    document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));
    const allLetter = document.querySelector('.letter-btn:first-child');
    if (allLetter) allLetter.classList.add('active');
    
    const activeLabel = document.getElementById('active-letter');
    if (activeLabel) activeLabel.textContent = 'A-Z';
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = 'All Legal Books';

    if (render) {
        filteredBooks = [...allBooks];
        renderBooks(filteredBooks);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const suggestionSpan = document.getElementById('search-suggestion');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        if (term.length > 0) {
            const match = allBooks.find(book => book.title.toLowerCase().startsWith(term));
            if (match && suggestionSpan) {
                const suggestionSuffix = match.title.slice(term.length);
                suggestionSpan.textContent = e.target.value + suggestionSuffix;
            } else if (suggestionSpan) {
                suggestionSpan.textContent = '';
            }
        } else if (suggestionSpan) {
            suggestionSpan.textContent = '';
        }

        applyFilters();
    });

    searchInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestionSpan && suggestionSpan.textContent) {
            const currentInput = searchInput.value;
            const suggestion = suggestionSpan.textContent;
            if (searchInput.selectionStart === currentInput.length && suggestion.length > currentInput.length) {
                e.preventDefault();
                searchInput.value = suggestion;
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });
}
