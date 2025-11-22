document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('parent-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleParentLogin);
    }
});

async function handleParentLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    showLoading(); // Show spinner before fetch

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Redirect to the OTP verification page
            window.location.href = result.redirect_url;
        } else {
            // Show error message
            const messageContainer = document.getElementById('message-container-js');
            messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700">${result.message || 'An unknown error occurred.'}</div>`;
            hideLoading(); // Hide spinner on error
        }
    } catch (error) {
        console.error('Login error:', error);
        const messageContainer = document.getElementById('message-container-js');
        messageContainer.innerHTML = `<div class="p-3 rounded-md text-sm bg-red-100 text-red-700">A network error occurred. Please try again.</div>`;
        hideLoading(); // Hide spinner on error
    }
    // The spinner will remain visible on success because the page will redirect.
}

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}