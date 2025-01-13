document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) return;

        // Get the current page
        const currentPage = window.location.pathname.split('/').pop();

        // Search based on current page
        switch(currentPage) {
            case 'events.html':
                searchEvents(searchTerm);
                break;
            case 'music.html':
                searchMusic(searchTerm);
                break;
            case 'index.html':
            case '':
                // Search everything and redirect to search results
                window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
                break;
            default:
                // Redirect to search page for other pages
                window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
        }
    }

    function searchEvents(searchTerm) {
        const eventItems = document.querySelectorAll('.event-item, .show-card');
        let found = false;

        eventItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            item.style.display = matches ? '' : 'none';
            if (matches) found = true;
        });

        // Show/hide no results message
        let noResults = document.getElementById('no-results');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'no-results';
            noResults.className = 'no-results';
            noResults.innerHTML = '<p>No matches found. Try a different search term.</p>';
            document.querySelector('.event-list, .show-grid').appendChild(noResults);
        }
        noResults.style.display = found ? 'none' : 'block';
    }

    function searchMusic(searchTerm) {
        const musicItems = document.querySelectorAll('.album-card, .track-item');
        let found = false;

        musicItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            
            if (item.classList.contains('album-card')) {
                item.style.display = matches ? '' : 'none';
            } else {
                item.style.display = matches ? '' : 'none';
            }
            
            if (matches) found = true;
        });

        // Show/hide no results message
        let noResults = document.getElementById('no-results');
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'no-results';
            noResults.className = 'no-results';
            noResults.innerHTML = '<p>No matches found. Try a different search term.</p>';
            document.querySelector('.album-grid').appendChild(noResults);
        }
        noResults.style.display = found ? 'none' : 'block';
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animation for show cards on scroll
    const showCards = document.querySelectorAll('.show-card');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    showCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });
});
