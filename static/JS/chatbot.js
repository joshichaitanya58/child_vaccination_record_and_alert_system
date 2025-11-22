document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");
    const languageSelector = document.getElementById("language-selector");
    const sendButton = document.getElementById("send-button");
    const clearChatBtn = document.getElementById("clear-chat");
    const voiceBtn = document.getElementById("voice-btn");
    const quickButtons = document.querySelectorAll(".quick-btn");

    // --- Configuration ---
    const API_KEY = "Enter_Your_API_Key";
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";

    const translations = {
        en: {
            title: "Child Vaccination Assistant",
            poweredBy: "Powered by AI",
            online: "Online",
            clearChat: "Clear Chat",
            initialMessage: "Hello! 👋 I'm your friendly vaccination assistant. I can help you with vaccination schedules, appointment booking, document requirements, and answer all your vaccination-related questions. How can I assist you today?",
            inputPlaceholder: "Ask about vaccination schedules, documents, or book appointment...",
            sendButton: "Send",
            suggestions: "Try asking: '6 month vaccine schedule' or 'What is BCG vaccine?'",
            newbornSchedule: "Newborn Schedule",
            documents: "Documents",
            bookAppointment: "Book Appointment",
            aboutProject: "About Project",
            systemContent: `You are VaxCare AI, an intelligent and professional vaccination assistant for a comprehensive child vaccination management system. 

IMPORTANT PROJECT INFORMATION:
- Project Name: "Vaccination Management System"
- Features: Doctor Dashboard, Parent Portal, Vaccination Tracking, Appointment Scheduling, Growth Monitoring, Certificate Generation
- Technologies: Web-based platform with AI integration
- Purpose: Digitalize child vaccination records and make healthcare accessible

RESPONSE GUIDELINES:
1. Always respond in a professional, empathetic, and helpful manner
2. When discussing vaccination schedules, present information in well-formatted tables
3. For project-related questions, highlight key features and benefits
4. Use markdown formatting for better readability
5. Include relevant emojis to make responses engaging
6. Provide actionable advice and next steps
7. For medical concerns, always recommend consulting healthcare professionals

SPECIAL INSTRUCTIONS:
- Format tables using HTML table tags with class "vaccine-table"
- Use bullet points for lists with proper formatting
- Highlight important information with emphasis
- Keep responses comprehensive but concise`,
            typingIndicatorText: "Assistant is typing...",
            apiErrorText: "I apologize, but I'm experiencing connection issues. Please try again in a moment.",
            voiceNotSupported: "Voice input is not supported in your browser",
            listening: "Listening...",
            clearConfirm: "Are you sure you want to clear the chat history?"
        },
        hi: {
            title: "बाल टीकाकरण सहायक",
            poweredBy: "एआई द्वारा संचालित",
            online: "ऑनलाइन",
            clearChat: "चैट साफ करें",
            initialMessage: "नमस्ते! 👋 मैं आपका टीकाकरण सहायक हूँ। मैं टीकाकरण कार्यक्रम, अपॉइंटमेंट बुकिंग, दस्तावेज़ आवश्यकताओं और आपके सभी टीकाकरण संबंधी प्रश्नों में आपकी सहायता कर सकता हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
            inputPlaceholder: "टीकाकरण कार्यक्रम, दस्तावेज़, या अपॉइंटमेंट बुक करने के बारे में पूछें...",
            sendButton: "भेजें",
            suggestions: "पूछने का प्रयास करें: '6 महीने का टीकाकरण कार्यक्रम' या 'बीसीजी वैक्सीन क्या है?'",
            newbornSchedule: "नवजात कार्यक्रम",
            documents: "दस्तावेज़",
            bookAppointment: "अपॉइंटमेंट बुक करें",
            aboutProject: "प्रोजेक्ट के बारे में",
            systemContent: `आप वैक्सकेयर एआई हैं, एक व्यापक बाल टीकाकरण प्रबंधन प्रणाली के लिए एक बुद्धिमान और पेशेवर टीकाकरण सहायक।

महत्वपूर्ण परियोजना जानकारी:
- परियोजना का नाम: "टीकाकरण प्रबंधन प्रणाली"
- विशेषताएं: डॉक्टर डैशबोर्ड, पैरेंट पोर्टल, टीकाकरण ट्रैकिंग, अपॉइंटमेंट शेड्यूलिंग, विकास निगरानी, प्रमाणपत्र जनरेशन
- प्रौद्योगिकियां: एआई एकीकरण के साथ वेब-आधारित प्लेटफॉर्म
- उद्देश्य: बाल टीकाकरण रिकॉर्ड को डिजिटल बनाना और स्वास्थ्य सेवा को सुलभ बनाना

प्रतिक्रिया दिशानिर्देश:
1. हमेशा पेशेवर, सहानुभूतिपूर्ण और सहायक तरीके से जवाब दें
2. टीकाकरण कार्यक्रमों पर चर्चा करते समय, अच्छी तरह से स्वरूपित तालिकाओं में जानकारी प्रस्तुत करें
3. परियोजना-संबंधी प्रश्नों के लिए, मुख्य विशेषताओं और लाभों पर प्रकाश डालें
4. बेहतर पठनीयता के लिए मार्कडाउन फॉर्मेटिंग का उपयोग करें
5. प्रतिक्रियाओं को आकर्षक बनाने के लिए प्रासंगिक इमोजी शामिल करें
6. कार्रवाई योग्य सलाह और अगले कदम प्रदान करें
7. चिकित्सा संबंधी चिंताओं के लिए, हमेशा स्वास्थ्य देखभाल पेशेवरों से परामर्श करने की सलाह दें

विशेष निर्देश:
- "vaccine-table" क्लास के साथ HTML टेबल टैग का उपयोग करके तालिकाएं प्रारूपित करें
- उचित फॉर्मेटिंग के साथ सूचियों के लिए बुलेट पॉइंट्स का उपयोग करें
- महत्वपूर्ण जानकारी को जोर देकर हाइलाइट करें
- प्रतिक्रियाओं को व्यापक लेकिन संक्षिप्त रखें`,
            typingIndicatorText: "सहायक टाइप कर रहा है...",
            apiErrorText: "मैं क्षमा चाहता हूं, लेकिन मुझे कनेक्शन समस्याओं का सामना करना पड़ रहा है। कृपया एक क्षण में पुनः प्रयास करें।",
            voiceNotSupported: "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है",
            listening: "सुन रहा हूं...",
            clearConfirm: "क्या आप वाकई चैट इतिहास साफ करना चाहते हैं?"
        },
        mr: {
            title: "बाल लसीकरण सहाय्यक",
            poweredBy: "एआय द्वारे समर्थित",
            online: "ऑनलाइन",
            clearChat: "चॅट साफ करा",
            initialMessage: "नमस्कार! 👋 मी तुमचा लसीकरण सहाय्यक आहे. मी लसीकरण वेळापत्रक, अपॉइंटमेंट बुकिंग, कागदपत्रे आवश्यकता आणि तुमच्या सर्व लसीकरण संबंधित प्रश्नांमध्ये मदत करू शकतो. आज मी तुमची कशी मदत करू शकेन?",
            inputPlaceholder: "लसीकरण वेळापत्रक, कागदपत्रे, किंवा अपॉइंटमेंट बुक करण्याबद्दल विचारा...",
            sendButton: "पाठवा",
            suggestions: "विचारण्याचा प्रयत्न करा: '6 महिन्यांचे लसीकरण वेळापत्रक' किंवा 'बीसीजी लस म्हणजे काय?'",
            newbornSchedule: "नवजात वेळापत्रक",
            documents: "कागदपत्रे",
            bookAppointment: "अपॉइंटमेंट बुक करा",
            aboutProject: "प्रकल्पाबद्दल",
            systemContent: `तुम्ही वॅक्सकेअर एआय आहात, एका व्यापक बाल लसीकरण व्यवस्थापन प्रणालीसाठी एक बुद्धिमान आणि व्यावसायिक लसीकरण सहाय्यक.

महत्वाची प्रकल्प माहिती:
- प्रकल्पाचे नाव: "लसीकरण व्यवस्थापन प्रणाली"
- वैशिष्ट्ये: डॉक्टर डॅशबोर्ड, पालक पोर्टल, लसीकरण ट्रॅकिंग, अपॉइंटमेंट शेड्युलिंग, वाढ निरीक्षण, प्रमाणपत्र निर्मिती
- तंत्रज्ञान: एआय एकत्रीकरणासह वेब-आधारित प्लॅटफॉर्म
- उद्देश: बाल लसीकरण नोंदी डिजिटल करणे आणि आरोग्यसेवा सुलभ करणे

प्रतिसाद मार्गदर्शक तत्त्वे:
1. नेहमी व्यावसायिक, सहानुभूतिपूर्ण आणि सहाय्यक पद्धतीने उत्तर द्या
2. लसीकरण वेळापत्रकांवर चर्चा करताना, चांगल्या स्वरूपात सारण्यांमध्ये माहिती सादर करा
3. प्रकल्प-संबंधित प्रश्नांसाठी, मुख्य वैशिष्ट्ये आणि फायदे हायलाइट करा
4. चांगल्या वाचनीयतेसाठी मार्कडाउन फॉरमॅटिंग वापरा
5. प्रतिसादांना आकर्षक बनवण्यासाठी संबंधित इमोजी समाविष्ट करा
6. कृतीयोग्य सल्ला आणि पुढच्या चरणांद्वारे मदत करा
7. वैद्यकीय चिंतेसाठी, नेहमी आरोग्यसेवा व्यावसायिकांचा सल्ला घेण्याची शिफारस करा

विशेष सूचना:
- "vaccine-table" वर्गासह HTML टेबल टॅग वापरून सारण्या स्वरूपित करा
- योग्य फॉरमॅटिंगसह याद्यांसाठी बुलेट पॉइंट्स वापरा
- महत्वाची माहिती जोर देऊन हायलाइट करा
- प्रतिसाद व्यापक पण संक्षिप्त ठेवा`,
            typingIndicatorText: "सहाय्यक टाइप करत आहे...",
            apiErrorText: "मला माफ करा, पण मला कनेक्शन समस्यांचा सामना करावा लागत आहे. कृपया क्षणभरात पुन्हा प्रयत्न करा.",
            voiceNotSupported: "तुमच्या ब्राउझरमध्ये व्हॉइस इनपुट समर्थित नाही",
            listening: "ऐकत आहे...",
            clearConfirm: "तुम्हाला खरोखर चॅट इतिहास साफ करायचा आहे का?"
        }
    };

    let conversationHistory = [];
    let currentLang = 'en';
    let recognition = null;

    // Initialize speech recognition
    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = currentLang === 'en' ? 'en-US' : (currentLang === 'hi' ? 'hi-IN' : 'mr-IN');

            recognition.onstart = () => {
                voiceBtn.classList.add('text-danger');
                userInput.placeholder = translations[currentLang].listening;
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                voiceBtn.classList.remove('text-danger');
                userInput.placeholder = translations[currentLang].inputPlaceholder;
            };

            recognition.onerror = () => {
                voiceBtn.classList.remove('text-danger');
                userInput.placeholder = translations[currentLang].inputPlaceholder;
            };

            recognition.onend = () => {
                voiceBtn.classList.remove('text-danger');
                userInput.placeholder = translations[currentLang].inputPlaceholder;
            };
        }
    }

    function changeLanguage(lang) {
        const langTranslations = translations[lang];
        
        // Update all translatable elements
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (langTranslations[key]) {
                if (element.placeholder !== undefined) {
                    element.placeholder = langTranslations[key];
                } else {
                    element.textContent = langTranslations[key];
                }
            }
        });

        currentLang = lang;
        
        // Reset conversation history with the new system prompt
        const systemPrompt = {
            role: "system",
            content: langTranslations.systemContent
        };
        conversationHistory = [systemPrompt];

        // Reinitialize speech recognition with new language
        if (recognition) {
            recognition.lang = currentLang === 'en' ? 'en-US' : (currentLang === 'hi' ? 'hi-IN' : 'mr-IN');
        }
    }

    // Initialize the app
    function initializeApp() {
        changeLanguage(languageSelector.value);
        initializeSpeechRecognition();
        
        // Add welcome message to conversation history
        conversationHistory.push({
            role: "assistant", 
            content: translations[currentLang].initialMessage
        });
    }

    // Event Listeners
    languageSelector.addEventListener("change", (e) => changeLanguage(e.target.value));

    voiceBtn.addEventListener("click", () => {
        if (recognition) {
            recognition.start();
        } else {
            alert(translations[currentLang].voiceNotSupported);
        }
    });

    clearChatBtn.addEventListener("click", () => {
        if (confirm(translations[currentLang].clearConfirm)) {
            chatWindow.innerHTML = '';
            conversationHistory = [{
                role: "system",
                content: translations[currentLang].systemContent
            }];
            addMessageToChat(translations[currentLang].initialMessage, "bot", true);
        }
    });

    quickButtons.forEach(button => {
        button.addEventListener("click", () => {
            const question = button.getAttribute('data-question');
            userInput.value = question;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Display user's message
        addMessageToChat(userMessage, "user");
        conversationHistory.push({ role: "user", content: userMessage });
        userInput.value = "";
        setFormDisabled(true);

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: conversationHistory,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const botMessage = data.choices[0].message.content;

            // Add bot's response to conversation history
            conversationHistory.push({ role: "assistant", content: botMessage });
            
            // Display bot's message with formatting
            addMessageToChat(botMessage, "bot");

        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorMsg = translations[currentLang].apiErrorText;
            addMessageToChat(errorMsg, "bot");
        } finally {
            // Clean up
            typingIndicator.remove();
            setFormDisabled(false);
        }
    });

    function setFormDisabled(isDisabled) {
        userInput.disabled = isDisabled;
        sendButton.disabled = isDisabled;
        if (!isDisabled) userInput.focus();
    }

    function addMessageToChat(message, sender, isWelcome = false) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", `${sender}-message`);
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let messageContent = message;
        
        // Format tables and lists
        if (sender === 'bot') {
            messageContent = formatMessage(message);
        }
        
        messageElement.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="avatar">
                    <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
                </div>
                <div class="message-content flex-grow-1">
                    <div class="message-text">${messageContent}</div>
                    <div class="message-time">
                        <i class="fas fa-clock me-1"></i>${timestamp}
                    </div>
                </div>
            </div>
        `;
        
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function formatMessage(message) {
        // Convert markdown tables to HTML tables
        let formattedMessage = message.replace(/\|(.+)\|/g, (match) => {
            const rows = match.trim().split('\n').filter(row => row.includes('|'));
            if (rows.length < 2) return match;
            
            let tableHTML = '<table class="vaccine-table"><thead><tr>';
            
            // Header row
            const headers = rows[0].split('|').filter(cell => cell.trim()).map(cell => cell.trim());
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';
            
            // Data rows
            for (let i = 2; i < rows.length; i++) {
                const cells = rows[i].split('|').filter(cell => cell.trim()).map(cell => cell.trim());
                if (cells.length === headers.length) {
                    tableHTML += '<tr>';
                    cells.forEach(cell => {
                        tableHTML += `<td>${cell}</td>`;
                    });
                    tableHTML += '</tr>';
                }
            }
            
            tableHTML += '</tbody></table>';
            return tableHTML;
        });

        // Convert markdown lists to HTML lists
        formattedMessage = formattedMessage.replace(/(\d+\.\s+.+(\n\s+.+)*)/g, (match) => {
            const items = match.split('\n').filter(item => item.trim());
            let listHTML = '<ol class="feature-list">';
            items.forEach(item => {
                listHTML += `<li>${item.replace(/^\d+\.\s*/, '')}</li>`;
            });
            listHTML += '</ol>';
            return listHTML;
        });

        formattedMessage = formattedMessage.replace(/([-*]\s+.+(\n\s+.+)*)/g, (match) => {
            const items = match.split('\n').filter(item => item.trim());
            let listHTML = '<ul class="feature-list">';
            items.forEach(item => {
                listHTML += `<li><i class="fas fa-check"></i>${item.replace(/^[-*]\s*/, '')}</li>`;
            });
            listHTML += '</ul>';
            return listHTML;
        });

        // Convert **text** to <strong>text</strong>
        formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert *text* to <em>text</em>
        formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');

        return formattedMessage;
    }

    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.classList.add("message", "bot-message", "typing-indicator");
        indicator.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="avatar me-3">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    ${translations[currentLang].typingIndicatorText}
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        chatWindow.appendChild(indicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return indicator;
    }

    // Initialize the application
    initializeApp();

});
