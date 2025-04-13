
        // DOM Elements
        const ideaForm = document.getElementById("ideaForm");
        const ideaList = document.getElementById("ideaList");
        const yourIdeasList = document.getElementById("yourIdeasList");
        const searchInput = document.getElementById("searchInput");
        const languageFilter = document.getElementById("languageFilter");
        const difficultyFilter = document.getElementById("difficultyFilter");
        const themeToggle = document.getElementById("themeToggle");
        const voiceSearchBtn = document.getElementById("voiceSearchBtn");
        const voiceTitleBtn = document.getElementById("voiceTitleBtn");
        const voiceDescBtn = document.getElementById("voiceDescBtn");
        const notification = document.getElementById("notification");

        // Speech Recognition setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition;
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
        }

        // Initialize app
        let ideas = JSON.parse(localStorage.getItem("ideaForgeIdeas")) || [];
        let isRecording = false;

        // Enhanced profanity filter with more comprehensive word list
        const negativeWords = [
            // Common profanity
            'bad', 'stupid', 'idiot', 'dumb', 'shit', 'fuck', 'asshole', 'bitch', 'bastard', 'crap',
            // Discriminatory terms
            'retard', 'retarded', 'nigger', 'nigga', 'chink', 'spic', 'fag', 'faggot',
            // Negative phrases
            'hate', 'sucks', 'worthless', 'useless', 'terrible', 'awful', 'garbage', 'trash',
            // Personal attacks
            'you suck', 'you\'re stupid', 'you\'re dumb', 'kill yourself', 'nobody likes you',
            // Additional negative terms
            'moron', 'jerk', 'loser', 'lame', 'pathetic', 'disgusting', 'horrible', 'terrible',
            // Slurs and offensive terms
            'whore', 'slut', 'cunt', 'dyke', 'tranny', 'retard', 'spastic'
        ];

        // Initialize the app
        document.addEventListener('DOMContentLoaded', initApp);

        function initApp() {
            // Load saved theme
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "dark") {
                document.body.classList.add("dark-mode");
                themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }

            // Set up event listeners
            setupEventListeners();
            
            // Display existing ideas
            displayIdeas();
        }

        function setupEventListeners() {
            // Form submission
            ideaForm.addEventListener("submit", handleFormSubmit);
            
            // Theme toggle
            themeToggle.addEventListener("click", toggleTheme);
            
            // Search and filter inputs
            [searchInput, languageFilter, difficultyFilter].forEach(input => {
                input.addEventListener("input", () => {
                    displayIdeas(document.getElementById("nickname").value.trim());
                });
            });
            
            // Voice search button
            if (voiceSearchBtn && recognition) {
                voiceSearchBtn.addEventListener("click", toggleVoiceSearch);
            } else if (!recognition) {
                voiceSearchBtn.style.display = 'none';
            }
            
            // Voice input for title
            if (voiceTitleBtn && recognition) {
                voiceTitleBtn.addEventListener("click", () => startVoiceInput('title'));
            } else if (!recognition) {
                voiceTitleBtn.style.display = 'none';
            }
            
            // Voice input for description
            if (voiceDescBtn && recognition) {
                voiceDescBtn.addEventListener("click", () => startVoiceInput('description'));
            } else if (!recognition) {
                voiceDescBtn.style.display = 'none';
            }
        }

        // Voice input functions
        function toggleVoiceSearch() {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording('search');
            }
        }

        function startRecording(target) {
            if (!recognition) {
                showNotification('Speech recognition not supported in your browser', 'error');
                return;
            }
            
            isRecording = true;
            const button = target === 'search' ? voiceSearchBtn : 
                          target === 'title' ? voiceTitleBtn : voiceDescBtn;
            button.classList.add('recording');
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (target === 'search') {
                    searchInput.value = transcript;
                    displayIdeas(document.getElementById("nickname").value.trim());
                } else {
                    document.getElementById(target).value = transcript;
                }
            };
            
            recognition.onerror = (event) => {
                showNotification('Error occurred in recognition: ' + event.error, 'error');
                stopRecording();
            };
            
            recognition.onend = () => {
                stopRecording();
            };
            
            recognition.start();
        }

        function stopRecording() {
            isRecording = false;
            voiceSearchBtn.classList.remove('recording');
            voiceTitleBtn.classList.remove('recording');
            voiceDescBtn.classList.remove('recording');
        }

        function startVoiceInput(target) {
            if (isRecording) {
                stopRecording();
                return;
            }
            startRecording(target);
        }

        // Form handling
        function handleFormSubmit(e) {
            e.preventDefault();

            const nickname = document.getElementById("nickname").value.trim();
            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const tags = document.getElementById("tags").value.split(",").map(tag => tag.trim()).filter(tag => tag);
            const difficulty = document.getElementById("difficulty").value;

            // Validate inputs
            if (!title || !description || !difficulty) {
                showNotification("Please fill in all required fields.", "error");
                return;
            }

            // Filter negative content
            const filteredTitle = filterNegativeContent(title);
            const filteredDesc = filterNegativeContent(description);
            const filteredTags = tags.map(tag => filterNegativeContent(tag));

            // Create new idea
            const newIdea = {
                id: generateId(),
                nickname,
                title: filteredTitle,
                description: filteredDesc,
                tags: filteredTags,
                difficulty,
                upvotes: 0,
                upvotedBy: [],
                comments: [],
                createdAt: new Date().toISOString()
            };

            // Add to ideas array
            ideas.push(newIdea);
            saveIdeas();
            
            // Show success message
            showNotification("Idea submitted successfully!", "success");
            
            // Reset form and display ideas
            ideaForm.reset();
            displayIdeas(nickname);
        }

        // Enhanced content filtering with prevention
        function filterNegativeContent(text) {
            if (!text) return text;
            
            let filteredText = text;
            
            // Filter single words
            negativeWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                filteredText = filteredText.replace(regex, '***');
            });
            
            // Filter phrases (more complex patterns)
            const phrasePatterns = [
                /you\s+(are|re)?\s+(stupid|dumb|idiot|worthless)/gi,
                /(go|goes)\s+(to\s+)?hell/gi,
                /(what|why)\s+the\s+(hell|fuck)/gi,
                /this\s+(is\s+)?(shit|garbage|trash)/gi,
                /worst\s+.+\s+ever/gi
            ];
            
            phrasePatterns.forEach(pattern => {
                filteredText = filteredText.replace(pattern, '***');
            });
            
            return filteredText;
        }

        // Check if content contains negative words/phrases
        function containsNegativeContent(text) {
            if (!text) return false;
            
            const lowerText = text.toLowerCase();
            
            // Check single words
            const hasNegativeWord = negativeWords.some(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(lowerText);
            });
            
            if (hasNegativeWord) return true;
            
            // Check phrases
            const negativePhrases = [
                /you\s+(are|re)?\s+(stupid|dumb|idiot|worthless)/i,
                /(go|goes)\s+(to\s+)?hell/i,
                /(what|why)\s+the\s+(hell|fuck)/i,
                /this\s+(is\s+)?(shit|garbage|trash)/i,
                /worst\s+.+\s+ever/i
            ];
            
            return negativePhrases.some(regex => regex.test(lowerText));
        }

        // Display ideas with proper date formatting
        function displayIdeas(currentNickname = "") {
            const searchText = searchInput.value.toLowerCase();
            const selectedLang = languageFilter.value;
            const selectedDifficulty = difficultyFilter.value;

            // Filter community ideas
            const communityIdeas = ideas.filter(idea => {
                const matchSearch = idea.title.toLowerCase().includes(searchText) ||
                    idea.description.toLowerCase().includes(searchText) ||
                    idea.tags.some(tag => tag.toLowerCase().includes(searchText));
                const matchLang = !selectedLang || 
                    idea.tags.some(tag => tag.toLowerCase() === selectedLang.toLowerCase());
                const matchDifficulty = !selectedDifficulty || idea.difficulty === selectedDifficulty;
                return matchSearch && matchLang && matchDifficulty;
            }).sort((a, b) => b.upvotes - a.upvotes);

            // Filter user ideas
            const userIdeas = currentNickname
                ? ideas.filter(idea => idea.nickname === currentNickname)
                : [];

            // Display community ideas
            ideaList.innerHTML = communityIdeas.length
                ? communityIdeas.map(idea => createIdeaCard(idea, currentNickname)).join("")
                : '<div class="empty-state"><i class="fas fa-search"></i><p>No ideas found matching your criteria</p></div>';

            // Display user ideas
            yourIdeasList.innerHTML = userIdeas.length
                ? userIdeas.map(idea => createIdeaCard(idea, currentNickname)).join("")
                : `<div class="empty-state"><i class="fas fa-user"></i><p>${
                    currentNickname
                        ? "You haven't submitted any ideas yet"
                        : "Enter a nickname to see your submissions"
                }</p></div>`;

            // Attach event listeners
            attachUpvoteListeners(currentNickname);
            attachCommentListeners();
        }

        // Create idea card HTML with proper date formatting
        function createIdeaCard(idea, currentNickname = "") {
            let formattedDate;
            try {
                // Try parsing the date (handles both ISO strings and timestamps)
                const dateObj = new Date(idea.createdAt);
                formattedDate = isNaN(dateObj.getTime()) ? 'Recent' : dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (e) {
                formattedDate = 'Recent';
            }
            
            // Check if current user has already upvoted this idea
            const hasUpvoted = currentNickname && idea.upvotedBy && idea.upvotedBy.includes(currentNickname);
            
            return `
                <div class="idea-card" data-id="${idea.id}">
                    <h3>${idea.title}</h3>
                    <p>${idea.description}</p>
                    <div class="tags-container">
                        ${idea.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        <span class="difficulty ${idea.difficulty}">
                            ${idea.difficulty.charAt(0).toUpperCase() + idea.difficulty.slice(1)}
                        </span>
                    </div>
                    <div class="idea-meta">
                        ${idea.nickname ? `<span class="author"><i class="fas fa-user"></i> ${idea.nickname}</span>` : ''}
                        <span class="date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span class="upvote-count"><i class="fas fa-thumbs-up"></i> ${idea.upvotes || 0}</span>
                    </div>
                    <div class="idea-actions">
                        <button class="action-btn upvote-btn ${hasUpvoted ? 'upvoted' : ''}" ${hasUpvoted ? 'disabled' : ''}>
                            <i class="fas fa-thumbs-up"></i> ${hasUpvoted ? 'Upvoted' : 'Upvote'}
                        </button>
                        <button class="action-btn comment-btn">
                            <i class="fas fa-comment"></i> Comment
                        </button>
                    </div>
                    <div class="comments-section" style="display: none;">
                        <div class="comments-list">
                            ${idea.comments.map(comment => `
                                <div class="comment">${filterNegativeContent(comment)}</div>
                            `).join('')}
                        </div>
                        <div class="comment-form">
                            <input type="text" class="comment-input" placeholder="Add a constructive comment..." />
                            <div class="comment-warning" style="display: none; color: #ff6b6b; margin: 5px 0; font-size: 0.9em;">
                                <i class="fas fa-exclamation-circle"></i> Please keep comments positive and constructive
                            </div>
                            <button class="action-btn submit-comment" disabled>
                                <i class="fas fa-paper-plane"></i> Submit
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Helper functions
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }

        function saveIdeas() {
            localStorage.setItem("ideaForgeIdeas", JSON.stringify(ideas));
        }

        function showNotification(message, type = 'success') {
            notification.textContent = message;
            notification.className = 'notification show';
            notification.classList.add(type);
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function toggleTheme() {
            const isDark = document.body.classList.toggle("dark-mode");
            themeToggle.innerHTML = isDark 
                ? '<i class="fas fa-sun"></i> Light Mode' 
                : '<i class="fas fa-moon"></i> Dark Mode';
            localStorage.setItem("theme", isDark ? "dark" : "light");
        }

        // Event listeners for dynamic elements with improved comment validation
        function attachUpvoteListeners(currentNickname = "") {
            document.querySelectorAll(".upvote-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    if (!currentNickname) {
                        showNotification("Please enter a nickname to upvote ideas", "error");
                        return;
                    }

                    const card = btn.closest(".idea-card");
                    const id = card.dataset.id;
                    const idea = ideas.find(i => i.id === id);
                    
                    if (idea) {
                        // Check if user already upvoted (just in case)
                        if (idea.upvotedBy && idea.upvotedBy.includes(currentNickname)) {
                            showNotification("You've already upvoted this idea", "error");
                            return;
                        }

                        // Update idea
                        idea.upvotes = (idea.upvotes || 0) + 1;
                        
                        // Initialize upvotedBy array if it doesn't exist
                        if (!idea.upvotedBy) {
                            idea.upvotedBy = [];
                        }
                        
                        // Record that this user upvoted
                        idea.upvotedBy.push(currentNickname);
                        
                        saveIdeas();
                        displayIdeas(currentNickname);
                        showNotification('Upvote added!', 'success');
                    }
                });
            });
        }

        function attachCommentListeners() {
            // Toggle comments section
            document.querySelectorAll(".comment-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const section = btn.closest(".idea-actions").nextElementSibling;
                    section.style.display = section.style.display === "none" ? "block" : "none";
                    
                    // Focus on input when comments are shown
                    if (section.style.display === "block") {
                        section.querySelector(".comment-input").focus();
                    }
                });
            });

            // Real-time comment validation
            document.querySelectorAll(".comment-input").forEach(input => {
                const formGroup = input.closest(".comment-form");
                const submitBtn = formGroup.querySelector(".submit-comment");
                const warningMsg = formGroup.querySelector(".comment-warning");

                input.addEventListener("input", () => {
                    const commentText = input.value.trim();
                    const hasNegativeContent = containsNegativeContent(commentText);

                    if (hasNegativeContent) {
                        warningMsg.style.display = "block";
                        submitBtn.disabled = true;
                        submitBtn.style.opacity = "0.6";
                        submitBtn.style.cursor = "not-allowed";
                    } else {
                        warningMsg.style.display = "none";
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = "1";
                        submitBtn.style.cursor = "pointer";
                    }

                    // Enable submit only if there's content and it's positive
                    submitBtn.disabled = commentText.length === 0 || hasNegativeContent;
                });

                // Allow Enter key to submit (if not negative)
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter" && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                });
            });

            // Submit comments
            document.querySelectorAll(".submit-comment").forEach(btn => {
                btn.addEventListener("click", () => {
                    const card = btn.closest(".idea-card");
                    const id = card.dataset.id;
                    const input = card.querySelector(".comment-input");
                    const text = input.value.trim();
                    
                    if (!text) {
                        showNotification("Please enter a comment", "error");
                        return;
                    }
                    
                    // Final check for negative content (in case someone bypasses the UI)
                    if (containsNegativeContent(text)) {
                        alert("Please keep comments positive and constructive", "error");
                        return;
                    }
                    
                    const idea = ideas.find(i => i.id === id);
                    if (idea) {
                        if (!idea.comments) {
                            idea.comments = [];
                        }
                        idea.comments.push(text);
                        saveIdeas();
                        displayIdeas(document.getElementById("nickname").value.trim());
                        input.value = '';
                        showNotification('Comment added!', 'success');
                    }
                });
            });
        }