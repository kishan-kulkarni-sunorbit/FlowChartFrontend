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

        // ✅ redirect after login
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
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        m: 0,
        p: 0,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          backgroundColor: '#fff',
          mx: 2,
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
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login
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
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Link href="/forgot-password" variant="body2">
              Forgot password?
            </Link>
            <Link href="/signup" variant="body2">
              Sign up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Loginpage;
