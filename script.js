let backendURL = "https://figma-production.up.railway.app"; // Hosted backend URL

let session_id = null; // Store session ID

// ✅ Start a new session when the page loads
async function startSession() {
    try {
        let response = await fetch(`${backendURL}/start`);
        let data = await response.json();
        session_id = data.session_id; // Store session ID
        console.log("✅ Session started:", session_id);

        // Show welcome message in chat
        let chatBox = document.getElementById("chatBox");
        chatBox.innerHTML += `<div class="chat-message bot">${data.message}</div>`;
    } catch (error) {
        console.error("⚠️ Error starting session:", error);
    }
}

// ✅ Send user message to backend
async function sendMessage() {
    let userInput = document.getElementById("userInput").value;
    let chatBox = document.getElementById("chatBox");

    if (!session_id) {
        console.error("⚠️ No session found. Starting new session...");
        await startSession(); // Start a new session if needed
    }

    if (userInput.trim() !== "") {
        // Append user's message to chat
        chatBox.innerHTML += `<div class="chat-message user">${userInput}</div>`;

        // Show typing indicator
        let typingIndicator = document.createElement("div");
        typingIndicator.classList.add("chat-message", "bot", "typing-indicator");
        typingIndicator.innerHTML = `<span></span><span></span><span></span>`;
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            let response = await fetch(`${backendURL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: session_id, response: userInput })
            });
        
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        
            let data = await response.json();
        

            // Remove typing indicator
            chatBox.removeChild(typingIndicator);

            if (data.error) {
                chatBox.innerHTML += `<div class="chat-message bot error">⚠️ ${data.error}</div>`;
                console.error("⚠️ API Error:", data.error);
            } else {
                // ✅ Process AI response (including video handling)
                let messageDiv = document.createElement("div");
                messageDiv.classList.add("chat-message", "bot");
                messageDiv.innerHTML = data.message;

                // ✅ Ensure embedded videos (YouTube iframes) are properly displayed
                let iframes = messageDiv.getElementsByTagName("iframe");
                for (let iframe of iframes) {
                    iframe.style.width = "100%";
                    iframe.style.height = "315px";
                    iframe.style.borderRadius = "10px";
                    iframe.style.marginTop = "10px";
                }

                chatBox.appendChild(messageDiv);
            }

            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (error) {
            console.error("⚠️ Server error:", error);
            chatBox.removeChild(typingIndicator);
            chatBox.innerHTML += `<div class="chat-message bot error">⚠️ Server error. Try again.</div>`;
        }

        document.getElementById("userInput").value = "";
    }
}

// ✅ Allow pressing "Enter" to send message
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// ✅ Start session when page loads
window.onload = startSession;