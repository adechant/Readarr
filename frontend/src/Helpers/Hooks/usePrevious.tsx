import { useEffect, useRef } from 'react';

export default function usePrevious<T>(value: T): T | undefined {
  // Pass null or undefined as the initial value
  const ref = useRef<T>(undefined); 

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}