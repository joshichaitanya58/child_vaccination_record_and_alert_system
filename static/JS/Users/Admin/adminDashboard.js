const viewMap = {
    'dashboard': loadDashboardView,
    'vaccines': loadVaccinesView,
    'system-health': loadSystemHealthView,
    'messages': loadMessagesView,
    'activity': loadActivityLogView,
    'settings': loadSettingsView,
};

// --- VACCINE MANAGEMENT FUNCTIONS ---

async function loadVaccinesView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Manage Vaccines</h1>
                <p class="text-gray-600">Add, edit, or remove vaccines from the system.</p>
            </div>
            <button onclick="showVaccineModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add New Vaccine
            </button>
        </section>
        <section class="bg-white rounded-xl p-4 shadow-md mb-6">
            <div class="relative">
                <input type="text" id="vaccine-search" placeholder="Search by name..." class="pl-10 pr-4 py-2 border rounded-lg w-full md:w-1/3">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
        </section>
        <section class="bg-white rounded-xl p-6 shadow-md">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended Age (Days)</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Series</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="vaccines-table-body" class="bg-white divide-y divide-gray-200">
                        <tr><td colspan="7" class="p-6 text-center text-gray-500">Loading vaccines...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const searchInput = document.getElementById('vaccine-search');

    const fetchAndRenderVaccines = async () => {
        const searchTerm = searchInput.value;
        const query = new URLSearchParams({ search: searchTerm }).toString();

        try {
            showLoading();
            const response = await fetch(`/api/admin/vaccines?${query}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const tableBody = document.getElementById('vaccines-table-body');
            if (data.vaccines.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-gray-500">No vaccines found matching your search.</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.vaccines.map(v => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${v.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(v.name)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${v.recommended_age_days}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${escapeHtml(v.dosage || 'N/A')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">${v.price ? `₹${parseFloat(v.price).toFixed(2)}` : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${v.series_name ? `${escapeHtml(v.series_name)} (${v.series_number})` : 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick='showVaccineModal(${JSON.stringify(v)})' class="text-blue-600 hover:text-blue-900 mr-4" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteVaccine(${v.id}, '${escapeHtml(v.name)}')" class="text-red-600 hover:text-red-900" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            showToast(error.message, 'error');
            document.getElementById('vaccines-table-body').innerHTML = `<tr><td colspan="7" class="text-center p-6 text-red-500">Failed to load data.</td></tr>`;
        } finally {
            hideLoading();
        }
    };

    searchInput.addEventListener('keyup', fetchAndRenderVaccines);
    fetchAndRenderVaccines(); // Initial fetch
}

function showVaccineModal(vaccine = null) {
    const isEdit = vaccine !== null;
    const modal = document.getElementById('vaccine-modal');
    const form = document.getElementById('vaccine-form');

    document.getElementById('vaccine-modal-title').textContent = isEdit ? 'Edit Vaccine' : 'Add New Vaccine';
    form.reset();
    document.getElementById('vaccine-id').value = isEdit ? vaccine.id : '';

    if (isEdit) {
        document.getElementById('vaccine-name').value = vaccine.name;
        document.getElementById('vaccine-description').value = vaccine.description;
        document.getElementById('vaccine-age').value = vaccine.recommended_age_days;
        document.getElementById('vaccine-price').value = vaccine.price;
        document.getElementById('vaccine-dosage').value = vaccine.dosage;
        document.getElementById('vaccine-series-name').value = vaccine.series_name;
        document.getElementById('vaccine-series-number').value = vaccine.series_number;
    }

    showModal('vaccine-modal');
}

async function handleVaccineSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const vaccineId = form.querySelector('#vaccine-id').value;
    const isEdit = !!vaccineId;

    const vaccineData = {
        name: form.querySelector('#vaccine-name').value,
        description: form.querySelector('#vaccine-description').value,
        recommended_age_days: form.querySelector('#vaccine-age').value,
        price: form.querySelector('#vaccine-price').value,
        dosage: form.querySelector('#vaccine-dosage').value,
        series_name: form.querySelector('#vaccine-series-name').value,
        series_number: form.querySelector('#vaccine-series-number').value,
    };

    const url = isEdit ? `/api/admin/vaccine/${vaccineId}` : '/api/admin/vaccine';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        showLoading();
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vaccineData)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('vaccine-modal');
            loadVaccinesView();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteVaccine(vaccineId, vaccineName) {
    if (!confirm(`Are you sure you want to delete the vaccine "${vaccineName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/admin/vaccine/${vaccineId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            loadVaccinesView();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeInactivityTimer();
    loadDashboardView(); // Initial load of dashboard view

    document.getElementById('sidebar-nav').addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        document.querySelectorAll('#sidebar-nav .nav-link').forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');

        if (targetId === 'dashboard') {
            restoreDashboardHTML(); // Restore the main dashboard layout
            loadDashboardView(); // Then load the data into it
        } else if (targetId === 'doctors') {
            loadUsersView('doctors');
        } else if (targetId === 'parents') {
            loadUsersView('parents');
        } else if (targetId === 'messages') {
            loadMessagesView();
        } else if (targetId === 'vaccines') {
            loadVaccinesView();
        } else if (targetId === 'system-health') {
            loadSystemHealthView();
        } else if (targetId === 'settings') {
            loadSettingsView();
        } else if (targetId === 'activity') {
            loadActivityLogView();
        }
    });

    document.getElementById('vaccine-form').addEventListener('submit', handleVaccineSubmit);
    document.getElementById('add-user-form').addEventListener('submit', handleAddUser);
    document.getElementById('edit-user-form').addEventListener('submit', handleUpdateUser);
    document.getElementById('reply-message-form').addEventListener('submit', handleSendMessageReply);
    document.getElementById('cancel-delete-btn').addEventListener('click', () => hideModal('delete-confirm-modal'));
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        // The actual delete logic is handled in confirmDeleteUser
    });

    // Change Password Modal
    document.getElementById('change-password-btn').addEventListener('click', () => showModal('change-password-modal'));
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);

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

async function loadDashboardView() {
    // The HTML structure is now guaranteed to exist by restoreDashboardHTML()
    try {
        showLoading();
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const stats = data.stats;
        const statsCardsHtml = `
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-blue-100 p-4 rounded-full"><i class="fas fa-users text-blue-600 text-2xl"></i></div>
                <div><p class="text-gray-600">Total Parents</p><p class="text-2xl font-bold text-gray-800">${stats.parents}</p></div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-green-100 p-4 rounded-full"><i class="fas fa-user-md text-green-600 text-2xl"></i></div>
                <div><p class="text-gray-600">Total Doctors</p><p class="text-2xl font-bold text-gray-800">${stats.doctors}</p></div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-purple-100 p-4 rounded-full"><i class="fas fa-child text-purple-600 text-2xl"></i></div>
                <div><p class="text-gray-600">Total Children</p><p class="text-2xl font-bold text-gray-800">${stats.children}</p></div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md flex items-center space-x-4 card-hover">
                <div class="bg-yellow-100 p-4 rounded-full"><i class="fas fa-check-circle text-yellow-600 text-2xl"></i></div>
                <div><p class="text-gray-600">Completed Vaccinations</p><p class="text-2xl font-bold text-gray-800">${stats.completed_appointments}</p></div>
            </div>
        `;
        document.getElementById('stats-cards').innerHTML = statsCardsHtml;

        // Append charts section
        const unreadMessagesBadge = document.getElementById('unread-messages-badge');
        if (stats.unread_messages > 0) {
            unreadMessagesBadge.textContent = stats.unread_messages;
            unreadMessagesBadge.classList.remove('hidden');
        } else {
            unreadMessagesBadge.classList.add('hidden');
        }

        // The HTML is already in adminDashboard.html, so we just need to initialize the charts.
        // This check ensures we are on the dashboard view before trying to render charts.
        if (document.getElementById('registration-chart')) {
             initializeAdminCharts(data.charts);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function initializeAdminCharts(chartData) {
    // Destroy existing charts if they exist
    if (window.registrationChart instanceof Chart) window.registrationChart.destroy();
    if (window.userDistributionChart instanceof Chart) window.userDistributionChart.destroy();

    // --- User Registration Trends (Line Chart) ---
    const trends = chartData.registration_trends;
    const trendLabels = [...new Set(trends.map(item => item.month))].sort();
    const parentData = trendLabels.map(label => {
        const entry = trends.find(t => t.month === label && t.user_type === 'parent');
        return entry ? entry.count : 0;
    });
    const doctorData = trendLabels.map(label => {
        const entry = trends.find(t => t.month === label && t.user_type === 'doctor');
        return entry ? entry.count : 0;
    });

    const formattedTrendLabels = trendLabels.map(label => new Date(label + '-02').toLocaleString('default', { month: 'short', year: 'numeric' }));

    const regCtx = document.getElementById('registration-chart').getContext('2d');
    window.registrationChart = new Chart(regCtx, {
        type: 'line',
        data: {
            labels: formattedTrendLabels,
            datasets: [{
                label: 'Parents',
                data: parentData,
                borderColor: '#3B82F6', // Blue
                backgroundColor: '#3B82F620',
                fill: true,
                tension: 0.3
            }, {
                label: 'Doctors',
                data: doctorData,
                borderColor: '#10B981', // Green
                backgroundColor: '#10B98120',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Users' } } }
        }
    });

    // --- User Role Distribution (Doughnut Chart) ---
    const distData = chartData.user_distribution;
    const distCtx = document.getElementById('user-distribution-chart').getContext('2d');
    window.userDistributionChart = new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: ['Parents', 'Doctors'],
            datasets: [{
                data: [distData.parents, distData.doctors],
                backgroundColor: ['#3B82F6', '#10B981'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'User Role Distribution' },
                legend: { position: 'top' }
            }
        }
    });
}

async function loadUsersView(userType) {
    const title = userType.charAt(0).toUpperCase() + userType.slice(1);
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Manage ${title}</h1> 
            <button onclick="showAddUserModal('${userType.slice(0, -1)}')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add New ${userType.slice(0, -1)}
            </button>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="relative">
                    <input type="text" id="user-search" placeholder="Search by name or email..." class="pl-10 pr-4 py-2 border rounded-lg w-full">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <select id="state-filter" class="border rounded-lg px-3 py-2 w-full">
                    <option value="">Filter by State</option>
                </select>
                <div id="specialization-filter-container" class="${userType === 'doctors' ? '' : 'hidden'}">
                    <select id="specialization-filter" class="border rounded-lg px-3 py-2 w-full">
                        <option value="">Filter by Specialization</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-md overflow-hidden" id="users-table-container">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-4 text-sm font-semibold text-gray-600">Name</th>
                            <th class="p-4 text-sm font-semibold text-gray-600">Email</th>
                            <th class="p-4 text-sm font-semibold text-gray-600">Phone</th>
                            <th class="p-4 text-sm font-semibold text-gray-600">Joined On</th>
                            <th class="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th class="p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <tr><td colspan="5" class="text-center p-6 text-gray-500">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const stateFilter = document.getElementById('state-filter');
    const specializationFilter = document.getElementById('specialization-filter');
    const searchInput = document.getElementById('user-search');

    // Function to fetch and render users (scoped to this view)
    const fetchAndRenderUsers = async () => {
        const searchTerm = searchInput.value;
        const state = stateFilter.value;
        const specialization = specializationFilter.value;

        const query = new URLSearchParams({
            type: userType,
            search: searchTerm,
            state: state,
            specialization: userType === 'doctors' ? specialization : ''
        }).toString();

        try {
            showLoading();
            const response = await fetch(`/api/admin/users?${query}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            const tableBody = document.getElementById('users-table-body');
            if (data.users.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-gray-500">No ${userType} found matching the criteria.</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.users.map(user => `
                <tr class="border-b hover:bg-gray-50 ${!user.is_active ? 'bg-red-50' : ''}">
                    <td class="p-4 text-sm font-medium">${escapeHtml(user.name)}</td>
                    <td class="p-4 text-sm">${escapeHtml(user.email)}</td>
                    <td class="p-4 text-sm">${escapeHtml(user.phone || 'N/A')}</td>
                    <td class="p-4 text-sm">${formatDate(user.created_at)}</td>
                    <td class="p-4 text-sm">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${user.is_active ? 'Active' : 'Deactivated'}
                        </span>
                    </td>
                    <td class="p-4 text-sm">
                        <button onclick="toggleUserStatus('${userType.slice(0, -1)}', ${user.id}, ${user.is_active})" class="text-yellow-500 hover:text-yellow-700 mr-3" title="${user.is_active ? 'Deactivate' : 'Activate'} User"><i class="fas ${user.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i></button>
                        <button onclick="showEditUserModal('${userType === 'parents' ? 'parent' : 'doctor'}', ${user.id})" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit User"><i class="fas fa-edit"></i></button>
                        <button onclick="showViewUserModal('${userType.slice(0, -1)}', ${user.id})" class="text-green-500 hover:text-green-700 mr-3" title="View Details"><i class="fas fa-eye"></i></button>
                        <button onclick="confirmDeleteUser('${userType.slice(0, -1)}', ${user.id}, '${escapeHtml(user.name)}')" class="text-red-600 hover:text-red-800 mr-3" title="Delete User"><i class="fas fa-trash-alt"></i></button>
                        <button onclick="confirmBlacklistUser('${userType.slice(0, -1)}', ${user.id}, '${escapeHtml(user.name)}', '${escapeHtml(user.email)}')" class="text-black hover:text-red-800" title="Blacklist User"><i class="fas fa-user-lock"></i></button>
                    </td>
                </tr>
            `).join('');

            // Populate state filter only once
            if (stateFilter.options.length <= 1) {
                data.filters.states.forEach(s => {
                    stateFilter.add(new Option(s, s));
                });
            }

        } catch (error) {
            showToast(error.message, 'error');
            document.getElementById('users-table-body').innerHTML = `<tr><td colspan="5" class="text-center p-6 text-red-500">Failed to load data.</td></tr>`;
        } finally {
            hideLoading();
        }
    };

    // Populate specialization filter if it's for doctors
    if (userType === 'doctors') {
        // Specialization filter population would go here
        // This would typically come from the API response
    }

    // Add event listeners for filters
    searchInput.addEventListener('keyup', () => fetchAndRenderUsers());
    stateFilter.addEventListener('change', () => fetchAndRenderUsers());
    if (userType === 'doctors') specializationFilter.addEventListener('change', () => fetchAndRenderUsers());

    // Initial fetch
    fetchAndRenderUsers();
}

async function showAddUserModal(userType) {
    showModal('add-user-modal');
    document.getElementById('add-user-modal-title').textContent = `Add New ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
    document.getElementById('add-user-type').value = userType;
    document.getElementById('add-user-form').reset(); // Clear form

    const specificFieldsContainer = document.getElementById('add-user-specific-fields');
    let formHtml = '';

    // Fetch states and cities for dropdowns
    const statesResponse = await fetch('/api/states_cities');
    const statesData = await statesResponse.json();
    const allStates = statesData.states;

    const populateStatesDropdown = (id, selectedValue = '') => {
        let options = '<option value="">Select State</option>';
        allStates.forEach(state => {
            options += `<option value="${state.name}" ${state.name === selectedValue ? 'selected' : ''}>${state.name}</option>`;
        });
        return `
            <label for="${id}" class="block text-sm font-medium text-gray-700">State</label>
            <select id="${id}" name="state" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">${options}</select>
        `;
    };

    const populateCitiesDropdown = (id, stateId, selectedValue = '') => {
        let options = '<option value="">Select City</option>';
        const selectedState = document.getElementById(stateId)?.value;
        const stateData = allStates.find(s => s.name === selectedState);
        if (stateData) {
            stateData.cities.forEach(city => {
                options += `<option value="${city}" ${city === selectedValue ? 'selected' : ''}>${city}</option>`;
            });
        }
        return `
            <label for="${id}" class="block text-sm font-medium text-gray-700">City</label>
            <select id="${id}" name="city" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" ${!selectedState ? 'disabled' : ''}>${options}</select>
        `;
    };

    if (userType === 'parent') {
        formHtml = `
            <div>
                <label for="add-user-address" class="block text-sm font-medium text-gray-700">Address</label>
                <textarea id="add-user-address" name="address" rows="2" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>${populateStatesDropdown('add-user-state')}</div>
            <div>${populateCitiesDropdown('add-user-city', 'add-user-state')}</div>
        `;
    } else { // doctor
        formHtml = `
            <div>
                <label for="add-user-license" class="block text-sm font-medium text-gray-700">License Number</label>
                <input type="text" id="add-user-license" name="license_number" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="add-user-specialization" class="block text-sm font-medium text-gray-700">Specialization</label>
                <input type="text" id="add-user-specialization" name="specialization" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="add-user-hospital" class="block text-sm font-medium text-gray-700">Hospital</label>
                <input type="text" id="add-user-hospital" name="hospital" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>${populateStatesDropdown('add-user-state')}</div>
            <div>${populateCitiesDropdown('add-user-city', 'add-user-state')}</div>
        `;
    }
    specificFieldsContainer.innerHTML = formHtml;

    // Add event listener for state dropdown to dynamically populate cities
    document.getElementById('add-user-state').addEventListener('change', (e) => {
        const selectedState = e.target.value;
        const cityDropdown = document.getElementById('add-user-city');
        cityDropdown.innerHTML = '<option value="">Select City</option>';
        cityDropdown.disabled = true;
        if (selectedState) {
            const stateData = allStates.find(s => s.name === selectedState);
            if (stateData) {
                stateData.cities.forEach(city => {
                    cityDropdown.innerHTML += `<option value="${city}">${city}</option>`;
                });
                cityDropdown.disabled = false;
            }
        }
    });
}

async function showAddUserModal(userType) {
    showModal('add-user-modal');
    document.getElementById('add-user-modal-title').textContent = `Add New ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
    document.getElementById('add-user-type').value = userType;
    document.getElementById('add-user-form').reset(); // Clear form

    const specificFieldsContainer = document.getElementById('add-user-specific-fields');
    let formHtml = '';

    // Fetch states and cities for dropdowns
    const statesResponse = await fetch('/api/states_cities');
    const statesData = await statesResponse.json();
    const allStates = statesData.states;

    const populateStatesDropdown = (id, selectedValue = '') => {
        let options = '<option value="">Select State</option>';
        allStates.forEach(state => {
            options += `<option value="${state.name}" ${state.name === selectedValue ? 'selected' : ''}>${state.name}</option>`;
        });
        return `
            <label for="${id}" class="block text-sm font-medium text-gray-700">State</label>
            <select id="${id}" name="state" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">${options}</select>
        `;
    };

    const populateCitiesDropdown = (id, stateId, selectedValue = '') => {
        let options = '<option value="">Select City</option>';
        const selectedState = document.getElementById(stateId)?.value;
        const stateData = allStates.find(s => s.name === selectedState);
        if (stateData) {
            stateData.cities.forEach(city => {
                options += `<option value="${city}" ${city === selectedValue ? 'selected' : ''}>${city}</option>`;
            });
        }
        return `
            <label for="${id}" class="block text-sm font-medium text-gray-700">City</label>
            <select id="${id}" name="city" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" ${!selectedState ? 'disabled' : ''}>${options}</select>
        `;
    };

    if (userType === 'parent') {
        formHtml = `
            <div>
                <label for="add-user-address" class="block text-sm font-medium text-gray-700">Address</label>
                <textarea id="add-user-address" name="address" rows="2" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>${populateStatesDropdown('add-user-state')}</div>
            <div>${populateCitiesDropdown('add-user-city', 'add-user-state')}</div>
        `;
    } else { // doctor
        formHtml = `
            <div>
                <label for="add-user-license" class="block text-sm font-medium text-gray-700">License Number</label>
                <input type="text" id="add-user-license" name="license_number" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="add-user-specialization" class="block text-sm font-medium text-gray-700">Specialization</label>
                <input type="text" id="add-user-specialization" name="specialization" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="add-user-hospital" class="block text-sm font-medium text-gray-700">Hospital</label>
                <input type="text" id="add-user-hospital" name="hospital" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>${populateStatesDropdown('add-user-state')}</div>
            <div>${populateCitiesDropdown('add-user-city', 'add-user-state')}</div>
        `;
    }
    specificFieldsContainer.innerHTML = formHtml;

    // Add event listener for state dropdown to dynamically populate cities
    document.getElementById('add-user-state').addEventListener('change', (e) => {
        const selectedState = e.target.value;
        const cityDropdown = document.getElementById('add-user-city');
        cityDropdown.innerHTML = '<option value="">Select City</option>';
        cityDropdown.disabled = true;
        if (selectedState) {
            const stateData = allStates.find(s => s.name === selectedState);
            if (stateData) {
                stateData.cities.forEach(city => {
                    cityDropdown.innerHTML += `<option value="${city}">${city}</option>`;
                });
                cityDropdown.disabled = false;
            }
        }
    });
}

async function handleAddUser(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const userType = data.user_type;
    try {
        showLoading();
        const response = await fetch('/api/admin/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('add-user-modal');
            loadUsersView(userType + 's'); // Reload the table
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function showViewUserModal(userType, userId) {
    showModal('view-user-modal');
    const contentDiv = document.getElementById('view-user-modal-content');
    contentDiv.innerHTML = `<div class="text-center p-4">Loading user data...</div>`;

    try {
        const response = await fetch(`/api/admin/user/${userType}/${userId}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const user = data.user;
        document.getElementById('view-user-modal-title').textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Details: ${escapeHtml(user.name)}`;

        let detailsHtml = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Name:</strong> ${escapeHtml(user.name)}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Email:</strong> ${escapeHtml(user.email)}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Phone:</strong> ${escapeHtml(user.phone || 'N/A')}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Joined:</strong> ${formatDate(user.created_at)}</div>
                
        `;
        if (userType === 'parent') {
            detailsHtml += `<div class="bg-gray-50 p-3 rounded-lg col-span-2"><strong>Address:</strong> ${escapeHtml(user.address || 'N/A')}</div>`;
        } else { // doctor
            detailsHtml += `
                <div class="bg-gray-50 p-3 rounded-lg"><strong>License:</strong> ${escapeHtml(user.license_number || 'N/A')}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Specialization:</strong> ${escapeHtml(user.specialization || 'N/A')}</div>
                <div class="bg-gray-50 p-3 rounded-lg col-span-2"><strong>Hospital:</strong> ${escapeHtml(user.hospital || 'N/A')}</div>
            `;
        }
        detailsHtml += `
                <div class="bg-gray-50 p-3 rounded-lg"><strong>City:</strong> ${escapeHtml(user.city || 'N/A')}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>State:</strong> ${escapeHtml(user.state || 'N/A')}</div>
                <div class="bg-gray-50 p-3 rounded-lg"><strong>Country:</strong> ${escapeHtml(user.country || 'N/A')}</div>
            </div>
        `;
        contentDiv.innerHTML = detailsHtml;
    } catch (error) {
        showToast(error.message, 'error');
        contentDiv.innerHTML = `<div class="text-center p-4 text-red-500">Failed to load user data.</div>`;
    }
}

async function showEditUserModal(userType, userId) {
    showModal('edit-user-modal');
    const formContent = document.getElementById('edit-user-specific-fields');
    formContent.innerHTML = `<div class="text-center p-4">Loading user data...</div>`;

    try {
        const response = await fetch(`/api/admin/user/${userType}/${userId}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const user = data.user;
        document.getElementById('edit-user-modal-title').textContent = `Edit ${userType.charAt(0).toUpperCase() + userType.slice(1)}: ${escapeHtml(user.name)}`;
        document.getElementById('edit-user-id').value = user.id; // Set the hidden user ID here
        
        // Fetch states and cities for dropdowns
        const statesResponse = await fetch('/api/states_cities');
        const statesData = await statesResponse.json();
        const allStates = statesData.states;

        const populateStatesDropdown = (id, selectedValue = '') => {
            let options = '<option value="">Select State</option>';
            allStates.forEach(state => {
                options += `<option value="${state.name}" ${state.name === selectedValue ? 'selected' : ''}>${state.name}</option>`;
            });
            return `
                <div>
                    <label for="${id}" class="block text-sm font-medium text-gray-700">State</label>
                    <select id="${id}" name="state" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">${options}</select>
                </div>
            `;
        };

        let formHtml = `
            <input type="hidden" name="user_type" value="${userType}">
            <div>
                <label for="edit-user-name" class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="edit-user-name" name="name" value="${escapeHtml(user.name)}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label for="edit-user-email" class="block text-sm font-medium text-gray-700">Email (Read-only)</label>
                <input type="email" id="edit-user-email" name="email" value="${escapeHtml(user.email)}" readonly class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed">
            </div>
            <div>
                <label for="edit-user-phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" id="edit-user-phone" name="phone" value="${escapeHtml(user.phone || '')}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
        `;

        if (userType === 'parent') {
            formHtml += `
                <div>
                    <label class="block text-sm font-medium text-gray-700">Address</label>
                    <textarea id="edit-user-address" name="address" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">${escapeHtml(user.address || '')}</textarea>
                </div>
                ${populateStatesDropdown('edit-user-state', user.state)}
                <div>
                    <label for="edit-user-city" class="block text-sm font-medium text-gray-700">City</label>
                    <select id="edit-user-city" name="city" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></select>
                </div>
            `;
        } else { // doctor
            formHtml += `
                <div>
                    <label class="block text-sm font-medium text-gray-700">License Number</label>
                    <input type="text" id="edit-user-license" name="license_number" value="${escapeHtml(user.license_number || '')}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Hospital/Clinic</label>
                    <input type="text" id="edit-user-hospital" name="hospital" value="${escapeHtml(user.hospital || '')}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Specialization</label>
                    <input type="text" id="edit-user-specialization" name="specialization" value="${escapeHtml(user.specialization || '')}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                ${populateStatesDropdown('edit-user-state', user.state)}
                <div>
                    <label for="edit-user-city" class="block text-sm font-medium text-gray-700">City</label>
                    <select id="edit-user-city" name="city" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></select>
                </div>
            `;
        }
        formContent.innerHTML = formHtml;

        // Populate cities for the selected state
        const cityDropdown = document.getElementById('edit-user-city');
        const stateDropdown = document.getElementById('edit-user-state');
        const populateCitiesForEdit = (selectedState, selectedCity = '') => {
            cityDropdown.innerHTML = '<option value="">Select City</option>';
            cityDropdown.disabled = true;
            if (selectedState) {
                const stateData = allStates.find(s => s.name === selectedState);
                if (stateData) {
                    stateData.cities.forEach(city => {
                        cityDropdown.innerHTML += `<option value="${city}" ${city === selectedCity ? 'selected' : ''}>${city}</option>`;
                    });
                    cityDropdown.disabled = false;
                }
            }
        };
        populateCitiesForEdit(user.state, user.city);
        stateDropdown.addEventListener('change', (e) => populateCitiesForEdit(e.target.value));

    } catch (error) {
        showToast(error.message, 'error');
        formContent.innerHTML = `<div class="text-center p-4 text-red-500">Failed to load user data.</div>`;
    }
}

function showHealthDetailsModal(serviceName, status, message) {
    const titleEl = document.getElementById('health-details-title');
    const contentEl = document.getElementById('health-details-content');
    const isOk = status === 'OK';

    titleEl.textContent = `${serviceName} Status`;
    contentEl.innerHTML = `<p><strong>Status:</strong> <span class="${isOk ? 'text-green-600' : 'text-red-600'} font-semibold">${status}</span></p>
                           <p class="mt-2"><strong>Details:</strong></p>
                           <pre class="whitespace-pre-wrap text-gray-700">${escapeHtml(message)}</pre>`;
    showModal('health-details-modal');
}

async function loadSystemHealthView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">System Health Status</h1>
            <p class="text-gray-600">Live status of critical system components.</p>
        </section>
        <section id="health-status-container" class="space-y-6">
            <!-- Skeleton Loader -->
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse">
                <div class="flex justify-between items-center">
                    <div class="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div class="h-8 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse">
                <div class="flex justify-between items-center">
                    <div class="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div class="h-8 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </section>
    `;

    try {
        showLoading();
        const response = await fetch('/api/admin/system_health');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const status = data.status;
        const container = document.getElementById('health-status-container');
        
        const renderStatus = (service, name) => {
            const isOk = service.status === 'OK';
            const bgColor = isOk ? 'bg-green-100' : 'bg-red-100';
            const textColor = isOk ? 'text-green-800' : 'text-red-800';
            const icon = isOk ? 'fa-check-circle' : 'fa-exclamation-triangle';

            // Create a div element and attach an event listener to it
            const div = document.createElement('div');
            div.className = `bg-white rounded-xl p-6 shadow-md border-l-4 ${isOk ? 'border-green-500' : 'border-red-500'} cursor-pointer hover:shadow-lg transition-shadow`;
            div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-gray-800">${name}</h3>
                        <span class="px-4 py-2 text-sm font-bold rounded-full ${bgColor} ${textColor}"><i class="fas ${icon} mr-2"></i>${service.status}</span>
                    </div>
            `;
            div.addEventListener('click', () => {
                showHealthDetailsModal(name, service.status, service.message);
            });
            return div;
        };

        // Clear the container and append the new elements
        container.innerHTML = '';
        const dbStatusElement = renderStatus(status.database, 'Database Connection');
        const emailStatusElement = renderStatus(status.email, 'Email Service');
        
        container.appendChild(dbStatusElement);
        container.appendChild(emailStatusElement);

    } catch (error) { showToast(error.message, 'error'); } finally { hideLoading(); }
}

async function handleUpdateUser(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userId = formData.get('user_id');
    const userType = formData.get('user_type');
    const data = Object.fromEntries(formData.entries());

    try {
        showLoading();
        const response = await fetch(`/api/admin/user/${userType}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('edit-user-modal');
            loadUsersView(userType + 's'); // Reload the table
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function confirmDeleteUser(userType, userId, userName) {
    const message = `Do you really want to delete the user: <strong>${userName}</strong>? This process cannot be undone.`;
    document.getElementById('delete-confirm-message').innerHTML = message;
    showModal('delete-confirm-modal');

    const confirmBtn = document.getElementById('confirm-delete-btn');

    // Clone and replace the button to remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => deleteUser(userType, userId));
}

async function loadContactMessagesView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Contact Form Messages</h1>
        </div>
        <div id="messages-container" class="space-y-4">
            <p class="text-center text-gray-500">Loading messages...</p>
        </div>
    `;

    try {
        showLoading();
        const response = await fetch('/api/admin/contact_messages');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById('messages-container');
        if (!data.messages || data.messages.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500">No messages found.</p>`;
            return;
        }

        container.innerHTML = data.messages.map(msg => `
            <div id="message-${msg.id}" class="bg-white rounded-lg shadow-md p-5 border-l-4 ${msg.is_read ? 'border-gray-300' : 'border-blue-500'}">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-lg text-gray-800">${escapeHtml(msg.name)}</p>
                        <a href="mailto:${escapeHtml(msg.email)}" class="text-sm text-blue-600">${escapeHtml(msg.email)}</a>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500">${formatDate(msg.created_at, true)}</p>
                        <div class="mt-2 space-x-2">
                            <button onclick="showReplyModal(${msg.id}, '${escapeHtml(msg.email)}', 'Re: Inquiry from ${escapeHtml(msg.name)}', '${escapeHtml(msg.name)}')" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200"><i class="fas fa-reply"></i> Reply</button>
                            ${!msg.is_read ? `<button onclick="markMessageAsRead(${msg.id})" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200">Mark as Read</button>` : ''}
                        </div>
                    </div>
                </div>
                <p class="mt-4 text-gray-700 whitespace-pre-wrap">${escapeHtml(msg.message)}</p>
                ${msg.reply_message ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.textContent = this.nextElementSibling.classList.contains('hidden') ? 'Show Reply' : 'Hide Reply';" 
                                class="text-sm font-medium text-blue-600 hover:text-blue-800">Show Reply</button>
                        <div class="hidden mt-2">
                            <div class="flex items-center text-sm text-green-700">
                                <i class="fas fa-check-circle mr-2"></i>
                                <p><strong>Replied by ${escapeHtml(msg.admin_name || 'Admin')}</strong> on ${formatDate(msg.replied_at, true)}</p>
                            </div>
                            <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">${escapeHtml(msg.reply_message)}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function markMessageAsRead(messageId) {
    try {
        const response = await fetch(`/api/admin/contact_message/mark_read/${messageId}`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            loadContactMessagesView(); // Reload the view to update UI
            // No need to reload entire dashboard, just update badge
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function showReplyModal(messageId, email, subject, name) {
    document.getElementById('reply-message-id').value = messageId;
    document.getElementById('reply-to-email').value = email;
    document.getElementById('reply-subject').value = subject;

    const replyBodyTemplate = `Hello ${name},

    [Your reply here]

Best regards,
The Vaccine Track Admin Team`;

    document.getElementById('reply-body').value = replyBodyTemplate;
    showModal('reply-message-modal');
}

async function handleSendMessageReply(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        showLoading();
        const response = await fetch('/api/admin/reply_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('reply-message-modal');
            form.reset();
            // Reload views to update message status and badge count
            // Just reload the dashboard view. It will update the unread count.
            loadDashboardView(); // Reload dashboard to update badge
            loadContactMessagesView(); // Reload the current view
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function confirmDeleteUser(userType, userId, userName) {
    const message = `Do you really want to delete the user: <strong>${userName}</strong>? This process cannot be undone.`;
    document.getElementById('delete-confirm-message').innerHTML = message;
    showModal('delete-confirm-modal');

    const confirmBtn = document.getElementById('confirm-delete-btn');

    // Clone and replace the button to remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => deleteUser(userType, userId));
}

function confirmBlacklistUser(userType, userId, userName, userEmail) {
    const reason = prompt(`You are about to permanently blacklist and delete the user:\n\nName: ${userName}\nEmail: ${userEmail}\n\nThis action cannot be undone. Please provide a reason for blacklisting:`);

    if (reason === null) { // User clicked cancel
        return;
    }

    if (reason.trim() === '') {
        showToast('A reason is required to blacklist a user.', 'error');
        return;
    }

    blacklistUser(userType, userId, reason);
}

async function blacklistUser(userType, userId, reason) {
    try {
        showLoading();
        const response = await fetch(`/api/admin/user/${userType}/${userId}/blacklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: reason })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            loadUsersView(userType + 's'); // Reload the view
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadActivityLogView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">User Activity Log</h1>
                <p class="text-gray-600">A record of all significant actions taken by users.</p>
            </div>
        </div>
        <div id="activity-log-container" class="bg-white rounded-xl shadow-md p-6">
            <p class="text-center text-gray-500">Loading activity...</p>
        </div>
    `;

    try {
        showLoading();
        const response = await fetch('/api/admin/activity_log');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById('activity-log-container');
        if (!data.logs || data.logs.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500">No user activity found.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="relative">
                <!-- Vertical line for timeline -->
                <div class="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
                <div class="space-y-8">
                    ${data.logs.map(log => `
                        <div class="relative pl-12">
                            <div class="absolute left-5 top-1.5 w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2"></div>
                            <p class="text-sm text-gray-500">${formatDate(log.created_at, true)}</p>
                            <p class="font-medium text-gray-800">
                                <strong class="font-semibold">${escapeHtml(log.user_name || 'A user')}</strong>
                                (${log.user_type}) performed action: 
                                <span class="font-semibold text-blue-600">${escapeHtml(log.action)}</span>
                            </p>
                            ${log.details ? `<p class="text-sm text-gray-600 mt-1 pl-4 border-l-2 border-gray-200">${escapeHtml(log.details)}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadContactMessagesView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Contact Form Messages</h1>
                <p class="text-gray-600">Messages sent from the public contact form and by users.</p>
            </div>
        </div>
        <div id="messages-container" class="space-y-4">
            <p class="text-center text-gray-500">Loading messages...</p>
        </div>
    `;

    try {
        showLoading();
        const response = await fetch('/api/admin/contact_messages');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);

        const container = document.getElementById('messages-container');
        if (!data.messages || data.messages.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-lg p-8 text-center text-gray-500"><p>No messages found.</p></div>`;
            return;
        }

        container.innerHTML = `
            ${data.messages.map(msg => `
            <div id="message-${msg.id}" class="bg-white rounded-lg shadow-md p-5 border-l-4 ${msg.is_read ? 'border-gray-300' : 'border-blue-500'}">
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-lg text-gray-800">${escapeHtml(msg.name)}</p>
                            <a href="mailto:${escapeHtml(msg.email)}" class="text-sm text-blue-600">${escapeHtml(msg.email)}</a>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-gray-500">${formatDate(msg.created_at, true)}</p>
                            <div class="mt-2 space-x-2">
                                <button onclick="showReplyModal(${msg.id}, '${escapeHtml(msg.email)}', 'Re: Inquiry from ${escapeHtml(msg.name)}', '${escapeHtml(msg.name)}')" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200"><i class="fas fa-reply"></i> Reply</button>
                                ${!msg.is_read ? `<button onclick="markMessageAsRead(${msg.id})" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200">Mark as Read</button>` : ''}
                            </div>
                        </div>
                    </div>
                    <p class="mt-4 text-gray-700 whitespace-pre-wrap">${escapeHtml(msg.message)}</p>
                </div>
            </div>
        `).join('')}`;
    } catch (error) {
        showToast(error.message, 'error');
    } finally { hideLoading(); }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.new_password !== data.confirm_new_password) {
        showToast('New passwords do not match.', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch('/api/admin/change_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            hideModal('change-password-modal');
            form.reset();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function deleteUser(userType, userId) {
    hideModal('delete-confirm-modal');
    try {
        showLoading();
        const response = await fetch(`/api/admin/user/${userType}/${userId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            loadUsersView(userType + 's'); // Reload the view
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function toggleUserStatus(userType, userId, isActive) {
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/admin/user/${userType}/${userId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !isActive })
        });

        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
            // Reload the current view to see the change
            const currentView = document.querySelector('#sidebar-nav .active-link')?.getAttribute('href').substring(1) || 'dashboard';
            if (currentView === 'doctors' || currentView === 'parents') {
                loadUsersView(currentView);
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function restoreDashboardHTML() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Check if the main dashboard content is already present to avoid unnecessary re-renders
    if (document.getElementById('stats-cards')) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // If not present, rebuild it
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <div id="stats-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Stats cards will be loaded here -->
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div>
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div>
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div>
            <div class="bg-white rounded-xl p-6 shadow-md animate-pulse"><div class="h-16 bg-gray-200 rounded"></div></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div class="lg:col-span-3 bg-white rounded-xl p-6 shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">User Registration Trends (Last 12 Months)</h3>
                <div class="h-80">
                    <canvas id="registration-chart"></canvas>
                </div>
            </div>
            <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">User Role Distribution</h3>
                <div class="h-80 flex items-center justify-center">
                    <canvas id="user-distribution-chart"></canvas>
                </div>
            </div>
        </div>
    `;
}

// --- UTILITY FUNCTIONS ---

function showModal(modalId) {
    document.getElementById(modalId)?.classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId)?.classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading-spinner')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner')?.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMessage || !toastIcon) return;

    toastMessage.textContent = message;
    if (type === 'error') {
        toast.className = toast.className.replace('bg-green-600', 'bg-red-600');
        toastIcon.className = 'fas fa-exclamation-triangle';
    } else {
        toast.className = toast.className.replace('bg-red-600', 'bg-green-600');
        toastIcon.className = 'fas fa-check-circle';
    }

    toast.classList.remove('translate-x-full');
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 4000);
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

function formatDate(dateString, includeTime = false) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(date.getTime() + (date.getTimezoneOffset() * 60000)).toLocaleDateString('en-GB', options);
    } catch (e) {
        return dateString;
    }
}

function loadMessagesView() {
    loadContactMessagesView();
}

// Placeholder function for settings view
function loadSettingsView() {
    // Implementation for settings view would go here
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Settings</h1>
        </div>
        <div class="bg-white rounded-xl shadow-md p-6">
            <p class="text-center text-gray-500">Settings view - Coming soon</p>
        </div>
    `;
}

// --- INACTIVITY TIMER ---

function initializeInactivityTimer() {
    let inactivityTimer;
    let countdownTimer;
    let countdownValue;

    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes (must match backend)
    const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes before timeout

    function showInactivityModal() {
        showModal('inactivity-modal');
        countdownValue = WARNING_TIME_MS / 1000;
        updateCountdownDisplay();

        countdownTimer = setInterval(() => {
            countdownValue--;
            updateCountdownDisplay();
            if (countdownValue <= 0) {
                clearInterval(countdownTimer);
                window.location.href = '/logout'; // Logout if no action
            }
        }, 1000);
    }

    function updateCountdownDisplay() {
        const minutes = Math.floor(countdownValue / 60);
        const seconds = countdownValue % 60;
        document.getElementById('inactivity-countdown').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async function resetInactivityTimer() {
        // Clear existing timers
        clearTimeout(inactivityTimer);
        clearInterval(countdownTimer);
        hideModal('inactivity-modal');

        // Set a new timer to show the warning modal
        inactivityTimer = setTimeout(showInactivityModal, INACTIVITY_TIMEOUT_MS - WARNING_TIME_MS);
    }

    async function stayLoggedIn() {
        try {
            const response = await fetch('/api/session/ping', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showToast('Your session has been extended.', 'success');
                resetInactivityTimer();
            } else {
                // If ping fails, it might mean the session is already dead
                window.location.href = '/admin/login';
            }
        } catch (error) {
            showToast('Could not extend session. Please log in again.', 'error');
            window.location.href = '/admin/login';
        }
    }

    // Event listeners for user activity
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true });
    window.addEventListener('keydown', resetInactivityTimer, { passive: true });
    window.addEventListener('scroll', resetInactivityTimer, { passive: true });
    window.addEventListener('click', resetInactivityTimer, { passive: true });

    // Modal button listeners
    document.getElementById('inactivity-stay-btn').addEventListener('click', stayLoggedIn);

    // Initial start of the timer
    resetInactivityTimer();
}