import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Home from './Home';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Para apps móviles, asegura que siempre haya contenido
    const timer = setTimeout(() => {
      navigate(createPageUrl('Home'), { replace: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Renderiza Home directamente mientras se navega
  return <Home />;
}