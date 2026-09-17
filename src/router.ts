import { useState, useEffect, useCallback } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
}

function parseRoute(): Route {
  const pathName = window.location.pathname || '/';
  const [path, queryString] = pathName.split('?');
  const params: Record<string, string> = {};
  const search = window.location.search.slice(1);
  const qs = queryString || search;
  if (qs) {
    new URLSearchParams(qs).forEach((value, key) => {
      params[key] = value;
    });
  }
  return { path: path || '/', params };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setRoute(parseRoute());
    window.scrollTo(0, 0);
  }, []);

  return { route, navigate };
}
