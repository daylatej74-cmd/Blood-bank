/**
 * LifeBank Main JavaScript File
 * Includes form validation, animations, and interactive features
 */

// ============================================
// FORM VALIDATION & MANAGEMENT
// ============================================

const formData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    bloodType: '',
    medicalHistory: [],
    password: '',
};

let currentStep = 1;

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
    const phoneRegex = /^[0-9\-\(\)\+\s]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate age (must be 18+)
 */
function validateAge(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
    }
    return age >= 18;
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
}

/**
 * Show password strength indicator
 */
function updatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const strengthBar = document.getElementById('password-strength-bar');
    
    if (!strengthBar) return;
    
    const strength = validatePasswordStrength(password);
    
    strengthBar.className = 'password-strength';
    
    switch(strength) {
        case 0:
        case 1:
            strengthBar.classList.add('strength-weak');
            break;
        case 2:
            strengthBar.classList.add('strength-fair');
            break;
        case 3:
            strengthBar.classList.add('strength-good');
            break;
        case 4:
            strengthBar.classList.add('strength-strong');
            break;
    }
}

/**
 * Validate form field
 */
function validateField(fieldId, value) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    let isValid = true;
    
    switch(fieldId) {
        case 'firstName':
        case 'lastName':
            isValid = value && value.length >= 2 && value.length <= 50;
            break;
        case 'dateOfBirth':
            isValid = value && validateAge(value);
            break;
        case 'gender':
            isValid = value && value !== '';
            break;
        case 'email':
            isValid = value && validateEmail(value);
            break;
        case 'phone':
            isValid = value && validatePhone(value);
            break;
        case 'password':
            isValid = value && value.length >= 8;
            break;
    }
    
    const inputElement = document.getElementById(fieldId);
    if (errorElement) {
        if (isValid) {
            inputElement.classList.remove('input-error');
            inputElement.classList.add('input-success');
            errorElement.classList.remove('show');
        } else {
            inputElement.classList.remove('input-success');
            inputElement.classList.add('input-error');
            errorElement.classList.add('show');
        }
    }
    
    return isValid;
}

/**
 * Validate entire form step
 */
function validateStep(stepNumber) {
    let isValid = true;
    
    if (stepNumber === 1) {
        const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'];
        fields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                if (!validateField(fieldId, input.value)) {
                    isValid = false;
                }
            }
        });
    } else if (stepNumber === 2) {
        // Validate appointment step
        const center = document.getElementById('center')?.value;
        const appointmentDate = document.getElementById('appointmentDate')?.value;
        const timeSlot = document.getElementById('timeSlot')?.value;
        
        if (!center || !appointmentDate || !timeSlot) {
            isValid = false;
        }
    } else if (stepNumber === 3) {
        // Validate confirmation
        const confirmTerms = document.getElementById('confirm-terms')?.checked;
        if (!confirmTerms) {
            showNotification('Please confirm the information to complete booking', 'error');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Move to next step
 */
function nextStep(stepNumber) {
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    const nextStepElement = document.getElementById(`step-${stepNumber + 1}`);
    
    // Basic validation for current step
    let isValid = true;
    let errorMsg = '';
    
    if (stepNumber === 1) {
        // Validate personal information
        const firstName = document.getElementById('firstName')?.value?.trim();
        const lastName = document.getElementById('lastName')?.value?.trim();
        const dateOfBirth = document.getElementById('dateOfBirth')?.value;
        const gender = document.getElementById('gender')?.value;
        const email = document.getElementById('email')?.value?.trim();
        const phone = document.getElementById('phone')?.value?.trim();
        
        if (!firstName || firstName.length < 2) {
            errorMsg = 'First name is required (minimum 2 characters)';
            isValid = false;
        } else if (!lastName || lastName.length < 2) {
            errorMsg = 'Last name is required (minimum 2 characters)';
            isValid = false;
        } else if (!dateOfBirth) {
            errorMsg = 'Date of birth is required';
            isValid = false;
        } else if (!validateAge(dateOfBirth)) {
            errorMsg = 'You must be at least 18 years old to donate';
            isValid = false;
        } else if (!gender) {
            errorMsg = 'Please select a gender';
            isValid = false;
        } else if (!email || !validateEmail(email)) {
            errorMsg = 'Please enter a valid email address';
            isValid = false;
        } else if (!phone || !validatePhone(phone)) {
            errorMsg = 'Please enter a valid phone number';
            isValid = false;
        }
    } else if (stepNumber === 2) {
        // Validate appointment details
        const center = document.getElementById('center')?.value;
        const appointmentDate = document.getElementById('appointmentDate')?.value;
        const timeSlot = document.getElementById('timeSlot')?.value;
        
        if (!center) {
            errorMsg = 'Please select a donation center';
            isValid = false;
        } else if (!appointmentDate) {
            errorMsg = 'Please select an appointment date';
            isValid = false;
        } else if (!timeSlot) {
            errorMsg = 'Please select a time slot';
            isValid = false;
        }
    }
    
    if (!isValid) {
        showNotification(errorMsg, 'error');
        return;
    }
    
    // Hide current step and show next
    if (currentStepElement) currentStepElement.classList.remove('active');
    if (nextStepElement) {
        nextStepElement.classList.add('active');
        // Update summary on final step
        if (stepNumber === 2) {
            updateAppointmentSummary();
        }
    }
    
    currentStep = stepNumber + 1;
    updateProgressBar();
}

/**
 * Move to previous step
 */
function prevStep(stepNumber) {
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    const prevStepElement = document.getElementById(`step-${stepNumber - 1}`);
    
    if (currentStepElement) currentStepElement.classList.remove('active');
    if (prevStepElement) prevStepElement.classList.add('active');
    
    currentStep = stepNumber - 1;
    updateProgressBar();
}

/**
 * Update appointment summary
 */
function updateAppointmentSummary() {
    const centerMap = {
        'downtown': 'Downtown Medical Center',
        'eastside': 'East Side Blood Bank',
        'westside': 'West Side Clinic',
        'uptown': 'Uptown Hospital',
        'midtown': 'Midtown Donation Center'
    };
    
    const bloodTypeMap = {
        'unknown': 'Not Specified'
    };
    
    const firstName = document.getElementById('firstName')?.value || '-';
    const lastName = document.getElementById('lastName')?.value || '-';
    const email = document.getElementById('email')?.value || '-';
    const phone = document.getElementById('phone')?.value || '-';
    const center = document.getElementById('center')?.value || '-';
    const appointmentDate = document.getElementById('appointmentDate')?.value || '-';
    const timeSlot = document.getElementById('timeSlot')?.value || '-';
    const bloodType = document.getElementById('bloodType')?.value || 'Not Specified';
    
    document.getElementById('summary-name').textContent = `${firstName} ${lastName}`;
    document.getElementById('summary-email').textContent = email;
    document.getElementById('summary-phone').textContent = phone;
    document.getElementById('summary-center').textContent = centerMap[center] || center;
    
    if (appointmentDate && timeSlot) {
        const date = new Date(appointmentDate);
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('summary-datetime').textContent = `${formattedDate} at ${timeSlot}`;
    }
    
    document.getElementById('summary-blood').textContent = bloodTypeMap[bloodType] || bloodType;
}

/**
 * Move to previous step
 */
function prevStep(stepNumber) {
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    const prevStepElement = document.getElementById(`step-${stepNumber - 1}`);
    
    if (currentStepElement) currentStepElement.classList.remove('active');
    if (prevStepElement) prevStepElement.classList.add('active');
    
    currentStep = stepNumber - 1;
    updateProgressBar();
}

/**
 * Update progress bar
 */
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        const percentage = (currentStep / 3) * 100;
        progressBar.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Step ${currentStep} of 3`;
    }
}

/**
 * Auto-save form data to localStorage
 */
function autoSaveFormData() {
    const form = document.getElementById('donor-registration-form');
    if (!form) return;
    
    form.addEventListener('change', () => {
        const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'];
        fields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                localStorage.setItem(`donor_${fieldId}`, input.value);
            }
        });
    });
}

/**
 * Restore form data from localStorage
 */
function restoreFormData() {
    const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'];
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const savedValue = localStorage.getItem(`donor_${fieldId}`);
        if (input && savedValue) {
            input.value = savedValue;
        }
    });
}

// ============================================
// ANIMATED NUMBER COUNTERS
// ============================================

function animateCounter(elementId, targetValue, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function observeScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.scroll-reveal').forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

function initBackToTop() {
    // Create button if it doesn't exist
    if (!document.getElementById('back-to-top')) {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.className = 'fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full hidden z-40 transition-all';
        document.body.appendChild(backToTopBtn);
    }
    
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('hidden');
        } else {
            backToTopBtn.classList.add('hidden');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// FORM FIELD VALIDATION LISTENERS
// ============================================

function initFormValidation() {
    const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone', 'password'];
    
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('blur', (e) => {
                validateField(fieldId, e.target.value);
            });
            
            input.addEventListener('input', (e) => {
                if (fieldId === 'password') {
                    updatePasswordStrength(e.target);
                }
            });
        }
    });
}

// ============================================
// TYPED.JS INITIALIZATION
// ============================================

function initTypedText() {
    const typedElement = document.getElementById('typed-text');
    if (typedElement && window.Typed) {
        new Typed('#typed-text', {
            strings: [
                'One donation at a time.',
                'Together we can make a difference.',
                'Your blood can save lives.'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            loop: true,
            loopCount: Infinity
        });
    }
}

/**
 * Initialize Blood Supply Trends Chart
 */
function initBloodSupplyChart() {
    const trendsChartElement = document.getElementById('trends-chart');
    const inventoryChartElement = document.getElementById('inventory-chart');
    
    if (!trendsChartElement && !inventoryChartElement) return;
    
    // Sample data for the last 30 days
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push((date.getMonth() + 1) + '/' + date.getDate());
    }
    
    // Blood supply data for each type (in units)
    const bloodData = {
        'O-': [8, 7, 6, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 3],
        'O+': [35, 36, 35, 34, 33, 34, 35, 36, 35, 34, 35, 36, 37, 36, 35, 34, 35, 36, 37, 38, 39, 38, 37, 36, 35, 34, 35, 36, 35, 34],
        'A-': [18, 17, 16, 15, 16, 17, 18, 19, 18, 17, 16, 17, 18, 19, 20, 19, 18, 17, 16, 15, 14, 15, 16, 17, 18, 19, 20, 19, 18, 17],
        'A+': [42, 41, 42, 43, 42, 41, 40, 41, 42, 43, 44, 43, 42, 41, 40, 41, 42, 43, 44, 45, 44, 43, 42, 41, 40, 41, 42, 43, 42, 41],
        'B-': [10, 9, 8, 7, 6, 5, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9],
        'B+': [28, 29, 28, 27, 26, 27, 28, 29, 30, 29, 28, 27, 26, 27, 28, 29, 30, 29, 28, 27, 26, 25, 26, 27, 28, 29, 30, 29, 28, 27],
        'AB-': [6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5],
        'AB+': [22, 23, 22, 21, 20, 21, 22, 23, 24, 23, 22, 21, 20, 21, 22, 23, 24, 25, 24, 23, 22, 21, 20, 21, 22, 23, 24, 23, 22, 21]
    };
    
    const chartOptions = {
        title: {
            text: 'Blood Supply Levels - Last 30 Days',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(50, 50, 50, 0.8)',
            borderColor: '#333',
            textStyle: { color: '#fff' }
        },
        legend: {
            data: Object.keys(bloodData),
            top: 'bottom'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: days,
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: 'Units Available',
            axisLabel: {
                formatter: '{value}'
            }
        },
        series: Object.entries(bloodData).map(([bloodType, data]) => ({
            name: bloodType,
            type: 'line',
            data: data,
            smooth: true,
            areaStyle: {
                opacity: 0.3
            },
            lineStyle: { width: 2 },
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
                color: getBloodTypeColor(bloodType)
            },
            areaStyle: {
                color: getBloodTypeColor(bloodType),
                opacity: 0.2
            }
        }))
    };
    
    // Initialize trends chart
    if (trendsChartElement) {
        const trendsChart = echarts.init(trendsChartElement);
        trendsChart.setOption(chartOptions);
        window.addEventListener('resize', () => trendsChart.resize());
    }
    
    // Initialize inventory chart on index.html if it exists
    if (inventoryChartElement) {
        const inventoryChart = echarts.init(inventoryChartElement);
        const inventoryOptions = {
            title: {
                text: 'Current Blood Inventory Levels',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: Object.keys(bloodData)
            },
            yAxis: {
                type: 'value',
                name: 'Units',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            series: [{
                name: 'Available Units',
                type: 'bar',
                data: Object.values(bloodData).map(arr => arr[arr.length - 1]),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#dc2626' },
                        { offset: 1, color: '#fee2e2' }
                    ])
                },
                label: {
                    show: true,
                    position: 'top'
                }
            }]
        };
        inventoryChart.setOption(inventoryOptions);
        window.addEventListener('resize', () => inventoryChart.resize());
    }
}

/**
 * Get color for blood type
 */
function getBloodTypeColor(bloodType) {
    const colors = {
        'O-': '#dc2626',  // red
        'O+': '#ef4444',  // light red
        'A-': '#3b82f6',  // blue
        'A+': '#60a5fa',  // light blue
        'B-': '#f59e0b',  // amber
        'B+': '#fbbf24',  // light amber
        'AB-': '#8b5cf6', // purple
        'AB+': '#a78bfa'  // light purple
    };
    return colors[bloodType] || '#6b7280';
}


// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Register Service Worker for offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
    
    // Initialize all features
    observeScrollReveal();
    initSmoothScroll();
    initBackToTop();
    initFormValidation();
    initTypedText();
    autoSaveFormData();
    restoreFormData();
    
    // Initialize blood supply trends chart
    initBloodSupplyChart();
    
    // Initialize Splide carousel for donor stories
    if (document.querySelector('.splide')) {
        new Splide('.splide', {
            type: 'carousel',
            perPage: 1,
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            rewind: true,
        }).mount();
    }
    
    // Add window resize listener for responsive adjustments
    window.addEventListener('resize', () => {
        // Add any responsive adjustments here
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show notification toast
 */
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    } z-50 animate-fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Debounce function for performance
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
