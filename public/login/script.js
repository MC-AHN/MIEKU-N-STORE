document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
        alert('Login successful!');
        // Store the token in localStorage or cookies as needed
        localStorage.setItem('token', result.token);
        // Redirect to admin dashboard or another page
        window.location.href = '../admin';
    } else {
        alert('Login failed: ' + result.message);
    }
});
