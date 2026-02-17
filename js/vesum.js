let map;
let markers = [];
        
// Load societies from localStorage or use defaults
function getSocieties() {
    const stored = localStorage.getItem('vesumSocieties');
    if (stored) {
        return JSON.parse(stored);
    }
    const defaultSocieties = [
        { name: "Greenwood Heights", lat: 19.0760, lng: 72.8777, slots: 20, available: 8, price: 20 },
        { name: "Palm Grove Apartments", lat: 19.0896, lng: 72.8656, slots: 15, available: 5, price: 25 },
        { name: "Sunrise Residency", lat: 19.0644, lng: 72.8700, slots: 25, available: 12, price: 18 },
        { name: "Ocean View Society", lat: 19.0520, lng: 72.8820, slots: 18, available: 0, price: 22 },
        { name: "Royal Gardens", lat: 19.0820, lng: 72.8920, slots: 22, available: 3, price: 20 },
    ];
    localStorage.setItem('vesumSocieties', JSON.stringify(defaultSocieties));
    return defaultSocieties;
}

function saveSocieties(societies) {
    localStorage.setItem('vesumSocieties', JSON.stringify(societies));
}

// Check if user is logged in on page load
window.addEventListener('load', function() {
    checkUserLogin();
    loadBookingHistory();
    updateAdminStats();
});

function checkUserLogin() {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    const userPhone = localStorage.getItem('userPhone');

    if (userLoggedIn === 'true' && userPhone) {
        showUserProfile(userPhone);
    }
}

function showUserProfile(phone) {
    document.getElementById('userProfileNav').style.display = 'block';
    const maskedPhone = phone.substring(0, phone.length - 3) + 'XXX';
    document.getElementById('userPhoneDisplay').textContent = maskedPhone;
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
    if (!e.target.matches('.user-profile') && !e.target.closest('.user-profile')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

function showMyBookings() {
    document.getElementById('userDropdown').classList.remove('show');
    showPage('my-bookings');
    loadBookingHistory();
}

function logoutUser() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userPhone');
    document.getElementById('userProfileNav').style.display = 'none';
    document.getElementById('userDropdown').classList.remove('show');
    showPage('home');
    alert('You have been logged out successfully!');
}

// Register Modal Functions
function showRegisterModal() {
    document.getElementById('registerModal').classList.add('show');
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('show');
}

function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const type = document.getElementById('regType').value;

    if (!name || !email || !phone) {
        alert('Please fill all fields');
        return;
    }

    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('vesumUsers') || '[]');
    users.push({ name, email, phone, type, registeredAt: new Date().toLocaleString() });
    localStorage.setItem('vesumUsers', JSON.stringify(users));

    alert(`✅ Registration Successful!\nWelcome ${name}!`);
    closeRegisterModal();
    
    // Clear form
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
}

// Login Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('phoneStep').style.display = 'block';
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('otpSentMessage').classList.remove('show');
    document.getElementById('loginPhone').value = '';
    document.getElementById('loginOTP').value = '';
}

function sendOTP() {
    const phone = document.getElementById('loginPhone').value.trim();
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }

    document.getElementById('otpSentMessage').classList.add('show');
    document.getElementById('phoneStep').style.display = 'none';
    document.getElementById('otpStep').style.display = 'block';
}

function backToPhone() {
    document.getElementById('phoneStep').style.display = 'block';
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('otpSentMessage').classList.remove('show');
    document.getElementById('loginOTP').value = '';
}

function verifyOTP() {
    const otp = document.getElementById('loginOTP').value.trim();
    const phone = document.getElementById('loginPhone').value.trim();

    if (otp === '1234') {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userPhone', phone);

        alert('✅ Login Successful!');
        closeLoginModal();
        showUserProfile(phone);

        if (window.pendingBooking) {
            proceedWithBooking();
        }
    } else {
        alert('Invalid OTP. Please use 1234 for demo.');
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    if (pageId === 'map') {
        setTimeout(() => {
            if (!map) {
                initMap();
            }
        }, 200);
    }
}

function initMap() {
    if (map) {
        map.remove();
    }
    
    const societies = getSocieties();
    
    map = L.map('parkingMap').setView([19.0760, 72.8777], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markers = [];
    societies.forEach(society => {
        let markerColor = 'green';
        if (society.available === 0) markerColor = 'red';
        else if (society.available <= 3) markerColor = 'orange';

        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [30, 30]
        });

        const marker = L.marker([society.lat, society.lng], { icon: icon }).addTo(map);
        markers.push(marker);
        
        marker.bindPopup(`
            <div class="society-popup">
                <h3>${society.name}</h3>
                <p><strong>Total Slots:</strong> ${society.slots}</p>
                <p><strong>Available:</strong> ${society.available}</p>
                <p><strong>Price:</strong> ₹${society.price}/hour</p>
                ${society.available > 0 ? 
                    `<button class="btn btn-primary popup-btn" onclick="openBooking('${society.name}')">Book Now</button>` :
                    `<p style="color: red; font-weight: bold;">FULL</p>`
                }
            </div>
        `);
    });
}

function refreshMapData() {
    if (map) {
        markers.forEach(marker => map.removeLayer(marker));
        initMap();
        alert('✅ Map refreshed with latest data!');
    }
}

function findNearMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            map.setView([userLat, userLng], 15);
            
            L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup('You are here!')
                .openPopup();
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function openBooking(societyName) {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    
    if (userLoggedIn !== 'true') {
        window.pendingBooking = societyName;
        showLoginModal();
        return;
    }

    proceedWithBooking(societyName);
}

function proceedWithBooking(societyName) {
    const society = societyName || window.pendingBooking;
    document.getElementById('bookingSociety').value = society;
    document.getElementById('bookingPanel').style.display = 'block';
    document.getElementById('bookingPanel').scrollIntoView({ behavior: 'smooth' });
    window.pendingBooking = null;
}

function closeBooking() {
    document.getElementById('bookingPanel').style.display = 'none';
}

function confirmBooking() {
    const society = document.getElementById('bookingSociety').value;
    const vehicle = document.getElementById('vehicleNumber').value;
    const duration = document.getElementById('duration').value;
    const slot = document.getElementById('slotSelect').value;
    const userPhone = localStorage.getItem('userPhone');

    if (!vehicle) {
        alert('Please enter vehicle number');
        return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const bookingId = 'VES-2024-' + Math.floor(1000 + Math.random() * 9000);
    const timestamp = new Date().toLocaleString();

    const booking = {
        id: bookingId,
        society: society,
        vehicle: vehicle,
        slot: slot,
        duration: duration,
        otp: otp,
        phone: userPhone,
        timestamp: timestamp,
        status: 'Active'
    };

    let bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('userBookings', JSON.stringify(bookings));

    document.getElementById('otpCode').textContent = otp;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('confSociety').textContent = society;
    document.getElementById('confSlot').textContent = slot;
    document.getElementById('confDuration').textContent = duration;
    document.getElementById('confVehicle').textContent = vehicle;

    document.getElementById('bookingPanel').style.display = 'none';
    document.getElementById('bookingConfirmation').style.display = 'block';
    document.getElementById('bookingConfirmation').scrollIntoView({ behavior: 'smooth' });
}

function closeConfirmation() {
    document.getElementById('bookingConfirmation').style.display = 'none';
    document.getElementById('vehicleNumber').value = '';
}

function loadBookingHistory() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const container = document.getElementById('bookingHistoryContainer');

    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No bookings yet. Book a parking slot to see it here!</p>';
        return;
    }

    container.innerHTML = bookings.reverse().map(booking => `
        <div class="booking-history-card">
            <h4>🅿️ ${booking.society}</h4>
            <div class="booking-details">
                <div class="booking-detail-item">
                    <strong>Booking ID</strong>
                    ${booking.id}
                </div>
                <div class="booking-detail-item">
                    <strong>Vehicle</strong>
                    ${booking.vehicle}
                </div>
                <div class="booking-detail-item">
                    <strong>Slot</strong>
                    ${booking.slot}
                </div>
                <div class="booking-detail-item">
                    <strong>Duration</strong>
                    ${booking.duration} hours
                </div>
                <div class="booking-detail-item">
                    <strong>OTP</strong>
                    ${booking.otp}
                </div>
                <div class="booking-detail-item">
                    <strong>Date/Time</strong>
                    ${booking.timestamp}
                </div>
                <div class="booking-detail-item">
                    <strong>Status</strong>
                    <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Demo Login Functions (accept any credentials)
function loginSecurity() {
    alert('✅ Security Login Successful!');
    showPage('security-dashboard');
    loadSecurityBookings();
}

function loginSociety() {
    alert('✅ Society Admin Login Successful!');
    showPage('society-dashboard');
    updateSocietyStats();
}

function loginAdmin() {
    alert('✅ Admin Login Successful!');
    showPage('admin-dashboard');
    updateAdminStats();
    viewAllSocieties();
    viewAllBookings();
}

function loadSecurityBookings() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const tbody = document.getElementById('securityBookingsTable');
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No bookings today</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.slice(0, 5).map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.vehicle}</td>
            <td>${b.slot}</td>
            <td>${b.timestamp.split(',')[1]}</td>
            <td>-</td>
            <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
        </tr>
    `).join('');
}

function verifyEntry() {
    const otp = document.getElementById('entryOtp').value;
    if (otp) {
        alert('✅ Entry Verified! Vehicle allowed to enter.');
        document.getElementById('entryOtp').value = '';
    } else {
        alert('Please enter OTP');
    }
}

function markExit() {
    const vehicle = document.getElementById('exitVehicle').value;
    if (vehicle) {
        alert('✅ Exit marked for vehicle: ' + vehicle);
        document.getElementById('exitVehicle').value = '';
    } else {
        alert('Please enter vehicle number');
    }
}

// Society Dashboard Functions
function updateSocietyStats() {
    const societies = getSocieties();
    const total = societies.reduce((sum, s) => sum + s.slots, 0);
    const available = societies.reduce((sum, s) => sum + s.available, 0);
    
    document.getElementById('totalSlots').textContent = total;
    document.getElementById('availableSlots').textContent = available;
    document.getElementById('occupiedSlots').textContent = total - available;
}

function addNewSociety() {
    const name = document.getElementById('newSocietyName').value.trim();
    const lat = parseFloat(document.getElementById('newSocietyLat').value);
    const lng = parseFloat(document.getElementById('newSocietyLng').value);
    const slots = parseInt(document.getElementById('newSocietySlots').value);
    const available = parseInt(document.getElementById('newSocietyAvailable').value);
    const price = parseInt(document.getElementById('newSocietyPrice').value);

    if (!name || !lat || !lng || !slots || !available || !price) {
        alert('Please fill all fields');
        return;
    }

    const societies = getSocieties();
    societies.push({ name, lat, lng, slots, available, price });
    saveSocieties(societies);

    // Show success message
    const msg = document.getElementById('societySuccessMessage');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 5000);

    // Clear form
    document.getElementById('newSocietyName').value = '';
    document.getElementById('newSocietyLat').value = '';
    document.getElementById('newSocietyLng').value = '';
    document.getElementById('newSocietySlots').value = '';
    document.getElementById('newSocietyAvailable').value = '';
    document.getElementById('newSocietyPrice').value = '';

    // Refresh map if it's open
    if (map) {
        refreshMapData();
    }

    alert('✅ Society added to map! Visit "Find Parking" to see it.');
}

// Admin Dashboard Functions
function updateAdminStats() {
    const societies = getSocieties();
    const users = JSON.parse(localStorage.getItem('vesumUsers') || '[]');
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const revenue = bookings.length * 50; // Simulated revenue

    document.getElementById('adminTotalSocieties').textContent = societies.length;
    document.getElementById('adminTotalUsers').textContent = users.length;
    document.getElementById('adminTotalBookings').textContent = bookings.length;
    document.getElementById('adminRevenue').textContent = revenue;
}

function refreshAdminData() {
    updateAdminStats();
    viewAllSocieties();
    viewAllBookings();
    alert('✅ Admin data refreshed!');
}

function viewAllSocieties() {
    const societies = getSocieties();
    const container = document.getElementById('adminSocietiesList');
    
    if (societies.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No societies registered</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Society Name</th>
                    <th>Total Slots</th>
                    <th>Available</th>
                    <th>Price/hr</th>
                    <th>Location</th>
                </tr>
            </thead>
            <tbody>
                ${societies.map(s => `
                    <tr>
                        <td>${s.name}</td>
                        <td>${s.slots}</td>
                        <td>${s.available}</td>
                        <td>₹${s.price}</td>
                        <td>${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function viewAllBookings() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const container = document.getElementById('adminBookingsList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No bookings yet</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Society</th>
                    <th>Vehicle</th>
                    <th>User Phone</th>
                    <th>Date/Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(b => `
                    <tr>
                        <td>${b.id}</td>
                        <td>${b.society}</td>
                        <td>${b.vehicle}</td>
                        <td>${b.phone}</td>
                        <td>${b.timestamp}</td>
                        <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function deleteSociety() {
    const name = document.getElementById('deleteSocietyName').value.trim();
    
    if (!name) {
        alert('Please enter society name');
        return;
    }

    let societies = getSocieties();
    const originalLength = societies.length;
    societies = societies.filter(s => s.name !== name);

    if (societies.length === originalLength) {
        alert('❌ Society not found!');
        return;
    }

    saveSocieties(societies);
    alert('✅ Society removed successfully!');
    document.getElementById('deleteSocietyName').value = '';
    
    viewAllSocieties();
    updateAdminStats();
    
    if (map) {
        refreshMapData();
    }
}
