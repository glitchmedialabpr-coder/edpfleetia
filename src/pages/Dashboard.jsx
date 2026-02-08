import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('Home'), { replace: true });
  }, [navigate]);
  return null;
}