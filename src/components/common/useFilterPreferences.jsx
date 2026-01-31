import { useState, useEffect } from 'react';

export default function useFilterPreferences(entityName) {
  const [filters, setFilters] = useState({});
  const [loaded, setLoaded] = useState(false);

  const storageKey = `filter_preferences_${entityName}`;

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading filter preferences:', error);
    }
    setLoaded(true);
  }, [entityName, storageKey]);

  // Guardar preferencias cuando cambien
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing filter preferences:', error);
    }
  };

  return { filters, updateFilters, clearFilters, loaded };
}