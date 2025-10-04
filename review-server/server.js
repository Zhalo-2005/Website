const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs-extra');
const { getReviews } = require('./fetch-reviews');

const app = express();
const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Logger middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Ensure public directory exists
async function ensurePublicDirectory() {
    await fs.ensureDir(PUBLIC_DIR);
}

// API endpoint to get reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await getReviews();
        
        res.json({
            success: true,
            reviews: reviews,
            count: reviews.length,
            lastUpdated: new Date().toISOString(),
            cached: true // This will be enhanced later
        });
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews',
            message: error.message
        });
    }
});

// API endpoint to force refresh reviews
app.post('/api/reviews/refresh', async (req, res) => {
    try {
        console.log('Force refreshing reviews...');
        
        // Clear cache by removing cache file
        const cacheFile = path.join(__dirname, 'reviews-cache.json');
        if (await fs.pathExists(cacheFile)) {
            await fs.remove(cacheFile);
        }
        
        // Fetch fresh reviews
        const reviews = await getReviews();
        
        // Save to public directory
        const reviewsData = {
            reviews: reviews,
            lastUpdated: new Date().toISOString(),
            source: 'fivebrowse',
            count: reviews.length
        };
        
        await fs.writeJson(path.join(PUBLIC_DIR, 'reviews.json'), reviewsData, { spaces: 2 });
        
        res.json({
            success: true,
            message: 'Reviews refreshed successfully',
            reviews: reviews,
            count: reviews.length
        });
        
    } catch (error) {
        console.error('Error refreshing reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh reviews',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve reviews.json directly
app.get('/reviews.json', async (req, res) => {
    try {
        const reviewsFile = path.join(PUBLIC_DIR, 'reviews.json');
        
        if (await fs.pathExists(reviewsFile)) {
            const reviewsData = await fs.readJson(reviewsFile);
            res.json(reviewsData);
        } else {
            // Generate reviews file if it doesn't exist
            const reviews = await getReviews();
            const reviewsData = {
                reviews: reviews,
                lastUpdated: new Date().toISOString(),
                source: 'fivebrowse',
                count: reviews.length
            };
            
            await fs.writeJson(reviewsFile, reviewsData, { spaces: 2 });
            res.json(reviewsData);
        }
        
    } catch (error) {
        console.error('Error serving reviews.json:', error);
        res.status(500).json({
            error: 'Failed to serve reviews',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Scheduled task to update reviews every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled review update...');
    try {
        await ensurePublicDirectory();
        
        // Clear cache and fetch fresh reviews
        const cacheFile = path.join(__dirname, 'reviews-cache.json');
        if (await fs.pathExists(cacheFile)) {
            await fs.remove(cacheFile);
        }
        
        const reviews = await getReviews();
        
        const reviewsData = {
            reviews: reviews,
            lastUpdated: new Date().toISOString(),
            source: 'fivebrowse',
            count: reviews.length
        };
        
        await fs.writeJson(path.join(PUBLIC_DIR, 'reviews.json'), reviewsData, { spaces: 2 });
        console.log('Scheduled review update completed successfully');
        
    } catch (error) {
        console.error('Scheduled review update failed:', error);
    }
});

// Initialize server
async function startServer() {
    try {
        await ensurePublicDirectory();
        
        // Generate initial reviews file
        console.log('Generating initial reviews data...');
        const reviews = await getReviews();
        const reviewsData = {
            reviews: reviews,
            lastUpdated: new Date().toISOString(),
            source: 'fivebrowse',
            count: reviews.length
        };
        
        await fs.writeJson(path.join(PUBLIC_DIR, 'reviews.json'), reviewsData, { spaces: 2 });
        
        app.listen(PORT, () => {
            console.log(`🚀 Review server running on port ${PORT}`);
            console.log(`📊 API endpoints:`);
            console.log(`   GET  /api/reviews          - Get all reviews`);
            console.log(`   POST /api/reviews/refresh - Force refresh reviews`);
            console.log(`   GET  /api/health           - Health check`);
            console.log(`   GET  /reviews.json         - Direct reviews file access`);
            console.log('');
            console.log(`🔄 Scheduled updates: Every hour`);
            console.log(`📁 Public directory: ${PUBLIC_DIR}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
startServer();