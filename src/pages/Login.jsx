import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Stack,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { login } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
// import GoogleSignInButton from '../GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!email || !password) {
      setError({ message: 'Please fill in all fields' });
      return;
    }

    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      setAuthToken(token);
      setError(null); // Clear any previous errors
      navigate('/');
    } catch (err) {
      // Handle different error scenarios
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('401')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message.includes('403')) {
        errorMessage = 'Your account has been deactivated';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError({ 
        message: errorMessage,
        details: err.response?.data?.message || err.message 
      });
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      mx: 'auto', 
      mt: 8, 
      p: 3,
      boxShadow: 3,
      borderRadius: 2
    }}>
      <Typography variant="h4" gutterBottom align="center">
        Login
      </Typography>
      
      <Collapse in={Boolean(error)}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">{error?.message}</Typography>
          {error?.details && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error.details}
            </Typography>
          )}
        </Alert>
      </Collapse>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(error)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(error)}
          required
        />
        
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
          >
            Register
          </Button>
        </Stack>

        {/* <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          <Link href="/forgot-password" underline="hover">
            Forgot password?
          </Link>
        </Typography> */}
        {/* <GoogleSignInButton /> */}
      </form>
    </Box>
  );
}