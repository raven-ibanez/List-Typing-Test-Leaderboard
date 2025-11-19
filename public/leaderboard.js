// Use relative API URL for Vercel deployment, fallback to localhost for development
const API_URL = window.location.origin + '/api';

let refreshInterval;

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    // Auto-refresh every 5 seconds
    refreshInterval = setInterval(loadLeaderboard, 5000);
    
    // Allow Enter key to check rank
    document.getElementById('playerSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkRank();
        }
    });
});

// Load and display leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const data = await response.json();
        displayLeaderboard(data.scores);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard').innerHTML = 
            '<div class="loading">Error loading leaderboard. Please try again.</div>';
    }
}

// Display leaderboard
function displayLeaderboard(scores) {
    const leaderboardDiv = document.getElementById('leaderboard');
    
    if (scores.length === 0) {
        leaderboardDiv.innerHTML = '<div class="loading">No scores yet. Be the first!</div>';
        return;
    }
    
    const html = scores.map((score, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';
        
        return `
            <div class="leaderboard-item">
                <div class="rank-badge ${rankClass}">#${rank}</div>
                <div class="player-name">${escapeHtml(score.name)}</div>
                <div class="score-value wpm">${score.wpm.toFixed(1)} WPM</div>
                <div class="score-value accuracy">${score.accuracy.toFixed(1)}%</div>
            </div>
        `;
    }).join('');
    
    leaderboardDiv.innerHTML = html;
}

// Check rank for a specific player
async function checkRank() {
    const name = document.getElementById('playerSearch').value.trim();
    const resultDiv = document.getElementById('rankResult');
    
    if (!name) {
        resultDiv.innerHTML = '<div class="error-message">Please enter a name</div>';
        resultDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/rank/${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (data.rank === null) {
            resultDiv.innerHTML = `
                <h3>Player Not Found</h3>
                <p>No player found with the name "${escapeHtml(name)}"</p>
            `;
        } else {
            resultDiv.innerHTML = `
                <h3>🎯 Your Rank</h3>
                <div class="rank-info">
                    <div class="rank-stat">
                        <strong>Rank:</strong> #${data.rank} out of ${data.totalPlayers}
                    </div>
                    <div class="rank-stat">
                        <strong>Name:</strong> ${escapeHtml(data.score.name)}
                    </div>
                    <div class="rank-stat">
                        <strong>WPM:</strong> ${data.score.wpm.toFixed(1)}
                    </div>
                    <div class="rank-stat">
                        <strong>Accuracy:</strong> ${data.score.accuracy.toFixed(1)}%
                    </div>
                </div>
            `;
        }
        resultDiv.classList.add('show');
    } catch (error) {
        console.error('Error checking rank:', error);
        resultDiv.innerHTML = '<div class="error-message">Error checking rank. Please try again.</div>';
        resultDiv.classList.add('show');
    }
}

// Refresh leaderboard manually
function refreshLeaderboard() {
    loadLeaderboard();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

