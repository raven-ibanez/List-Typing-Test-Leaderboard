// Use relative API URL for Vercel deployment, fallback to localhost for development
const API_URL = window.location.origin + '/api';

let authToken = null;

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('adminToken');
    if (authToken) {
        showDashboard();
        loadScores();
    }
    
    // Handle form submission
    document.getElementById('addScoreForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addScore();
    });
    
    // Allow Enter key to login
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login();
        }
    });
});

// Login function
async function login() {
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!password) {
        errorDiv.textContent = 'Please enter a password';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            showDashboard();
            loadScores();
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = data.error || 'Invalid password';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Error connecting to server';
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('adminPassword').value = '';
}

// Logout function
function logout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('addScoreForm').reset();
    document.getElementById('message').classList.remove('show');
}

// Add score
async function addScore() {
    const name = document.getElementById('playerName').value.trim();
    const wpm = parseFloat(document.getElementById('wpm').value);
    const accuracy = parseFloat(document.getElementById('accuracy').value);
    const messageDiv = document.getElementById('message');
    
    if (!name || isNaN(wpm) || isNaN(accuracy)) {
        showMessage('Please fill in all fields with valid values', 'error');
        return;
    }
    
    if (accuracy < 0 || accuracy > 100) {
        showMessage('Accuracy must be between 0 and 100', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/add-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, wpm, accuracy })
        });
        
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            showMessage('Server returned an error. Check console for details.', 'error');
            return;
        }
        
        if (response.ok) {
            showMessage(`Score added successfully for ${escapeHtml(name)}!`, 'success');
            document.getElementById('addScoreForm').reset();
            loadScores();
        } else {
            if (response.status === 401) {
                showMessage('Session expired. Please login again.', 'error');
                logout();
            } else {
                showMessage(data.error || `Failed to add score (Status: ${response.status})`, 'error');
                console.error('Add score error:', data);
            }
        }
    } catch (error) {
        console.error('Error adding score:', error);
        showMessage(`Error connecting to server: ${error.message}`, 'error');
    }
}

// Load all scores
async function loadScores() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const data = await response.json();
        displayScores(data.scores);
    } catch (error) {
        console.error('Error loading scores:', error);
        document.getElementById('scoresList').innerHTML = 
            '<div class="loading">Error loading scores</div>';
    }
}

// Display scores in admin view
function displayScores(scores) {
    const scoresListDiv = document.getElementById('scoresList');
    
    if (scores.length === 0) {
        scoresListDiv.innerHTML = '<div class="loading">No scores yet</div>';
        return;
    }
    
    // Sort scores
    const sortedScores = [...scores].sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
    });
    
    const html = sortedScores.map(score => {
        const date = new Date(score.date).toLocaleDateString();
        return `
            <div class="score-item">
                <div>
                    <strong>${escapeHtml(score.name)}</strong>
                    <div style="font-size: 0.85em; color: #666; margin-top: 4px;">${date}</div>
                </div>
                <div class="score-value wpm">${score.wpm.toFixed(1)} WPM</div>
                <div class="score-value accuracy">${score.accuracy.toFixed(1)}%</div>
                <button class="delete-btn" onclick="deleteScore('${score.id}')">Delete</button>
            </div>
        `;
    }).join('');
    
    scoresListDiv.innerHTML = html;
}

// Delete score
async function deleteScore(id) {
    if (!confirm('Are you sure you want to delete this score?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/score/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showMessage('Score deleted successfully', 'success');
            loadScores();
        } else {
            if (response.status === 401) {
                showMessage('Session expired. Please login again.', 'error');
                logout();
            } else {
                const data = await response.json();
                showMessage(data.error || 'Failed to delete score', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting score:', error);
        showMessage('Error connecting to server', 'error');
    }
}

// Refresh scores
function refreshScores() {
    loadScores();
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} show`;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

