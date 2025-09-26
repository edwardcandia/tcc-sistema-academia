// frontend/src/pages/DashboardPage.jsx
import React from 'react';
import { Typography } from '@mui/material';
import Dashboard from '../components/Dashboard';

function DashboardPage() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Dashboard />
    </>
  );
}

export default DashboardPage;