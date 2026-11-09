import { useEffect } from 'react';

/**
 * Prevents background content from scrolling when a modal or drawer is active.
 * Restores original scroll behavior automatically when the modal unmounts or closes.
 * 
 * @param {boolean} isLocked Whether scroll should currently be locked.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isLocked]);
}

export default useBodyScrollLock;

