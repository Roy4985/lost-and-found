import { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';

// Loads data from the backend when a component appears.
// Returns the data, whether it's still loading, any error message,
// and a reload() function to fetch it again.
export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setData(await apiFetch(path));
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [path, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  return { data, loading, error, reload };
}