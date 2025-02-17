// Replace with your Stability AI API key
const apiKey = 'sk-CA4OhATn2gBN3go21Wk32IZRHQcAyZ7qGNKNN9Twgo63eReP';
const apiUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';

// Function to generate image using Stability AI
async function generateImageWithAI(prompt) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            width: 512,
            height: 512,
            steps: 30,
            samples: 1,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate image. Please try again.');
    }

    const data = await response.json();
    return data.artifacts[0].base64; // Base64-encoded image
}

// Function to handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Function to handle AI image generation
async function handleAIImageGeneration() {
    const prompt = document.getElementById('aiPromptInput').value; // Use AI Prompt Input field
    if (!prompt) {
        alert('Please enter a prompt for image generation.');
        return;
    }

    const button = document.getElementById('generateImageBtn');
    button.disabled = true;
    button.textContent = 'Generating...';

    try {
        const imageUrl = await generateImageWithAI(prompt);
        const previewImage = document.getElementById('previewImage');
        previewImage.src = `data:image/png;base64,${imageUrl}`;
        previewImage.style.display = 'block';
    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = 'Generate';
    }
}

// Event Listeners
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('generateImageBtn').addEventListener('click', handleAIImageGeneration);