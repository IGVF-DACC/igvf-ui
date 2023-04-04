// node_modules
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  // True if the button to scroll to the top is visible
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Detect if the user has scrolled 100px down from the top of the page.
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 100) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide the scroll-to-top button if the user hasn't scrolled in five seconds.
  useEffect(() => {
    let timeoutId;
    if (isScrollToTopVisible) {
      timeoutId = setTimeout(() => {
        setIsScrollToTopVisible(false);
      }, 8000);
    }
    return () => clearTimeout(timeoutId);
  }, [isScrollToTopVisible]);

  return (
    <AnimatePresence>
      {isScrollToTopVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <button
            className="fixed bottom-4 right-4 rounded-full bg-[#337788] p-2 opacity-70"
            onClick={scrollToTop}
          >
            <ArrowUpIcon className="h-8 w-8 fill-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
