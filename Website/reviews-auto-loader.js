// Auto Review Loader for Unrestricted RP Website
// This script automatically fetches and displays reviews from the review server

class ReviewAutoLoader {
    constructor() {
        this.reviews = [];
        this.reviewServerUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : window.location.hostname === '0.0.0.0' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8081' // Use the Python HTTP server port
            : 'https://your-review-server.herokuapp.com'; // Update this with your actual server URL
        this.cacheKey = 'urp_reviews_cache';
        this.cacheDuration = 30 * 60 * 1000; // 30 minutes
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
    }

    // Initialize the review loader
    async init() {
        console.log('🔄 Initializing auto review loader...');
        
        try {
            await this.loadReviews();
            this.renderReviews();
            this.startAutoRefresh();
            
            console.log('✅ Review auto loader initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize review loader:', error);
            this.renderFallbackReviews();
        }
    }

    // Load reviews with caching and fallback
    async loadReviews() {
        try {
            // Try to load from local cache first
            const cachedReviews = this.getCachedReviews();
            if (cachedReviews) {
                console.log('📦 Using cached reviews');
                this.reviews = cachedReviews;
                return;
            }

            // Fetch from server with retry logic
            const reviews = await this.fetchReviewsWithRetry();
            this.reviews = reviews;
            
            // Cache the reviews
            this.cacheReviews(reviews);
            
        } catch (error) {
            console.error('❌ Failed to load reviews:', error);
            this.reviews = this.getFallbackReviews();
        }
    }

    // Fetch reviews with retry logic
    async fetchReviewsWithRetry() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempting to fetch reviews (attempt ${attempt}/${this.maxRetries})...`);
                
                // Try to fetch from the API server first
                const response = await fetch(`${this.reviewServerUrl}/api/reviews`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.reviews && data.reviews.length > 0) {
                    console.log(`✅ Successfully fetched ${data.reviews.length} reviews from API`);
                    return data.reviews;
                } else {
                    throw new Error('No reviews found in API response');
                }

            } catch (error) {
                console.error(`❌ Attempt ${attempt} failed:`, error);
                lastError = error;
                
                // On the last attempt, try to load from local JSON file
                if (attempt === this.maxRetries) {
                    console.log('🔄 Trying to load reviews from local JSON file...');
                    try {
                        const jsonResponse = await fetch('/reviews.json');
                        if (jsonResponse.ok) {
                            const jsonData = await jsonResponse.json();
                            if (jsonData.reviews && jsonData.reviews.length > 0) {
                                console.log(`✅ Successfully loaded ${jsonData.reviews.length} reviews from JSON file`);
                                return jsonData.reviews;
                            }
                        }
                    } catch (jsonError) {
                        console.error('❌ Failed to load from JSON file:', jsonError);
                    }
                }
                
                if (attempt < this.maxRetries) {
                    console.log(`⏳ Waiting ${this.retryDelay / 1000} seconds before retry...`);
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        throw lastError;
    }

    // Get cached reviews from localStorage
    getCachedReviews() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const { reviews, timestamp } = JSON.parse(cached);
                const now = Date.now();
                
                if (now - timestamp < this.cacheDuration) {
                    return reviews;
                } else {
                    console.log('⏰ Cache expired');
                    localStorage.removeItem(this.cacheKey);
                }
            }
        } catch (error) {
            console.error('❌ Error reading cache:', error);
        }
        
        return null;
    }

    // Cache reviews in localStorage
    cacheReviews(reviews) {
        try {
            const cacheData = {
                reviews: reviews,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            console.log('💾 Reviews cached successfully');
        } catch (error) {
            console.error('❌ Error caching reviews:', error);
        }
    }

    // Render reviews in the testimonials section
    renderReviews() {
        const testimonialsSection = document.querySelector('#testimonials .testimonials-grid');
        
        if (!testimonialsSection) {
            console.error('❌ Testimonials section not found');
            return;
        }

        if (!this.reviews || this.reviews.length === 0) {
            console.warn('⚠️ No reviews to render');
            return;
        }

        // Clear existing reviews (except the loading indicator)
        const existingReviews = testimonialsSection.querySelectorAll('.testimonial-card');
        existingReviews.forEach(review => review.remove());

        // Render each review
        this.reviews.forEach((review, index) => {
            const reviewElement = this.createReviewElement(review, index);
            testimonialsSection.appendChild(reviewElement);
        });

        console.log(`🎨 Rendered ${this.reviews.length} reviews`);
    }

    // Create a review element
    createReviewElement(review, index) {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.style.animationDelay = `${index * 0.15}s`;
        
        // Format the date
        const formattedDate = this.formatDate(review.date);
        
        // Create avatar or use existing one
        const avatar = review.avatar || this.generateAvatar(review.author);
        
        card.innerHTML = `
            <p class="testimonial-text">"${this.escapeHtml(review.content)}"</p>
            <div class="testimonial-author">
                <div class="author-avatar">${avatar}</div>
                <div class="author-info">
                    <h4>${this.escapeHtml(review.author)}</h4>
                    <p>${review.rating} Stars - ${formattedDate}</p>
                </div>
            </div>
        `;
        
        return card;
    }

    // Generate a simple avatar based on author name
    generateAvatar(author) {
        const avatars = ['⭐', '👤', '🎮', '🕹️', '🎯', '🏆', '💎', '🔥'];
        const index = author.charCodeAt(0) % avatars.length;
        return avatars[index];
    }

    // Format date for display
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        } catch (error) {
            return 'Recently';
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get fallback reviews when everything else fails
    getFallbackReviews() {
        return [
            {
                id: 'fallback_1',
                author: '⭐⭐⭐⭐⭐',
                content: 'One of the best upcoming role play servers out there amazing staff team the best owners/founders Zhalo + Icy bringing the best fiveM experience possible',
                rating: '5',
                date: '2025-10-03T00:18:00.000Z'
            },
            {
                id: 'fallback_2',
                author: 'Green',
                content: 'one of the best server i played has good staff nice people over all great server',
                rating: '5',
                date: '2025-10-02T19:06:00.000Z'
            },
            {
                id: 'fallback_3',
                author: 'XRYZKI',
                content: 'great server gotta love it',
                rating: '5',
                date: '2025-10-02T14:13:00.000Z'
            },
            {
                id: 'fallback_4',
                author: 'Zane',
                content: 'When I first joined the server, I did not know what to do. So I approached the lovely staff who helped me out so much it was unreal!!',
                rating: '5',
                date: '2025-10-02T04:36:00.000Z'
            },
            {
                id: 'fallback_5',
                author: 'gamerswhocook',
                content: 'Amazing people! Joined to just fined a place to call home and i found it just some lovely people and not money hungry',
                rating: '5',
                date: '2025-10-02T02:45:00.000Z'
            },
            {
                id: 'fallback_6',
                author: 'Dr_Spitfire',
                content: 'Good looking server so far can not wait to see what it looks like when it drops',
                rating: '5',
                date: '2025-10-02T07:28:00.000Z'
            }
        ];
    }

    // Render fallback reviews when fetch fails
    renderFallbackReviews() {
        console.log('🔄 Rendering fallback reviews');
        this.reviews = this.getFallbackReviews();
        this.renderReviews();
    }

    // Start auto-refresh timer
    startAutoRefresh() {
        // Refresh every 30 minutes
        setInterval(async () => {
            console.log('🔄 Auto-refreshing reviews...');
            try {
                await this.loadReviews();
                this.renderReviews();
                console.log('✅ Auto-refresh completed');
            } catch (error) {
                console.error('❌ Auto-refresh failed:', error);
            }
        }, 30 * 60 * 1000); // 30 minutes

        console.log('⏰ Auto-refresh started (every 30 minutes)');
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manual refresh method (can be called from console or button)
    async refresh() {
        console.log('🔄 Manual refresh requested...');
        
        try {
            // Clear cache
            localStorage.removeItem(this.cacheKey);
            
            // Fetch fresh reviews
            await this.loadReviews();
            this.renderReviews();
            
            console.log('✅ Manual refresh completed');
            return true;
        } catch (error) {
            console.error('❌ Manual refresh failed:', error);
            return false;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if testimonials section exists
    if (document.querySelector('#testimonials')) {
        const reviewLoader = new ReviewAutoLoader();
        reviewLoader.init();
        
        // Expose to global scope for manual refresh
        window.reviewLoader = reviewLoader;
        
        console.log('🚀 Auto review loader ready! Use window.reviewLoader.refresh() to manually refresh.');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReviewAutoLoader;
}