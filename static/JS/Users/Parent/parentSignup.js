document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("parent-signup-form");
    const addChildBtn = document.getElementById("add-child-btn");
    const childrenContainer = document.getElementById("children-container");
    let childCount = 0;

    const passwordInput = document.getElementById("password");
    const strengthContainer = document.getElementById("password-strength-container");
    const strengthBar = document.getElementById("password-strength-bar");
    const strengthText = document.getElementById("password-strength-text");

    const stateDropdown = document.getElementById('state');
    const cityDropdown = document.getElementById('city');

    // 🔹 Populate States and Cities
    try {
        const response = await fetch('/api/states_cities');
        const data = await response.json();
        const states = data.states;

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
        });

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


    // 🔹 Add new child details form
    addChildBtn.addEventListener("click", () => {
        childCount++;
        const childDiv = document.createElement("div");
        childDiv.classList.add("border", "border-gray-300", "p-4", "rounded-md", "bg-white", "relative");

        childDiv.innerHTML = `
            <button type="button" class="remove-child absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">✕</button>
            <h4 class="text-md font-semibold text-gray-700 mb-2">Child ${childCount}</h4>
            <div class="mb-2">
                <label class="block text-sm text-gray-600">Child Name</label>
                <input type="text" name="child_name_${childCount}" required 
                    class="w-full border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="mb-2">
                <label class="block text-sm text-gray-600">Date of Birth</label>
                <input type="date" name="child_dob_${childCount}" required
                    class="w-full border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="mb-2">
                <label class="block text-sm text-gray-600">Gender</label>
                <select name="child_gender_${childCount}" required
                    class="w-full border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="block text-sm text-gray-600">Relation to Child</label>
                <select name="child_relation_${childCount}" required
                    class="w-full border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                </select>
            </div>
        `;

        // Append child block
        childrenContainer.appendChild(childDiv);

        // Add remove button functionality
        childDiv.querySelector(".remove-child").addEventListener("click", () => {
            childDiv.remove();
        });
    });

    // 🔹 Form validation and submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const email = document.getElementById("email-address").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const country = document.getElementById("country") ? document.getElementById("country").value.trim() : "India";
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const agreeTerms = document.getElementById("agree-terms").checked;

        // Validate required fields
        if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
            alert("Please fill all required fields.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Validate terms
        if (!agreeTerms) {
            alert("You must agree to the Terms and Conditions.");
            return;
        }

        // Gather child data
        const children = [];
        const childBlocks = childrenContainer.querySelectorAll("div.border");
        childBlocks.forEach((childDiv, index) => {
            const name = childDiv.querySelector(`input[name^="child_name_"]`).value.trim();
            const dob = childDiv.querySelector(`input[name^="child_dob_"]`).value;
            const gender = childDiv.querySelector(`select[name^="child_gender_"]`).value;
            const relation = childDiv.querySelector(`select[name^="child_relation_"]`).value;
            children.push({ name, dob, gender, relation });
        });

        // Prepare data object to send
        const formData = {
            full_name: fullName,
            email,
            phone,
            address,
            city,
            state,
            country,
            password,
            children
        };

        console.log("Form Data Ready to Send:", formData);

        // Send to Flask backend (POST)
        fetch("/parent/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    // If response is not OK, parse JSON for error message
                    return response.json().then(err => { throw new Error(err.message || 'Server error') });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect_url; // Redirect to OTP verification page
                } else {
                    // This was missing. Show the error message from the server.
                    throw new Error(data.message || 'An unknown error occurred.');
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error: " + err.message);
            });
    });
});
