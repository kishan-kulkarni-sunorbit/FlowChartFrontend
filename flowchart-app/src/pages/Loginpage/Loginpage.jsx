import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Loginpage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/login', {
        email,
        password,
      });

      const data = response.data;

      if (data.token) {
        setSuccess('Login successful!');
        localStorage.setItem('token', data.token);
        navigate('/flowcharts');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Server error during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to right, #74ebd5, #ACB6E5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 420,
          width: '90%',
          p: 5,
          borderRadius: 4,
          backgroundColor: 'white',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{ fontWeight: 'bold', color: '#1976d2' }}
          >
            🔐 Secure Login
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'text.secondary', mb: 1 }}
          >
            Welcome back! Please log in to your account.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
              transition: 'all 0.3s ease-in-out',
              fontWeight: 600,
              py: 1.5,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              fontSize: '0.9rem',
            }}
          >
            <Link href="/forgot-password" underline="hover">
              Forgot password?
            </Link>
            <Link href="/signup" underline="hover">
              Create account
            </Link>
          </Box>

          <Divider sx={{ my: 2 }}>or</Divider>

          <Typography variant="body2" align="center" sx={{ color: 'gray' }}>
            Need help? <Link href="mailto:support@example.com">Contact support</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Loginpage;
