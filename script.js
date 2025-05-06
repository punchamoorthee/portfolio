/**
 * Portfolio Script
 *
 * Handles:
 * - Navbar behavior (scroll effects, mobile toggle)
 * - Active link highlighting
 * - Smooth scrolling
 * - Scroll animations (using IntersectionObserver)
 * - Contact form submission and validation (with ARIA enhancements)
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
  const backToTopButton = document.querySelector(".footer__back-to-top");

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

    if (currentScrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

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
      document.body.classList.toggle("mobile-nav-active", isMobileNavOpen);
      document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
    }
  };

  const closeMobileNav = () => {
    if (isMobileNavOpen) {
      toggleMobileNav();
    }
  };

  if (navbar) {
    window.addEventListener("scroll", throttle(handleNavbarScroll, 100));
  }

  if (hamburgerMenu && navLinksContainer) {
    hamburgerMenu.addEventListener("click", toggleMobileNav);
    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
    document.body.addEventListener(
      "click",
      (event) => {
        if (!isMobileNavOpen) return;
        const isClickInsideNav = navLinksContainer.contains(event.target);
        const isClickOnHamburger = hamburgerMenu.contains(event.target);
        if (!isClickInsideNav && !isClickOnHamburger) {
          closeMobileNav();
        }
      },
      true
    );
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
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      if (history.pushState) {
        history.pushState(null, null, targetId);
      } else {
        window.location.hash = targetId;
      }
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (
        this.getAttribute("href").length > 1 &&
        this.pathname === window.location.pathname
      ) {
        e.preventDefault();
        smoothScrollTo(this.getAttribute("href"));
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: `-${navbar ? navbar.offsetHeight : 80}px 0px -40% 0px`,
    threshold: 0,
  };

  const highlightNavObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const navLink = document.querySelector(`.navbar__links a[href="#${id}"]`);

      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });
        if (navLink) {
          navLink.classList.add("active");
          navLink.setAttribute("aria-current", "page");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    highlightNavObserver.observe(section);
  });

  // --- Animations ---
  const animationObserverOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.1,
  };

  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, animationObserverOptions);

  const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
  elementsToAnimate.forEach((el) => {
    animationObserver.observe(el);
  });

  const typeWriter = (text, i, element, callback) => {
    if (!element) return;
    if (i < text.length) {
      element.innerHTML =
        text.substring(0, i + 1) + '<span class="blinking-cursor">|</span>';
      setTimeout(() => typeWriter(text, i + 1, element, callback), 80);
    } else {
      const cursor = element.querySelector(".blinking-cursor");
      if (cursor) {
        setTimeout(() => cursor.remove(), 700);
      }
      if (typeof callback === "function") {
        setTimeout(callback, 500);
      }
    }
  };

  if (heroTitleElement) {
    const heroTitleText = heroTitleElement.textContent || "";
    if (heroTitleText) {
      heroTitleElement.innerHTML = '<span class="blinking-cursor">|</span>';
      setTimeout(() => typeWriter(heroTitleText, 0, heroTitleElement), 500);
    }
  }

  // --- Contact Form Logic ---
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const statusMessage = document.getElementById("form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    clearFormErrors(form); // Clear previous errors and ARIA attributes
    if (statusMessage) statusMessage.textContent = "";
    statusMessage.className = "contact__form-status";

    if (!validateForm(form)) { // validateForm now handles ARIA attributes for errors
      if (statusMessage) {
        statusMessage.textContent = "Please correct the errors above.";
        statusMessage.classList.add("error");
      }
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        if (statusMessage) {
          statusMessage.textContent =
            "Thanks for your message! I'll get back to you soon.";
          statusMessage.classList.add("success");
        }
        form.reset();
        clearFormErrors(form); // Clear any visual styles/ARIA from successful submission too
      } else {
        const data = await response.json();
        let errorMessageText = "Oops! There was a problem sending your message.";
        if (data && data.errors) {
          errorMessageText = data.errors.map((error) => error.message).join(", ");
        } else if (response.statusText) {
          errorMessageText = `Error: ${response.statusText}`;
        }
        if (statusMessage) {
          statusMessage.textContent = errorMessageText;
          statusMessage.classList.add("error");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      if (statusMessage) {
        statusMessage.textContent = "Network error. Could not send message.";
        statusMessage.classList.add("error");
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  };

  // --- IMPROVED VALIDATION WITH ARIA ---
  const validateForm = (form) => {
    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      const errorElement = field.nextElementSibling;
      const errorId = field.id + "-error"; // Unique ID for the error message element
      let errorMessage = "";

      if (!field.value.trim()) {
        errorMessage = "This field is required.";
      } else if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          errorMessage = "Please enter a valid email address.";
        }
      }

      if (errorMessage) {
        isValid = false;
        field.classList.add("error");
        field.setAttribute("aria-invalid", "true");
        if (errorElement && errorElement.classList.contains("form-group__error-message")) {
          errorElement.textContent = errorMessage;
          errorElement.id = errorId; // Set ID on the error span
          field.setAttribute("aria-describedby", errorId); // Link input to error span
        }
      } else {
        field.classList.remove("error");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        if (errorElement && errorElement.classList.contains("form-group__error-message")) {
          errorElement.textContent = "";
          errorElement.removeAttribute("id"); // Remove ID if no error
        }
      }
    });
    return isValid;
  };

  // --- IMPROVED CLEAR FORM ERRORS WITH ARIA ---
  const clearFormErrors = (form) => {
    form.querySelectorAll(".form-group__error-message").forEach((el) => {
        el.textContent = "";
        el.removeAttribute("id"); // Remove ID from error span
    });
    form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
        field.classList.remove("error");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
    });
  };

  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);

    contactForm.querySelectorAll("input[required], textarea[required]").forEach((field) => {
      field.addEventListener("input", () => {
        // Only clear if it currently has an error state from our validation
        if (field.classList.contains("error") || field.hasAttribute("aria-invalid")) {
          const errorElement = field.nextElementSibling;
          if (errorElement && errorElement.classList.contains("form-group__error-message")) {
            errorElement.textContent = "";
            errorElement.removeAttribute("id");
          }
          field.classList.remove("error");
          field.removeAttribute("aria-invalid");
          field.removeAttribute("aria-describedby");
          
          // Clear main form status only if it's a "Please correct errors" message
          const formStatus = document.getElementById("form-status");
          if (formStatus && formStatus.classList.contains("error") && formStatus.textContent.startsWith("Please correct")) {
            formStatus.textContent = "";
            formStatus.className = "contact__form-status";
          }
        }
      });
    });
  }

  // --- Footer Logic ---
  if (copyrightYearSpan) {
    copyrightYearSpan.textContent = new Date().getFullYear();
  }

  const backToTopObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (backToTopButton) {
          backToTopButton.style.opacity = entry.isIntersecting ? "0" : "1";
          backToTopButton.style.visibility = entry.isIntersecting
            ? "hidden"
            : "visible";
        }
      });
    },
    { threshold: 0.1 }
  );

  const heroSection = document.getElementById("home");
  if (heroSection && backToTopButton) {
    backToTopObserver.observe(heroSection);
  }
});