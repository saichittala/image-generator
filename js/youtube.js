const CLIENT_ID = "459494761850-33ni1civ148l601a3n7d252rg4u0cuq2.apps.googleusercontent.com"; // ✅ Replace with your actual OAuth Client ID
const API_KEY = "AIzaSyA_A6GQbVBbp8WNppr7rhCXUe4ekkNEiqA"; // ✅ Replace with your actual API Key
const SCOPES = "https://www.googleapis.com/auth/youtube.upload";

function initClient() {
    gapi.load("client:auth2", () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
            scope: SCOPES
        }).then(() => {
            gapi.auth2.init({ client_id: CLIENT_ID }).then(() => {
                console.log("✅ API Initialized");
                checkAuthState();
            });
        }).catch(error => {
            console.error("❌ Initialization Error:", error);
            showError("Failed to initialize YouTube API.");
        });
    });
}

function checkAuthState() {
    const auth = gapi.auth2.getAuthInstance();
    if (auth.isSignedIn.get()) {
        document.getElementById("login").classList.add("hidden");
        document.getElementById("logout").classList.remove("hidden");
        document.getElementById("upload").disabled = false;
    } else {
        document.getElementById("login").classList.remove("hidden");
        document.getElementById("logout").classList.add("hidden");
        document.getElementById("upload").disabled = true;
    }
}

function authenticate() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
        console.log("✅ Logged in");
        checkAuthState();
    }).catch(error => {
        console.error("❌ Auth Error", error);
        showError("Authentication failed.");
    });
}

function logout() {
    gapi.auth2.getAuthInstance().signOut().then(() => {
        console.log("✅ Logged out");
        checkAuthState();
    });
}

document.getElementById("login").addEventListener("click", authenticate);
document.getElementById("logout").addEventListener("click", logout);
gapi.load("client:auth2", initClient);

function uploadVideo() {
    const file = document.getElementById("videoFile").files[0];
    if (!file) {
        showError("Please select a video file.");
        return;
    }

    const title = document.getElementById("videoTitle").value || "Untitled";
    const description = document.getElementById("videoDescription").value || "";
    const tags = document.getElementById("videoTags").value.split(",").map(tag => tag.trim());
    const privacyStatus = document.getElementById("scheduleTime").value ? "private" : "public";
    const publishTime = document.getElementById("scheduleTime").value || null;

    const metadata = {
        snippet: { title, description, tags, categoryId: "22" },
        status: { privacyStatus, publishAt: publishTime }
    };

    document.getElementById("progress-container").classList.remove("hidden");
    updateProgress(0);

    const reader = new FileReader();
    reader.onload = function(e) {
        const blob = new Blob([e.target.result], { type: file.type });

        gapi.client.request({
            path: "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(metadata)
        }).then(response => {
            const uploadUrl = response.headers.Location;
            return fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: blob });
        }).then(() => {
            updateProgress(100);
            document.getElementById("progress-container").classList.add("hidden");
            console.log("✅ Upload Success");
        }).catch(error => showError("Upload failed: " + error.message));
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById("upload").addEventListener("click", uploadVideo);
