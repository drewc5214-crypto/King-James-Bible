let bibleData = null;

// Load Bible data from local JSON on page load (flat object format)
fetch('bible.json')
    .then(response => response.json())
    .then(data => {
        bibleData = data; // data is an object like {"Book Chapter:Verse": "text"}
        console.log('Bible data loaded successfully.');
        
        // Display random verse of the day
        const keys = Object.keys(bibleData);
        if (keys.length > 0) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const verseText = bibleData[randomKey];
            document.getElementById('random-verse').textContent = `${randomKey} - ${verseText}`;
        }
    })
    .catch(error => {
        console.error('Error loading Bible data:', error);
        document.getElementById('bible-text').innerHTML = 'Failed to load Bible data. Check bible.json file.';
        document.getElementById('random-verse').textContent = 'Verse unavailable.';
    });

// Chapter counts for all KJV books
const chapterCounts = {
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
    'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
    'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
    'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
    'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
    'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
    'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24,
    'John': 21, 'Acts': 28, 'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13,
    'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
    '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
    'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5,
    '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

// Intro Screen Transition (with debug alerts - remove after testing)
document.getElementById('start-btn').addEventListener('click', () => {
    alert('Start button clicked!'); // Debug alert
    const intro = document.getElementById('intro');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    
    intro.classList.add('hide');
    setTimeout(() => {
        intro.style.display = 'none';
        header.style.display = 'flex';
        main.style.display = 'block';
        alert('Transition complete!'); // Debug alert
    }, 500);
});

// Dark Mode Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = document.getElementById('theme-toggle');
    icon.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Populate chapters when book changes
document.getElementById('book-select').addEventListener('change', () => {
    const book = document.getElementById('book-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    chapterSelect.innerHTML = '';
    const count = chapterCounts[book];
    for (let i = 1; i <= count; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Chapter ${i}`;
        chapterSelect.appendChild(option);
    }
});

// Load initial chapters for default book (Genesis)
document.getElementById('book-select').dispatchEvent(new Event('change'));

// Load chapter from flat JSON object
document.getElementById('load-btn').addEventListener('click', () => {
    const book = document.getElementById('book-select').value;
    const chapter = document.getElementById('chapter-select').value;
    
    // Show loading indicator
    document.getElementById('loading').style.display = 'block';
    document.getElementById('bible-text').innerHTML = '';
    document.getElementById('search-results').style.display = 'none';
    
    if (!bibleData) {
        document.getElementById('bible-text').innerHTML = 'Bible data not loaded yet. Please wait.';
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    // Filter keys that match the selected book and chapter (e.g., "Hebrews 7:1", "Hebrews 7:2")
    const matchingKeys = Object.keys(bibleData).filter(key => key.startsWith(`${book} ${chapter}:`));
    if (matchingKeys.length === 0) {
        document.getElementById('bible-text').innerHTML = 'No verses found for this chapter.';
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    // Sort verses by verse number and build HTML
    const verses = matchingKeys
        .map(key => {
            const verseNum = key.split(':')[1]; // Extract verse number (e.g., "2" from "Hebrews 7:2")
            return { verse: parseInt(verseNum), text: bibleData[key] };
        })
        .sort((a, b) => a.verse - b.verse) // Sort by verse number
        .map(v => `<p><sup>${v.verse}</sup> ${v.text}</p>`)
        .join('');
    
    // Hide loading and display text
    document.getElementById('loading').style.display = 'none';
    document.getElementById('bible-text').innerHTML = `<h2>${book} ${chapter}</h2>${verses}`;
});

// Search Functionality
document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    if (!query) return;
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('bible-text').innerHTML = '';
    
    if (!bibleData) {
        document.getElementById('search-results').innerHTML = 'Bible data not loaded yet.';
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    // Search keys and text for matches
    const results = Object.keys(bibleData)
        .filter(key => key.toLowerCase().includes(query) || bibleData[key].toLowerCase().includes(query))
        .slice(0, 20) // Limit to 20 results
        .map(key => {
            const [bookChapter] = key.split(':');
            const verseNum = key.split(':')[1];
            return { key, bookChapter, verseNum, text: bibleData[key] };
        });
    
    document.getElementById('loading').style.display = 'none';
    if (results.length === 0) {
        document.getElementById('search-results').innerHTML = '<h3>No results found.</h3>';
    } else {
        const resultList = results.map(r => `<li onclick="loadFromSearch('${r.bookChapter}')">${r.bookChapter}:${r.verseNum} - ${r.text.substring(0, 100)}...</li>`).join('');
        document.getElementById('search-results').innerHTML = `<h3>Search Results (${results.length}):</h3><ul>${resultList}</ul>`;
    }
    document.getElementById('search-results').style.display = 'block';
});

// Function to load chapter from search result
function loadFromSearch(bookChapter) {
    const [book, chapter] = bookChapter.split(' ');
    document.getElementById('book-select').value = book;
    document.getElementById('book-select').dispatchEvent(new Event('change'));
    document.getElementById('chapter-select').value = chapter;
    document.getElementById('load-btn').click();
}