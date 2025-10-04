

async function fetchServerStatus() {
    const serverIP = "jyrm3l"; // your server code
    const apiURL = `https://servers-frontend.fivem.net/api/servers/single/${serverIP}`;

    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error("Server offline");

        const data = await response.json();

        // Update UI
        const statusDot = document.querySelector('.status-dot');
        const infoSpan = document.getElementById('server-info');

        if (data.Data && data.Data.clients !== undefined) {
            statusDot.classList.add('online');
            infoSpan.textContent = `Server Online • ${data.Data.clients}/${data.Data.sv_maxclients} Players`;
        } else {
            statusDot.classList.add('offline');
            infoSpan.textContent = "Server Offline";
        }

    } catch (err) {
        document.querySelector('.status-dot').classList.add('offline');
        document.getElementById('server-info').textContent = "Server Offline";
        console.error("Server check failed:", err);
    }
}

// Check every 30 seconds
fetchServerStatus();
setInterval(fetchServerStatus, 30000);

        // Animated background particles
        function createParticles() {
            const bgAnimation = document.getElementById('bgAnimation');
            const particleCount = 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                bgAnimation.appendChild(particle);
            }
        }

        // Scroll reveal animation
        function revealOnScroll() {
            const reveals = document.querySelectorAll('.reveal');
            
            reveals.forEach(reveal => {
                const windowHeight = window.innerHeight;
                const elementTop = reveal.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < windowHeight - elementVisible) {
                    reveal.classList.add('active');
                }
            });
        }

        // Counter animation for stats
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const increment = target / 200;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (target.toString().includes('.')) {
                            counter.textContent = current.toFixed(1);
                        } else {
                            counter.textContent = Math.ceil(current);
                        }
                        setTimeout(updateCounter, 10);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                // Start animation when element is visible
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            updateCounter();
                            observer.unobserve(entry.target);
                        }
                    });
                });
                
                observer.observe(counter);
            });
        }

        // Smooth scrolling for navigation links
        function smoothScroll() {
            const links = document.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = targetSection.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        // Header background on scroll
        function headerScroll() {
            const header = document.querySelector('header');
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.15)';
                    header.style.backdropFilter = 'blur(25px)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.1)';
                    header.style.backdropFilter = 'blur(20px)';
                }
            });
        }

        // Mobile menu toggle
        function mobileMenu() {
            const mobileMenuBtn = document.querySelector('.mobile-menu');
            const navLinks = document.querySelector('.nav-links');
            
            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener('click', () => {
                    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                    navLinks.style.position = 'absolute';
                    navLinks.style.top = '100%';
                    navLinks.style.left = '0';
                    navLinks.style.right = '0';
                    navLinks.style.background = 'rgba(0, 0, 0, 0.95)';
                    navLinks.style.flexDirection = 'column';
                    navLinks.style.padding = '2rem';
                    navLinks.style.backdropFilter = 'blur(20px)';
                });
            }
        }

        // Add sparkle effect to staff cards
        function addSparkleEffect() {
            const staffCards = document.querySelectorAll('.staff-card');
            
            staffCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    const sparkle = document.createElement('div');
                    sparkle.style.position = 'absolute';
                    sparkle.style.top = Math.random() * 100 + '%';
                    sparkle.style.left = Math.random() * 100 + '%';
                    sparkle.style.width = '4px';
                    sparkle.style.height = '4px';
                    sparkle.style.background = 'white';
                    sparkle.style.borderRadius = '50%';
                    sparkle.style.animation = 'sparkle 1s ease-out forwards';
                    sparkle.style.pointerEvents = 'none';
                    card.appendChild(sparkle);
                    
                    setTimeout(() => {
                        if (sparkle.parentNode) {
                            sparkle.parentNode.removeChild(sparkle);
                        }
                    }, 1000);
                });
            });
        }

        // Add sparkle animation keyframes
        const sparkleStyle = document.createElement('style');
        sparkleStyle.textContent = `
            @keyframes sparkle {
                0% {
                    opacity: 1;
                    transform: scale(0);
                }
                50% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0);
                }
            }
        `;
        document.head.appendChild(sparkleStyle);

        // Initialize all functions when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            createParticles();
            animateCounters();
            smoothScroll();
            headerScroll();
            mobileMenu();
            addSparkleEffect();
            
            // Initial reveal check
            revealOnScroll();
            
            // Reveal on scroll
            window.addEventListener('scroll', revealOnScroll);
        });

        // Performance optimization: Throttle scroll events
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

        // Apply throttling to scroll events
        window.addEventListener('scroll', throttle(revealOnScroll, 100));
        window.addEventListener('scroll', throttle(headerScroll, 100));