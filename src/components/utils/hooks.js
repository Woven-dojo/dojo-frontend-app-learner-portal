import { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export const useIsFirstRender = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

export function useUrlParams(param) {
  const history = useHistory();
  const url = new URLSearchParams(history.location.search);

  const urlParam = url.get(param);
  const [value, setValue] = useState(urlParam !== null ? urlParam : '');

  function setProps(newVal) {
    const currentUrl = new URLSearchParams(history.location.search);
    if (newVal.length === 0) {
      currentUrl.delete(param);
    } else {
      currentUrl.set(param, newVal);
    }
    history.replace({ pathname: history.location.pathname, search: currentUrl.toString() });
    setValue(newVal);
  }

  return [value, setProps];
}
