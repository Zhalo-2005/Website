# Unrestricted RP Auto Review System

An automated system that fetches and displays reviews from FiveBrowse, keeping your website's testimonials up-to-date without manual intervention.

## 🌟 Features

- **Automatic Review Fetching**: Pulls latest reviews from FiveBrowse every hour
- **Smart Caching**: 30-minute cache to reduce server load
- **Error Handling**: Graceful fallback to cached reviews if fetch fails
- **Real-time Updates**: Website updates automatically when new reviews are available
- **GitHub Actions Integration**: Automated deployment and updates
- **Responsive Design**: Works seamlessly with your existing website
- **Retry Logic**: Multiple retry attempts for reliable fetching
- **Local Storage Caching**: Client-side caching for better performance

## 🚀 Quick Start

### 1. Deploy the System

```bash
# Clone your repository
git clone https://github.com/Zhalo-2005/Website.git
cd Website

# Run the deployment script
./deploy.sh
```

### 2. Update Configuration

Edit `Website/reviews-auto-loader.js` and update the server URL:

```javascript
// Change this line to your actual server URL
this.reviewServerUrl = 'https://your-domain.com/review-server';
```

### 3. Test the System

Open `Website/index.html` in your browser and check the testimonials section. Reviews should load automatically.

## 📁 Project Structure

```
Website/
├── Website/
│   ├── index.html              # Main website (updated with auto-loader)
│   ├── reviews-auto-loader.js  # Frontend auto-loading script
│   └── main.js                 # Existing website scripts
├── review-server/
│   ├── server.js               # Main review server
│   ├── fetch-reviews.js        # Review fetching logic
│   ├── package.json            # Dependencies
│   └── reviews-cache.json      # Cached reviews (auto-generated)
├── .github/workflows/
│   ├── update-reviews.yml      # Auto-update workflow
│   └── deploy.yml              # Deployment workflow
├── public/
│   └── reviews.json            # Public reviews data (auto-generated)
└── deploy.sh                   # Deployment script
```

## 🔧 Configuration

### Review Server Configuration

The review server runs on port 3001 by default. You can change this in `review-server/server.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

### Update Frequency

By default, reviews are updated every hour. To change this, modify the cron schedule in `review-server/server.js`:

```javascript
// Current: every hour
cron.schedule('0 * * * *', async () => {
    // Update logic here
});

// Examples:
// '*/30 * * * *' - Every 30 minutes
// '0 */6 * * *' - Every 6 hours
// '0 0 * * *' - Daily at midnight
```

### Cache Duration

Reviews are cached for 30 minutes. To change this, modify `CACHE_DURATION` in `review-server/fetch-reviews.js`:

```javascript
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
```

## 📊 API Endpoints

The review server provides several API endpoints:

- `GET /api/reviews` - Get all reviews with metadata
- `POST /api/reviews/refresh` - Force refresh reviews (clears cache)
- `GET /api/health` - Health check endpoint
- `GET /reviews.json` - Direct access to reviews JSON file

### Example API Response

```json
{
  "success": true,
  "reviews": [
    {
      "id": "review_0_1234567890",
      "author": "PlayerName",
      "content": "Great server, amazing community!",
      "rating": "5",
      "date": "2025-10-03T12:18:00.000Z",
      "source": "fivebrowse",
      "avatar": null
    }
  ],
  "count": 6,
  "lastUpdated": "2025-10-04T02:55:45.000Z",
  "cached": true
}
```

## 🔄 How It Works

1. **Scheduled Fetching**: GitHub Actions or the review server fetches reviews from FiveBrowse every hour
2. **Web Scraping**: The system scrapes review data from your FiveBrowse server page
3. **Caching**: Reviews are cached to reduce server load and improve performance
4. **API Serving**: The review server provides an API endpoint for the frontend
5. **Auto-loading**: The frontend script automatically fetches and displays reviews
6. **Fallback**: If fetching fails, the system uses cached or fallback reviews

## 🛠️ Manual Operations

### Force Refresh Reviews

```bash
# Using curl
curl -X POST http://localhost:3001/api/reviews/refresh

# Or use the browser console
window.reviewLoader.refresh()
```

### Check System Health

```bash
curl http://localhost:3001/api/health
```

### View Logs

```bash
# If using PM2
pm2 logs unrestricted-review-server

# If using direct node
tail -f review-server/review-server.log
```

## 🚨 Troubleshooting

### Reviews Not Loading

1. Check if the review server is running:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. Check browser console for JavaScript errors

3. Verify the server URL in `reviews-auto-loader.js`

4. Test the review fetcher directly:
   ```bash
   cd review-server
   node fetch-reviews.js
   ```

### Server Not Starting

1. Check if port 3001 is already in use:
   ```bash
   lsof -i :3001
   ```

2. Check Node.js dependencies:
   ```bash
   cd review-server
   npm install
   ```

3. Review server logs for errors

### GitHub Actions Not Working

1. Ensure your repository is on GitHub
2. Check Actions tab for workflow runs
3. Verify workflow files are in `.github/workflows/`
4. Check repository settings for Actions permissions

## 🔒 Security Considerations

- The system only fetches public data from FiveBrowse
- No authentication tokens or sensitive data are stored
- Reviews are cached locally to reduce external requests
- The server only accepts GET and POST requests to specific endpoints
- No user input is directly executed or stored

## 📈 Performance

- **Caching**: 30-minute server-side cache + client-side localStorage
- **Lazy Loading**: Reviews load after page content
- **Compression**: Automatic gzip compression for API responses
- **Throttling**: Scroll events and API calls are throttled
- **Fallback**: Instant display of cached reviews if available

## 🎯 Customization

### Styling Reviews

Reviews use your existing CSS classes. To customize the appearance, override these classes in your CSS:

```css
.testimonial-card {
    /* Your custom styles */
}

.testimonial-text {
    /* Your custom styles */
}

.testimonial-author {
    /* Your custom styles */
}
```

### Adding New Review Sources

To add support for additional review platforms:

1. Update `fetch-reviews.js` with new scraping logic
2. Add platform detection in the review object
3. Update the frontend to handle different review formats

### Changing Review Display

Modify `reviews-auto-loader.js` to change how reviews are displayed:

```javascript
// In createReviewElement method
card.innerHTML = `
    <div class="your-custom-class">
        <p>${review.content}</p>
        <span>${review.author}</span>
    </div>
`;
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Test the system step by step
4. Ensure all dependencies are installed
5. Verify your server configuration

## 🤝 Contributing

Feel free to submit issues or improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Unrestricted RP website and follows the same usage terms.

---

Made with ❤️ for Unrestricted RP