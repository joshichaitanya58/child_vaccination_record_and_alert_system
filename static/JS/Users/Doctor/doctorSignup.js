document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("doctor-signup-form");
    const messageContainer = document.getElementById("message-container-js");

    const passwordInput = document.getElementById("password");
    const strengthContainer = document.getElementById("password-strength-container");
    const strengthBar = document.getElementById("password-strength-bar");
    const strengthText = document.getElementById("password-strength-text");

    const stateDropdown = document.getElementById('state');
    const cityDropdown = document.getElementById('city');
    const hospitalInput = document.getElementById('hospital'); // Get reference to the hospital input field
    const hospitalDatalist = document.getElementById('hospital-list');

    // 🔹 Populate States and Cities
    try {
        const response = await fetch('/api/states_cities');
        const data = await response.json();
        const states = data.states;
        
        // Store original values if they exist (e.g., from a failed form submission)
        const originalStateValue = stateDropdown.value;
        const originalCityValue = cityDropdown.value;

        // Populate states
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.name;
            option.textContent = state.name;
            stateDropdown.appendChild(option);
        });

        // Function to populate cities based on selected state
        const populateCities = (selectedState) => {
            cityDropdown.innerHTML = '<option value="">Select City</option>'; // Reset cities
            cityDropdown.disabled = true;
            hospitalDatalist.innerHTML = ''; // Clear hospitals when city changes
            cityDropdown.classList.add('bg-gray-100', 'cursor-not-allowed');

            const stateData = states.find(s => s.name === selectedState);
            if (stateData) {
                stateData.cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    cityDropdown.appendChild(option);
                });
                cityDropdown.disabled = false;
                cityDropdown.classList.remove('bg-gray-100', 'cursor-not-allowed');
            }
        };

        // Event listener for state change
        stateDropdown.addEventListener('change', () => {
            populateCities(stateDropdown.value);
            // Also clear hospital input and datalist when state changes
            hospitalInput.value = '';
            hospitalDatalist.innerHTML = '';
            cityDropdown.value = ''; // Reset city dropdown
        });

        // 🔹 Populate Hospitals based on City
        const populateHospitals = async (selectedCity) => {
            hospitalDatalist.innerHTML = ''; // Clear previous suggestions
            if (!selectedCity) return;

            try {
                const response = await fetch(`/api/hospitals_in_city?city=${encodeURIComponent(selectedCity)}`);
                const data = await response.json();
                if (data.success) {
                    data.hospitals.forEach(hospital => {
                        const option = document.createElement('option');
                        option.value = hospital;
                        hospitalDatalist.appendChild(option);
                    });
                }
            } catch (error) {
                console.error("Failed to load hospitals for the city:", error);
            }
        };

        cityDropdown.addEventListener('change', () => {
            populateHospitals(cityDropdown.value);
        });

        // --- Handle pre-filled values on page load ---
        if (originalStateValue) {
            stateDropdown.value = originalStateValue; // Re-select the original state
            populateCities(originalStateValue); // Populate cities for the original state
            // Wait for cities to be populated before trying to select original city and load hospitals
            setTimeout(() => {
                if (originalCityValue) {
                    cityDropdown.value = originalCityValue; // Re-select the original city
                    populateHospitals(originalCityValue); // Populate hospitals for the original city
                }
            }, 100); // Small delay to ensure cities are rendered
        }

    } catch (error) {
        console.error("Failed to load states and cities:", error);
        stateDropdown.innerHTML = '<option value="">Error loading states</option>';
        cityDropdown.innerHTML = '<option value="">Error loading cities</option>';
    }

    const checkPasswordStrength = (password) => {
        let score = 0;
        if (!password) return 0;
        // Award points for different criteria
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++; // Symbols
        return score;
    };

    const updateStrengthIndicator = (score) => {
        const percentages = [0, 20, 40, 60, 80, 100];
        const colors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
        const texts = ['', 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];

        strengthBar.style.width = `${percentages[score]}%`;
        strengthBar.className = `h-2 rounded-full transition-all duration-300 ${colors[score]}`;
        strengthText.textContent = texts[score];
    };

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (password.length > 0) {
            strengthContainer.classList.remove('hidden');
            const score = checkPasswordStrength(password);
            updateStrengthIndicator(score);
        } else {
            strengthContainer.classList.add('hidden');
        }
    });


    form.addEventListener("submit", (e) => {
        e.preventDefault();
        messageContainer.innerHTML = ''; // Clear previous messages

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const agreeTerms = document.getElementById("agree-terms").checked;

        // Basic client-side validation
        if (password !== confirmPassword) {
            messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700 flash-message">Passwords do not match!</div>`;
            return;
        }

        if (!agreeTerms) {
            messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700 flash-message">You must agree to the Terms and Conditions.</div>`;
            return;
        }

        const formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display success message and redirect
                messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-green-100 text-green-700 flash-message">${data.message}</div>`;
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 1500); // Wait 1.5 seconds before redirecting
            } else {
                // Display error message from server
                messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700 flash-message">${data.message || 'An unknown error occurred.'}</div>`;
            }
        })
        .catch(err => {
            console.error('Signup error:', err);
            messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700 flash-message">An unexpected network error occurred. Please try again.</div>`;
        });
    });
});