// Doctor Dashboard JavaScript - Complete Version (Bug Fixed)
document.addEventListener('DOMContentLoaded', function () {
    console.log('Doctor Dashboard Loaded');
    
    // Centralized routing on page load
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    
    // Top Navbar Listeners
    document.getElementById('notification-button')?.addEventListener('click', toggleDoctorNotificationDropdown);

    // Modal event listeners
    document.getElementById('close-child-modal')?.addEventListener('click', hideChildModal);
    document.getElementById('ok-child-modal')?.addEventListener('click', hideChildModal);

    document.addEventListener('click', function (event) {
        if (event.target === document.getElementById('child-details-modal')) {
            hideChildModal();
        }
    });

    // Delete Account Modal Listeners
    document.getElementById('close-delete-account-modal')?.addEventListener('click', () => hideModal('delete-account-modal'));
    document.getElementById('cancel-delete-account')?.addEventListener('click', () => hideModal('delete-account-modal'));
    document.getElementById('delete-account-form')?.addEventListener('submit', handleDeleteAccount);

    // Contact Admin form listener
    document.getElementById('contact-admin-form')?.addEventListener('submit', submitContactAdmin);

    // Reply Modal Listeners
    document.getElementById('reply-to-parent-form')?.addEventListener('submit', handleSendReplyToParent);

    // Booster Modal Listener
    document.getElementById('schedule-booster-form')?.addEventListener('submit', handleScheduleBooster);

    // Assign Staff Modal Listener
    document.getElementById('assign-staff-form')?.addEventListener('submit', handleAssignStaff);

    // Sidebar navigation
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', handleSidebarNavigation);
    }

    // Back to Top Button Logic
    const mainContentArea = document.getElementById('main-content');
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
});

function handleRouting() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    console.log(`Routing to: ${hash}`);

    // Update active link in sidebar based on hash
    document.querySelectorAll('#sidebar-nav a').forEach(a => {
        const linkHash = a.getAttribute('href')?.substring(1);
        if (linkHash === hash) {
            a.classList.add('bg-blue-700', 'font-semibold', 'text-white');
            a.classList.remove('text-gray-300', 'hover:bg-blue-600');
        } else {
            a.classList.remove('bg-blue-700', 'font-semibold', 'text-white');
            a.classList.add('text-gray-300', 'hover:bg-blue-600');
        }
    });

    const viewMap = {
        'dashboard': loadDashboardView,
        'children': loadPatientsView,
        'appointments': loadAppointmentsView,
        'calendar': loadCalendarView,
        'reviews': loadReviewsView,
        'inbox': loadInboxView,
        'reports': loadReportsView,
        'outreach': loadOutreachView,
        'settings': loadSettingsView,
        'contact-admin': showDoctorContactAdminModal,
    };

    const loadView = viewMap[hash] || loadDashboardView;
    loadView();
}

function handleSidebarNavigation(event) {
    const link = event.target.closest('a');
    if (!link) return;

    event.preventDefault();
    const targetHash = link.getAttribute('href');
    
    if (targetHash && targetHash.startsWith('#')) {
        window.location.hash = targetHash.substring(1);
    }
}

// Function to load the main dashboard view
async function loadDashboardView() {
    console.log('Loading dashboard view...');
    
    // Always restore dashboard HTML first
    restoreDashboardHTML();

    // Fetch notifications whenever the dashboard is loaded
    fetchDoctorNotifications();

    try {
        showLoading();
        const response = await fetch('/api/doctor/dashboard');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            updateStats(data.stats);
            updateDoctorNotificationBadge(data.stats.unread_notifications);
            updateDashboardAppointmentsTable(data.upcoming_appointments);
            initializeCharts(data.charts);
        } else {
            console.error('Failed to load dashboard data:', data.error);
            showToast(data.error || 'Failed to load data.', 'error');
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Function to load the appointments view
async function loadAppointmentsView() {
    console.log('Loading appointments view...');
    const mainContent = document.getElementById('main-content');
    
    // Clear and set loading state
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Appointments</h1>
            <p class="text-gray-600">Manage all scheduled and completed appointments.</p>
        </section>

        <!-- Upcoming Appointments Table -->
        <section class="bg-white rounded-xl p-6 shadow-md mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="p-3 text-sm font-semibold text-gray-600">Child Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Parent Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Vaccine</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Date & Time</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="upcoming-appointments-table">
                        <tr><td colspan="5" class="text-center p-4 text-gray-500">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Completed Appointments Table -->
        <section class="bg-white rounded-xl p-6 shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Completed Appointments</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="p-3 text-sm font-semibold text-gray-600">Child Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Parent Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Vaccine</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Date</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Price</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody id="completed-appointments-table">
                        <tr><td colspan="6" class="text-center p-4 text-gray-500">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/doctor/appointments');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            const upcomingTable = document.getElementById('upcoming-appointments-table');
            if (data.upcoming && data.upcoming.length > 0) {
                upcomingTable.innerHTML = data.upcoming.map(appt => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 text-sm text-gray-700 flex items-center space-x-2">
                            ${appt.service_type === 'Home' ? '<i class="fas fa-home text-blue-500" title="Home Vaccination"></i>' : ''}
                            <span>${escapeHtml(appt.child_name)}</span>
                        </td>
                        <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.parent_name)}</td>
                        <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.vaccine_name)}</td>
                        <td class="p-3 text-sm text-gray-700">${formatDate(appt.preferred_date)} at ${appt.preferred_time}</td>
                        <td class="p-3 text-sm">
                            ${appt.service_type === 'Home' ? `<button onclick="showHomeVisitDetails(${appt.id})" class="text-purple-600 hover:text-purple-800 mr-2" title="Home Visit Details"><i class="fas fa-info-circle"></i></button>` : ''}
                            <button onclick="viewChildDetails(${appt.child_id})" class="text-blue-600 hover:text-blue-800 mr-2" title="View Details"><i class="fas fa-eye"></i></button>
                            <button onclick="markAsCompleted(${appt.id})" class="text-green-600 hover:text-green-800" title="Mark as Completed"><i class="fas fa-check"></i></button>
                        </td>
                    </tr>
                `).join('');
            } else {
                upcomingTable.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">No upcoming appointments found.</td></tr>';
            }

            const completedTable = document.getElementById('completed-appointments-table');
            if (data.completed && data.completed.length > 0) {
                completedTable.innerHTML = data.completed.map(appt => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 text-sm text-gray-700 flex items-center space-x-2">
                            ${appt.service_type === 'Home' ? '<i class="fas fa-home text-blue-500" title="Home Vaccination"></i>' : ''}
                            <span>${escapeHtml(appt.child_name)}</span>
                        </td>
                        <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.parent_name)}</td>
                        <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.vaccine_name)}</td>
                        <td class="p-3 text-sm text-gray-700">${formatDate(appt.administered_date || appt.preferred_date)}</td>
                        <td class="p-3 text-sm text-gray-700">
                            ${appt.vaccine_price ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">₹${parseFloat(appt.vaccine_price).toFixed(2)}</span>` : 'N/A'}
                        </td>
                        <td class="p-3 text-sm flex items-center space-x-2">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                            ${appt.record_id ? `
                                <button onclick="viewCertificate(${appt.record_id})" class="text-yellow-600 hover:text-yellow-800" title="View Certificate">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="window.open('/certificate/${appt.record_id}', '_blank')" class="text-blue-600 hover:text-blue-800" title="Download Certificate">
                                    <i class="fas fa-award"></i>
                                </button>
                            ` : ''} ${appt.cost && appt.cost > 0 ? `
                                <button onclick="window.open('/invoice/${appt.id}', '_blank')" class="text-purple-600 hover:text-purple-800" title="View Invoice">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </button>                            
                            ` : ''}
                        </td>
                    </tr>
                `).join('');
            } else {
                completedTable.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">No completed appointments found.</td></tr>';
            }
        } else {
            throw new Error(data.error || 'Failed to load appointments.');
        }
    } catch (error) {
        console.error('Error loading appointments view:', error);
        showToast(error.message, 'error');
        document.getElementById('upcoming-appointments-table').innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-500">Error loading data.</td></tr>`;
        document.getElementById('completed-appointments-table').innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading data.</td></tr>`;
    } finally {
        hideLoading();
    }
}

async function showHomeVisitDetails(appointmentId) {
    showModal('home-visit-modal');
    const contentDiv = document.getElementById('home-visit-content');
    contentDiv.innerHTML = `<div class="animate-pulse space-y-3"><div class="h-6 bg-gray-200 rounded w-3/4"></div><div class="h-4 bg-gray-200 rounded w-1/2"></div><div class="h-4 bg-gray-200 rounded w-1/3"></div></div>`;

    try {
        const response = await fetch(`/api/doctor/appointment_details/${appointmentId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const details = data.details;
        const paymentStatusColor = details.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600';
        const paymentStatusIcon = details.payment_status === 'Paid' ? 'fa-check-circle' : 'fa-clock';

        contentDiv.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column: Patient Info -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-lg border-b pb-2">Patient Information</h4>
                    <p><strong>Child:</strong> ${escapeHtml(details.child_name)}</p>
                    <p><strong>Parent:</strong> ${escapeHtml(details.parent_name)}</p>
                    <p><strong>Contact:</strong> <a href="tel:${escapeHtml(details.parent_phone)}" class="text-blue-600 hover:underline">${escapeHtml(details.parent_phone)}</a></p>
                    <p><strong>Address:</strong> ${escapeHtml(details.parent_address || 'Not provided')}</p>
                </div>
                <!-- Right Column: Visit & Payment Info -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-lg border-b pb-2">Visit & Payment</h4>
                    <p><strong>Vaccine:</strong> ${escapeHtml(details.vaccine_name)}</p>
                    <p><strong>Visit Date:</strong> ${formatDate(details.preferred_date)} at ${details.preferred_time}</p>
                    <p><strong>Assigned Staff:</strong> ${escapeHtml(details.assigned_staff_name) || 'Not Assigned'}</p>
                    <p><strong>Payment Method:</strong> ${escapeHtml(details.payment_method) || 'N/A'}</p>
                    <p><strong>Amount:</strong> ₹${details.cost ? parseFloat(details.cost).toFixed(2) : '0.00'}</p>
                    <p><strong>Payment Status:</strong> <span class="font-semibold ${paymentStatusColor}"><i class="fas ${paymentStatusIcon} mr-1"></i>${escapeHtml(details.payment_status)}</span></p>
                </div>
            </div>
            <div class="mt-6 text-right">
                <button onclick="showAssignStaffModal(${appointmentId}, '${escapeHtml(details.assigned_staff_name || '')}', '${details.payment_status}')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <i class="fas fa-user-nurse mr-2"></i>Assign Staff / Update Payment
                </button>
            </div>
        `;

    } catch (error) {
        contentDiv.innerHTML = `<p class="text-red-500">Failed to load details: ${error.message}</p>`;
    }
}

function showAssignStaffModal(appointmentId, currentStaff, currentStatus) {
    document.getElementById('assign-staff-appointment-id').value = appointmentId;
    document.getElementById('staff-name').value = currentStaff || '';
    document.getElementById('payment-status').value = currentStatus || 'Pending';
    showModal('assign-staff-modal');
}

async function handleAssignStaff(e) {
    e.preventDefault();
    const appointmentId = document.getElementById('assign-staff-appointment-id').value;
    const staff_name = document.getElementById('staff-name').value;
    const payment_status = document.getElementById('payment-status').value;

    try {
        showLoading();
        const response = await fetch(`/api/doctor/update_home_visit/${appointmentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_name, payment_status })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('assign-staff-modal');
            showHomeVisitDetails(appointmentId);
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

// Function to load the children (patients) view
async function loadPatientsView() {
    console.log('Loading patients view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">My Patients</h1>
            <p class="text-gray-600">A list of all children you have treated.</p>
        </section>

        <section class="bg-white rounded-xl p-6 shadow-md">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">All Children</h3>
                <div class="relative">
                    <input type="text" id="child-search-input" placeholder="Search by name..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="p-3 text-sm font-semibold text-gray-600">Child Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Parent Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Age</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Gender</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="children-list-table">
                        <tr><td colspan="5" class="text-center p-4 text-gray-500">Loading children...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/doctor/children');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            const childrenTable = document.getElementById('children-list-table');

            const renderTable = (children) => {
                if (children && children.length > 0) {
                    childrenTable.innerHTML = children.map(child => `
                        <tr class="border-b hover:bg-gray-50 child-row" data-name="${escapeHtml(child.child_name.toLowerCase())}">
                            <td class="p-3 text-sm text-gray-700 font-medium">${escapeHtml(child.child_name)}</td>
                            <td class="p-3 text-sm text-gray-600">${escapeHtml(child.parent_name)}</td>
                            <td class="p-3 text-sm text-gray-600">${calculateAge(child.birth_date)}</td>
                            <td class="p-3 text-sm text-gray-600">${escapeHtml(child.gender)}</td>
                            <td class="p-3 text-sm">
                                <button onclick="viewChildDetails(${child.id})" class="text-blue-600 hover:text-blue-800" title="View Details">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    childrenTable.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">You have not treated any children yet.</td></tr>';
                }
            };

            renderTable(data.children);

            // Add search functionality
            document.getElementById('child-search-input').addEventListener('keyup', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredChildren = data.children.filter(child =>
                    child.child_name.toLowerCase().includes(searchTerm)
                );
                renderTable(filteredChildren);
            });

        } else {
            throw new Error(data.error || 'Failed to load children.');
        }
    } catch (error) {
        console.error('Error loading children view:', error);
        showToast(error.message, 'error');
        document.getElementById('children-list-table').innerHTML = `<tr><td colspan="5" class="text-center p-4 text-red-500">Error loading data.</td></tr>`;
    } finally {
        hideLoading();
    }
}

function loadReviewsView() {
    console.log('Loading reviews view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Reviews</h1>
            <p class="text-gray-600">View patient reviews and ratings.</p>
        </section>
        <section class="bg-white rounded-xl p-8 shadow-md text-center">
            <i class="fas fa-star text-6xl text-yellow-300 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-700">Coming Soon!</h2>
            <p class="text-gray-500 mt-2">Reviews section is under development.</p>
        </section>
    `;
}

// Function to load the reports view
async function loadReportsView() {
    console.log('Loading reports view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8 flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Reports</h1>
                <p class="text-gray-600">View and generate activity reports.</p>
            </div>
            <button onclick="printReport()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                <i class="fas fa-print mr-2"></i>Print Report
            </button>
        </section>

        <!-- Filters Section -->
        <section class="mb-6 bg-white p-4 rounded-xl shadow-md">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center space-x-2 flex-wrap gap-2">
                    <label for="report-start-date" class="text-sm font-medium text-gray-700">From:</label>
                    <input type="date" id="report-start-date" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <label for="report-end-date" class="text-sm font-medium text-gray-700 ml-2">To:</label>
                    <input type="date" id="report-end-date" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <button onclick="exportReportToCSV()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                    <i class="fas fa-file-csv mr-2"></i>Export CSV
                </button>
                <div class="relative">
                    <input type="text" id="report-search-input" placeholder="Search by name or vaccine..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
        </section>

        <!-- Report Stats -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4">
                <div class="bg-green-100 p-4 rounded-full"><i class="fas fa-check-circle text-green-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Vaccinations (Last 30d)</p>
                    <p id="report-stat-vaccinations" class="text-2xl font-bold text-gray-800 animate-pulse bg-gray-200 rounded w-12 h-8"></p>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4">
                <div class="bg-red-100 p-4 rounded-full"><i class="fas fa-calendar-times text-red-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Missed Appointments</p>
                    <p id="report-stat-missed" class="text-2xl font-bold text-gray-800 animate-pulse bg-gray-200 rounded w-12 h-8"></p>
                </div>
            </div>
        </section>

        <div id="report-content">
            <div class="bg-white rounded-xl shadow-md">
                <!-- Tabs -->
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-6 px-6" id="report-tabs">
                        <button data-tab="recent" class="tab-btn border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Recent Vaccinations
                        </button>
                        <button data-tab="missed" class="tab-btn border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                            Missed Appointments
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div class="p-6">
                    <div id="report-tab-content-recent">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="p-3 text-sm font-semibold text-gray-600">Date</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Child</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Parent</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Vaccine</th>
                                    </tr>
                                </thead>
                                <tbody id="recent-vaccinations-report"></tbody>
                            </table>
                        </div>
                    </div>
                    <div id="report-tab-content-missed" class="hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="p-3 text-sm font-semibold text-gray-600">Missed Date</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Child</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Parent</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Contact</th>
                                        <th class="p-3 text-sm font-semibold text-gray-600">Vaccine</th>
                                    </tr>
                                </thead>
                                <tbody id="missed-appointments-report"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        showLoading();
        const response = await fetch('/api/doctor/reports_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            const allRecent = data.recent_vaccinations || [];
            const allMissed = data.missed_appointments || [];

            // Update stats
            document.getElementById('report-stat-vaccinations').textContent = allRecent.length;
            document.getElementById('report-stat-vaccinations').classList.remove('animate-pulse', 'bg-gray-200');
            document.getElementById('report-stat-missed').textContent = allMissed.length;
            document.getElementById('report-stat-missed').classList.remove('animate-pulse', 'bg-gray-200');

            // Render functions for tables
            const renderRecentTable = (records) => {
                const tableBody = document.getElementById('recent-vaccinations-report');
                tableBody.innerHTML = records.length > 0 ? records.map(v => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 text-sm text-gray-700"><i class="fas fa-calendar-alt text-gray-400 mr-2"></i>${formatDate(v.administered_date)}</td>
                        <td class="p-3 text-sm text-gray-700 font-medium">${escapeHtml(v.child_name)}</td>
                        <td class="p-3 text-sm text-gray-600">${escapeHtml(v.parent_name)}</td>
                        <td class="p-3 text-sm text-gray-600">${escapeHtml(v.vaccine_name)}</td>
                    </tr>`).join('') : `<tr><td colspan="4" class="text-center p-4 text-gray-500">No recent vaccinations found.</td></tr>`;
            };

            const renderMissedTable = (records) => {
                const tableBody = document.getElementById('missed-appointments-report');
                tableBody.innerHTML = records.length > 0 ? records.map(a => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 text-sm text-red-600 font-medium"><i class="fas fa-calendar-times text-red-400 mr-2"></i>${formatDate(a.preferred_date)}</td>
                        <td class="p-3 text-sm text-gray-700 font-medium">${escapeHtml(a.child_name)}</td>
                        <td class="p-3 text-sm text-gray-600">${escapeHtml(a.parent_name)}</td>
                        <td class="p-3 text-sm text-gray-600"><a href="tel:${escapeHtml(a.parent_phone)}" class="hover:text-blue-600">${escapeHtml(a.parent_phone)}</a></td>
                        <td class="p-3 text-sm text-gray-600">${escapeHtml(a.vaccine_name)}</td>
                    </tr>`).join('') : `<tr><td colspan="5" class="text-center p-4 text-gray-500">No missed appointments found.</td></tr>`;
            };

            // Initial render
            renderRecentTable(allRecent);
            renderMissedTable(allMissed);

            // Add tab functionality
            document.getElementById('report-tabs').addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-btn')) {
                    const tab = e.target.dataset.tab;
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        btn.classList.remove('border-blue-500', 'text-blue-600');
                        btn.classList.add('border-transparent', 'text-gray-500');
                    });
                    e.target.classList.add('border-blue-500', 'text-blue-600');

                    document.getElementById('report-tab-content-recent').classList.toggle('hidden', tab !== 'recent');
                    document.getElementById('report-tab-content-missed').classList.toggle('hidden', tab !== 'missed');

                    // Trigger search to re-filter when tab changes
                    document.getElementById('report-search-input').dispatchEvent(new Event('keyup'));
                }
            });

            // Add search functionality
            document.getElementById('report-search-input').addEventListener('keyup', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const activeTab = document.querySelector('.tab-btn.border-blue-500').dataset.tab;

                if (activeTab === 'recent') {
                    const filteredRecent = allRecent.filter(v =>
                        v.child_name.toLowerCase().includes(searchTerm) ||
                        v.parent_name.toLowerCase().includes(searchTerm) ||
                        v.vaccine_name.toLowerCase().includes(searchTerm)
                    );
                    renderRecentTable(filteredRecent);
                } else {
                    const filteredMissed = allMissed.filter(a =>
                        a.child_name.toLowerCase().includes(searchTerm) ||
                        a.parent_name.toLowerCase().includes(searchTerm) ||
                        a.vaccine_name.toLowerCase().includes(searchTerm)
                    );
                    renderMissedTable(filteredMissed);
                }
            });
        } else {
            throw new Error(data.error || 'Failed to load reports.');
        }
    } catch (error) {
        console.error('Error loading reports view:', error);
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Function to export reports to CSV
function exportReportToCSV() {
    const activeTab = document.querySelector('.tab-btn.border-blue-500')?.dataset.tab || 'recent';
    const searchTerm = document.getElementById('report-search-input').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;

    const queryParams = new URLSearchParams({
        type: activeTab,
        search: searchTerm,
        start_date: startDate,
        end_date: endDate
    });

    const url = `/api/doctor/export_report?${queryParams.toString()}`;

    showToast(`Exporting ${activeTab} report...`, 'info');
    showLoading();

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok.');
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        })
        .catch(error => showToast('Failed to export report.', 'error'))
        .finally(() => hideLoading());
}

// Function to load the broadcast message view
async function loadOutreachView() {
    console.log('Loading outreach view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Patient Outreach</h1>
            <p class="text-gray-600">Send targeted messages to specific groups of parents.</p>
        </section>

        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto">
            <form id="outreach-form">
                <div class="space-y-6">
                    <div>
                        <label for="outreach-target" class="block text-sm font-medium text-gray-700 mb-2">Select Target Audience</label>
                        <select id="outreach-target" name="target_group" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Parents</option>
                            <option value="due_next_30_days">Parents of children with vaccines due in next 30 days</option>
                            <option value="missed_last_30_days">Parents who missed appointments in last 30 days</option>
                            <option value="age_0_1">Parents of children aged 0-1 year</option>
                            <option value="age_1_5">Parents of children aged 1-5 years</option>
                        </select>
                    </div>
                    <div>
                        <label for="outreach-message" class="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                        <textarea id="outreach-message" name="message" rows="6" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your message here..."></textarea>
                        <p class="text-xs text-gray-500 mt-2">This message will be sent as a notification to the selected group of parents.</p>
                    </div>
                </div>
                <div class="mt-8 text-right">
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-bullseye mr-2"></i>
                        Send Message
                    </button>
                </div>
            </form>
        </section>
    `;

    document.getElementById('outreach-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = document.getElementById('outreach-message').value;
        const targetGroup = document.getElementById('outreach-target').value;

        if (!message.trim()) {
            showToast('Message cannot be empty.', 'error');
            return;
        }

        if (!confirm(`Are you sure you want to send this message to the selected group of parents?`)) {
            return;
        }

        try {
            showLoading();
            const response = await fetch('/api/doctor/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, target_group: targetGroup })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success) {
                showToast(result.message, 'success');
                document.getElementById('outreach-message').value = '';
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            hideLoading();
        }
    });
}

// Function to load the inbox view
async function loadInboxView() {
    console.log('Loading inbox view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Inbox</h1>
            <p class="text-gray-600">View messages and replies from parents.</p>
        </section>

        <section id="inbox-list" class="bg-white rounded-xl shadow-md">
            <div class="p-6 text-center text-gray-500">Loading messages...</div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/doctor/notifications');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const inboxList = document.getElementById('inbox-list');
        if (data.notifications && data.notifications.length === 0) {
            inboxList.innerHTML = `<div class="p-8 text-center text-gray-500">
                <i class="fas fa-envelope-open-text text-4xl text-gray-300 mb-4"></i>
                <p>Your inbox is empty.</p>
            </div>`;
            return;
        }

        inboxList.innerHTML = data.notifications.map(msg => `
            <div class="p-4 border-b hover:bg-gray-50 flex justify-between items-start">
                <div>
                    <div class="flex items-center mb-2">
                        <span class="font-semibold text-gray-800 mr-2">${escapeHtml(msg.sender_name)}</span>
                        <span class="text-xs text-gray-500 rel-time" data-timestamp="${msg.created_at}" title="${new Date(String(msg.created_at).replace(/-/g, '/')).toLocaleString()}">${timeAgo(msg.created_at)}</span>
                    </div>
                    <p class="text-sm text-gray-600">${escapeHtml(msg.message)}</p>
                </div>
                <button onclick="showReplyToParentModal(${msg.sender_id}, '${escapeHtml(msg.sender_name)}')" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 flex-shrink-0">
                    <i class="fas fa-reply mr-1"></i> Reply
                </button>
            </div>
        `).join('');

    } catch (error) {
        showToast(error.message, 'error');
        document.getElementById('inbox-list').innerHTML = `<div class="p-8 text-center text-red-500">${error.message}</div>`;
    } finally {
        hideLoading();
    }
}

// Function to show the reply to parent modal
function showReplyToParentModal(parentId, parentName) {
    document.getElementById('reply-parent-id').value = parentId;
    document.getElementById('reply-modal-title').textContent = `Reply to ${parentName}`;
    document.getElementById('reply-message').value = '';
    showModal('reply-to-parent-modal');
}

// Function to handle sending a reply to a parent
async function handleSendReplyToParent(e) {
    e.preventDefault();
    const parentId = document.getElementById('reply-parent-id').value;
    const message = document.getElementById('reply-message').value;

    try {
        showLoading();
        const response = await fetch('/api/doctor/reply_to_parent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parent_id: parentId, message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('reply-to-parent-modal');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleUpdateDoctorProfile(e) {
    e.preventDefault();
    const hospital = document.getElementById('profile-hospital').value;
    const phone = document.getElementById('profile-phone').value;
    const city = document.getElementById('profile-city').value;
    const state = document.getElementById('profile-state').value;
    await updateProfile({ hospital, phone, city, state });
}

async function loadSettingsView() {
    console.log('Loading settings view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Settings</h1>
            <p class="text-gray-600">Manage your profile, availability, and account settings.</p>
        </section>

        <!-- Profile Picture Section -->
        <section class="bg-white rounded-xl p-8 shadow-md max-w-2xl mx-auto mb-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Profile Picture</h3>
            <div class="flex items-center space-x-6">
                <img id="profile-pic-preview" src="${document.getElementById('doctor-profile-pic-nav')?.src || '/images/default-avatar.png'}" alt="Profile Preview" class="h-24 w-24 rounded-full object-cover border-4 border-gray-200">
                <div>
                    <input type="file" id="profile-pic-input" class="hidden" accept="image/png, image/jpeg, image/gif">
                    <button onclick="document.getElementById('profile-pic-input').click()" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Change Picture
                    </button>
                    <button id="remove-pic-btn" class="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors ml-2">Remove</button>
                </div>
            </div>
        </section>

        <!-- Profile Information Section -->
        <section id="profile-settings-container" class="bg-white rounded-xl p-8 shadow-md max-w-4xl mx-auto mb-8">
            <!-- Profile form will be loaded here by JS -->
            <div class="text-center p-4 text-gray-500">Loading profile settings...</div>
        </section>

        <!-- Availability Settings Section -->
        <section class="bg-white rounded-xl p-8 shadow-md max-w-4xl mx-auto mt-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">Availability Settings</h3>
            <p class="text-sm text-gray-600 mb-6">Select the days and time slots you are available for appointments. Parents will only be able to book you during these times.</p>
            <form id="availability-form">
                <div id="availability-schedule" class="space-y-4">
                    <!-- Availability checkboxes will be loaded here by JS -->
                    <div class="text-center p-4 text-gray-500">Loading availability settings...</div>
                </div>
                <div class="mt-8 text-right">
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Save Availability</button>
                </div>
            </form>
        </section>
    `;

    // Load Profile Settings Form
    const profileContainer = document.getElementById('profile-settings-container');
    profileContainer.innerHTML = `
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
                    <label for="profile-hospital" class="block text-sm font-medium text-gray-700">Hospital/Clinic</label>
                    <input type="text" id="profile-hospital" name="hospital" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label for="profile-phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="profile-phone" name="phone" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="relative">
                        <label for="profile-state" class="block text-sm font-medium text-gray-700">State</label>
                        <select id="profile-state" name="state" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none">
                            <option value="">Select State</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700"><svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                    <div class="relative">
                        <label for="profile-city" class="block text-sm font-medium text-gray-700">City</label>
                        <select id="profile-city" name="city" required disabled class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none bg-gray-100 cursor-not-allowed">
                            <option value="">Select City</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700"><svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                </div>
            </div>
            <div class="mt-8 text-right">
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </form>

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

    // Attach event listeners for the newly created content
    document.getElementById('profile-pic-input').addEventListener('change', handleDoctorProfilePicUpload);
    document.getElementById('remove-pic-btn').addEventListener('click', handleRemoveDoctorProfilePic);
    document.getElementById('profile-settings-form').addEventListener('submit', handleUpdateDoctorProfile);
    document.getElementById('change-password-form').addEventListener('submit', handleInitiateDoctorPasswordChange);

    // Load availability and attach listeners
    const availabilityForm = document.getElementById('availability-form');
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', handleSaveAvailability);
    }

    // Load availability settings
    await loadDoctorAvailability();

    try {
        showLoading();
        const response = await fetch('/api/doctor/profile');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            const profile = data.profile;
            document.getElementById('profile-name').value = profile.name;
            document.getElementById('profile-email').value = profile.email;
            document.getElementById('profile-hospital').value = profile.hospital;
            document.getElementById('profile-phone').value = profile.phone;

            // Populate state and city dropdowns
            const stateDropdown = document.getElementById('profile-state');
            const cityDropdown = document.getElementById('profile-city');

            const statesResponse = await fetch('/api/states_cities');
            if (!statesResponse.ok) {
                throw new Error(`HTTP error! status: ${statesResponse.status}`);
            }
            const statesData = await statesResponse.json();
            const allStates = statesData.states || [];

            allStates.forEach(state => {
                const option = document.createElement('option');
                option.value = state.name;
                option.textContent = state.name;
                stateDropdown.appendChild(option);
            });

            // Set selected state
            stateDropdown.value = profile.state || '';

            // Function to populate cities based on selected state
            const populateCities = (selectedState) => {
                cityDropdown.innerHTML = '<option value="">Select City</option>';
                cityDropdown.disabled = true;
                cityDropdown.classList.add('bg-gray-100', 'cursor-not-allowed');
                const stateInfo = allStates.find(s => s.name === selectedState);
                if (stateInfo) {
                    stateInfo.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city;
                        option.textContent = city;
                        cityDropdown.appendChild(option);
                    });
                    cityDropdown.disabled = false;
                    cityDropdown.classList.remove('bg-gray-100', 'cursor-not-allowed');
                }
            };

            populateCities(profile.state);
            cityDropdown.value = profile.city || '';
            stateDropdown.addEventListener('change', () => populateCities(stateDropdown.value));
        } else {
            throw new Error(data.error || 'Failed to load profile.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadDoctorAvailability() {
    const container = document.getElementById('availability-schedule');
    try {
        const response = await fetch('/api/doctor/availability');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const unavailable = data.unavailable || {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

        container.innerHTML = days.map((day, index) => {
            const dayUnavailableSlots = unavailable[index] || [];
            return `
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-center border-t pt-4">
                    <div class="md:col-span-1">
                        <div class="font-semibold text-gray-700">${day}</div> 
                        <div class="mt-2">
                            <label class="text-xs text-gray-500 flex items-center">
                                <input type="checkbox" class="select-all-day mr-1 h-3 w-3" data-day-index="${index}"> All
                            </label>
                        </div>
                    </div>
                    <div class="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                        ${timeSlots.map(slot => `
                            <label class="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" name="availability" value="${index}-${slot}"
                                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                       ${!dayUnavailableSlots.includes(slot) ? 'checked' : ''}>
                                <span class="text-sm text-gray-600">${formatTime(slot)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Add select-all functionality
        container.addEventListener('change', function (e) {
            if (e.target.classList.contains('select-all-day')) {
                const dayIndex = e.target.dataset.dayIndex;
                const isChecked = e.target.checked;
                const dayContainer = e.target.closest('.grid.grid-cols-1');
                if (dayContainer) {
                    const dayCheckboxes = dayContainer.querySelectorAll(`input[name="availability"][value^="${dayIndex}-"]`);
                    dayCheckboxes.forEach(checkbox => checkbox.checked = isChecked);
                }
            }
        });

    } catch (error) {
        container.innerHTML = `<p class="text-red-500">Failed to load availability settings: ${error.message}</p>`;
    }
}

async function handleSaveAvailability(e) {
    e.preventDefault();
    const uncheckedBoxes = document.querySelectorAll('input[name="availability"]:not(:checked)');
    const unavailable = {};

    uncheckedBoxes.forEach(box => {
        const [day, time] = box.value.split('-');
        if (!unavailable[day]) {
            unavailable[day] = [];
        }
        unavailable[day].push(time);
    });

    try {
        showLoading();
        const response = await fetch('/api/doctor/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unavailable })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour, 10);
    return `${h > 12 ? h - 12 : h}:${minute} ${h >= 12 ? 'PM' : 'AM'}`;
}

// Function to update doctor profile
async function updateProfile(profileData) {
    try {
        showLoading();
        const response = await fetch('/api/doctor/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
        } else {
            throw new Error(result.error || 'Failed to update profile.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Function to handle contact admin form submission
async function submitContactAdmin(e) {
    e.preventDefault();
    const form = document.getElementById('contact-admin-form');
    const message = form.querySelector('#contact-admin-message').value;

    try {
        showLoading();
        const response = await fetch('/api/doctor/contact_admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            showToast(data.message || 'Message sent successfully!', 'success');
            form.reset();
            hideModal('contact-admin-modal');
        } else {
            throw new Error(data.error || 'Failed to send message');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleDoctorProfilePicUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile_pic', file);
    try {
        showLoading();
        const response = await fetch('/api/doctor/upload_profile_pic', { method: 'POST', body: formData });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            document.querySelectorAll('#doctor-profile-pic-nav, #doctor-profile-pic-sidebar, #profile-pic-preview').forEach(img => {
                img.src = result.profile_pic_url + '?t=' + new Date().getTime();
            });
        } else {
            throw new Error(result.error || 'Upload failed.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleRemoveDoctorProfilePic() {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    try {
        showLoading();
        const response = await fetch('/api/doctor/remove_profile_pic', { method: 'POST' });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            document.querySelectorAll('#doctor-profile-pic-nav, #doctor-profile-pic-sidebar, #profile-pic-preview').forEach(img => {
                img.src = result.profile_pic_url + '?t=' + new Date().getTime();
            });
        } else {
            throw new Error(result.error || 'Failed to remove picture.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleInitiateDoctorPasswordChange(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/doctor/initiate_password_change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'info');
            document.getElementById('current-password').parentElement.classList.add('hidden');
            document.getElementById('new-password').parentElement.classList.add('hidden');
            document.getElementById('confirm-new-password').parentElement.classList.add('hidden');
            document.getElementById('otp-field-container').classList.remove('hidden');
            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.textContent = 'Confirm & Change Password';
            e.target.removeEventListener('submit', handleInitiateDoctorPasswordChange);
            e.target.addEventListener('submit', handleFinalizeDoctorPasswordChange);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleFinalizeDoctorPasswordChange(e) {
    e.preventDefault();
    const otp = document.getElementById('password-change-otp').value;
    if (!otp || otp.length !== 6) {
        showToast('Please enter a valid 6-digit OTP.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/doctor/finalize_password_change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: otp })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
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

// Function to handle doctor account deletion
async function handleDeleteAccount(e) {
    e.preventDefault();
    const password = document.getElementById('delete-account-password').value;

    if (!password) {
        showToast('Password is required to delete your account.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/doctor/delete_account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            window.location.href = result.redirect_url;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function updateStats(stats) {
    if (!stats) return;

    const totalChildrenEl = document.getElementById('total-children');
    const totalCompletedEl = document.getElementById('total-completed');
    const upcomingAppointmentsEl = document.getElementById('upcoming-appointments-count');
    const pendingVaccinationsEl = document.getElementById('pending-vaccinations');

    if (totalChildrenEl) totalChildrenEl.textContent = stats.total_children || 0;
    if (totalCompletedEl) totalCompletedEl.textContent = stats.total_completed || 0;
    if (upcomingAppointmentsEl) upcomingAppointmentsEl.textContent = stats.upcoming_appointments || 0;
    if (pendingVaccinationsEl) pendingVaccinationsEl.textContent = stats.pending_vaccinations || 0;
}

// Function to initialize Chart.js charts
function initializeCharts(chartData) {
    if (!chartData) return;

    // Destroy existing charts if they exist
    if (window.vaccinationChart instanceof Chart) {
        window.vaccinationChart.destroy();
    }
    if (window.vaccineTypeChart instanceof Chart) {
        window.vaccineTypeChart.destroy();
    }

    // Monthly Vaccination Progress Chart
    const monthlyCtx = document.getElementById('vaccinationChart');
    if (monthlyCtx && chartData.monthly_progress) {
        const monthlyLabels = chartData.monthly_progress.map(item => {
            const date = new Date(item.month + '-02');
            return date.toLocaleString('default', { month: 'short' });
        });
        const monthlyCounts = chartData.monthly_progress.map(item => item.count);

        window.vaccinationChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: 'Total Vaccinations',
                    data: monthlyCounts,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Vaccinations' } },
                    x: { title: { display: true, text: 'Month' } }
                }
            }
        });
    }

    // Vaccine Type Doughnut Chart
    const typeCtx = document.getElementById('vaccineTypeChart');
    if (typeCtx && chartData.vaccine_types) {
        const vaccineTypeLabels = chartData.vaccine_types.map(item => item.vaccine_name);
        const vaccineTypeCounts = chartData.vaccine_types.map(item => item.count);

        window.vaccineTypeChart = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: vaccineTypeLabels.length > 0 ? vaccineTypeLabels : ['No Data'],
                datasets: [{
                    label: 'Vaccine Types Administered',
                    data: vaccineTypeCounts.length > 0 ? vaccineTypeCounts : [1],
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                        '#8B5CF6', '#6366F1', '#EC4899'
                    ],
                    hoverOffset: 4,
                    borderColor: vaccineTypeLabels.length > 0 ? '#fff' : '#e5e7eb',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
}

// Function to mark an appointment as completed
async function markAsCompleted(appointmentId) {
    if (!confirm('Are you sure you want to mark this appointment as completed? This will create a vaccination record.')) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/appointment/complete/${appointmentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            // Check if there's a next booster and show modal
            if (result.next_booster) {
                showBoosterModal(result.next_booster);
            } else {
                loadAppointmentsView();
            }
        } else {
            throw new Error(result.error || 'Failed to complete appointment.');
        }
    } catch (error) {
        console.error('Error completing appointment:', error);
        showToast(`Error: ${error.message}`, 'error');
        loadAppointmentsView();
    } finally {
        hideLoading();
    }
}

// Function to view child details in a modal
async function viewChildDetails(childId) {
    showModal('child-details-modal');
    const contentDiv = document.getElementById('child-modal-content');
    contentDiv.innerHTML = '<div class="text-center p-4">Loading details...</div>';

    try {
        const response = await fetch(`/api/doctor/child/${childId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            populateChildModal(data.child, data.history, data.child.growth_records);
        } else {
            throw new Error(data.error || 'Failed to load details.');
        }
    } catch (error) {
        contentDiv.innerHTML = `<div class="text-center p-4 text-red-500">${error.message}</div>`;
        console.error('Error fetching child details:', error);
    }
}

// Function to populate the child details modal
async function populateChildModal(child, history, growthData) {
    document.getElementById('child-modal-title').textContent = `Details for ${escapeHtml(child.name)}`;
    const contentDiv = document.getElementById('child-modal-content');

    const historyHtml = history && history.length > 0 ? history.map(rec => `
        <tr class="border-b">
            <td class="p-2">${escapeHtml(rec.vaccine_name)}</td>
            <td class="p-2">${formatDate(rec.vaccination_date)}</td>
            <td class="p-2"><span class="px-2 py-1 text-xs font-semibold rounded-full ${rec.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${rec.status}</span></td>
            <td class="p-2 text-gray-600">${escapeHtml(rec.doctor_name) || 'N/A'}</td>
            <td class="p-2 text-gray-600">
                ${rec.vaccine_price ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">₹${parseFloat(rec.vaccine_price).toFixed(2)}</span>` : 'N/A'}
            </td>
        </tr>
        `).join('') : '<tr><td colspan="5" class="text-center p-4 text-gray-500">No vaccination history found.</td></tr>';

    contentDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="bg-gray-50 p-3 rounded-lg"><strong class="text-gray-600">Parent:</strong> ${escapeHtml(child.parent_name)}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><strong class="text-gray-600">Parent Contact:</strong> ${escapeHtml(child.parent_phone) || 'N/A'}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><strong class="text-gray-600">DOB:</strong> ${formatDate(child.birth_date)}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><strong class="text-gray-600">Gender:</strong> ${escapeHtml(child.gender)}</div>
            <div class="bg-gray-50 p-3 rounded-lg"><strong class="text-gray-600">Blood Group:</strong> ${escapeHtml(child.blood_group) || 'N/A'}</div>
            <div class="bg-red-50 p-3 rounded-lg col-span-1 md:col-span-2"><strong class="text-red-700">Allergies:</strong> ${escapeHtml(child.allergies) || 'None reported'}</div>
        </div>

        <div class="mt-6">
            <h4 class="text-md font-semibold text-gray-800 mb-2">Vaccination History</h4>
            <div class="overflow-y-auto max-h-60 border rounded-lg">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-100 sticky top-0">
                        <tr>
                            <th class="p-2 font-semibold">Vaccine</th>
                            <th class="p-2 font-semibold">Date</th>
                            <th class="p-2 font-semibold">Status</th>
                            <th class="p-2 font-semibold">Administered By</th>
                            <th class="p-2 font-semibold">Price</th>
                        </tr>
                    </thead>
                    <tbody>${historyHtml}</tbody> 
                </table>
            </div>
        </div>
        ${growthData && growthData.length > 0 ? `
        <div class="mt-6">
            <h4 class="text-md font-semibold text-gray-800 mb-2">Growth Chart</h4>
            <div class="h-64"><canvas id="doctor-growth-chart-${child.id}"></canvas></div>
        </div>
        ` : ''}
    `;

    // After setting the HTML, render the chart if growth data exists
    if (child && growthData && growthData.length > 0) {
        await renderDoctorGrowthChart(child);
    }
}

// Function to hide the child details modal
function hideChildModal() {
    hideModal('child-details-modal');
}

async function renderDoctorGrowthChart(child) {
    const canvas = document.getElementById(`doctor-growth-chart-${child.id}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const growthData = child.growth_records || [];

    try {
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

        new Chart(ctx, {
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
                        spanGaps: true
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
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { display: true, title: { display: true, text: 'Age in Months' } },
                    'y-weight': { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Weight (kg)' } },
                    'y-height': { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Height (cm)' }, grid: { drawOnChartArea: false } }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering growth chart:', error);
        canvas.parentElement.innerHTML = '<p class="text-gray-500 text-center">Unable to load growth chart</p>';
    }
}

// Modal and Utility Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Function to update the upcoming appointments table on the main dashboard
function updateDashboardAppointmentsTable(appointments) {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) {
        console.error('Could not find appointments-table-body');
        return;
    }

    if (!appointments || appointments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">No upcoming appointments.</td></tr>`;
        return;
    }
    tableBody.innerHTML = appointments.map(appt => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.child_name)}</td>
            <td class="p-3 text-sm text-gray-700">${escapeHtml(appt.vaccine_name)}</td>
            <td class="p-3 text-sm text-gray-700">${formatDate(appt.preferred_date)} at ${appt.preferred_time}</td>
            <td class="p-3 text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${escapeHtml(appt.status)}
                </span>
            </td>
            <td class="p-3 text-sm">
                <button onclick="viewChildDetails(${appt.child_id})" class="text-blue-600 hover:text-blue-800 mr-2" title="View Child Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="markAsCompleted(${appt.id})" class="text-green-600 hover:text-green-800" title="Mark as Completed">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Utility Functions
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString.replace(/-/g, '/'));
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
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

// Generic function to show loading spinner
function showLoading() {
    document.getElementById('loading-spinner')?.classList.remove('hidden');
}

// Generic function to hide loading spinner
function hideLoading() {
    document.getElementById('loading-spinner')?.classList.add('hidden');
}

function timeAgo(dateString) {
    if (!dateString) return '';
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

// Refresh all relative time labels
function refreshRelativeTimes() {
    document.querySelectorAll('.rel-time').forEach(el => {
        const ts = el.getAttribute('data-timestamp');
        if (!ts) return;
        try {
            el.textContent = timeAgo(ts);
            const d = new Date(String(ts).replace(/-/g, '/'));
            if (!isNaN(d.getTime())) el.title = d.toLocaleString();
        } catch (e) {
            // ignore
        }
    });
}

// Update relative times every 30 seconds
setInterval(refreshRelativeTimes, 30000);
// Run once on script load to ensure labels are current
refreshRelativeTimes();

function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age < 1 ? 'Under 1 year' : `${age} years`;
}

// Global function to open certificate
function viewCertificate(recordId) {
    window.open(`/certificate/${recordId}`, '_blank');
}

// Function to print reports
function printReport() {
    const reportContent = document.getElementById('report-content')?.innerHTML;
    if (!reportContent) {
        showToast('No report content to print', 'error');
        return;
    }
    
    const originalContent = document.body.innerHTML;
    const doctorName = document.body.dataset.doctorName || 'Doctor';

    document.body.innerHTML = `
        <div class="p-8">
            <h1 class="text-2xl font-bold mb-2">Clinic Activity Report</h1>
            <p class="mb-6 text-gray-600">Generated by: Dr. ${escapeHtml(doctorName)} on ${new Date().toLocaleDateString()}</p>
            ${reportContent}
        </div>
        `;
    window.print();
    document.body.innerHTML = originalContent;
    loadReportsView();
}

// --- Doctor Notification Functions ---

async function fetchDoctorNotifications() {
    try {
        const response = await fetch('/api/doctor/notifications');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            updateDoctorNotificationDropdownUI(data.notifications);
        }
    } catch (error) {
        console.error('Failed to fetch doctor notifications:', error);
    }
}

function updateDoctorNotificationBadge(unreadCount) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function updateDoctorNotificationDropdownUI(notifications) {
    const list = document.getElementById('notification-list');
    const unreadCount = notifications.filter(n => !n.is_read).length;
    updateDoctorNotificationBadge(unreadCount);

    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No notifications</div>';
    } else {
        list.innerHTML = notifications.map(n => `
        <a href="#inbox" class="block p-3 hover:bg-gray-50 border-b ${!n.is_read ? 'bg-blue-50' : ''}">
                <p class="text-sm text-gray-700">${escapeHtml(n.message)}</p>
                <p class="text-xs text-gray-400 mt-1"><span class="rel-time" data-timestamp="${n.created_at}" title="${new Date(String(n.created_at).replace(/-/g, '/')).toLocaleString()}">${timeAgo(n.created_at)}</span></p>
            </a>
        `).join('');
    }
}

function toggleDoctorNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    const isHidden = dropdown.classList.toggle('hidden');

    if (!isHidden) {
        fetch('/api/doctor/notifications/mark_read', { method: 'POST' });
        setTimeout(() => fetchDoctorNotifications(), 2000);
    }
}

async function showDoctorContactAdminModal() {
    // This function now opens a modal instead of loading a new page view.
    // It doesn't clear the main content, so the dashboard stays in the background.
    console.log('Showing Contact Admin modal...');
    
    // Pre-fill form with doctor's details from the body's dataset
    document.getElementById('contact-admin-name').value = document.body.dataset.doctorName || '';
    document.getElementById('contact-admin-email').value = document.body.dataset.doctorEmail || '';
    document.getElementById('contact-admin-form').reset(); // Reset message field

    showModal('contact-admin-modal');

    // Fetch and display contact history, similar to parent dashboard
    const historyContainer = document.getElementById('contact-history-container');
    historyContainer.innerHTML = `<p class="text-center text-gray-500">Loading history...</p>`;

    try {
        const response = await fetch('/api/doctor/contact_history');
        const data = await response.json();
        if (data.success) {
            if (data.history.length === 0) {
                historyContainer.innerHTML = `<p class="text-center text-gray-500">No previous contacts found.</p>`;
            } else {
                historyContainer.innerHTML = data.history.map(contact => `
                    <div class="bg-gray-50 p-3 rounded-lg mb-2 border">
                        <p class="font-medium text-sm">${formatDate(contact.created_at)}</p>
                        <p class="text-sm text-gray-700 mt-1">${escapeHtml(contact.message)}</p>
                        ${contact.reply_message ? `<div class="mt-2 pt-2 border-t"><p class="text-sm text-green-700"><strong>Admin Reply:</strong> ${escapeHtml(contact.reply_message)}</p></div>` : ''}
                    </div>
                `).join('');
            }
        } else {
            throw new Error(data.error || 'Failed to load history.');
        }
    } catch (error) {
        console.error('Error loading contact history:', error);
        historyContainer.innerHTML = `<p class="text-center text-red-500">Failed to load contact history.</p>`;
    }
}

// Function to load the calendar view
function restoreDashboardHTML() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Check if the main dashboard content is already present to avoid unnecessary re-renders
    if (document.getElementById('stats-cards')) {
        // If dashboard content exists, just scroll to top and ensure it's visible
        document.querySelectorAll('#main-content > section').forEach(section => {
            section.classList.remove('hidden');
        });
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // If not present, rebuild it
    mainContent.innerHTML = `
        <section id="welcome-section" class="mb-8">
            <div class="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                <h1 class="text-3xl font-bold mb-2" id="welcome-message">Welcome back, ${escapeHtml(document.body.dataset.doctorName || 'Doctor')}!</h1>
                <p class="text-blue-100">Here's an overview of your clinic's activity.</p>
            </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-cards">
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-blue-100 p-4 rounded-full"><i class="fas fa-child text-blue-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Total Children</p>
                    <p id="total-children" class="text-2xl font-bold text-gray-800"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></p>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-green-100 p-4 rounded-full"><i class="fas fa-check-circle text-green-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Vaccinations Done</p>
                    <p id="total-completed" class="text-2xl font-bold text-gray-800"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></p>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-yellow-100 p-4 rounded-full"><i class="fas fa-calendar-check text-yellow-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Upcoming</p>
                    <p id="upcoming-appointments-count" class="text-2xl font-bold text-gray-800"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></p>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-red-100 p-4 rounded-full"><i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i></div>
                <div>
                    <p class="text-gray-600">Missed</p>
                    <p id="pending-vaccinations" class="text-2xl font-bold text-gray-800"><span class="animate-pulse bg-gray-300 rounded-md inline-block w-12 h-8"></span></p>
                </div>
            </div>
        </section>

        <section id="charts-section" class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div class="lg:col-span-3 bg-white rounded-xl p-6 shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Vaccination Progress</h3>
                <canvas id="vaccinationChart"></canvas>
            </div>
            <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Vaccination by Type</h3>
                <canvas id="vaccineTypeChart"></canvas>
            </div>
        </section>

        <section id="appointments-section" class="bg-white rounded-xl p-6 shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="p-3 text-sm font-semibold text-gray-600">Child Name</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Vaccine</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Date & Time</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Status</th>
                            <th class="p-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="appointments-table-body"></tbody>
                </table>
            </div>
        </section>
    `;
}

async function loadCalendarView() {
    console.log('Loading calendar view...');
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Appointment Calendar</h1>
            <p class="text-gray-600">View all your scheduled appointments.</p>
        </section>
        <div class="mb-4 flex justify-end items-center space-x-6">
            <label class="flex items-center cursor-pointer" for="show-completed-checkbox">
                <input type="checkbox" id="show-completed-checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <span class="ml-2 text-sm font-medium text-gray-700">Show Completed Appointments</span>
            </label>
            <label class="flex items-center cursor-pointer" for="show-cancelled-checkbox">
                <input type="checkbox" id="show-cancelled-checkbox" class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                <span class="ml-2 text-sm font-medium text-gray-700">Show Cancelled Appointments</span>
            </label>
        </div>
        <section class="bg-white rounded-xl p-6 shadow-md">
            <div id="calendar"></div>
        </section>
    `;

    try {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) {
            throw new Error('Calendar element not found');
        }

        const showCancelledCheckbox = document.getElementById('show-cancelled-checkbox');
        const showCompletedCheckbox = document.getElementById('show-completed-checkbox');

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: true,
            events: function (fetchInfo, successCallback, failureCallback) {
                const showCompleted = showCompletedCheckbox?.checked || false;
                const showCancelled = showCancelledCheckbox?.checked || false;
                fetch(`/api/calendar/events?show_completed=${showCompleted}&show_cancelled=${showCancelled}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => successCallback(data))
                    .catch(error => failureCallback(error));
            },
            eventClick: function (info) {
                const props = info.event.extendedProps;
                const content = `
                    <div class="space-y-3 text-sm">
                        <p><strong>Child:</strong> ${escapeHtml(props.child_name)}</p>
                        <p><strong>Parent:</strong> ${escapeHtml(props.parent_name)}</p>
                        <p><strong>Vaccine:</strong> ${escapeHtml(props.vaccine_name)}</p>
                        <p><strong>Status:</strong> <span class="px-2 py-1 text-xs font-semibold rounded-full" style="background-color: ${info.event.backgroundColor}20; color: ${info.event.backgroundColor};">${escapeHtml(props.status)}</span></p>
                        <p><strong>Notes:</strong> ${escapeHtml(props.notes) || 'None'}</p>
                    </div>
                `;
                document.getElementById('child-modal-title').textContent = `Appointment Details`;
                document.getElementById('child-modal-content').innerHTML = content;
                showModal('child-details-modal');
            },
            eventDidMount: function (info) {
                info.el.setAttribute('title', info.event.title);
            },
            eventDrop: async function (info) {
                const appointmentId = info.event.id;
                const newStartDate = info.event.start;

                const newDate = newStartDate.toISOString().split('T')[0];
                const newTime = newStartDate.toTimeString().substring(0, 5);

                if (!confirm(`Are you sure you want to move this appointment to ${newDate} at ${newTime}? The parent will be notified.`)) {
                    info.revert();
                    return;
                }

                try {
                    showLoading();
                    const response = await fetch(`/api/doctor/appointment/reschedule/${appointmentId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            preferred_date: newDate,
                            preferred_time: newTime
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    if (result.success) {
                        showToast('Appointment rescheduled successfully!', 'success');
                    } else {
                        throw new Error(result.error || 'Failed to reschedule.');
                    }
                } catch (error) {
                    showToast(error.message, 'error');
                    info.revert();
                } finally {
                    hideLoading();
                }
            }
        });

        calendar.render();

        if (showCancelledCheckbox) {
            showCancelledCheckbox.addEventListener('change', function () {
                calendar.refetchEvents();
            });
        }

        if (showCompletedCheckbox) {
            showCompletedCheckbox.addEventListener('change', function () {
                calendar.refetchEvents();
            });
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
        showToast('Failed to load calendar view', 'error');
    }
}

// Function to show the booster dose scheduling modal
function showBoosterModal(boosterInfo) {
    const today = new Date().toISOString().split('T')[0];
    const boosterDateInput = document.getElementById('booster-date');
    if (boosterDateInput) {
        boosterDateInput.min = today;
    }
    document.getElementById('booster-child-id').value = boosterInfo.child_id;
    document.getElementById('booster-vaccine-name').value = boosterInfo.vaccine_name;
    document.getElementById('booster-vaccine-display').textContent = boosterInfo.vaccine_name;
    document.getElementById('booster-date').value = boosterInfo.recommended_date;
    showModal('schedule-booster-modal');
}

// Function to handle scheduling a booster dose
async function handleScheduleBooster(e) {
    e.preventDefault();
    const boosterData = {
        child_id: document.getElementById('booster-child-id').value,
        vaccine_name: document.getElementById('booster-vaccine-name').value,
        preferred_date: document.getElementById('booster-date').value,
        preferred_time: document.getElementById('booster-time').value,
    };

    try {
        showLoading();
        const response = await fetch('/api/doctor/schedule_appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boosterData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('schedule-booster-modal');
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

// Make functions globally available for inline HTML calls
window.loadDashboardView = loadDashboardView;
window.loadPatientsView = loadPatientsView;
window.loadAppointmentsView = loadAppointmentsView;
window.loadCalendarView = loadCalendarView;
window.loadReportsView = loadReportsView;
window.loadOutreachView = loadOutreachView;
window.loadInboxView = loadInboxView;
window.loadSettingsView = loadSettingsView;
window.loadReviewsView = loadReviewsView;

window.showHomeVisitDetails = showHomeVisitDetails;
window.showAssignStaffModal = showAssignStaffModal;
window.viewChildDetails = viewChildDetails;
window.hideChildModal = hideChildModal;
window.markAsCompleted = markAsCompleted;
window.viewCertificate = viewCertificate;
window.printReport = printReport;
window.exportReportToCSV = exportReportToCSV;
window.showReplyToParentModal = showReplyToParentModal;
window.showBoosterModal = showBoosterModal;
window.showModal = showModal;
window.hideModal = hideModal;