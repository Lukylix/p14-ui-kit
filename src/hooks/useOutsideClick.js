import { useEffect } from "react";

export default function useOutsideClick(refs, callback) {
  useEffect(() => {
    const handleClick = (e) => {
      let isClickInside = false;
      refs.forEach((ref) => {
        if (ref?.current?.contains(e.target)) isClickInside = true;
      });
      if (!isClickInside) callback();
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [...refs, callback]);
}
