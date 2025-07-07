const API_URL = 'https://taskmanager-backend-gmri.onrender.com/api';

async function fetchAPI(endpoint, options = {}, authToken) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers
  });

  if (authToken) {
    headers.append('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json(); // This fails when HTML is returned
    
    if (!response.ok) {
      // Handle API error responses (4xx, 5xx)
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (err) {
    // Handle network errors and invalid JSON
    if (err instanceof SyntaxError) {
      throw new Error('Server returned unexpected response');
    }
    throw err;
  }
}

export async function register(username, email, password) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

export async function getTasks(authToken) {
  return fetchAPI('/tasks', { method: 'GET' }, authToken);
}

export async function getTaskAnalytics(authToken) {
  return fetchAPI('/tasks/analytics', { method: 'GET' }, authToken);
}

export async function createTask(taskData, authToken) {
  return fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }, authToken);
}