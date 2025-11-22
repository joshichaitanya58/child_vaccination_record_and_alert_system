document.addEventListener('DOMContentLoaded', function () {
    const resendLink = document.getElementById('resend-otp-link');
    const resendContainer = document.getElementById('resend-otp-container');
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-5 right-5 z-[100] space-y-2';
    document.body.appendChild(toastContainer);

    if (resendLink) {
        resendLink.addEventListener('click', function (e) {
            e.preventDefault();

            // Prevent multiple clicks while processing
            if (resendLink.classList.contains('disabled')) {
                return;
            }

            const userType = resendContainer.dataset.userType;
            const action = resendContainer.dataset.action;

            fetch('/resend_otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_type: userType, action: action }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    startCooldown();
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('An unexpected error occurred.', 'error');
            });
        });
    }

    function startCooldown() {
        resendLink.classList.add('disabled', 'text-gray-400', 'cursor-not-allowed');
        resendLink.classList.remove('text-green-600', 'hover:text-green-500');
        let seconds = 60;
        resendLink.innerHTML = `Resend in ${seconds}s`;

        const interval = setInterval(() => {
            seconds--;
            resendLink.innerHTML = `Resend in ${seconds}s`;
            if (seconds <= 0) {
                clearInterval(interval);
                resendLink.innerHTML = 'Resend OTP';
                resendLink.classList.remove('disabled', 'text-gray-400', 'cursor-not-allowed');
                resendLink.classList.add('text-green-600', 'hover:text-green-500');
            }
        }, 1000);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `p-3 rounded-md text-sm shadow-lg ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
});