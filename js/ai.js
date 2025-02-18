const PIXABAY_API_KEY = '40826638-5714d333bb16cf6c5efc8654d';
let page = 1;
let isFetching = false;
let currentQuery = '';

// Function to fetch images from Pixabay
async function fetchImages(query, append = false) {
    if (isFetching) return;
    isFetching = true;

    try {
        const response = await fetch(
            `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=12&page=${page}`
        );
        const data = await response.json();

        if (data.hits && data.hits.length > 0) {
            displayImageSelectionModal(data.hits, append);
            page++;  // Increment page number for next fetch
        } else {
            console.log('No more images to load.');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        alert('Failed to fetch images. Please try again.');
    }

    isFetching = false;
}

// Function to display images in the modal
function displayImageSelectionModal(images, append = false) {
    const modal = document.getElementById('imageSelectionModal');
    const modalContent = document.getElementById('modalImages');

    if (!append) {
        modalContent.innerHTML = '';  // Clear previous images if not appending
        page = 1; // Reset page count
    }

    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.webformatURL;
        imgElement.classList.add('modal-image');
        imgElement.addEventListener('click', () => {
            document.getElementById('previewImage').src = image.webformatURL;
        });
        modalContent.appendChild(imgElement);
    });

    // Show modal
    modal.style.display = 'block';
}

// Infinite scrolling logic
document.getElementById('modalImages').addEventListener('scroll', function () {
    const container = this;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10 && !isFetching) {
        fetchImages(currentQuery, true); // Load more images when scrolling to the bottom
    }
});

// Generate images on button click
document.getElementById('generateImageBtn').addEventListener('click', async () => {
    const query = document.getElementById('aiPromptInput').value;
    if (!query) {
        alert('Please enter a search query.');
        return;
    }

    currentQuery = query;
    page = 1; // Reset page count
    await fetchImages(query);
});

// Close modal when clicking outside
document.getElementById('imageSelectionModal').addEventListener('click', (event) => {
    if (event.target.id === 'imageSelectionModal') {
        document.getElementById('imageSelectionModal').style.display = 'none';
    }
});

// Close modal when clicking the close button
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('imageSelectionModal').style.display = 'none';
});

// Make modal draggable
const modalContent = document.querySelector('.modal-content');

let isDragging = false;
let offsetX, offsetY;

modalContent.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - modalContent.getBoundingClientRect().left;
    offsetY = e.clientY - modalContent.getBoundingClientRect().top;
    modalContent.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    modalContent.style.left = `${e.clientX - offsetX}px`;
    modalContent.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    modalContent.style.cursor = 'grab';
});

// Function to reset the page and images when switching queries
function resetPageAndFetchImages(query) {
    page = 1;
    fetchImages(query);
}

