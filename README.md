# NBA Analytics & Prediction Platform

A full-stack web application that provides comprehensive NBA analytics, playoff predictions, and award forecasting using machine learning models. Built with React, Node.js, and Python.

## Live Demo

https://nba-project-five.vercel.app

## Features

- **Player Analytics Dashboard**: Comprehensive player statistics with search and filtering
- **Team Standings**: Real-time team rankings and performance metrics
- **Playoff Predictions**: AI-powered playoff bracket simulations using historical data
- **Award Forecasting**: Machine learning models predicting MVP, All-NBA, DPOY, and other awards
- **Interactive UI**: Modern React frontend with responsive design
- **RESTful API**: Node.js/Express backend serving player and team data

## Tech Stack

**Frontend:**

- React 18
- Vite
- CSS3 with custom styling
- Responsive design

**Backend:**

- Node.js
- Express.js
- PostgreSQL
- RESTful API architecture

**Data Processing & ML:**

- Python
- Pandas
- Scikit-learn
- Random Forest models
- Linear regression

**Data Sources:**

- Basketball Reference (historical NBA data)
- Custom web scraping scripts

## Project Structure

```
nba-project/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API integration
│   └── public/            # Static assets
├── backend/               # Node.js API server
│   ├── routes/            # API endpoints
│   ├── controllers/       # Business logic
│   ├── data/             # Static data files
│   └── scripts/          # Data processing scripts
└── data/                 # CSV datasets
```

## Key Features Implemented

### 1. Player Analytics

- Comprehensive player statistics (per game, totals, advanced metrics)
- Player search with autocomplete
- Career statistics visualization
- Headshot integration

### 2. Team Analytics

- Current season standings
- Historical team performance
- Conference rankings
- Team statistics comparison

### 3. Machine Learning Models

- **Playoff Predictions**: Uses team performance metrics and historical playoff data
- **MVP Prediction**: Analyzes player statistics, team success, and historical voting patterns
- **All-NBA Teams**: Predicts first and second team selections
- **Defensive Player of the Year**: Models defensive statistics and team impact

### 4. Interactive Playoff Bracket

- Simulated playoff matchups
- Win probability calculations
- Championship odds
- Historical performance adjustments

## API Endpoints

- `GET /api/player/stats/all` - Player statistics
- `GET /api/player/:id` - Individual player data
- `GET /api/team/:team` - Team statistics
- `GET /api/search/:query` - Global search
- `GET /api/team/standings` - Current standings

## Data Processing Pipeline

1. **Data Collection**: Web scraping from Basketball Reference
2. **Data Cleaning**: Python scripts for data normalization
3. **Feature Engineering**: Statistical calculations and metrics
4. **Model Training**: Machine learning on historical data
5. **Prediction Generation**: Real-time award and playoff predictions

## Installation & Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (for local development)

### Quick Start

```bash
# Clone repository
git clone https://github.com/osmanmohh/nba-project.git
cd nba-project

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
# Create .env files in both backend/ and frontend/

# Start development servers
cd backend && npm run dev
cd ../frontend && npm run dev
```

## Development Notes

- The scraper scripts in `backend/scripts/` are for demonstration purposes only
- All data processing is done offline and results are stored in CSV format
- Machine learning models are pre-trained and deployed as static predictions
- The application uses a hybrid approach: static data files with dynamic API responses

## Future Enhancements

- Real-time data updates
- User authentication and personalized dashboards
- Advanced statistical visualizations
- Mobile app development
- Integration with live NBA APIs

## License

This project is for educational and portfolio purposes.
