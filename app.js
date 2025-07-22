// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuToggle.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        menuToggle.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            mobileMenu.classList.add('hidden');
            menuToggle.classList.remove('active');
        }
    });
});

// Intersection Observer for fade-in effect
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach((section) => {
    observer.observe(section);
});

// Handle profile image loading and responsiveness
document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profileImg');
    const profileSpinner = document.getElementById('profileSpinner');
    
    if (profileImg && profileSpinner) {
        // Show spinner while image is loading
        profileSpinner.style.display = 'block';
        
        profileImg.onload = () => {
            // Hide spinner once image is loaded
            profileSpinner.style.display = 'none';
            // Add fade-in effect to image
            profileImg.classList.add('fade-in');
        };
        
        profileImg.onerror = () => {
            // Hide spinner if image fails to load
            profileSpinner.style.display = 'none';
            // Add a fallback or error handling if needed
            console.error('Profile image failed to load');
        };
        
        // Handle responsive behavior for different screen sizes
        const handleResize = () => {
            const container = profileImg.parentElement.parentElement;
            // Ensure the container maintains aspect ratio on smaller screens
            if (window.innerWidth <= 480) {
                container.style.maxWidth = '250px';
                container.style.maxHeight = '250px';
            } else {
                container.style.maxWidth = '';
                container.style.maxHeight = '';
            }
        };
        
        // Initial call and add event listener for window resize
        handleResize();
        window.addEventListener('resize', handleResize);
    }
});
