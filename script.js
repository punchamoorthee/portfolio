/**
 * Portfolio Script
 *
 * Handles:
 * - Navbar behavior (scroll effects, mobile toggle)
 * - Active link highlighting
 * - Smooth scrolling
 * - Scroll animations (using IntersectionObserver)
 * - Contact form submission and validation
 * - Dynamic footer year
 */
document.addEventListener("DOMContentLoaded", function () {
  // --- DOM Elements ---
  const navbar = document.getElementById("navbar");
  const hamburgerMenu = document.querySelector(".navbar__hamburger");
  const navLinksContainer = document.getElementById("nav-links-list");
  const navLinks = document.querySelectorAll(".navbar__links a");
  const sections = document.querySelectorAll("section[id]");
  const contactForm = document.getElementById("contactForm");
  const copyrightYearSpan = document.getElementById("copyright-year");
  const heroTitleElement = document.querySelector(".animate-text");
  const scrollIndicator = document.querySelector(".hero__scroll-indicator");
  const backToTopButton = document.querySelector(".footer__back-to-top"); // Added

  // --- State ---
  let isMobileNavOpen = false;

  // --- Helper Functions ---
  const throttle = (func, limit) => {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // --- Navbar Logic ---

  const handleNavbarScroll = () => {
    if (!navbar) return;
    const currentScrollY = window.scrollY;

    // Scrolled class for shrinking/styling
    if (currentScrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Hide scroll indicator after scrolling down a bit
    if (scrollIndicator) {
      if (currentScrollY > 100) {
        scrollIndicator.classList.add("hidden");
      } else {
        scrollIndicator.classList.remove("hidden");
      }
    }
  };

  const toggleMobileNav = () => {
    isMobileNavOpen = !isMobileNavOpen;
    if (hamburgerMenu && navLinksContainer) {
      hamburgerMenu.setAttribute("aria-expanded", isMobileNavOpen);
      navLinksContainer.classList.toggle("active", isMobileNavOpen);
      document.body.classList.toggle("mobile-nav-active", isMobileNavOpen); // For overlay/scroll lock
      // Optional: Lock body scroll
      document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
    }
  };

  const closeMobileNav = () => {
    if (isMobileNavOpen) {
      toggleMobileNav();
    }
  };

  // Navbar Event Listeners
  if (navbar) {
    window.addEventListener("scroll", throttle(handleNavbarScroll, 100)); // Throttle scroll handler
  }

  if (hamburgerMenu && navLinksContainer) {
    hamburgerMenu.addEventListener("click", toggleMobileNav);

    // Close on link click
    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    // Close on click outside nav menu (using event capturing on body)
    document.body.addEventListener(
      "click",
      (event) => {
        if (!isMobileNavOpen) return; // Only run if nav is open

        // Check if click is inside the nav container or on the hamburger itself
        const isClickInsideNav = navLinksContainer.contains(event.target);
        const isClickOnHamburger = hamburgerMenu.contains(event.target);

        if (!isClickInsideNav && !isClickOnHamburger) {
          closeMobileNav();
        }
      },
      true
    ); // Use capturing phase to catch clicks on overlay

    // Close on Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMobileNavOpen) {
        closeMobileNav();
      }
    });
  }

  // --- Scrolling and Active Link Logic ---

  const smoothScrollTo = (targetId) => {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navHeight = navbar ? navbar.offsetHeight : 80;
      // Use offsetTop relative to the document, adjusted for navbar height
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Update URL hash without jumping (optional but good UX)
      if (history.pushState) {
        history.pushState(null, null, targetId);
      } else {
        window.location.hash = targetId;
      }
    }
  };

  // Smooth scrolling for all anchor links starting with #
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Check if it's just a hash link (and not something else like "#!")
      if (
        this.getAttribute("href").length > 1 &&
        this.pathname === window.location.pathname
      ) {
        e.preventDefault();
        smoothScrollTo(this.getAttribute("href"));
      }
    });
  });

  // Active link highlighting using Intersection Observer (More performant)
  const observerOptions = {
    root: null, // Relative to viewport
    // Adjust rootMargin based on navbar height to trigger earlier/later
    rootMargin: `-${navbar ? navbar.offsetHeight : 80}px 0px -40% 0px`, // Top offset by nav height, bottom trigger area reduced
    threshold: 0, // Trigger as soon as any part enters/leaves the intersection area
  };

  const highlightNavObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const navLink = document.querySelector(`.navbar__links a[href="#${id}"]`);

      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        // Remove active from all links first
        navLinks.forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current"); // Principle 7: ARIA current page
        });

        // Add active to the current one
        if (navLink) {
          navLink.classList.add("active");
          navLink.setAttribute("aria-current", "page"); // Principle 7: ARIA current page
        }
      }
      // Optional: handle when element leaves viewport if needed
      // else {
      //     if (navLink) {
      //         // Maybe remove active state or handle differently
      //     }
      // }
    });
  }, observerOptions);

  // Observe all sections with IDs
  sections.forEach((section) => {
    highlightNavObserver.observe(section);
  });

  // --- Animations ---

  // Animate elements on scroll using Intersection Observer
  const animationObserverOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px", // Trigger when element is 100px from bottom
    threshold: 0.1, // Trigger when 10% is visible
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, animationObserverOptions);

  // Observe elements designated for animation
  const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
  elementsToAnimate.forEach((el) => {
    animationObserver.observe(el);
  });

  // Typing effect for hero section
  const typeWriter = (text, i, element, callback) => {
    if (!element) return; // Guard against null element
    if (i < text.length) {
      element.innerHTML =
        text.substring(0, i + 1) + '<span class="blinking-cursor">|</span>';
      setTimeout(() => typeWriter(text, i + 1, element, callback), 80); // Slightly faster typing
    } else {
      // Remove blinking cursor after typing
      const cursor = element.querySelector(".blinking-cursor");
      if (cursor) {
        setTimeout(() => cursor.remove(), 700); // Keep cursor for a bit
      }
      if (typeof callback === "function") {
        setTimeout(callback, 500); // Short delay before callback
      }
    }
  };

  // Start typing effect
  if (heroTitleElement) {
    const heroTitleText = heroTitleElement.textContent || "";
    if (heroTitleText) {
      heroTitleElement.innerHTML = '<span class="blinking-cursor">|</span>'; // Start with cursor
      setTimeout(() => typeWriter(heroTitleText, 0, heroTitleElement), 500);
    }
  }

  // --- Contact Form Logic ---

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default submission
    const form = event.target;
    const formData = new FormData(form);
    const statusMessage = document.getElementById("form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Clear previous errors/status
    clearFormErrors(form);
    if (statusMessage) statusMessage.textContent = "";
    statusMessage.className = "contact__form-status"; // Reset class

    // Client-side Validation
    if (!validateForm(form)) {
      if (statusMessage) {
        statusMessage.textContent = "Please correct the errors above.";
        statusMessage.classList.add("error");
      }
      return; // Stop if validation fails
    }

    // Disable button, show sending state
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        // Success
        if (statusMessage) {
          statusMessage.textContent =
            "Thanks for your message! I'll get back to you soon.";
          statusMessage.classList.add("success");
        }
        form.reset(); // Clear the form
      } else {
        // Handle server/network errors (e.g., from Formspree)
        const data = await response.json();
        let errorMessage = "Oops! There was a problem sending your message.";
        if (data && data.errors) {
          // Try to get specific error from Formspree
          errorMessage = data.errors.map((error) => error.message).join(", ");
        } else if (response.statusText) {
          errorMessage = `Error: ${response.statusText}`;
        }
        if (statusMessage) {
          statusMessage.textContent = errorMessage;
          statusMessage.classList.add("error");
        }
      }
    } catch (error) {
      // Handle network errors
      console.error("Form submission error:", error);
      if (statusMessage) {
        statusMessage.textContent = "Network error. Could not send message.";
        statusMessage.classList.add("error");
      }
    } finally {
      // Re-enable button and restore text
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  };

  // Simple Client-Side Validation Logic
  const validateForm = (form) => {
    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      const errorElement = field.nextElementSibling; // Assuming error span is next sibling
      let errorMessage = "";

      if (!field.value.trim()) {
        errorMessage = "This field is required.";
        isValid = false;
      } else if (field.type === "email") {
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          errorMessage = "Please enter a valid email address.";
          isValid = false;
        }
      }

      // Display error message and style input
      if (errorMessage) {
        if (
          errorElement &&
          errorElement.classList.contains("form-group__error-message")
        ) {
          errorElement.textContent = errorMessage;
        }
        field.classList.add("error"); // Add error class for styling
      } else {
        field.classList.remove("error");
      }
    });
    return isValid;
  };

  // Clear validation errors
  const clearFormErrors = (form) => {
    form
      .querySelectorAll(".form-group__error-message")
      .forEach((el) => (el.textContent = ""));
    form
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
  };

  // Attach form submit listener
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);

    // Optional: Clear errors when user starts typing again
    contactForm
      .querySelectorAll("input[required], textarea[required]")
      .forEach((field) => {
        field.addEventListener("input", () => {
          if (field.classList.contains("error")) {
            const errorElement = field.nextElementSibling;
            if (
              errorElement &&
              errorElement.classList.contains("form-group__error-message")
            ) {
              errorElement.textContent = "";
            }
            field.classList.remove("error");
            // Optionally clear the main form status message too
            // const statusMessage = document.getElementById("form-status");
            // if (statusMessage && statusMessage.classList.contains('error')) {
            //     statusMessage.textContent = '';
            //     statusMessage.className = 'contact__form-status';
            // }
          }
        });
      });
  }

  // --- Footer Logic ---

  // Set dynamic copyright year
  if (copyrightYearSpan) {
    copyrightYearSpan.textContent = new Date().getFullYear();
  }

  // Back to top button visibility (optional, could also use scroll handler)
  const backToTopObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Show button when hero section is NOT intersecting (i.e., scrolled past it)
        if (backToTopButton) {
          backToTopButton.style.opacity = entry.isIntersecting ? "0" : "1";
          backToTopButton.style.visibility = entry.isIntersecting
            ? "hidden"
            : "visible";
        }
      });
    },
    { threshold: 0.1 }
  ); // Trigger when hero is mostly out of view

  const heroSection = document.getElementById("home");
  if (heroSection && backToTopButton) {
    backToTopObserver.observe(heroSection);
  }
}); // End DOMContentLoaded
