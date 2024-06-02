document.addEventListener('DOMContentLoaded', function() {
    // Initialize stars based on local storage or data from URL if available
    const searchParams = new URLSearchParams(window.location.search);
    const encodedData = searchParams.get('data');
    if (encodedData) {
        const dataFromUrl = decodeAndDecompress(encodedData);
        initializeStars(dataFromUrl);
    } else {
        initializeStars(null);
    }

    document.getElementById('shareButton').addEventListener('click', function() {
        const serializedData = serializeTableData();
        const encodedCompressedData = compressAndEncode(serializedData);
        const currentUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        const newUrl = `${currentUrl}?data=${encodedCompressedData}`;

        // Set the URL in the modal input and show the modal
        const shareInput = document.getElementById('shareUrl');
        shareInput.value = newUrl;
        showModal();
    });

    document.getElementById('resetButton').addEventListener('click', function() {
        resetRatings();
        clearUrl();
    });
});

function initializeStars(data) {
    document.querySelectorAll('.content').forEach(cell => {
        const cellId = cell.getAttribute('id');
        const starsHtml = data ? getStarsHtmlFromData(data, cellId) : getStarsHtml(cellId);
        cell.querySelector('.stars').innerHTML = starsHtml;

        cell.querySelector('.stars').addEventListener('click', function(event) {
            if (event.target.classList.contains('star')) {
                const idx = Array.from(this.children).indexOf(event.target) + 1;
                const currentRating = localStorage.getItem(cellId) || 0;
                const newRating = idx === parseInt(currentRating) ? 0 : idx; // Toggle the same rating
                setStars(cellId, newRating);
            }
        });
    });
}

function serializeTableData() {
    let data = {};
    document.querySelectorAll('.content').forEach(cell => {
        const cellId = cell.getAttribute('id');
        const rating = localStorage.getItem(cellId) || 0;
        data[cellId] = rating;
    });
    return data;
}

function getStarsHtmlFromData(data, cellId) {
    const rating = data[cellId] || 0;
    return getStarsHtmlForRating(rating);
}

function getStarsHtml(cellId) {
    const rating = localStorage.getItem(cellId) || 0;
    return getStarsHtmlForRating(rating);
}

function getStarsHtmlForRating(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 3; i++) {
        starsHtml += `<span class="star ${i <= rating ? '' : 'gray'}">★</span>`;
    }
    return starsHtml;
}

function setStars(cellId, rating) {
    localStorage.setItem(cellId, String(rating)); // Ensure rating is stored as a string
    document.getElementById(cellId).querySelector('.stars').innerHTML = getStarsHtmlForRating(rating);
}

function compressAndEncode(dataObject) {
    const jsonString = JSON.stringify(dataObject);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    return btoa(compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeAndDecompress(encodedData) {
    const data = atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'));
    const decompressed = pako.inflate(data, { to: 'string' });
    return JSON.parse(decompressed);
}

function copyToClipboard() {
    const copyText = document.getElementById("shareUrl");
    copyText.select();
    document.execCommand("copy");
    alert("Copied to clipboard: " + copyText.value);
}

function showModal() {
    document.getElementById('shareModal').style.display = 'block';
    const shareInput = document.getElementById('shareUrl');
    shareInput.focus();
    shareInput.select();
}

function closeModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function resetRatings() {
    document.querySelectorAll('.content').forEach(cell => {
        localStorage.removeItem(cell.getAttribute('id'));
        cell.querySelector('.stars').innerHTML = getStarsHtmlForRating(0);
    });
}

function clearUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('data');
    window.history.pushState({}, '', url.toString());
}
