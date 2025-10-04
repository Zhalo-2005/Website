// Enhanced JavaScript for URP Website

// Scroll Progress Bar
function updateScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    }
}

// Back to Top Button
function handleBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Enhanced Mobile Menu
function enhancedMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            
            // Change icon
            if (navLinks.classList.contains('mobile-active')) {
                mobileMenuBtn.textContent = '✕';
            } else {
                mobileMenuBtn.textContent = '☰';
            }
        });
        
        // Close menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                mobileMenuBtn.textContent = '☰';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('mobile-active');
                mobileMenuBtn.textContent = '☰';
            }
        });
    }
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Gallery Image Loading
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth Scroll for All Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Testimonials Animation
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
}

// Enhanced Scroll Events with Throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', () => {
    enhancedMobileMenu();
    initFAQ();
    initGallery();
    initSmoothScroll();
    initLazyLoading();
    initTestimonials();
    
    // Scroll events
    window.addEventListener('scroll', throttle(() => {
        updateScrollProgress();
        handleBackToTop();
    }, 100));
    
    // Initial calls
    updateScrollProgress();
    handleBackToTop();
    
    console.log('🚀 Enhanced URP Website loaded successfully!');
});

// Handle window resize
window.addEventListener('resize', throttle(() => {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    
    if (window.innerWidth > 768) {
        if (navLinks) navLinks.classList.remove('mobile-active');
        if (mobileMenuBtn) mobileMenuBtn.textContent = '☰';
    }
}, 250));