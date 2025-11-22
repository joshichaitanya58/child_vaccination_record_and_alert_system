// Parent Dashboard JavaScript - Complete Version
document.addEventListener('DOMContentLoaded', function () {
    console.log('Parent Dashboard loaded.'); // Log 1

    // Fetch notifications on load
    fetchNotifications();
    // Initialize dashboard
    initDashboard();
    loadDashboardData();
});

// Global variables
let allDoctorsCache = [];
let statesAndCitiesCache = null; // Cache for the JSON data
let growthChartInstances = {};

// Contact Admin Functions
async function showContactAdminModal() {
    showModal('contact-admin-modal');
    const contactForm = document.getElementById('contact-admin-form');
    if (contactForm) {
        contactForm.reset();
    }
    const historyContainer = document.getElementById('contact-history-container');
    if (historyContainer) historyContainer.innerHTML = `<p class="text-center text-gray-500">Loading history...</p>`;

    try {
        const response = await fetch('/api/parent/profile');
        const data = await response.json();
        if (data.success) {
            const nameInput = document.getElementById('contact-admin-name');
            if (nameInput) {
                nameInput.value = data.profile.name;
            }
            const emailInput = document.getElementById('contact-admin-email');
            if (emailInput) {
                emailInput.value = data.profile.email;
            }
        } else {
            throw new Error(data.error || 'Failed to load profile for contact form.');
        }
    } catch (error) {
        console.error('Error pre-filling contact admin form:', error);
        showToast('Could not pre-fill contact form. Please try again.', 'error');
    }

    // Fetch and display contact history
    try {
        const response = await fetch('/api/parent/contact_history');
        const data = await response.json();
        if (data.success) {
            const historyContainer = document.getElementById('contact-history-container');
            if (historyContainer) {
                if (data.history.length === 0) {
                    historyContainer.innerHTML = `<p class="text-center text-gray-500">No previous contacts found.</p>`;
                } else {
                    historyContainer.innerHTML = data.history.map(contact => `
                        <div class="bg-gray-50 p-3 rounded-lg mb-2">
                            <p class="font-medium">${formatDate(contact.created_at)}</p>
                            <p class="text-sm text-gray-600">${escapeHtml(contact.message)}</p>
                            ${contact.reply ? `<p class="text-sm text-green-600 mt-1"><strong>Reply:</strong> ${escapeHtml(contact.reply)}</p>` : ''}
                        </div>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error loading contact history:', error);
        const historyContainer = document.getElementById('contact-history-container');
        if (historyContainer) historyContainer.innerHTML = `<p class="text-center text-red-500">Failed to load contact history.</p>`;
    }
}

async function handleContactAdmin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    try {
        showLoading();
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: 'Server error with no JSON response' }));
            throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showToast(result.message || 'Message sent successfully!', 'success');
        hideModal('contact-admin-modal');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Dashboard Functions
function initDashboard() {
    console.log('Initializing dashboard...');
    console.log('Parent Name:', document.body.getAttribute('data-parent-name')); // Debug parent name

    // Set user name in UI
    const parentName = document.body.getAttribute('data-parent-name') || 'Parent';
    document.getElementById('user-name').textContent = parentName;
    document.getElementById('sidebar-user-name').textContent = parentName;
    document.getElementById('welcome-message').textContent = `Welcome back, ${parentName}!`;

    // Event Listeners
    document.getElementById('user-menu-button')?.addEventListener('click', toggleUserMenu);
    document.getElementById('mobile-menu-button')?.addEventListener('click', toggleMobileMenu);
    document.getElementById('logout-button')?.addEventListener('click', handleLogout);
    document.getElementById('mobile-logout-button')?.addEventListener('click', handleLogout);

    // Notification Listeners
    document.getElementById('notification-button')?.addEventListener('click', toggleNotificationDropdown);

    // Child Management
    document.getElementById('add-child-button')?.addEventListener('click', showAddChildModal);
    document.getElementById('view-all-children-button')?.addEventListener('click', loadChildrenView);

    // Attach navigation handlers
    document.getElementById('user-menu')?.addEventListener('click', handleMenuNavigation);
    document.getElementById('close-add-child-modal')?.addEventListener('click', hideAddChildModal);
    document.getElementById('cancel-add-child')?.addEventListener('click', hideAddChildModal);
    document.getElementById('add-child-form')?.addEventListener('submit', handleAddChild);

    // Growth Record Modal
    document.getElementById('close-growth-modal')?.addEventListener('click', () => hideModal('add-growth-record-modal'));
    document.getElementById('cancel-growth-record')?.addEventListener('click', () => hideModal('add-growth-record-modal'));
    document.getElementById('add-growth-record-form')?.addEventListener('submit', handleAddGrowthRecord);

    // Edit Growth Record Modal
    document.getElementById('edit-growth-record-form')?.addEventListener('submit', handleEditGrowthRecord);

    // Appointment Management
    document.getElementById('book-appointment-button')?.addEventListener('click', showBookAppointmentModal);
    document.getElementById('close-appointment-modal')?.addEventListener('click', hideBookAppointmentModal);
    document.getElementById('cancel-appointment')?.addEventListener('click', hideBookAppointmentModal);
    document.getElementById('book-appointment-form')?.addEventListener('submit', handleBookAppointment);

    // Edit Child Management
    document.getElementById('close-edit-child-modal')?.addEventListener('click', hideEditChildModal);
    document.getElementById('cancel-edit-child')?.addEventListener('click', hideEditChildModal);
    document.getElementById('edit-child-form')?.addEventListener('submit', handleEditChild);

    // Reschedule Appointment Management
    document.getElementById('close-reschedule-appointment-modal')?.addEventListener('click', hideRescheduleAppointmentModal);
    document.getElementById('cancel-reschedule-appointment')?.addEventListener('click', hideRescheduleAppointmentModal);
    document.getElementById('reschedule-appointment-form')?.addEventListener('submit', handleRescheduleAppointment);

    // Delete Account Management
    document.getElementById('close-delete-account-modal')?.addEventListener('click', () => hideModal('delete-account-modal'));
    document.getElementById('cancel-delete-account')?.addEventListener('click', () => hideModal('delete-account-modal'));
    document.getElementById('delete-account-form')?.addEventListener('submit', handleDeleteAccount);

    // View Child Details Management
    document.getElementById('close-view-child-modal')?.addEventListener('click', hideViewChildModal);
    document.getElementById('ok-view-child')?.addEventListener('click', hideViewChildModal);

    // Reply to Doctor Modal
    document.getElementById('close-reply-modal')?.addEventListener('click', () => hideModal('reply-to-doctor-modal'));
    document.getElementById('cancel-reply-modal')?.addEventListener('click', () => hideModal('reply-to-doctor-modal'));
    document.getElementById('reply-to-doctor-form')?.addEventListener('submit', handleSendReply);

    // View Doctor Profile Management
    document.getElementById('close-doctor-modal')?.addEventListener('click', () => hideModal('view-doctor-modal'));
    document.getElementById('ok-doctor-modal')?.addEventListener('click', () => hideModal('view-doctor-modal'));

    // Contact Admin Modal
    document.getElementById('close-contact-admin-modal')?.addEventListener('click', () => hideModal('contact-admin-modal'));
    document.getElementById('contact-admin-form')?.addEventListener('submit', handleContactAdmin);

    // Review Modal
    document.getElementById('review-form')?.addEventListener('submit', handleReviewSubmit);

    // Close modals when clicking outside
    document.addEventListener('click', function (event) {
        const modals = ['add-child-modal', 'book-appointment-modal', 'edit-child-modal', 'view-child-modal', 'reschedule-appointment-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) {
                hideModal(modalId);
            }
        });
    });

    // Sidebar Navigation
    document.querySelector('.sidebar nav')?.addEventListener('click', handleMenuNavigation);
    document.querySelector('#mobile-menu')?.addEventListener('click', handleMenuNavigation);

    // Back to Top Button Logic
    const mainContentArea = document.querySelector('main');
    const backToTopButton = document.getElementById('back-to-top');

    if (mainContentArea && backToTopButton) {
        mainContentArea.addEventListener('scroll', () => {
            if (mainContentArea.scrollTop > 200) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        });

        backToTopButton.addEventListener('click', () => {
            mainContentArea.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    console.log('Navigation event listeners attached.'); // Log 3
}

function handleMenuNavigation(e) {
    console.log('handleMenuNavigation triggered by:', e.target); // Log 4
    const link = e.target.closest('a'); // Find the closest <a> tag to the clicked element
    if (!link) return;

    const href = link.getAttribute('href');
    // If it's an external link (opens in new tab) or an absolute path, don't handle it here.
    if (link.target === '_blank' || href.startsWith('/') || href.startsWith('http')) {
        return;
    }

    e.preventDefault();
    const targetId = href.substring(1);

    // Update active link style
    document.querySelectorAll('.sidebar nav a, #mobile-menu a').forEach(a => a.classList.remove('bg-blue-700'));
    // Find corresponding sidebar link to highlight
    const sidebarLink = document.querySelector(`.sidebar nav a[href="#${targetId}"]`);
    if (sidebarLink) sidebarLink.classList.add('bg-blue-700');

    if (targetId === 'dashboard') {
        restoreDashboardHTML();
        loadDashboardData();
    } else if (targetId === 'profile' || targetId === 'settings') {
        restoreDashboardHTML();
        loadSettingsView();
    } else if (targetId === 'contact-admin') {
        // No need to restore dashboard, just show the modal over the current view
        showContactAdminModal();
    } else {
        // For other views that load dynamically
        let viewFunction;

        // Special handling for map-view and inbox as their function names are direct
        if (targetId === 'map-view') {
            restoreDashboardHTML();
            viewFunction = window['loadMapView'];
            console.log('Navigating to Map View. Calling loadMapView().'); // Log 10
        } else if (targetId === 'inbox') {
            viewFunction = window['loadInboxView'];
            console.log('Navigating to Inbox. Calling loadInboxView().'); // Log 11
        } else {
            // Construct function name for other views (e.g., 'children' -> 'loadChildrenView')
            const camelCaseTarget = targetId.replace(/-([a-z])/g, g => g[1].toUpperCase());
            const functionName = `load${camelCaseTarget.charAt(0).toUpperCase() + camelCaseTarget.slice(1)}View`;
            viewFunction = window[functionName];
            console.log('Constructed function name:', functionName, 'Function found:', typeof viewFunction === 'function'); // Log 12
        }

        if (typeof viewFunction === 'function') {
            viewFunction();
        } else {
            console.warn('No specific view function found for', targetId, '. Falling back to hash navigation.'); // Log 13
            // Fallback for sections on the main page
            window.location.hash = targetId;
        }
    }
}

function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.classList.toggle('hidden');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.toggle('hidden');
}

async function handleLogout(event) {
    event.preventDefault();

    try {
        showLoading();
        const response = await fetch('/logout');
        if (response.ok) {
            window.location.href = '/';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    console.log('Loading dashboard data...');

    try {
        const response = await fetch('/api/parent/dashboard');
        console.log('Dashboard response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dashboard API error:', response.status, errorText);
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dashboard data received:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        if (data.success === false) {
            throw new Error(data.message || 'Failed to load dashboard data');
        }

        updateDashboardUI(data);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast(error.message || 'Failed to load dashboard data. Please refresh the page.', 'error');
    }
}

function updateDashboardUI(data) {
    console.log('Updating dashboard UI with data:', data);

    // Update statistics
    updateStatistics(data);

    // Update children section
    updateChildrenSection(data.children || []);

    // Update upcoming vaccinations
    updateUpcomingVaccinations(data.upcoming_vaccinations || []);

    // Update vaccination history
    updateVaccinationHistory(data.recent_activity || []);

    // Update appointments
    updateAppointments(data.appointments?.upcoming || []);

    // Update Vaccine Schedule
    updateVaccineSchedule(data.vaccine_schedule || []);

    // Update Missed Appointments
    updateMissedAppointments(data.appointments?.missed || []);
}

function updateStatistics(data) {
    const totalChildren = data.children ? data.children.length : 0;
    const upcomingVaccines = data.upcoming_vaccinations ? data.upcoming_vaccinations.length : 0;
    const totalAppointments = data.appointments ? data.appointments.upcoming.length : 0;
    const completedVaccines = data.stats ? data.stats.completed_vaccinations : 0;

    // More robust way to update stats
    const updateTotalChildren = document.getElementById('total-children-stat');
    const updateUpcomingVaccines = document.getElementById('upcoming-vaccines-stat');
    const updateTotalAppointments = document.getElementById('total-appointments-stat');
    const updateCompletedVaccines = document.getElementById('completed-vaccines-stat');

    if (updateTotalChildren) updateTotalChildren.textContent = totalChildren;
    if (updateUpcomingVaccines) updateUpcomingVaccines.textContent = upcomingVaccines;
    if (updateTotalAppointments) updateTotalAppointments.textContent = totalAppointments;
    if (updateCompletedVaccines) updateCompletedVaccines.textContent = completedVaccines;
}

function updateChildrenSection(children) {
    const childrenList = document.getElementById('children-list');
    if (!childrenList) return;

    if (children.length === 0) {
        childrenList.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <i class="fas fa-child text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No children added yet.</p>
                <button onclick="showAddChildModal()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Your First Child
                </button>
            </div>
        `;
        return;
    }

    const cardColors = ['border-blue-400', 'border-purple-400', 'border-green-400', 'border-yellow-400'];

    childrenList.innerHTML = children.map((child, index) => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 ${cardColors[index % cardColors.length]}">
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <i class="fas fa-user-astronaut text-3xl text-gray-500"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-xl text-gray-800">${escapeHtml(child.name)}</h3>
                        <div class="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                            <span><i class="fas fa-birthday-cake mr-1 text-gray-400"></i> ${calculateAge(child.birth_date)}</span>
                            <span><i class="fas fa-venus-mars mr-1 text-gray-400"></i> ${child.gender || 'N/A'}</span>
                            ${child.blood_group ? `<span><i class="fas fa-tint mr-1 text-red-400"></i> ${child.blood_group}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="space-y-3 text-sm">
                    ${child.allergies ? `<div class="bg-red-50 text-red-700 p-3 rounded-lg"><i class="fas fa-exclamation-triangle mr-2"></i><strong>Allergies:</strong> ${escapeHtml(child.allergies)}</div>` : ''}
                    ${child.medical_notes ? `<div class="bg-gray-50 text-gray-700 p-3 rounded-lg"><i class="fas fa-notes-medical mr-2"></i><strong>Notes:</strong> ${escapeHtml(child.medical_notes)}</div>` : ''}
                </div>
            </div>
            <!-- Growth Chart Section -->
            <div class="p-6 border-t bg-gray-50 rounded-b-xl">
    <h4 class="font-semibold text-gray-800 mb-4 text-lg">Growth Chart</h4>

    <!-- Chart -->
    <div class="h-64 mb-6 bg-white rounded-xl p-3 shadow-sm border">
        <canvas id="growth-chart-${child.id}"></canvas>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-3 items-center text-sm" data-child-id="${child.id}" data-child-name="${escapeHtml(child.name)}">
        <a href="#" data-action="view-details" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-eye text-gray-500"></i> View Details</a>
        <a href="#" data-action="edit-child" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-edit text-gray-500"></i> Edit Information</a>
        <a href="#" data-action="add-growth" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-chart-line text-gray-500"></i> Add Growth Record</a>
        <a href="#" data-action="manage-growth" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-tasks text-gray-500"></i> Manage Growth</a>
        <div class="w-full my-2 h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>
        <a href="#" data-action="delete-child" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-sm transition"><i class="fas fa-trash-alt text-red-500"></i> Delete Child</a>
    </div>
</div>


            
                
                    
                    
                
            </div>
        </div>
    `).join('');

    // After rendering the cards, initialize the charts for each child
    children.forEach(child => {
        renderGrowthChart(child);
    });

    // Add event listeners for the newly created buttons
    attachChildCardActionListeners(childrenList);
}

function toggleChildMenu(childId) {
    const menu = document.getElementById(`child-menu-${childId}`);
    if (menu) {
        menu.classList.toggle('hidden');
    }
    // Close other menus
    document.querySelectorAll('[id^="child-menu-"]').forEach(otherMenu => {
        if (otherMenu.id !== `child-menu-${childId}`) {
            otherMenu.classList.add('hidden');
        }
    });

    // Scroll the card into view when its menu is opened
    // const card = document.querySelector(`[data-child-id="${childId}"]`);
    // if (card && !menu.classList.contains('hidden')) {
    //     card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // }
}

async function renderGrowthChart(child) {
    const canvasId = `growth-chart-${child.id}`;
    const canvasElement = document.getElementById(canvasId);

    if (!canvasElement) {
        console.warn(`Canvas with id ${canvasId} not found.`);
        return;
    }

    const ctx = canvasElement.getContext('2d');
    const growthData = child.growth_records || []; // This should now be populated correctly

    // Calculate age in months for each of the child's records
    const childDataWithAge = growthData.map(record => {
        const birthDate = new Date(child.birth_date);
        const recordDate = new Date(record.record_date);
        const ageInMonths = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + (recordDate.getMonth() - birthDate.getMonth());
        return { ...record, ageInMonths };
    });

    // Sort data by age
    childDataWithAge.sort((a, b) => a.ageInMonths - b.ageInMonths);

    // Prepare data for the chart
    const labels = childDataWithAge.map(d => `${d.ageInMonths}m`);
    const childWeightData = childDataWithAge.map(d => d.weight_kg);
    const childHeightData = childDataWithAge.map(d => d.height_cm);

    // Destroy existing chart instance if it exists
    if (growthChartInstances && growthChartInstances[child.id]) {
        growthChartInstances[child.id].destroy();
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: childWeightData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    yAxisID: 'y-weight',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    tension: 0.4,
                    spanGaps: true // Connect lines over null data points
                },
                {
                    label: 'Height (cm)',
                    data: childHeightData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    yAxisID: 'y-height',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(239, 68, 68)',
                    tension: 0.4,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            return `Age: ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Age in Months'
                    }
                },
                'y-weight': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                'y-height': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Height (cm)'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }
            }
        }
    });

    // Store chart instance to manage it later
    if (!growthChartInstances) {
        growthChartInstances = {};
    }
    growthChartInstances[child.id] = chart;
}

function showAddGrowthRecordModal(childId, childName) {
    const childIdInput = document.getElementById('growth-record-child-id');
    const childNameSpan = document.getElementById('growth-modal-child-name');
    const recordDateInput = document.getElementById('record-date');

    if (childIdInput) childIdInput.value = childId;
    if (childNameSpan) childNameSpan.textContent = childName;

    // Set max date for record date input to today
    const today = new Date().toISOString().split('T')[0];
    if (recordDateInput) recordDateInput.max = today;

    showModal('add-growth-record-modal');
}

async function handleAddGrowthRecord(event) {
    event.preventDefault();
    const childId = document.getElementById('growth-record-child-id').value;
    const record_date = document.getElementById('record-date').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;

    try {
        showLoading();
        const response = await fetch(`/api/parent/child/${childId}/growth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record_date, weight, height })
        }).then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Server error'); });
            return res.json();
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('add-growth-record-modal');
            loadDashboardData(); // Refresh dashboard to show new data
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function showManageGrowthRecordsModal(childOrId) {
    let child;
    // If we only have an ID, we need to fetch the full child object with growth records.
    if (typeof childOrId === 'number') {
        try {
            showLoading();
            const response = await fetch(`/api/parent/child/${childOrId}`);
            const data = await response.json();
            if (!data.id) throw new Error('Child data not found.');
            child = data;
        } catch (error) {
            showToast('Could not load growth records.', 'error');
            return;
        } finally {
            hideLoading();
        }
    } else {
        child = childOrId;
    }
    // Pass the full child object to the "Add" button from this modal
    const addBtn = document.getElementById('add-growth-from-manage-btn');
    const childNameEl = document.getElementById('manage-growth-child-name');
    const container = document.getElementById('growth-records-list-container');

    if (childNameEl) childNameEl.textContent = child.name;

    if (!container) return; // Exit if the main container isn't found

    if (!child.growth_records || child.growth_records.length === 0) { 
        container.innerHTML = `<p class="text-center text-gray-500">No growth records found for ${escapeHtml(child.name)}.</p>`;
    } else {
        // Sort records by date, most recent first
        child.growth_records.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

        container.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Height (cm)</th>
                        <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${child.growth_records.map(record => `
                        <tr id="growth-record-row-${record.id}">
                            <td class="px-4 py-2 whitespace-nowrap text-sm">${formatDate(record.record_date)}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">${record.weight_kg}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm">${record.height_cm}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-right text-sm">
                                <button onclick='showEditGrowthRecordModal(${JSON.stringify(record)})' class="text-blue-600 hover:text-blue-800 mr-3" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteGrowthRecord(${record.id})" class="text-red-600 hover:text-red-800" title="Delete">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Ensure the "Add" button in this modal works correctly.
    // It should close the current modal and open the "Add Growth Record" modal.
    if (addBtn) {
        addBtn.onclick = () => { hideModal('manage-growth-records-modal'); showAddGrowthRecordModal(child.id, child.name); };
    }

    showModal('manage-growth-records-modal');
}

function showEditGrowthRecordModal(record) {
    hideModal('manage-growth-records-modal'); // Hide the manage modal first
    document.getElementById('edit-growth-record-id').value = record.id;
    document.getElementById('edit-record-date').value = record.record_date;
    document.getElementById('edit-weight').value = record.weight_kg;
    document.getElementById('edit-height').value = record.height_cm;
    showModal('edit-growth-record-modal');
}

async function handleEditGrowthRecord(event) {
    event.preventDefault();
    const recordId = document.getElementById('edit-growth-record-id').value;
    const record_date = document.getElementById('edit-record-date').value;
    const weight = document.getElementById('edit-weight').value;
    const height = document.getElementById('edit-height').value;

    try {
        showLoading();
        const response = await fetch(`/api/parent/growth_record/${recordId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ record_date, weight, height })
        }).then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Server error'); });
            return res.json();
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('edit-growth-record-modal');
            loadDashboardData(); // Refresh all data
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteGrowthRecord(recordId) {
    if (!confirm('Are you sure you want to delete this growth record?')) return;

    try {
        showLoading();
        const response = await fetch(`/api/parent/growth_record/${recordId}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Server error'); });
                return res.json();
            });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            document.getElementById(`growth-record-row-${recordId}`)?.remove(); // Remove from list
            loadDashboardData(); // Refresh chart and other data
            hideModal('manage-growth-records-modal');
        } else { throw new Error(result.error); }
    } catch (error) { showToast(error.message, 'error'); }
}

function updateUpcomingVaccinations(vaccinations) {
    const upcomingVaccines = document.getElementById('upcoming-vaccines');
    if (!upcomingVaccines) return;

    if (vaccinations.length === 0) {
        upcomingVaccines.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-syringe text-2xl mb-2"></i>
                <p>No upcoming vaccinations</p>
            </div>
        `;
        return;
    }

    upcomingVaccines.innerHTML = vaccinations.map(vaccine => `
        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex-grow">
                <h4 class="font-semibold text-gray-800">${escapeHtml(vaccine.vaccine_name)} for ${escapeHtml(vaccine.child_name)}</h4>
                <p class="text-sm text-gray-600">${formatDate(vaccine.preferred_date)} at ${vaccine.preferred_time}</p>
            </div>
            <div class="text-right ml-4 flex items-center space-x-2">
                ${vaccine.cost ? `<div class="text-md font-bold text-blue-600 mb-1">₹${parseFloat(vaccine.cost).toFixed(2)}</div>` : ''}
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    ${vaccine.status || 'Scheduled'}
                </span>
                ${vaccine.service_type === 'Home' ? `
                    <button onclick="showParentHomeVisitDetails(${vaccine.id})" 
                            class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 text-xs font-medium transition-colors" 
                            title="View Home Visit Details">
                        <i class="fas fa-info-circle"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');
    if (!appointmentsList) return;

    if (appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <i class="fas fa-calendar text-2xl mb-2"></i>
                <p>No appointments scheduled</p>
            </div>
        `;
        return;
    }

    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="fas fa-calendar-check text-blue-500 text-xl"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800 text-lg">${escapeHtml(appointment.vaccine_name)}</h4>
                        <p class="text-sm text-gray-600">
                            For: <strong>${escapeHtml(appointment.child_name)}</strong> on ${formatDate(appointment.preferred_date)} at ${appointment.preferred_time}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${appointment.status === 'Scheduled' ? `
                        <button onclick="showRescheduleModal(${appointment.id}, '${escapeHtml(appointment.child_name)}', '${escapeHtml(appointment.vaccine_name)}', '${appointment.preferred_date}', '${appointment.preferred_time}')" 
                                class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-xs font-medium transition-colors" title="Reschedule">
                            <i class="fas fa-calendar-alt mr-1"></i>Reschedule
                        </button>
                        <button onclick="cancelAppointment(${appointment.id})" class="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-xs font-medium transition-colors" title="Cancel">
                            <i class="fas fa-times mr-1"></i>Cancel
                        </button>` : ''}
                    ${appointment.status === 'Scheduled' && appointment.service_type === 'Home' ? `
                        <button onclick="showParentHomeVisitDetails(${appointment.id})" class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 text-xs font-medium transition-colors" title="View Home Visit Details">
                            <i class="fas fa-info-circle mr-1"></i>Info
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateMissedAppointments(appointments) {
    const section = document.getElementById('missed-appointments-section');
    if (!section) return;

    if (!appointments || appointments.length === 0) {
        section.classList.add('hidden');
        return;
    }

    const list = section.querySelector('#missed-appointments-list');
    if (!list) return;

    section.classList.remove('hidden');
    list.innerHTML = appointments.map(appointment => `
        <div class="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-200">
            <div>
                <h4 class="font-semibold text-gray-800">${escapeHtml(appointment.vaccine_name)}</h4>
                <p class="text-sm text-red-700">
                    For: ${escapeHtml(appointment.child_name)} • Missed on: ${formatDate(appointment.preferred_date)}
                </p>
            </div>
            <div class="flex space-x-2">
                <button onclick="showRescheduleModal(${appointment.id}, '${escapeHtml(appointment.child_name)}', '${escapeHtml(appointment.vaccine_name)}', '${appointment.preferred_date}', '${appointment.preferred_time}')" 
                        class="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm font-medium" title="Reschedule">
                    <i class="fas fa-calendar-alt mr-1"></i>Reschedule
                </button>
            </div>
        </div>
    `).join('');
}

function updateVaccinationHistory(history) {
    const historyBody = document.getElementById('vaccination-history-body');
    if (!historyBody) return;

    if (history.length === 0) {
        historyBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    <i class="fas fa-history text-2xl mb-2"></i>
                    <p>No vaccination history found</p>
                </td>
            </tr>
        `;
        return;
    }

    historyBody.innerHTML = history.map(record => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(record.vaccine_name)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(record.child_name)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(record.vaccination_date)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Completed' ? 'bg-green-100 text-green-800' :
            record.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
        }">${record.status || 'Unknown'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${record.doctor_id && record.doctor_name ? `
                    <button onclick="viewDoctorProfile(${record.doctor_id})" class="text-gray-600 hover:text-blue-700" title="View Doctor Profile">
                        <i class="fas fa-user-md mr-1"></i>${escapeHtml(record.doctor_name)}
                    </button>` : `<span class="text-gray-400">N/A</span>`}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${record.vaccine_price ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">₹${typeof record.vaccine_price === 'number' ? record.vaccine_price.toFixed(2) : Number(record.vaccine_price).toFixed(2)}</span>` : 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${record.status === 'Completed' && record.record_id ? `
                    <button onclick="downloadCertificate(${record.record_id}, '${escapeHtml(record.child_name)}')" class="text-blue-600 hover:text-blue-900" title="Download Certificate">
                        <i class="fas fa-file-pdf"></i> Download PDF
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function updateVaccineSchedule(schedule = []) {
    const scheduleList = document.getElementById('vaccine-schedule-list');
    if (!scheduleList) return;

    if (schedule.length === 0) {
        scheduleList.innerHTML = `
            <div class="text-center py-8 text-gray-500 bg-green-50 rounded-lg">
                <i class="fas fa-check-circle text-2xl text-green-500 mb-2"></i>
                <p>All children are up-to-date with their vaccinations!</p>
            </div>
        `;
        return;
    }

    scheduleList.innerHTML = schedule.map(item => `
        <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
            <div class="flex items-center space-x-4">
                <div class="bg-red-100 p-3 rounded-full">
                    <i class="fas fa-syringe text-red-500 text-xl"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800 text-lg">${escapeHtml(item.vaccine_name)}</h4>
                    <p class="text-sm text-gray-600">For: <strong>${escapeHtml(item.child_name)}</strong></p>
                </div>
            </div>
            <div class="text-right">
                ${item.price ? `<div class="text-lg font-bold text-blue-600 mb-2">₹${parseFloat(item.price).toFixed(2)}</div>` : ''}
                <button onclick="showBookAppointmentModal(${item.child_id}, ${item.vaccine_id})" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <i class="fas fa-calendar-plus mr-2"></i>Book Now
                </button>
            </div>
        </div>
    `).join('');
}

// Child Management Functions
function showAddChildModal() {
    // Ensure the modal exists in the DOM. If not, create it.
    if (!document.getElementById('add-child-modal')) {
        const modalHTML = `
            <div id="add-child-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
                <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                    <div class="modal-content">
                        <div class="flex justify-between items-center border-b pb-3">
                            <h3 class="text-xl font-semibold text-gray-900">Add a New Child</h3>
                            <button id="close-add-child-modal" class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
                                <i class="fas fa-times w-5 h-5"></i>
                            </button>
                        </div>
                        <form id="add-child-form" class="mt-4 space-y-4">
                            <div>
                                <label for="add-child-name" class="block text-sm font-medium text-gray-700">Child's Full Name</label>
                                <input type="text" name="name" id="add-child-name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="add-child-birth-date" class="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="birth_date" id="add-child-birth-date" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div>
                                    <label for="add-child-gender" class="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" id="add-child-gender" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label for="add-child-blood-group" class="block text-sm font-medium text-gray-700">Blood Group (Optional)</label>
                                <input type="text" name="blood_group" id="add-child-blood-group" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label for="add-child-allergies" class="block text-sm font-medium text-gray-700">Allergies (Optional)</label>
                                <textarea name="allergies" id="add-child-allergies" rows="2" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <div>
                                <label for="add-child-medical-notes" class="block text-sm font-medium text-gray-700">Medical Notes (Optional)</label>
                                <textarea name="medical_notes" id="add-child-medical-notes" rows="2" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <div class="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" id="cancel-add-child" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Child</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        // Re-attach event listeners for the newly created modal
        document.getElementById('close-add-child-modal')?.addEventListener('click', hideAddChildModal);
        document.getElementById('cancel-add-child')?.addEventListener('click', hideAddChildModal);
        document.getElementById('add-child-form')?.addEventListener('submit', handleAddChild);
    }
    // Set max date for birth date input to today
    const today = new Date().toISOString().split('T')[0];
    const birthDateInput = document.querySelector('#add-child-form input[name="birth_date"]');
    if (birthDateInput) {
        birthDateInput.max = today;
    }
    showModal('add-child-modal');
}

function hideAddChildModal() {
    hideModal('add-child-modal');
    document.getElementById('add-child-form')?.reset();
}

async function handleAddChild(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const childData = {
        name: formData.get('name'),
        birth_date: formData.get('birth_date'),
        gender: formData.get('gender'),
        birth_weight: formData.get('birth_weight'),
        blood_group: formData.get('blood_group'),
        allergies: formData.get('allergies'),
        medical_notes: formData.get('medical_notes')
    };

    try {
        showLoading();
        const response = await fetch('/api/parent/children', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
        });

        const result = await response.json();

        if (result.success) {
            showToast(result.message || 'Child added successfully!');
            hideAddChildModal();
            loadDashboardData();
        } else {
            throw new Error(result.message || 'Failed to add child');
        }
    } catch (error) {
        console.error('Add child error:', error);
        showToast(error.message || 'Failed to add child. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function showEditChildModal(childId) {
    // Set max date for birth date input to today
    const today = new Date().toISOString().split('T')[0];
    const editBirthDateInput = document.getElementById('edit-child-birth-date');
    if (editBirthDateInput) {
        editBirthDateInput.max = today;
    }
    fetch(`/api/parent/child/${childId}`)
        .then(response => response.json())
        .then(child => {
            document.getElementById('edit-child-id').value = child.id;
            document.getElementById('edit-child-name').value = child.name || '';
            document.getElementById('edit-child-birth-date').value = child.birth_date || '';
            document.getElementById('edit-child-birth-weight').value = child.birth_weight || '';
            document.getElementById('edit-child-gender').value = child.gender || '';
            document.getElementById('edit-child-blood-group').value = child.blood_group || '';
            document.getElementById('edit-child-allergies').value = child.allergies || '';
            document.getElementById('edit-child-medical-notes').value = child.medical_notes || '';

            showModal('edit-child-modal');
        })
        .catch(error => {
            console.error('Error fetching child details:', error);
            showToast('Failed to load child details.', 'error');
        });
}

function hideEditChildModal() {
    hideModal('edit-child-modal');
}

async function handleEditChild(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const childId = formData.get('child_id');
    const childData = {
        name: formData.get('name'),
        birth_date: formData.get('birth_date'),
        birth_weight: formData.get('birth_weight') || null,
        gender: formData.get('gender'),
        blood_group: formData.get('blood_group'),
        allergies: formData.get('allergies'),
        medical_notes: formData.get('medical_notes')
    };
    try {
        const response = await fetch(`/api/parent/child/${childId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Child details updated successfully!');
            hideEditChildModal();
            loadDashboardData();
        } else {
            throw new Error(result.message || 'Failed to update child details');
        }
    } catch (error) {
        console.error('Edit child error:', error);
        showToast(error.message || 'Failed to update child details. Please try again.', 'error');
    }
}

async function deleteChild(childId, childName) {
    const confirmationMessage = `Are you sure you want to delete ${childName}?\n\nThis action is irreversible and will permanently delete all associated vaccination records and appointments.`;
    if (!confirm(confirmationMessage)) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/parent/child/${childId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        if (result.success) {
            showToast(result.message || 'Child deleted successfully!');
            loadDashboardData(); // Refresh the dashboard to reflect the change
        } else {
            throw new Error(result.error || 'Failed to delete child.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Appointment Management Functions
async function showBookAppointmentModal(childId = null, vaccineId = null) {
    // Set min date for appointment date input to today
    const today = new Date().toISOString().split('T')[0];
    const appointmentDateInput = document.querySelector('#book-appointment-form input[name="preferred_date"]');
    if (appointmentDateInput) {
        appointmentDateInput.min = today;
    }

    // Inject filter HTML into the modal before showing it
    const doctorSection = document.getElementById('appointment-doctor-section');
    

    // Populate dropdowns
    await populateAppointmentChildrenDropdown(childId);
    await populateAppointmentVaccinesDropdown(vaccineId);
    showModal('book-appointment-modal');

    const childSelect = document.getElementById('appointment-child-select');
    if (childId) {
        childSelect.value = childId;
    } else {
        childSelect.value = ""; // Explicitly set to the placeholder when no childId is passed
    }
    if (vaccineId) document.getElementById('appointment-vaccine-select').value = vaccineId;

    // --- New State/City Filter Logic ---
    const stateFilter = document.getElementById('appointment-state-filter');
    const cityFilter = document.getElementById('appointment-city-filter');
    const doctorListContainer = document.getElementById('appointment-doctor-list-container');
    const selectedDoctorNameDiv = document.getElementById('selected-doctor-name');
    const doctorIdInput = document.getElementById('appointment-doctor-id');

    // Reset filters and doctor selection
    stateFilter.innerHTML = '<option value="">Select State</option>';
    cityFilter.innerHTML = '<option value="">Select City</option>';
    cityFilter.disabled = true;
    doctorListContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Please select a city to see available doctors.</p>';
    selectedDoctorNameDiv.classList.add('hidden');
    doctorIdInput.value = '';

    // --- New State/City Filter Logic using states-cities.json ---
    const populateStates = (states) => {
        states.forEach(state => {
            stateFilter.add(new Option(state.name, state.name));
        });
    };

    const populateCities = (selectedState) => {
        cityFilter.innerHTML = '<option value="">Select City</option>';
        cityFilter.disabled = true;
        doctorListContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Please select a city to see available doctors.</p>';
        
        if (selectedState && statesAndCitiesCache) {
            const stateData = statesAndCitiesCache.states.find(s => s.name === selectedState);
            if (stateData && stateData.cities) {
                stateData.cities.forEach(city => cityFilter.add(new Option(city, city)));
                cityFilter.disabled = false;
            }
        }
    };

    if (statesAndCitiesCache) {
        populateStates(statesAndCitiesCache.states);
    } else {
        fetch('/static/JS/states-cities.json')
            .then(res => res.json())
            .then(data => {
                statesAndCitiesCache = data; // Cache the data
                populateStates(statesAndCitiesCache.states);
            })
            .catch(err => console.error("Failed to load states-cities.json", err));
    }

    stateFilter.addEventListener('change', () => populateCities(stateFilter.value));

    // 3. City change -> Populate Doctors
    cityFilter.addEventListener('change', () => updateDoctorsList());

    const dateInputEl = document.querySelector('#book-appointment-form [name="preferred_date"]');
    if (dateInputEl) dateInputEl.addEventListener('change', updateTimeSlotAvailability);
    
    doctorListContainer.addEventListener('click', updateTimeSlotAvailability);

    // Show payment method section and initialize cost tracking
    document.getElementById('payment-method-section').classList.remove('hidden'); // Ensure payment section is always visible

    // Update payment section with cost details
    const updatePaymentDetails = () => {
        const vaccineSelect = document.getElementById('appointment-vaccine-select');
        const selectedOption = vaccineSelect.options[vaccineSelect.selectedIndex];
        const vaccinePrice = selectedOption.text.match(/₹(\d+(\.\d{1,2})?)/);
        const basePrice = vaccinePrice ? parseFloat(vaccinePrice[1]) : 0;

        const serviceType = document.querySelector('input[name="service_type"]:checked')?.value || 'Center';
        const homeVisitChargeConfig = parseFloat(document.body.getAttribute('data-home-visit-charge')) || 0;
        const homeVisitCharge = serviceType === 'Home' ? homeVisitChargeConfig : 0;
        const totalCost = basePrice + homeVisitCharge;

        const paymentLabel = document.getElementById('payment-method-label');
        const costBreakdown = `<div class="text-sm mb-2">
                <p>Vaccine Cost: ₹${basePrice.toFixed(2)}</p>
                ${serviceType === 'Home' ? `<p>Home Visit Charge: ₹${homeVisitCharge.toFixed(2)}</p>` : ''}
                <p class="font-bold mt-1">Total Cost: ₹${totalCost.toFixed(2)}</p>
            </div>`;

        paymentLabel.innerHTML = `Payment Method ${costBreakdown}`;
    };

    // Add cost update listeners
    document.querySelectorAll('#book-appointment-form input[name="service_type"]')
        .forEach(radio => radio.addEventListener('change', updatePaymentDetails));

    document.getElementById('appointment-vaccine-select')
        .addEventListener('change', updatePaymentDetails);

    // Initial cost calculation
    setTimeout(updatePaymentDetails, 100); // Small delay to ensure elements are loaded
}

function hideBookAppointmentModal() {
    hideModal('book-appointment-modal');
    document.getElementById('book-appointment-form')?.reset();
}

async function populateAppointmentChildrenDropdown(selectedChildId = null) {
    const dropdown = document.getElementById('appointment-child-select');
    if (!dropdown) return;

    try {
        const response = await fetch('/api/parent/children');
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to load children');
        const children = data.children;

        dropdown.innerHTML = '<option value="">Select Child</option>';
        children.forEach(child => {
            dropdown.innerHTML += `<option value="${child.id}" ${child.id === selectedChildId ? 'selected' : ''}>${child.name}</option>`;
        });
    } catch (error) {
        console.error('Error populating children dropdown:', error);
        dropdown.innerHTML = '<option value="">Failed to load children</option>';
    }
}

async function populateAppointmentVaccinesDropdown(selectedVaccineId = null) {
    const dropdown = document.getElementById('appointment-vaccine-select');

    try {
        const response = await fetch('/api/vaccines');
        const vaccines = await response.json();

        dropdown.innerHTML = '<option value="">Select Vaccine</option>';
        vaccines.forEach(vaccine => {
            const priceText = vaccine.price ? ` (₹${parseFloat(vaccine.price).toFixed(2)})` : '';
            dropdown.innerHTML += `<option value="${vaccine.id}" ${vaccine.id === selectedVaccineId ? 'selected' : ''}>
                ${escapeHtml(vaccine.name)}${priceText}
            </option>`;
        });
    } catch (error) {
        console.error('Error populating vaccines dropdown:', error);
        dropdown.innerHTML = '<option value="">Failed to load vaccines</option>';
    }
}

async function updateDoctorsList() { // Replaces the old updateDoctorsList
    const city = document.getElementById('appointment-city-filter').value;
    const doctorListContainer = document.getElementById('appointment-doctor-list-container');
    const selectedDoctorNameDiv = document.getElementById('selected-doctor-name');
    const doctorIdInput = document.getElementById('appointment-doctor-id');

    // Reset doctor selection
    doctorIdInput.value = '';
    selectedDoctorNameDiv.classList.add('hidden');
    
    // Ensure the doctor list is visible when filtering
    doctorListContainer.classList.remove('hidden');

    if (!city) {
        doctorListContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Please select a city to see available doctors.</p>';
        return;
    }

    doctorListContainer.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i></div>';

    try {
        // Fetch all doctors if cache is empty
        if (allDoctorsCache.length === 0) {
            const response = await fetch('/api/doctors');
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to load doctors');
            allDoctorsCache = data.doctors; // Cache the full list
        }

        // Filter doctors by the selected city
        const doctorsInCity = allDoctorsCache.filter(doc => doc.city === city);

        if (doctorsInCity.length === 0) {
            doctorListContainer.innerHTML = '<p class="text-center text-gray-500 mt-8 text-lg">No doctors found in the selected city.</p>';
        } else {
            // Generate HTML for the filtered doctors
            const doctorsHtml = doctorsInCity.map(doctor => `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 ease-in-out">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <img class="w-16 h-16 rounded-full mr-4 object-cover" src="/static/${doctor.profile_pic || 'images/default_avatar.png'}" alt="Dr. ${escapeHtml(doctor.name)}">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">${escapeHtml(doctor.name)}</h3>
                                <p class="text-md text-gray-600">${escapeHtml(doctor.specialization)}</p>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mb-2"><i class="fas fa-hospital mr-2 text-gray-400"></i>${escapeHtml(doctor.hospital)}</p>
                        <p class="text-sm text-gray-500 mb-4"><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>${escapeHtml(doctor.city)}</p>
                        <div class="flex items-center text-sm text-yellow-500 mb-4">
                            <i class="fas fa-star mr-1"></i>
                            <span>${doctor.avg_rating ? parseFloat(doctor.avg_rating).toFixed(1) : 'No reviews'} (${doctor.review_count || 0} reviews)</span>
                        </div>
                        <button class="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300 select-doctor-btn" data-doctor-id="${doctor.id}" data-doctor-name="${escapeHtml(doctor.name)}">
                            Select Doctor
                        </button>
                    </div>
                </div>
            `).join('');
            doctorListContainer.innerHTML = `<div class="grid grid-cols-1 gap-4">${doctorsHtml}</div>`;
        }

        // Re-attach event listeners after updating HTML
        attachDoctorSelectionListeners();

    } catch (error) {
        doctorListContainer.innerHTML = '<p class="text-center text-red-500 p-4">Could not load doctors. Please try again.</p>';
    }
    updateTimeSlotAvailability();
}

function attachDoctorSelectionListeners() {
    const doctorListContainer = document.getElementById('appointment-doctor-list-container');
    const selectedDoctorNameDiv = document.getElementById('selected-doctor-name');
    const doctorIdInput = document.getElementById('appointment-doctor-id');

    doctorListContainer.querySelectorAll('.select-doctor-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const doctorId = e.target.dataset.doctorId;
            const doctorName = e.target.dataset.doctorName;

            doctorIdInput.value = doctorId;
            selectedDoctorNameDiv.textContent = `Selected: Dr. ${doctorName}`;
            selectedDoctorNameDiv.classList.remove('hidden');
            doctorListContainer.classList.add('hidden'); // Hide the list after selection
            updateTimeSlotAvailability(); // Update time slots for the selected doctor
        });
    });
}

async function populateSpecializationFilter() {
    const specDropdown = document.getElementById('doctor-spec-filter');
    if (!specDropdown) return;

    try {
        const response = await fetch('/api/doctor_specializations');
        const data = await response.json();
        if (data.success) {
            data.specializations.forEach(spec => {
                specDropdown.innerHTML += `<option value="${spec}">${escapeHtml(spec)}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading specializations:', error);
    }
}

async function handleBookAppointment(event) {
    event.preventDefault();

    // Prevent booking a disabled/full timeslot on the client side
    const timeSelect = event.target.querySelector('[name="preferred_time"]');
    if (timeSelect) {
        const selectedOption = timeSelect.options[timeSelect.selectedIndex];
        if (selectedOption && selectedOption.disabled) {
            showToast('Selected time slot is full. Please choose another time.', 'error');
            return;
        }
    }

    const formData = new FormData(event.target);
    const appointmentData = {
        child_id: formData.get('child_id'),
        vaccine_id: formData.get('vaccine_id'),
        doctor_id: formData.get('doctor_id'), // This is now a required field
        preferred_date: formData.get('preferred_date'),
        preferred_time: formData.get('preferred_time'),
        service_type: formData.get('service_type'),
        // Always include payment_method so backend can decide whether to redirect to payment page
        payment_method: formData.get('payment_method'),
        notes: formData.get('notes')
    };

    if (!appointmentData.doctor_id) {
        showToast('Please select a doctor.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/parent/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        const result = await response.json();

        if (result.success) {
            if (result.redirect_to_payment && result.payment_url) {
                showToast('Redirecting to payment page...', 'info');
                window.location.href = result.payment_url;
                return; // Stop further execution
            }
            showToast('Appointment booked successfully!');
            hideBookAppointmentModal();
            loadDashboardData();
        } else {
            throw new Error(result.error || 'Failed to book appointment');
        }
    } catch (error) {
        console.error('Book appointment error:', error);
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Fetch slot availability from server for a given doctor and date
async function fetchSlotAvailability(doctorId, date) {
    if (!doctorId || !date) return null;
    try {
        const resp = await fetch(`/api/doctor/slot_availability?doctor_id=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
        const data = await resp.json();
        if (!data.success) {
            // Display the specific error from the backend
            showToast(data.error || 'Could not fetch slots.', 'error');
            return null;
        }
        return data.slots || {};
    } catch (e) {
        console.error('Error fetching slot availability:', e);
        return null;
    }
}

// Update the preferred_time select to reflect availability (mark full slots disabled)
async function updateTimeSlotAvailability() {
    const doctorIdInput = document.getElementById('appointment-doctor-id');
    const dateInput = document.querySelector('#book-appointment-form [name="preferred_date"]');
    const timeSelect = document.querySelector('#book-appointment-form [name="preferred_time"]');

    if (!timeSelect) return;
    
    const doctorId = doctorIdInput ? doctorIdInput.value : '';
    const date = dateInput ? dateInput.value : '';

    // Reset option labels to original text if we stored them
    for (let i = 0; i < timeSelect.options.length; i++) {
        const opt = timeSelect.options[i];
        if (!opt.value) continue; // skip placeholder
        if (!opt.dataset.origLabel) opt.dataset.origLabel = opt.text;
    }

    if (!doctorId || !date) {
        // If no doctor or no date selected, enable all and restore labels
        for (let i = 0; i < timeSelect.options.length; i++) {
            const opt = timeSelect.options[i];
            opt.disabled = false;
            if (opt.dataset.origLabel) opt.text = opt.dataset.origLabel;
        }
        // Continue to fetch availability even if no doctor/date is selected, to disable all slots
    }

    const slots = await fetchSlotAvailability(doctorId, date);
    for (let i = 0; i < timeSelect.options.length; i++) {
        const opt = timeSelect.options[i];
        if (!opt.value) continue;
        const slot = slots ? slots[opt.value] : null;
        if (slot === null || slot === undefined) { // If slot doesn't exist in response, it's unavailable
            opt.disabled = true;
            opt.text = `${opt.dataset.origLabel || opt.text} (Unavailable)`;
        } else if (slot.remaining === 0) {
            opt.disabled = true;
            opt.text = `${opt.dataset.origLabel || opt.text} (Full)`;
        } else {
            opt.disabled = false;
            opt.text = `${opt.dataset.origLabel || opt.text} (${slot.remaining} spot${slot.remaining !== 1 ? 's' : ''} left)`;
        }
    }
}

// Cancel Appointment Function
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/appointment/cancel/${appointmentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();

        if (result.success) {
            showToast(result.message || 'Appointment cancelled successfully!');
            loadDashboardData();
        } else {
            throw new Error(result.error || 'Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Cancel appointment error:', error);
        showToast(error.message || 'Failed to cancel appointment. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Reschedule Appointment Functions
function showRescheduleModal(appointmentId, childName, vaccineName, currentDate, currentTime) {
    document.getElementById('reschedule-appointment-id').value = appointmentId;
    document.getElementById('reschedule-child-name').value = childName;
    document.getElementById('reschedule-vaccine-name').value = vaccineName;
    document.getElementById('reschedule-preferred-date').value = currentDate;
    document.getElementById('reschedule-preferred-time').value = currentTime;
    showModal('reschedule-appointment-modal');
}

function hideRescheduleAppointmentModal() {
    hideModal('reschedule-appointment-modal');
    document.getElementById('reschedule-appointment-form')?.reset();
}

async function handleRescheduleAppointment(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const appointmentId = formData.get('appointment_id');
    const rescheduleData = {
        preferred_date: formData.get('preferred_date'),
        preferred_time: formData.get('preferred_time')
    };

    try {
        showLoading();
        const response = await fetch(`/api/appointment/reschedule/${appointmentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rescheduleData)
        });
        const result = await response.json();

        if (result.success) {
            showToast(result.message || 'Appointment rescheduled successfully!');
            hideRescheduleAppointmentModal();
            loadDashboardData();
        } else {
            throw new Error(result.error || 'Failed to reschedule appointment');
        }
    } catch (error) {
        console.error('Reschedule appointment error:', error);
        showToast(error.message || 'Failed to reschedule appointment. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function timeAgo(dateString) {
    if (!dateString) return '';
    // Normalize date string to avoid timezone parsing issues across browsers
    const normalized = String(dateString).replace(/-/g, '/');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const seconds = Math.round(diffMs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Refresh relative-time labels periodically so they show live times
function refreshRelativeTimes() {
    document.querySelectorAll('.rel-time').forEach(el => {
        const ts = el.getAttribute('data-timestamp');
        if (!ts) return;
        try {
            el.textContent = timeAgo(ts);
            const d = new Date(String(ts).replace(/-/g, '/'));
            if (!isNaN(d.getTime())) el.title = d.toLocaleString();
        } catch (e) { /* ignore parse errors */ }
    });
}

// Run periodically and once on load
setInterval(refreshRelativeTimes, 30000);
refreshRelativeTimes();

// View Child Details
async function viewChildDetails(childId) {
    try {
        showLoading();
        const response = await fetch(`/api/parent/child/${childId}`);
        const child = await response.json();

        // Populate view modal
        document.getElementById('view-child-name-title').textContent = `Details for ${child.name}`;
        const contentDiv = document.getElementById('view-child-content');

        contentDiv.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <strong>Name:</strong> ${escapeHtml(child.name)}
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <strong>Date of Birth:</strong> ${formatDate(child.birth_date)}
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <strong>Gender:</strong> ${child.gender || 'N/A'}
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <strong>Relation:</strong> ${escapeHtml(child.relation_to_parent || 'N/A')}
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <strong>Blood Group:</strong> ${child.blood_group || 'N/A'}
                    </div>
                </div>
                <div class="bg-red-50 p-3 rounded-lg">
                    <strong>Allergies:</strong> ${child.allergies || 'None reported'}
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <strong>Medical Notes:</strong> ${child.medical_notes || 'None'}
                </div>
            </div>
        `;

        showModal('view-child-modal');
    } catch (error) {
        console.error('Error viewing child details:', error);
        showToast('Failed to load child details.', 'error');
    } finally {
        hideLoading();
    }
}

function hideViewChildModal() {
    hideModal('view-child-modal');
}

// Utility Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function calculateAge(birthDate) {
    if (!birthDate) return 'Age not specified';

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age === 0 ? 'Less than 1 year' : `${age} years`;
}

function formatDate(dateString) {
    if (!dateString) return 'Date not specified';

    try {
        // Replace hyphens with slashes to avoid timezone issues. 'YYYY-MM-DD' is parsed as UTC.
        const date = new Date(dateString.replace(/-/g, '/'));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour, 10);
    return `${h > 12 ? h - 12 : h}:${minute} ${h >= 12 ? 'PM' : 'AM'} `;
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        document.body.appendChild(toast);
    }

    const toastMessage = document.getElementById('toast-message') || document.createElement('div');
    toastMessage.id = 'toast-message';
    toastMessage.innerHTML = `<div class="flex items-center space-x-2"><i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i><span>${message}</span></div>`;

    if (!toast.contains(toastMessage)) {
        toast.appendChild(toastMessage);
    }

    // Set color based on type
    toast.className = `fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`;

    // Show toast
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 5000);
}

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('hidden');
}

// Reminders View
async function loadRemindersView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section id="reminders-view">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Manage Reminders</h1>
                <p class="text-gray-600">Manage email and SMS reminders for your upcoming appointments.</p>
            </div>
            <div id="reminders-list" class="space-y-6">
                <!-- Loading Skeleton -->
                <div class="animate-pulse bg-white rounded-xl p-6 shadow-md">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                            <div class="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div class="flex items-center space-x-6">
                            <div class="h-6 w-24 bg-gray-200 rounded"></div>
                            <div class="h-6 w-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/parent/reminders');
        const data = await response.json();

        if (!data.success) throw new Error(data.error);

        const remindersList = document.getElementById('reminders-list');
        if (data.appointments.length === 0) {
            remindersList.innerHTML = `
                <div class="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md">
                    <i class="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
                    <p class="font-semibold">No upcoming appointments found.</p>
                    <p class="text-sm">You can set reminders once you book an appointment.</p>
                </div>`;
            return;
        }

        remindersList.innerHTML = data.appointments.map(appt => {
            const reminderSettings = data.reminders[appt.id] || {};
            const isEmailActive = reminderSettings.email === 1;
            const isSmsActive = reminderSettings.sms === 1;

            return `
                <div class="bg-white rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                        <div class="bg-blue-100 p-3 rounded-full">
                            <i class="fas fa-calendar-check text-blue-500 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-lg">${escapeHtml(appt.vaccine_name)}</h4>
                            <p class="text-sm text-gray-600">For <strong>${escapeHtml(appt.child_name)}</strong> on ${formatDate(appt.preferred_date)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6 w-full md:w-auto justify-around">
                        <label class="flex items-center cursor-pointer">
                            <i class="fas fa-envelope text-gray-400 mr-2"></i>
                            <span class="mr-3 text-sm font-medium text-gray-700">Email</span>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer" ${isEmailActive ? 'checked' : ''} onchange="toggleReminder(${appt.id}, 'email', this.checked)">
                                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <i class="fas fa-mobile-alt text-gray-400 mr-2"></i>
                            <span class="mr-3 text-sm font-medium text-gray-700">SMS</span>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer" ${isSmsActive ? 'checked' : ''} onchange="toggleReminder(${appt.id}, 'sms', this.checked)">
                                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading reminders:', error);
        document.getElementById('reminders-list').innerHTML = `<div class="text-center py-8 text-red-500"><p>Failed to load reminders.</p></div>`;
    } finally {
        hideLoading();
    }
}

async function toggleReminder(appointmentId, type, enabled) {
    try {
        const response = await fetch('/api/parent/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointment_id: appointmentId,
                type: type,
                enabled: enabled
            })
        });

        const result = await response.json();
        if (result.success) {
            showToast(`Reminder ${enabled ? 'enabled' : 'disabled'} successfully!`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error toggling reminder:', error);
        showToast('Failed to update reminder settings.', 'error');
        // Reload to reset toggle state
        loadRemindersView();
    }
}

async function loadChildrenView() {
    // This function will now render a full-page view of all children
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">My Children</h1>
                <p class="text-gray-600">A complete list of all your registered children.</p>
            </div>
            <button onclick="showAddChildModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add Child
            </button>
        </section>
        <div id="children-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;

    try {
        const response = await fetch('/api/parent/children');
        const data = await response.json();
        if (data.success) {
            renderChildrenListPage(data.children || []);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading children view:', error);
        document.getElementById('children-list').innerHTML = `
            <div class="col-span-full text-center py-8 text-red-500">
                <p>Failed to load children data.</p>
            </div>
        `;
    }
}

function renderChildrenListPage(children) {
    const childrenList = document.getElementById('children-list');
    if (!childrenList) return;

    if (children.length === 0) {
        childrenList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-child text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No children added yet.</p>
                <button onclick="showAddChildModal()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Your First Child
                </button>
            </div>
        `;
        return;
    }

    const cardColors = ['border-blue-400', 'border-purple-400', 'border-green-400', 'border-yellow-400'];

    childrenList.innerHTML = children.map((child, index) => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 ${cardColors[index % cardColors.length]}">
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <i class="fas fa-user-astronaut text-3xl text-gray-500"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-xl text-gray-800">${escapeHtml(child.name)}</h3>
                        <div class="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                            <span><i class="fas fa-birthday-cake mr-1 text-gray-400"></i> ${calculateAge(child.birth_date)}</span>
                            <span><i class="fas fa-venus-mars mr-1 text-gray-400"></i> ${child.gender || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
             <!-- Growth Chart Section -->
            <div class="p-6 border-t bg-gray-50 rounded-b-xl">
    <h4 class="font-semibold text-gray-800 mb-4 text-lg">Growth Chart</h4>

    <!-- Chart -->
    <div class="h-64 mb-6 bg-white rounded-xl p-3 shadow-sm border">
        <canvas id="growth-chart-${child.id}"></canvas>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-3 items-center text-sm" data-child-id="${child.id}" data-child-name="${escapeHtml(child.name)}">
        <a href="#" data-action="view-details" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-eye text-gray-500"></i> View Details</a>
        <a href="#" data-action="edit-child" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-edit text-gray-500"></i> Edit Information</a>
        <a href="#" data-action="add-growth" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-chart-line text-gray-500"></i> Add Growth Record</a>
        <a href="#" data-action="manage-growth" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 shadow-sm transition"><i class="fas fa-tasks text-gray-500"></i> Manage Growth</a>
        <div class="w-full my-2 h-[1px] bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>
        <a href="#" data-action="delete-child" class="action-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-sm transition"><i class="fas fa-trash-alt text-red-500"></i> Delete Child</a>
    </div>
</div>

        </div>
    `).join('');

    // After rendering the cards, initialize the charts for each child
    // Fetch full child data with growth records for each child
    children.forEach(child => {
        fetchChildGrowthData(child);
    });

    // Add event listeners for the newly created buttons
    attachChildCardActionListeners(childrenList);
}

async function fetchChildGrowthData(child) {
    try {
        // The renderGrowthChart function now fetches its own data.
        // We just need to pass the basic child object to it.
        await renderGrowthChart(child);
    } catch (error) {
        console.error(`Failed to render growth chart for child ${child.id}:`, error);
        const canvasId = `growth-chart-${child.id}`;
        const canvasElement = document.getElementById(canvasId);
        if (canvasElement) {
            const ctx = canvasElement.getContext('2d');
            ctx.font = '16px Arial';
            ctx.fillStyle = '#f00';
            ctx.textAlign = 'center';
            ctx.fillText('Error loading chart', canvasElement.width / 2, canvasElement.height / 2);
        }
    }
}

function attachChildCardActionListeners(container) {
    container.addEventListener('click', function(event) {
        const button = event.target.closest('.action-btn');
        if (!button) return;

        event.preventDefault();
        const buttonContainer = button.parentElement;
        const childId = buttonContainer.dataset.childId;
        const childName = buttonContainer.dataset.childName;
        const action = button.dataset.action;

        switch (action) {
            case 'view-details':
                viewChildDetails(childId);
                break;
            case 'edit-child':
                showEditChildModal(childId);
                break;
            case 'add-growth':
                showAddGrowthRecordModal(childId, childName);
                break;
            case 'manage-growth':
                showManageGrowthRecordsModal(childId);
                break;
            case 'delete-child':
                deleteChild(childId, childName);
                break;
        }
    });
}


async function loadAppointmentsView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">My Appointments</h1>
            <p class="text-gray-600">Manage all your scheduled, completed, and past appointments.</p>
        </section>
        <div id="appointment-tabs" class="mb-6">
            <!-- Tabs will be generated here -->
        </div>
        <div id="appointment-content" class="bg-white rounded-xl p-6 shadow-md">
            <!-- Content will be loaded here -->
            <div class="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
        </div>
    `;

    try {
        showLoading();
        const response = await fetch('/api/parent/appointments');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const appointments = data.appointments;
        const tabs = ['upcoming', 'completed', 'missed', 'cancelled'];

        const renderContent = (category) => {
            const list = appointments[category] || [];
            const contentEl = document.getElementById('appointment-content');
            if (list.length === 0) {
                contentEl.innerHTML = `<div class="text-center py-8 text-gray-500"><p>No ${category} appointments found.</p></div>`;
                return;
            }
            contentEl.innerHTML = `
                <div class="space-y-4">
                    ${list.map(appt => `
                        <div class="p-4 border rounded-lg flex justify-between items-center ${appt.service_type === 'Home' ? 'bg-blue-50' : ''}">
                            <div class="flex items-center space-x-3">
                                ${appt.service_type === 'Home' ? '<i class="fas fa-home text-blue-500" title="Home Vaccination"></i>' : ''}
                                <div>
                                    <h4 class="font-semibold text-lg">${escapeHtml(appt.vaccine_name)}</h4>
                                    <p class="text-sm text-gray-600">For: ${escapeHtml(appt.child_name)} on ${formatDate(appt.preferred_date)} at ${appt.preferred_time}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="px-3 py-1 text-xs font-semibold rounded-full ${appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        appt.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                }">${escapeHtml(appt.status)}</span>
                                ${appt.status === 'Scheduled' ? `
                                    <button onclick="showRescheduleModal(${appt.id}, '${escapeHtml(appt.child_name)}', '${escapeHtml(appt.vaccine_name)}', '${appt.preferred_date}', '${appt.preferred_time}')"
                                            class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-xs font-medium transition-colors" title="Reschedule">
                                        <i class="fas fa-calendar-alt mr-1"></i>Reschedule
                                    </button>
                                    <button onclick="cancelAppointment(${appt.id})" class="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-xs font-medium transition-colors" title="Cancel">
                                        <i class="fas fa-times mr-1"></i>Cancel
                                    </button>` : ''}                                
                                ${appt.status === 'Completed' && appt.cost > 0 ? `
                                    <button onclick="window.open('/invoice/${appt.id}', '_blank')" class="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-xs font-medium transition-colors" title="View Invoice">
                                        <i class="fas fa-file-invoice-dollar mr-1"></i> Invoice
                                    </button>
                                ` : ''}
                                ${appt.status === 'Completed' && !appt.is_reviewed ? `
                                    <button onclick="showReviewModal(${appt.id}, '${escapeHtml(appt.child_name)}', '${escapeHtml(appt.vaccine_name)}');"
                                            class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-xs font-medium transition-colors" title="Leave a Review">
                                        <i class="fas fa-star mr-1"></i>Review
                                    </button>
                                ` : ''}
                                ${appt.status === 'Scheduled' && appt.service_type === 'Home' ? `
                                    <button onclick="showParentHomeVisitDetails(${appt.id})" class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 text-xs font-medium transition-colors" title="View Home Visit Details">
                                        <i class="fas fa-info-circle mr-1"></i>Details
                                    </button>
                                ` : ''}
                                ${appt.status === 'Missed' ? `
                                    <button onclick="showRescheduleModal(${appt.id}, '${escapeHtml(appt.child_name)}', '${escapeHtml(appt.vaccine_name)}', '${appt.preferred_date}', '${appt.preferred_time}')"
                                            class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium transition-colors" title="Reschedule">
                                        <i class="fas fa-calendar-alt mr-1"></i>Reschedule
                                    </button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        const tabContainer = document.getElementById('appointment-tabs');
        tabContainer.innerHTML = `
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-6" aria-label="Tabs">
                    ${tabs.map((tab, index) => `
                        <button data-tab="${tab}" class="tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${index === 0 ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                            ${tab.charAt(0).toUpperCase() + tab.slice(1)} (${(appointments[tab] || []).length})
                        </button>
                    `).join('')}
                </nav>
            </div>
        `;

        tabContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tab = e.target.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('border-blue-500', 'text-blue-600');
                    btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                });
                e.target.classList.add('border-blue-500', 'text-blue-600');
                e.target.classList.remove('border-transparent', 'text-gray-500');
                renderContent(tab);
            }
        });

        // Initial render
        renderContent('upcoming');

    } catch (error) {
        showToast(error.message, 'error');
        document.getElementById('appointment-content').innerHTML = `<div class="text-center py-8 text-red-500"><p>Failed to load appointments.</p></div>`;
    } finally {
        hideLoading();
    }
}

// --- Review Functions ---
async function showReviewModal(appointmentId, childName, vaccineName) {
    document.getElementById('review-appointment-id').value = appointmentId;
    document.getElementById('review-modal-title').textContent = `Review for ${escapeHtml(vaccineName)} (${escapeHtml(childName)})`;
    // Reset form
    document.getElementById('review-form').reset();
    // Reset stars
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-300');
    });
    document.getElementById('rating-value').value = 0;

    // Fetch appointment details to obtain doctor_id (so backend can record which doctor the review is for)
    try {
        showLoading();
        const resp = await fetch(`/api/parent/appointment_details/${appointmentId}`);
        const data = await resp.json();
        if (data.success && data.details) {
            // `doctor_id` was added to the API response in the backend
            document.getElementById('review-doctor-id').value = data.details.doctor_id || '';
            document.getElementById('review-doctor-name').textContent = data.details.doctor_name || 'the doctor';
            document.getElementById('review-appointment-details').textContent = `${escapeHtml(vaccineName)} on ${formatDate(data.details.preferred_date)}`;
        } else {
            document.getElementById('review-doctor-id').value = '';
            document.getElementById('review-doctor-name').textContent = 'the doctor';
            document.getElementById('review-appointment-details').textContent = `${escapeHtml(vaccineName)}`;
        }
    } catch (err) {
        console.error('Failed to fetch appointment details for review:', err);
        document.getElementById('review-doctor-name').textContent = 'the doctor';
        document.getElementById('review-doctor-id').value = '';
    } finally {
        hideLoading();
    }

    showModal('review-modal');

    // Star rating logic
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach((star, index) => {
        star.onmouseover = () => {
            stars.forEach((s, i) => {
                s.className = `fas fa-star cursor-pointer text-2xl ${i <= index ? 'text-yellow-400' : 'text-gray-300'}`;
            });
        };
        star.onclick = () => {
            document.getElementById('rating-value').value = index + 1;
        };
    });

    // Reset stars on mouse out
    document.getElementById('star-rating').onmouseleave = () => {
        const rating = document.getElementById('rating-value').value;
        stars.forEach((s, i) => s.className = `fas fa-star cursor-pointer text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`);
    };
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    const appointment_id = document.getElementById('review-appointment-id').value;
    const rating = document.getElementById('rating-value').value;
    const review_text = document.getElementById('review-text').value;
    const is_anonymous = document.getElementById('is-anonymous').checked;

    if (rating == 0) {
        showToast('Please select a star rating.', 'error');
        return;
    }

    try {
        showLoading();
        const doctor_id = document.getElementById('review-doctor-id') ? document.getElementById('review-doctor-id').value : null;
        const payload = { appointment_id, doctor_id, rating, review_text, is_anonymous };
        const response = await fetch('/api/parent/submit_review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('review-modal');
            loadAppointmentsView();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadHistoryView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Full Vaccination History</h1>
            <p class="text-gray-600">A complete record of all vaccinations for your children.</p>
        </section>
        <section class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Administered By</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="vaccination-history-body">
                        <tr><td colspan="7" class="p-6 text-center text-gray-500">Loading history...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/parent/vaccination_history');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const historyBody = document.getElementById('vaccination-history-body');
        if (data.history.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-gray-500">No vaccination history found.</td></tr>`;
            return;
        }
        historyBody.innerHTML = data.history.map(record => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(record.vaccine_name)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${escapeHtml(record.child_name)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatDate(record.vaccination_date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Completed' ? 'bg-green-100 text-green-800' :
                record.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
            }">${escapeHtml(record.status)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${record.doctor_id && record.doctor_name ? `
                        <button onclick="viewDoctorProfile(${record.doctor_id})" class="text-gray-600 hover:text-blue-700" title="View Doctor Profile">
                            <i class="fas fa-user-md mr-1"></i>${escapeHtml(record.doctor_name)}
                        </button>` : `<span class="text-gray-400">N/A</span>`}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${record.vaccine_price ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">₹${parseFloat(record.vaccine_price).toFixed(2)}</span>` : 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    ${record.status === 'Completed' && record.record_id ? `
                        <div class="flex items-center justify-center space-x-4">
                            <button onclick="viewCertificate(${record.record_id})" class="text-green-600 hover:text-green-800 transition-colors" title="View Certificate">
                                <i class="fas fa-eye text-lg"></i>
                            </button>
                            <button onclick="downloadCertificate(${record.record_id}, '${escapeHtml(record.child_name)}')" class="text-blue-600 hover:text-blue-800 transition-colors" title="Download Certificate">
                                <i class="fas fa-file-pdf text-lg"></i>
                            </button>
                        </div>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast(error.message, 'error');
        document.getElementById('vaccination-history-body').innerHTML = `<tr><td colspan="7" class="p-6 text-center text-red-500">Failed to load history.</td></tr>`;
    } finally {
        hideLoading();
    }
}

async function showParentHomeVisitDetails(appointmentId) {
    showModal('home-visit-modal');
    const contentDiv = document.getElementById('home-visit-content');
    contentDiv.innerHTML = `<div class="animate-pulse space-y-3"><div class="h-6 bg-gray-200 rounded w-3/4"></div><div class="h-4 bg-gray-200 rounded w-1/2"></div><div class="h-4 bg-gray-200 rounded w-1/3"></div></div>`;

    try {
        const response = await fetch(`/api/parent/appointment_details/${appointmentId}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const details = data.details;
        const paymentStatusColor = details.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600';
        const paymentStatusIcon = details.payment_status === 'Paid' ? 'fa-check-circle' : 'fa-clock';

        contentDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column: Appointment Info -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-lg border-b pb-2">Appointment Information</h4>
                    <p><strong>Child:</strong> ${escapeHtml(details.child_name)}</p>
                    <p><strong>Vaccine:</strong> ${escapeHtml(details.vaccine_name)}</p>
                    <p><strong>Visit Date:</strong> ${formatDate(details.preferred_date)} at ${details.preferred_time}</p>
                    <p><strong>Doctor:</strong> Dr. ${escapeHtml(details.doctor_name) || 'Not Assigned'}</p>
                    <p><strong>Clinic:</strong> ${escapeHtml(details.doctor_hospital) || 'N/A'}</p>
                </div>
                <!-- Right Column: Home Visit & Payment Info -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-lg border-b pb-2">Home Visit & Payment</h4>
                    <p><strong>Assigned Staff:</strong> ${escapeHtml(details.assigned_staff_name) || 'Not Yet Assigned'}</p>
                    <p><strong>Payment Method:</strong> ${escapeHtml(details.payment_method) || 'N/A'}</p>
                    <p><strong>Amount:</strong> ₹${details.cost ? parseFloat(details.cost).toFixed(2) : '0.00'}</p>
                    <p><strong>Payment Status:</strong> <span class="font-semibold ${paymentStatusColor}"><i class="fas ${paymentStatusIcon} mr-1"></i>${escapeHtml(details.payment_status)}</span></p>
                </div>
            </div>
        `;

    } catch (error) {
        contentDiv.innerHTML = `<p class="text-red-500">Failed to load details: ${error.message}</p>`;
    }
}

async function downloadCertificate(recordId, childName) {
    // Instead of generating a separate PDF, simply open the viewable certificate
    // in a new tab. The user can then use the browser's print-to-PDF functionality.
    showToast(`Opening certificate for ${childName}. Use the 'Download' button on the new page.`, 'info');
    viewCertificate(recordId);
}

function viewCertificate(recordId) {
    // This function opens the certificate in a new tab.
    window.open(`/certificate/${recordId}`, '_blank');
}

async function viewDoctorProfile(doctorId) {
    showModal('view-doctor-modal');
    const contentDiv = document.getElementById('view-doctor-content');
    contentDiv.innerHTML = `
        <div class="animate-pulse">
            <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>`;

    try {
        const response = await fetch(`/api/doctor_public_profile/${doctorId}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const doctor = data.doctor;
        const profilePicUrl = doctor.profile_pic ? `/static/${doctor.profile_pic}` : '/static/images/default_avatar.png';

        contentDiv.innerHTML = `
            <img src="${profilePicUrl}" alt="Doctor Profile" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200">
            <h4 class="text-xl font-bold text-gray-800">${escapeHtml(doctor.name)}</h4>
            <p class="text-gray-500">${escapeHtml(doctor.specialization)}</p>
            <p class="text-sm text-gray-500 mt-1"><i class="fas fa-hospital-alt mr-2"></i>${escapeHtml(doctor.hospital)}</p>
        `;
    } catch (error) {
        showToast(error.message, 'error');
        contentDiv.innerHTML = `<div class="text-center py-8 text-red-500"><p>Failed to load doctor profile.</p></div>`;
    }
}

async function loadVaccinesView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Available Vaccines</h1>
                <p class="text-gray-600">Information about standard child immunizations.</p>
            </div>
            <div class="relative">
                <input type="text" id="vaccine-search-input" placeholder="Search vaccines..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
        </section>
        <section id="vaccines-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="text-center py-8 col-span-full"><p>Loading vaccines...</p></div>
        </section>
    `;

    try {
        const response = await fetch('/api/vaccines');
        if (!response.ok) {
            throw new Error('Failed to fetch vaccines');
        }
        const vaccines = await response.json();

        // Initial display
        displayDashboardVaccines(vaccines, '');

        // Add search functionality
        document.getElementById('vaccine-search-input').addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            displayDashboardVaccines(vaccines, searchTerm);
        });

    } catch (error) {
        console.error('Error loading vaccines:', error);
        document.getElementById('vaccines-container').innerHTML = `
            <div class="col-span-full text-center py-8 text-red-500">
                <p>Failed to load vaccines. Please try again later.</p>
            </div>
        `;
    }
}

function displayDashboardVaccines(allVaccines, searchTerm) {
    const container = document.getElementById('vaccines-container');
    if (!container) return;

    const filteredVaccines = allVaccines.filter(vaccine =>
        vaccine.name.toLowerCase().includes(searchTerm) || (vaccine.description && vaccine.description.toLowerCase().includes(searchTerm))
    );

    if (filteredVaccines.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-8"><p>No vaccines found matching "${escapeHtml(searchTerm)}".</p></div>`;
        return;
    }
    
    const colors = [
        { from: 'from-purple-500', to: 'to-indigo-600', text: 'text-indigo-600' },
        { from: 'from-blue-500', to: 'to-cyan-600', text: 'text-cyan-600' },
        { from: 'from-green-500', to: 'to-teal-600', text: 'text-teal-600' },
        { from: 'from-yellow-500', to: 'to-orange-600', text: 'text-orange-600' },
        { from: 'from-red-500', to: 'to-pink-600', text: 'text-pink-600' }
    ];

    container.innerHTML = filteredVaccines.map((vaccine, index) => {
        const color = colors[index % colors.length];
        const recommendedAge = vaccine.recommended_age_days ?
            `Recommended at ~${Math.floor(vaccine.recommended_age_days / 30)} months` :
            'As per schedule';

        return `
            <div class="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col overflow-hidden">
                <div class="w-full h-32 bg-gradient-to-br ${color.from} ${color.to} rounded-t-xl flex items-center justify-center text-white">
                    <i class="fas fa-syringe text-5xl opacity-80"></i>
                </div>
                <div class="p-5 flex-grow flex flex-col">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${escapeHtml(vaccine.name)}</h3>
                    <p class="text-gray-600 text-sm mb-4 flex-grow h-20">${escapeHtml(vaccine.description || 'No description available.')}</p>
                    <div class="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-auto">
                        <span class="font-medium"><i class="fas fa-baby mr-1"></i> ${recommendedAge}</span>
                        ${vaccine.dosage ? `<span class="font-semibold ${color.text}"><i class="fas fa-prescription-bottle-alt mr-1"></i> ${escapeHtml(vaccine.dosage)}</span>` : ''}
                        ${vaccine.price ? `
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">₹${parseFloat(vaccine.price).toFixed(2)}</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadResourcesView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Health Resources</h1>
            <p class="text-gray-600">Helpful articles and links for parents.</p>
        </section>
        <section class="bg-white rounded-xl p-8 shadow-md text-center">
            <i class="fas fa-book-medical text-6xl text-blue-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-700">Coming Soon!</h2>
            <p class="text-gray-500 mt-2">We are working on curating a list of helpful resources for you. Please check back later.</p>
        </section>
    `;
}

async function loadSettingsView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Settings</h1>
            <p class="text-gray-600">Manage your profile and account settings.</p>
        </section>

        <!-- Profile Picture Section -->
        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto mb-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Profile Picture</h3>
            <div class="flex items-center space-x-6">
                <img id="profile-pic-preview" src="${document.getElementById('parent-profile-pic-nav')?.src || ''}" alt="Profile Preview" class="h-24 w-24 rounded-full object-cover border-4 border-gray-200">
                <div>
                    <input type="file" id="profile-pic-input" class="hidden" accept="image/png, image/jpeg, image/gif">
                    <button onclick="document.getElementById('profile-pic-input').click()" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Change Picture
                    </button>
                    <button id="remove-pic-btn" class="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors ml-2">Remove</button>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Profile Information</h3>
            <form id="profile-settings-form">
                <div class="space-y-6">
                    <div>
                        <label for="profile-name" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="profile-name" name="name" readonly class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed">
                    </div>
                    <div>
                        <label for="profile-email" class="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="profile-email" name="email" readonly class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed">
                    </div>
                    <div>
                        <label for="profile-phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="profile-phone" name="phone" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="profile-address" class="block text-sm font-medium text-gray-700">Address</label>
                        <textarea id="profile-address" name="address" rows="3" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="profile-city" class="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="profile-city" name="city" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label for="profile-state" class="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="profile-state" name="state" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                </div>
                <div class="mt-8 text-right">
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>
        </section>

        <!-- Change Password Section -->
        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto mt-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Change Password</h3>
            <form id="change-password-form">
                <div class="space-y-6">
                    <div>
                        <label for="current-password" class="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" id="current-password" name="current_password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" id="new-password" name="new_password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="confirm-new-password" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input type="password" id="confirm-new-password" name="confirm_new_password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div id="otp-field-container" class="hidden">
                        <label for="password-change-otp" class="block text-sm font-medium text-gray-700">Enter OTP</label>
                        <input type="text" id="password-change-otp" name="otp" inputmode="numeric" maxlength="6" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Enter 6-digit OTP">
                    </div>
                </div>
                <div class="mt-8 text-right">
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Change Password</button>
                </div>
            </form>
        </section>

        <!-- Delete Account Section -->
        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto mt-8 border-2 border-red-200">
            <h3 class="text-xl font-semibold text-red-700 mb-4">Delete Account</h3>
            <p class="text-sm text-gray-600 mb-6">
                Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <form id="show-delete-modal-form" class="text-right">
                 <button type="button" onclick="showModal('delete-account-modal')" class="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Delete My Account
                </button>
            </form>
        </section>
    `;

    try {
        let profile; // Define profile in the outer scope of the function
        showLoading();
        const response = await fetch('/api/parent/profile');
        const data = await response.json();
        if (data.success) {
            profile = data.profile; // Assign data to the profile variable
            document.getElementById('profile-name').value = profile.name;
            document.getElementById('profile-email').value = profile.email;
            document.getElementById('profile-phone').value = profile.phone;
            document.getElementById('profile-address').value = profile.address;

            // Now that profile is loaded, load states and cities
            const stateDropdown = document.getElementById('profile-state');
            const cityDropdown = document.getElementById('profile-city');

            const statesResponse = await fetch('/api/states_cities');
            const statesData = await statesResponse.json();
            if (!statesData.states) throw new Error("Could not load states/cities data.");

            const allStates = statesData.states;

            stateDropdown.innerHTML = '<option value="">Select State</option>';
            allStates.forEach(state => {
                const option = document.createElement('option');
                option.value = state.name;
                option.textContent = state.name;
                stateDropdown.appendChild(option);
            });

            const populateCities = (selectedState) => {
                cityDropdown.innerHTML = '<option value="">Select City</option>';
                cityDropdown.disabled = true;
                cityDropdown.classList.add('bg-gray-100', 'cursor-not-allowed');
                const stateData = allStates.find(s => s.name === selectedState);
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

            if (profile.state) {
                stateDropdown.value = profile.state;
                populateCities(profile.state);
                if (profile.city) {
                    cityDropdown.value = profile.city;
                }
            }

            stateDropdown.addEventListener('change', () => {
                populateCities(stateDropdown.value);
                cityDropdown.value = ''; // Reset city selection
            });

        } else { throw new Error(data.error); }
    } catch (error) { showToast(error.message, 'error'); } finally { hideLoading(); }

    document.getElementById('profile-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('profile-phone').value;
        const address = document.getElementById('profile-address').value;
        const city = document.getElementById('profile-city').value;
        const state = document.getElementById('profile-state').value;
        try {
            showLoading();
            const response = await fetch('/api/parent/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, address, city, state })
            });
            const result = await response.json();
            if (result.success) { showToast(result.message, 'success'); }
            else { throw new Error(result.error); }
        } catch (error) { showToast(error.message, 'error'); } finally { hideLoading(); }
    });

    // Profile Picture Upload
    document.getElementById('profile-pic-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profile_pic', file);
        try {
            showLoading();
            const response = await fetch('/api/parent/upload_profile_pic', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                document.querySelectorAll('#parent-profile-pic-nav, #parent-profile-pic-sidebar, #profile-pic-preview').forEach(img => {
                    img.src = result.profile_pic_url + '?t=' + new Date().getTime(); // Add cache buster
                });
            } else { throw new Error(result.error); }
        } catch (error) { showToast(error.message, 'error'); } finally { hideLoading(); }
    });

    document.getElementById('remove-pic-btn').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;
        try {
            showLoading();
            const response = await fetch('/api/parent/remove_profile_pic', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                document.querySelectorAll('#parent-profile-pic-nav, #parent-profile-pic-sidebar, #profile-pic-preview').forEach(img => {
                    img.src = result.profile_pic_url + '?t=' + new Date().getTime(); // Add cache buster
                });
            } else { throw new Error(result.error); }
        } catch (error) { showToast(error.message, 'error'); } finally { hideLoading(); }
    });

    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        // Show loading and call the first API to send OTP
        try {
            showLoading();
            const response = await fetch('/api/parent/initiate_password_change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'info');
                // Hide password fields and show OTP field
                document.getElementById('current-password').parentElement.classList.add('hidden');
                document.getElementById('new-password').parentElement.classList.add('hidden');
                document.getElementById('confirm-new-password').parentElement.classList.add('hidden');
                document.getElementById('otp-field-container').classList.remove('hidden');

                // Change button text and functionality
                const submitButton = e.target.querySelector('button[type="submit"]');
                submitButton.textContent = 'Confirm & Change Password';
                // Remove old event listener and add new one for OTP submission
                e.target.removeEventListener('submit', arguments.callee);
                e.target.addEventListener('submit', handleFinalizePasswordChange);
            } else {
                // If OTP sending fails, reset the form state
                document.getElementById('current-password').parentElement.classList.remove('hidden');
                document.getElementById('new-password').parentElement.classList.remove('hidden');
                document.getElementById('confirm-new-password').parentElement.classList.remove('hidden');
                throw new Error(result.error);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally { hideLoading(); }
    });
}

async function handleFinalizePasswordChange(e) {
    e.preventDefault();
    const otp = document.getElementById('password-change-otp').value;
    if (!otp || otp.length !== 6) {
        showToast('Please enter a valid 6-digit OTP.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/parent/finalize_password_change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: otp })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            // Reload settings view to reset the form
            loadSettingsView();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleDeleteAccount(e) {
    e.preventDefault();
    const password = document.getElementById('delete-account-password').value;

    if (!password) {
        showToast('Password is required to delete your account.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/parent/delete_account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message); // Use alert for this critical message before redirecting
            window.location.href = result.redirect_url;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally { hideLoading(); }
}

async function loadCalendarView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Vaccination Calendar</h1>
            <p class="text-gray-600">View and manage your children's vaccination schedules</p>
        </section>
        <section class="bg-white rounded-xl p-4 shadow-md mb-6">
            <div class="flex items-center space-x-4">
                <label for="child-calendar-filter" class="text-sm font-medium text-gray-700">Filter by Child:</label>
                <select id="child-calendar-filter" class="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Children</option>
                    <!-- Child options will be populated here -->
                </select>
            </div>
        </section>
        <div id="calendar" class="bg-white p-6 rounded-xl shadow-md"></div>
    `;

    try {
        showLoading();
        const calendarEl = document.getElementById('calendar');
        const childFilterEl = document.getElementById('child-calendar-filter');

        // Populate child filter dropdown
        try {
            const childrenResponse = await fetch('/api/parent/children');
            const childrenData = await childrenResponse.json();
            if (childrenData.success) {
                childrenData.children.forEach(child => {
                    const option = document.createElement('option');
                    option.value = child.id;
                    option.textContent = escapeHtml(child.name);
                    childFilterEl.appendChild(option);
                });
            }
        } catch (e) {
            console.error("Could not load children for filter dropdown:", e);
        }

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            editable: true, // Enable drag-and-drop
            events: function (fetchInfo, successCallback, failureCallback) {
                const childId = childFilterEl.value;
                const query = new URLSearchParams({ child_id: childId }).toString();
                fetch(`/api/calendar/events?${query}`)
                    .then(response => response.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            successCallback(data); // If API returns an array directly
                        } else if (data && Array.isArray(data.events)) {
                            successCallback(data.events); // If API returns an object like { events: [...] }
                        } else {
                            failureCallback(new Error('Invalid event data format'));
                        }
                    }).catch(error => failureCallback(error));
            },
            loading: function (isLoading) { if (!isLoading) { hideLoading(); } },
            eventClick: function (info) {
                const event = info.event;
                const props = event.extendedProps;

                // Show event details in a modal
                const modalContent = `
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                        <div class="space-y-3">
                            <p><strong>Child:</strong> ${escapeHtml(props.childName)}</p>
                            <p><strong>Vaccine:</strong> ${escapeHtml(props.vaccineName)}</p>
                            <p><strong>Date:</strong> ${formatDate(event.start)}</p>
                            <p><strong>Time:</strong> ${event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Status:</strong> 
                                <span class="px-2 py-1 rounded-full text-sm ${props.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        props.status === 'Missed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                    }">${props.status}</span>
                            </p>
                        </div>
                        ${props.status === 'Scheduled' ? `
                            <div class="mt-6 flex justify-end space-x-3">
                                <button onclick="showRescheduleModal(${props.appointmentId}, '${escapeHtml(props.childName)}', '${escapeHtml(props.vaccineName)}', '${event.startStr.split('T')[0]}', '${event.startStr.split('T')[1]}')" 
                                        class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm font-medium">
                                    <i class="fas fa-calendar-alt mr-1"></i>Reschedule
                                </button>
                                <button onclick="cancelAppointment(${props.appointmentId})" 
                                        class="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium">
                                    <i class="fas fa-times mr-1"></i>Cancel
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;

                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
                modal.innerHTML = `
                    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        ${modalContent}
                    </div>
                `;

                document.body.appendChild(modal);

                // Close modal when clicking outside
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            },
            eventDrop: async function (info) {
                const appointmentId = info.event.id;
                const newStartDate = info.event.start;

                // Extract date and time in 'YYYY-MM-DD' and 'HH:MM' format
                const newDate = newStartDate.toISOString().split('T')[0];
                const newTime = newStartDate.toTimeString().substring(0, 5);

                if (!confirm(`Are you sure you want to move this appointment to ${newDate} at ${newTime}?`)) {
                    info.revert(); // Revert the event to its original position
                    return;
                }

                try {
                    showLoading();
                    const response = await fetch(`/api/appointment/reschedule/${appointmentId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            preferred_date: newDate,
                            preferred_time: newTime
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        showToast('Appointment rescheduled successfully!', 'success');
                        calendar.refetchEvents(); // Refresh calendar to show the change
                    } else {
                        throw new Error(result.error || 'Failed to reschedule.');
                    }
                } catch (error) {
                    showToast(error.message, 'error');
                    info.revert(); // Revert the event to its original position on failure
                } finally { hideLoading(); }
            },
        });

        calendar.render();

        // Add event listener to refetch events when filter changes
        childFilterEl.addEventListener('change', () => calendar.refetchEvents());
    } catch (error) {
        console.error('Error loading calendar:', error);
        document.getElementById('calendar').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-calendar-times text-4xl mb-2"></i>
                <p>Failed to load calendar. Please try again later.</p>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Inbox View Function
async function loadInboxView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">My Messages</h1>
            <p class="text-gray-600">View and manage your conversations with doctors</p>
        </section>
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div id="inbox-messages" class="divide-y divide-gray-200">
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Loading messages...</p>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/api/parent/messages');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load messages');
        }

        const inboxContainer = document.getElementById('inbox-messages');

        if (data.messages.length === 0) {
            inboxContainer.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-envelope-open text-4xl text-gray-300 mb-4"></i>
                    <p class="font-semibold">No messages yet</p>
                    <p class="text-sm">Messages from your doctors will appear here</p>
                </div>
            `;
            return;
        }

        inboxContainer.innerHTML = data.messages.map(message => `
            <div class="p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer"
                             onclick="viewDoctorDetails(${message.sender_id})" title="View doctor details">
                            <i class="fas fa-user-md text-blue-500"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
                                onclick="viewDoctorDetails(${message.sender_id})">${escapeHtml(message.sender_name)}</h4>
                            <p class="text-xs text-gray-500"><span class="rel-time" data-timestamp="${message.created_at}" title="${message.created_at ? new Date(String(message.created_at).replace(/-/g, '/')).toLocaleString() : ''}">${timeAgo(message.created_at)}</span></p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="viewDoctorDetails(${message.sender_id})" 
                                class="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium transition-colors">
                            <i class="fas fa-info-circle mr-1"></i>Info
                        </button>
                        <button onclick="showReplyModal(${message.sender_id}, '${escapeHtml(message.sender_name)}')" 
                                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors">
                            <i class="fas fa-reply mr-1"></i>Reply
                        </button>
                    </div>
                </div>
                <div class="pl-13">
                    <p class="text-gray-700">${escapeHtml(message.message)}</p>
                    ${message.reply ? `
                        <div class="mt-3 pl-4 border-l-2 border-green-200">
                            <p class="text-sm text-gray-600">Your reply:</p>
                            <p class="text-gray-700">${escapeHtml(message.reply)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading inbox:', error);
        document.getElementById('inbox-messages').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                <p>Failed to load messages. Please try again later.</p>
            </div>
        `;
    }
}

// --- Notification Functions ---

async function fetchNotifications() {
    try {
        const response = await fetch('/api/parent/notifications');
        const data = await response.json();
        if (data.success) {
            updateNotificationUI(data.notifications);
        }
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
    }
}

function updateNotificationUI(notifications) {
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notification-list');

    if (!badge || !list) return;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (notifications.length === 0) {
        list.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No notifications</div>';
    } else {
        list.innerHTML = notifications.map(n => `
            <div class="p-3 hover:bg-gray-50 border-b ${!n.is_read ? 'bg-blue-50' : ''}" data-sender-id="${n.sender_id}">
                <a href="${n.link || '#'}">
                    <p class="text-sm text-gray-700">
                        ${n.sender_name ? `<strong class="font-semibold">${escapeHtml(n.sender_name)}:</strong> ` : ''}
                        ${escapeHtml(n.message)}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">${timeAgo(n.created_at)}</p>
                </a>
                ${n.sender_type === 'doctor' && n.sender_id ? `
                    <button onclick="showReplyModal(${n.sender_id}, '${escapeHtml(n.sender_name)}')" 
                            class="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200"
                            title="Reply to ${escapeHtml(n.sender_name)}">
                        <i class="fas fa-reply mr-1"></i>Reply
                    </button>
                ` : ''}
            </div>
        `).join('');
    }
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    const isHidden = dropdown.classList.toggle('hidden');

    // If dropdown is opened, mark notifications as read
    if (!isHidden) {
        const badge = document.getElementById('notification-badge');
        if (!badge.classList.contains('hidden')) {
            // Mark as read on the server
            fetch('/api/parent/notifications/mark_read', { method: 'POST' });
            // Instantly hide badge on UI
            badge.classList.add('hidden');
            // After a short delay, remove the "new" background from items
            setTimeout(() => fetchNotifications(), 2000);
        }
    }
}

function showReplyModal(doctorId, doctorName) {
    document.getElementById('reply-doctor-id').value = doctorId;
    document.querySelector('#reply-to-doctor-modal h3').textContent = `Reply to Dr. ${escapeHtml(doctorName)}`;
    document.getElementById('reply-message').value = ''; // Clear previous message
    showModal('reply-to-doctor-modal');
}

async function viewDoctorDetails(doctorId) {
    try {
        showLoading();
        const response = await fetch(`/api/doctor_public_profile/${doctorId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load doctor details');
        }

        const doctor = data.doctor;
        const profilePicUrl = doctor.profile_pic ? `/static/${doctor.profile_pic}` : '/static/images/default_avatar.png';

        // Show doctor details in modal
        const modalContent = document.querySelector('#view-doctor-modal .modal-content') || document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <div class="p-6">
                <div class="text-center mb-6">
                    <img src="${profilePicUrl}" alt="Doctor Profile" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
                    <h3 class="text-xl font-bold text-gray-800 mb-1">${escapeHtml(doctor.name)}</h3>
                    <p class="text-gray-600">${escapeHtml(doctor.specialization || 'General Physician')}</p>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-hospital text-blue-500 w-6"></i>
                        <span class="text-gray-700">${escapeHtml(doctor.hospital)}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-map-marker-alt text-red-500 w-6"></i>
                        <span class="text-gray-700">${escapeHtml(doctor.city)}, ${escapeHtml(doctor.state)}</span>
                    </div>
                    ${doctor.phone ? `
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-phone text-green-500 w-6"></i>
                            <span class="text-gray-700">${escapeHtml(doctor.phone)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="hideModal('view-doctor-modal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Close
                    </button>
                    <button onclick="showReplyModal(${doctor.id}, '${escapeHtml(doctor.name)}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-reply mr-1"></i>Send Message
                    </button>
                </div>
            </div>
        `;

        if (!document.querySelector('#view-doctor-modal .modal-content')) {
            document.getElementById('view-doctor-modal').appendChild(modalContent);
        }

        showModal('view-doctor-modal');
    } catch (error) {
        console.error('Error viewing doctor details:', error);
        showToast('Failed to load doctor details. Please try again later.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleSendReply(e) {
    e.preventDefault();
    const doctorId = document.getElementById('reply-doctor-id').value;
    const message = document.getElementById('reply-message').value;

    if (!message.trim()) {
        showToast('Reply message cannot be empty.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/parent/reply_to_doctor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctor_id: doctorId, message: message })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('reply-to-doctor-modal');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// --- Map View Functions ---
async function loadMapView() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section id="map-view" class="p-6 overflow-auto">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">Nearby Vaccination Centers</h1>
            <p class="text-gray-600 mb-6">Explore vaccination centers where our registered doctors practice.</p>
            <!-- Search Bar -->
            <div class="mb-6 flex items-center">
                <input type="text" id="map-search-input" placeholder="Search for a hospital or city..." class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="map-search-btn" class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-search"></i>
                </button>
            </div>

            <div id="mapid" class="w-full h-[600px] rounded-xl shadow-md bg-gray-200"></div>
            <div class="mt-4 p-4 bg-white rounded-xl shadow-md">
                <h3 class="font-semibold text-gray-800 mb-2">Map Legend</h3>
                <div class="flex items-center"><img src="/static/images/hospital_marker.png" alt="Hospital Icon" class="w-6 h-6 mr-2"><span class="text-gray-700">Registered Hospital/Clinic</span></div>
            </div>
        </section>
    `;

    // Ensure map container is visible before initializing
    const mapContainer = document.getElementById('mapid');
    if (!mapContainer) {
        console.error("Map container 'mapid' not found.");
        return;
    }

    // Clear previous map instance if it exists
    if (window.parentMap) {
        window.parentMap.remove();
    }

    let allMarkers = []; // To store all markers for filtering

    try {
        showLoading();
        const response = await fetch('/api/hospitals_for_map');
        const data = await response.json();

        if (!data.success) throw new Error(data.error || 'Failed to load hospital data.');

        const hospitals = data.hospitals;

        // Define a custom icon for hospitals
        const hospitalIcon = L.icon({
            iconUrl: '/static/images/hospital_marker.png', // Path to your custom icon image
            iconSize: [32, 32], // size of the icon
            iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
        });

        // Initialize the map
        window.parentMap = L.map('mapid').setView([20.5937, 78.9629], 5); // Centered on India

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.parentMap);

        let bounds = [];
        allMarkers = hospitals.map(hospital => {
            if (hospital.latitude && hospital.longitude) {
                const lat = parseFloat(hospital.latitude);
                const lon = parseFloat(hospital.longitude);
                if (!isNaN(lat) && !isNaN(lon)) {
                    const marker = L.marker([lat, lon], { icon: hospitalIcon }).addTo(window.parentMap); // Use custom icon
                    marker.bindPopup(`
                        <div style="font-family: 'Inter', sans-serif; padding: 5px;">
                            <strong style="color: #3B82F6;">${escapeHtml(hospital.hospital)}</strong><br>
                            <span style="font-size: 0.9em; color: #555;">${escapeHtml(hospital.city)}, ${escapeHtml(hospital.state)}</span>
                        </div>
                    `);
                    bounds.push([lat, lon]);
                    // Store data on the marker for searching
                    marker.hospitalData = hospital;
                    return marker;
                }
            }
            return null;
        }).filter(m => m !== null);

        if (bounds.length > 0) {
            window.parentMap.fitBounds(bounds); // Adjust map to show all markers
        }

        // --- Backend Logic for Search ---
        const searchInput = document.getElementById('map-search-input');
        const searchBtn = document.getElementById('map-search-btn');

        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase();
            let firstResultCoords = null;

            allMarkers.forEach(marker => {
                const hospital = marker.hospitalData;
                const isMatch = hospital.hospital.toLowerCase().includes(searchTerm) ||
                                hospital.city.toLowerCase().includes(searchTerm) ||
                                hospital.state.toLowerCase().includes(searchTerm);

                if (isMatch) {
                    marker.addTo(window.parentMap);
                    if (!firstResultCoords) {
                        firstResultCoords = marker.getLatLng();
                    }
                } else {
                    marker.remove();
                }
            });

            if (firstResultCoords) {
                window.parentMap.setView(firstResultCoords, 12); // Zoom to the first result
            }
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && performSearch());

    } catch (error) {
        console.error('Error loading map view:', error);
        showToast(error.message || 'Failed to load map data.', 'error');
    } finally {
        hideLoading();
    }
}

function restoreDashboardHTML() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    // Check if the main dashboard content is already present
    if (document.getElementById('stats-cards')) {
        // If dashboard content exists, just scroll to top and ensure it's visible
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.remove('hidden');
        });
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // If not present, rebuild it
    mainContent.innerHTML = `
        <!-- Welcome Section -->
        <section id="dashboard" class="mb-8">
            <div class="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                <h1 class="text-3xl font-bold mb-2" id="welcome-message">Welcome back!</h1>
                <p class="text-blue-100">Here's your child's vaccination overview</p>
            </div>
        </section>

        <!-- Stats Cards -->
        <section class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-cards">
                <div class="bg-white rounded-xl p-6 shadow-md card-hover text-center flex flex-col justify-center items-center">
                    <div id="total-children-stat" class="text-3xl font-bold text-blue-600 mb-2"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></div>
                    <div class="text-gray-600">Total Children</div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md card-hover text-center flex flex-col justify-center items-center">
                    <div id="upcoming-vaccines-stat" class="text-3xl font-bold text-green-600 mb-2"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></div>
                    <div class="text-gray-600">Upcoming Vaccines</div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md card-hover text-center flex flex-col justify-center items-center">
                    <div id="total-appointments-stat" class="text-3xl font-bold text-purple-600 mb-2"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></div>
                    <div class="text-gray-600">Appointments</div>
                </div>
                <div class="bg-white rounded-xl p-6 shadow-md card-hover text-center flex flex-col justify-center items-center">
                    <div id="completed-vaccines-stat" class="text-3xl font-bold text-orange-600 mb-2"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></div>
                    <div class="text-gray-600">Completed Vaccines</div>
                </div>
            </div>
        </section>

        <!-- Children Section -->
        <section id="children" class="mb-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">My Children</h2>
                <div class="flex items-center space-x-2">
                    <button id="view-all-children-button" onclick="loadChildrenView()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">View All</button>
                    <button id="add-child-button" onclick="showAddChildModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><i class="fas fa-plus mr-2"></i>Add Child</button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="children-list">
                <div class="bg-white rounded-xl p-6 shadow-md"><div class="animate-pulse"><div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div><div class="h-3 bg-gray-200 rounded w-1/3"></div></div></div>
            </div>
        </section>

        <!-- Missed Appointments Section -->
        <section id="missed-appointments-section" class="mb-8 hidden">
            <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 shadow-md">
                <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-bold text-red-800"><i class="fas fa-exclamation-triangle mr-2"></i>Missed Appointments</h2></div>
                <p class="text-sm text-red-700 mb-4">You have some appointments that were missed. Please reschedule them as soon as possible.</p>
                <div class="space-y-4" id="missed-appointments-list"></div>
            </div>
        </section>

        <!-- Upcoming Vaccines & Appointments -->
        <section id="appointments" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-md">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Upcoming Vaccines</h2>
                <div class="space-y-4" id="upcoming-vaccines"><div class="animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div></div>
                <a href="#history" class="w-full mt-4 text-center text-blue-600 hover:text-blue-800 font-medium block">View All Vaccines <i class="fas fa-chevron-right ml-1"></i></a>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">My Appointments</h2>
                    <button id="book-appointment-button" onclick="showBookAppointmentModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"><i class="fas fa-plus mr-1"></i> Book New</button>
                </div>
                <div class="space-y-4" id="appointments-list"><div class="animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div></div>
            </div>
        </section>

        <!-- Vaccine Schedule Section -->
        <section id="vaccine-schedule" class="mb-8">
            <div class="bg-white rounded-xl p-6 shadow-md">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Vaccine Schedule (Due)</h2>
                <p class="text-sm text-gray-500 mb-4">This list shows recommended vaccines that are due for your children based on their age and have not been completed or scheduled yet.</p>
                <div class="space-y-4" id="vaccine-schedule-list"><div class="animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div></div>
            </div>
        </section>

        <!-- Vaccination History -->
        <section id="history" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Vaccination History</h2>
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200" id="vaccination-history-body">
                <tr><td colspan="7" class="p-4 text-center">
                <div class="animate-pulse h-8 bg-gray-200 rounded">
                </div></td></tr></tbody></table></div></div>
        </section>
    `;
}

// Make functions globally available
window.showEditChildModal = showEditChildModal;
window.viewChildDetails = viewChildDetails;
window.hideEditChildModal = hideEditChildModal;
window.showRescheduleModal = showRescheduleModal;
window.hideViewChildModal = hideViewChildModal;
window.showAddChildModal = showAddChildModal;
window.showBookAppointmentModal = showBookAppointmentModal;
window.deleteChild = deleteChild;
window.loadDashboardData = loadDashboardData;
window.toggleReminder = toggleReminder;
window.loadRemindersView = loadRemindersView;
window.loadChildrenView = loadChildrenView;
window.loadAppointmentsView = loadAppointmentsView;
window.loadHistoryView = loadHistoryView;
window.loadVaccinesView = loadVaccinesView;
window.loadResourcesView = loadResourcesView;
window.loadMapView = loadMapView;
window.viewCertificate = viewCertificate;
window.loadCalendarView = loadCalendarView;
window.cancelAppointment = cancelAppointment; // Re-add if it was removed by mistake, it's used in other places.
window.downloadCertificate = downloadCertificate;
window.showReplyModal = showReplyModal;
window.showManageGrowthRecordsModal = showManageGrowthRecordsModal;
window.showEditGrowthRecordModal = showEditGrowthRecordModal;
window.deleteGrowthRecord = deleteGrowthRecord;
window.showAddGrowthRecordModal = showAddGrowthRecordModal;
window.showReviewModal = showReviewModal;
window.loadInboxView = loadInboxView;
window.toggleChildMenu = toggleChildMenu;
window.loadSettingsView = loadSettingsView; // Re-add if it was removed by mistake.
window.viewDoctorDetails = viewDoctorDetails;
window.showParentHomeVisitDetails = showParentHomeVisitDetails;