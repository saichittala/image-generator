const PIXABAY_API_KEY = '40826638-5714d333bb16cf6c5efc8654d';
const UNSPLASH_API_KEY = 'Im4XtYHF00w6y37G5dTcI-V8_KjXolVfDdRkS-tAVL4'; // Replace with your Unsplash API key
let page = 1;
let isFetching = false;
let currentQuery = '';
let currentSource = 'pixabay'; // Default source is Pixabay

// Function to fetch images from Pixabay or Unsplash
async function fetchImages(query, append = false) {
    if (isFetching) return;
    isFetching = true;

    try {
        let apiUrl;

        if (currentSource === 'pixabay') {
            apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=64&page=${page}`;
        } else if (currentSource === 'unsplash') {
            apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}&per_page=30&page=${page}`;
        }

        console.log('Fetching from:', apiUrl); // Debug log for API URL
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log for the response

        if (currentSource === 'pixabay') {
            if (data.hits && data.hits.length > 0) {
                console.log('Pixabay images:', data.hits); // Debug log for images
                displayImageSelectionModal(data.hits, append);
                page++;
            } else {
                console.log('No more images to load from Pixabay.');
            }
        } else if (currentSource === 'unsplash') {
            if (data.results && data.results.length > 0) {
                console.log('Unsplash images:', data.results); // Debug log for images
                displayImageSelectionModal(data.results, append);
                page++;
            } else {
                console.log('No more images to load from Unsplash.');
            }
        }

        // Show the Load More button if there are more images to load
        if ((data.hits && data.hits.length > 0) || (data.results && data.results.length > 0)) {
            document.getElementById('loadMoreBtn').style.display = 'block';
        } else {
            document.getElementById('loadMoreBtn').style.display = 'none';
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
        imgElement.src = currentSource === 'pixabay' ? image.webformatURL : image.urls.small;
        imgElement.classList.add('modal-image');
        imgElement.addEventListener('click', () => {
            document.getElementById('previewImage').src = currentSource === 'pixabay' ? image.webformatURL : image.urls.small;
        });
        modalContent.appendChild(imgElement);
    });

    modal.style.display = 'block'; // Show modal
}

// Toggle between Pixabay and Unsplash
document.getElementById('pixabayBtn').addEventListener('click', () => {
    currentSource = 'pixabay';
    document.getElementById('pixabayBtn').classList.add('active');
    document.getElementById('unsplashBtn').classList.remove('active');
    resetPageAndFetchImages(currentQuery);
});

document.getElementById('unsplashBtn').addEventListener('click', () => {
    currentSource = 'unsplash';
    document.getElementById('unsplashBtn').classList.add('active');
    document.getElementById('pixabayBtn').classList.remove('active');
    resetPageAndFetchImages(currentQuery);
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

// Function to reset the page and images when switching queries
function resetPageAndFetchImages(query) {
    page = 1;
    fetchImages(query);
}

// Load more images when "Load More" button is clicked
document.getElementById('loadMoreBtn').addEventListener('click', () => {
    fetchImages(currentQuery, true); // Fetch more images and append them
    document.getElementById('loadMoreBtn').style.display = 'none'; // Hide button after click
});

function enableEdit(elementId) {
    const element = document.getElementById(elementId);
    
    // Make the text content editable on single click
    element.setAttribute('contenteditable', 'true');
    
    // Focus on the element to start editing
    element.focus();
    
    // Add a style to make it visually obvious it's editable
    element.style.outline = '1px solid #000000'; // Change the outline color (optional)

    // When the element loses focus, save the edited text
    element.addEventListener('blur', function() {
        element.style.outline = ''; // Remove the outline
        element.setAttribute('contenteditable', 'false'); // Disable editing
    });

    // Optional: When Enter is pressed, save the text and remove the outline
    element.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            element.blur(); // Trigger blur to save the changes
        }
    });
}

