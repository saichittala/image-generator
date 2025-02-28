const PIXABAY_API_KEY = '40826638-5714d333bb16cf6c5efc8654d';
const UNSPLASH_API_KEY = 'Im4XtYHF00w6y37G5dTcI-V8_KjXolVfDdRkS-tAVL4';
const PEXELS_API_KEY = '7XHICSwlkwTvtmUf7RXaIe5iKGYwRnEZfdWqeScqBoB2CEezuJa4qo3P'; // Replace with your Pexels API key

let page = 1;
let isFetching = false;
let currentQuery = '';
let currentSource = 'pixabay'; // Default source is Pixabay

// Function to fetch images from Pixabay, Unsplash, or Pexels
async function fetchImages(query, append = false) {
    if (isFetching) return;
    isFetching = true;

    try {
        let apiUrl;
        let headers = {};

        if (currentSource === 'pixabay') {
            apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=64&page=${page}`;
        } else if (currentSource === 'unsplash') {
            apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}&per_page=30&page=${page}`;
        } else if (currentSource === 'pexels') {
            apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=64&page=${page}`;
            headers = { 'Authorization': PEXELS_API_KEY };
        }

        console.log('Fetching from:', apiUrl); // Debug log for API URL
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log for the response

        let images = [];
        if (currentSource === 'pixabay') {
            images = data.hits || [];
        } else if (currentSource === 'unsplash') {
            images = data.results || [];
        } else if (currentSource === 'pexels') {
            images = data.photos || [];
        }

        if (images.length > 0) {
            console.log(`${currentSource} images:`, images); // Debug log for images
            displayImageSelectionModal(images, append);
            page++;
        } else {
            console.log(`No more images to load from ${currentSource}.`);
        }

        document.getElementById('loadMoreBtn').style.display = images.length > 0 ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching images:', error);
        alert('Failed to fetch images. Please try again.');
    }

    isFetching = false;
}

function displayImageSelectionModal(images, append = false) {
    const modal = document.getElementById('imageSelectionModal');
    const modalContent = document.getElementById('modalImages');

    if (!append) {
        modalContent.innerHTML = '';  // Clear previous images if not appending
        page = 1; // Reset page count
    }

    images.forEach(image => {
        const imgElement = document.createElement('img');
        if (currentSource === 'pixabay') {
            imgElement.src = image.webformatURL;
        } else if (currentSource === 'unsplash') {
            imgElement.src = image.urls.small;
        } else if (currentSource === 'pexels') {
            imgElement.src = image.src.medium;
        }
        imgElement.classList.add('modal-image');
        
        // Set image preview and background on click
        imgElement.addEventListener('click', () => {
            updatePreviewImage(imgElement.src);
        });

        modalContent.appendChild(imgElement);
    });

    modal.style.display = 'block'; // Show modal
}

// Function to update preview image and background
function updatePreviewImage(imageSrc) {
    const previewImage = document.getElementById("previewImage");
    const imgContainer = document.querySelector(".img-container-div");

    if (previewImage) {
        previewImage.src = imageSrc;
    }
    
    if (imgContainer) {
        imgContainer.style.backgroundImage = `url('${imageSrc}')`;
        imgContainer.style.backgroundSize = "cover";  // Ensure full coverage
        imgContainer.style.backgroundPosition = "center"; // Center the image
        imgContainer.style.backgroundRepeat = "no-repeat";
    }
}


// Toggle between Pixabay, Unsplash, and Pexels
document.getElementById('pixabayBtn').addEventListener('click', () => {
    setCurrentSource('pixabay');
});

document.getElementById('unsplashBtn').addEventListener('click', () => {
    setCurrentSource('unsplash');
});

document.getElementById('pexelsBtn').addEventListener('click', () => {
    setCurrentSource('pexels');
});

function setCurrentSource(source) {
    currentSource = source;
    document.querySelectorAll('.image-source-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${source}Btn`).classList.add('active');
    resetPageAndFetchImages(currentQuery);
}

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
    fetchImages(currentQuery, true);
    document.getElementById('loadMoreBtn').style.display = 'none';
});

// Search within the modal
document.getElementById('modalSearchBtn').addEventListener('click', () => {
    const query = document.getElementById('modalSearchInput').value;
    if (!query) {
        alert('Please enter a search query.');
        return;
    }
    currentQuery = query;  // Update the global query
    page = 1; // Reset pagination
    fetchImages(query); // Fetch new images
});

// Also allow pressing 'Enter' to search
document.getElementById('modalSearchInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('modalSearchBtn').click();
    }
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

