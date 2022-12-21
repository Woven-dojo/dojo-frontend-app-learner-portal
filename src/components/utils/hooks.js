import { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { QUERY_PARAMS, queryInit } from './constants';

export const useIsFirstRender = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

const convertToArray = (value) => {
  if (value && value.length > 0) {
    return typeof value === 'string' ? value.split(',') : value;
  }
  return [];
};
const setParamType = (param, value) => {
  switch (param) {
    case 'fDiff':
    case 'fLan':
    case 'fLern':
    case 'fDel':
      return convertToArray(value);
    case 'pAct':
    case 'pPer':
      return Number(value);
    default:
      return value;
  }
};

export function useUrlParams(params) {
  const history = useHistory();
  const url = new URLSearchParams(history.location.search);

  const [query, setQuery] = useState(queryInit);

  useEffect(() => {
    params.forEach((param) => {
      const urlParam = url.get(param);
      if (urlParam !== null) {
        setQuery((currentQuery) => ({
          ...currentQuery,
          [QUERY_PARAMS[param]]: setParamType(param, urlParam),
        }));
      }
    });
    // eslint-disable-next-line
  }, []);

  const handleQuery = (param, value) => {
    const currentUrl = new URLSearchParams(history.location.search);

    if (value.length === 0) {
      currentUrl.delete(param);
    } else {
      currentUrl.set(param, value);
    }
    history.replace({ pathname: history.location.pathname, search: currentUrl.toString() });
    setQuery((currentQuery) => ({
      ...currentQuery,
      [QUERY_PARAMS[param]]: setParamType(param, value),
    }));
  };
  return [query, handleQuery];
}
