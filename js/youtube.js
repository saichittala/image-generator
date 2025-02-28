const CLIENT_ID = "459494761850-33ni1civ148l601a3n7d252rg4u0cuq2.apps.googleusercontent.com"; // Replace with your OAuth Client ID
const SCOPES = "https://www.googleapis.com/auth/youtube.upload";
let accessToken = null;
let tokenClient;

// ✅ Load YouTube API
function loadYouTubeAPI() {
    gapi.load("client", () => {
        gapi.client.load("youtube", "v3", () => {
            console.log("YouTube API Loaded!");
            loadUploadedVideos();
        });
    });
}

// ✅ Authenticate User
function authenticate() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
            if (response.error) {
                console.error("Authentication failed", response);
                return;
            }
            accessToken = response.access_token;
            console.log("Authenticated Successfully!");
        }
    });

    tokenClient.requestAccessToken();
}

// ✅ Handle Upload
document.getElementById("upload").addEventListener("click", () => {
    const fileInput = document.getElementById("videoFile").files[0];
    const title = document.getElementById("videoTitle").value || "Untitled Video";
    const description = document.getElementById("videoDescription").value || "No Description";
    const tags = document.getElementById("videoTags").value.split(",").map(tag => tag.trim());
    const scheduleTime = document.getElementById("scheduleTime").value;

    if (!fileInput) {
        alert("Please select a video file.");
        return;
    }

    if (!accessToken) {
        alert("Please log in first.");
        return;
    }

    if (scheduleTime) {
        const uploadTime = new Date(scheduleTime).toISOString();
        uploadVideo(fileInput, title, description, tags, "private", uploadTime);
    } else {
        uploadVideo(fileInput, title, description, tags, "public");
    }
});

// ✅ Upload Video with Progress Tracking
function uploadVideo(file, title, description, tags, privacyStatus, publishTime = null) {
    const metadata = {
        snippet: {
            title: title,
            description: description,
            tags: tags,
            categoryId: "22"
        },
        status: {
            privacyStatus: privacyStatus,
            publishAt: publishTime // Only works for "private" videos
        }
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    // Show progress bar
    document.getElementById("progress-container").style.display = "block";

    fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            console.log("✅ Upload Successful! Video ID:", data.id);
            saveVideoData(title, data.id);
            updateProgress(100);
        } else {
            console.error("❌ Upload failed", data);
        }
    })
    .catch(error => {
        console.error("❌ Upload failed", error);
        updateProgress(0);
    });

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress >= 90) clearInterval(interval);
        updateProgress(progress);
    }, 500);
}

// ✅ Update Progress Bar
function updateProgress(value) {
    document.getElementById("progress-bar").value = value;
    document.getElementById("progress-text").innerText = `${value}%`;
}

// ✅ Save Uploaded Video Info
function saveVideoData(title, videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videos = JSON.parse(localStorage.getItem("uploadedVideos")) || [];
    videos.push({ title, url: videoUrl });
    localStorage.setItem("uploadedVideos", JSON.stringify(videos));
    loadUploadedVideos();
}

// ✅ Load & Delete Uploaded Videos
function loadUploadedVideos() {
    const videoList = document.getElementById("videoList");
    videoList.innerHTML = "";
    const videos = JSON.parse(localStorage.getItem("uploadedVideos")) || [];

    videos.forEach((video, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${video.url}" target="_blank">${video.title}</a>
                              <button class="delete-btn" onclick="deleteVideo(${index})">🗑</button>`;
        videoList.appendChild(listItem);
    });
}

function deleteVideo(index) {
    const videos = JSON.parse(localStorage.getItem("uploadedVideos")) || [];
    videos.splice(index, 1);
    localStorage.setItem("uploadedVideos", JSON.stringify(videos));
    loadUploadedVideos();
}

document.getElementById("login").addEventListener("click", authenticate);
window.onload = loadYouTubeAPI;
