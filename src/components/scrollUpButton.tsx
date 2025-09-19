"use client";

import { useEffect, useState } from "react";

type ScrollUpButtonProps = {
  scrollHeight?: number;
};

export function ScrollUpButton({ scrollHeight = 300 }: ScrollUpButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollHeight]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed right-6 bottom-6 z-50 pointer-events-auto bg-white/10 backdrop-blur-md hover:bg-white/20 transition rounded-full p-2 sm:p-3 md:p-4 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 md:h-7 md:w-7 text-white"
      >
        <path
          fill="currentColor"
          d="M12 4l-6 6h4v6h4v-6h4l-6-6z"
        />
      </svg>
    </button>
  );
}
