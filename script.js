document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar");
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("section[id]"); // Select sections with IDs
  const contactForm = document.getElementById("contactForm");
  const copyrightYearSpan = document.getElementById("copyright-year");
  const heroTitleElement = document.querySelector(".animate-text");

  // --- Navbar Logic ---

  // Toggle Mobile Navigation
  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener("click", function () {
      const isActive = this.classList.toggle("active");
      navLinks.classList.toggle("active");
      this.setAttribute("aria-expanded", isActive ? "true" : "false");
      // Optional: Prevent body scroll when menu is open
      // document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close mobile menu when a link is clicked
    navItems.forEach((item) => {
      item.addEventListener("click", function () {
        hamburgerMenu.classList.remove("active");
        navLinks.classList.remove("active");
        hamburgerMenu.setAttribute("aria-expanded", "false");
        // document.body.style.overflow = ''; // Re-enable scroll
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInsideNav = navLinks.contains(event.target);
      const isClickOnHamburger = hamburgerMenu.contains(event.target);

      if (
        !isClickInsideNav &&
        !isClickOnHamburger &&
        navLinks.classList.contains("active")
      ) {
        hamburgerMenu.classList.remove("active");
        navLinks.classList.remove("active");
        hamburgerMenu.setAttribute("aria-expanded", "false");
        // document.body.style.overflow = ''; // Re-enable scroll
      }
    });
  }

  // Navbar scroll effect (shrink/expand)
  let lastScrollY = window.scrollY;
  if (navbar) {
    window.addEventListener("scroll", function () {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) {
        navbar.style.height = "70px";
        navbar.style.boxShadow = "var(--box-shadow-md)"; // Use variable
      } else {
        navbar.style.height = "80px";
        navbar.style.boxShadow = "var(--box-shadow-sm)"; // Use variable
      }

      // Optional: Hide navbar on scroll down, show on scroll up
      // if (currentScrollY > lastScrollY && currentScrollY > 80) {
      //     navbar.style.top = '-80px'; // Hide navbar
      // } else {
      //     navbar.style.top = '0'; // Show navbar
      // }
      lastScrollY = currentScrollY;
    });
  }

  // --- Scrolling and Active Link Logic ---

  // Active link highlighting on scroll
  const highlightNav = () => {
    let currentSectionId = "";
    const scrollY = window.pageYOffset;
    const navHeight = navbar ? navbar.offsetHeight : 80;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navHeight - 50; // Add buffer
      const sectionHeight = section.clientHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Special case for reaching the bottom of the page (highlight contact)
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 50
    ) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        currentSectionId = lastSection.getAttribute("id");
      }
    }

    navItems.forEach((item) => {
      item.classList.remove("active");
      // Check if the link's href matches the current section ID
      if (item.getAttribute("href") === `#${currentSectionId}`) {
        item.classList.add("active");
      }
    });

    // If no section is active (e.g., at the very top), default to home
    if (!currentSectionId && scrollY < sections[0].offsetTop) {
      const homeLink = document.querySelector('.nav-links a[href="#home"]');
      if (homeLink) homeLink.classList.add("active");
    }
  };

  window.addEventListener("scroll", highlightNav);
  highlightNav(); // Initial call

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetElement.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL hash without jumping (optional)
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          window.location.hash = targetId;
        }
      }
    });
  });

  // --- Animations ---

  // Animate elements when they enter the viewport (Simple Version)
  const animatedElements = document.querySelectorAll(
    ".card, .skill-item, .project-card, .education-card, .timeline-content" // Added timeline content
  );

  const animateOnScroll = () => {
    animatedElements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // Trigger animation when element is about 100px from bottom edge
      if (elementPosition < windowHeight - 100) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }
      // Optional: Reset animation if element scrolls out of view upwards
      // else if (elementPosition > windowHeight) {
      //    element.style.opacity = "0";
      //    element.style.transform = "translateY(20px)";
      // }
    });
  };

  // Set initial state for animated elements
  const setupAnimations = () => {
    animatedElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition =
        "opacity 0.6s ease-out, transform 0.6s ease-out";
    });
  };

  setupAnimations();
  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll(); // Run once on page load to catch elements already in view

  // Typing effect for hero section
  const typeWriter = (text, i, element, callback) => {
    if (i < text.length) {
      element.innerHTML =
        text.substring(0, i + 1) + '<span class="blinking-cursor">|</span>';
      setTimeout(() => {
        typeWriter(text, i + 1, element, callback);
      }, 100); // Adjust typing speed (milliseconds)
    } else {
      // Remove blinking cursor after typing is complete
      setTimeout(() => {
        const cursor = element.querySelector(".blinking-cursor");
        if (cursor) cursor.remove();
      }, 1000); // Keep cursor for 1 second

      if (typeof callback === "function") {
        setTimeout(callback, 700); // Delay before callback
      }
    }
  };

  // Start the typing effect if the element exists
  if (heroTitleElement) {
    const heroTitleText = heroTitleElement.textContent || ""; // Get original text
    if (heroTitleText) {
      heroTitleElement.innerHTML = ""; // Clear element first
      // Add a slight delay before starting to ensure smooth loading
      setTimeout(() => {
        typeWriter(heroTitleText, 0, heroTitleElement);
      }, 500); // Delay start by 0.5s
    }
  }

  // --- Contact Form Logic ---
  if (contactForm) {
    const formStatus = document.getElementById("form-status");

    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default browser submission

      const formData = new FormData(contactForm);
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      // Basic client-side validation (already handled by 'required' attribute, but good practice)
      const name = formData.get("name");
      const email = formData.get("email");
      const subject = formData.get("subject");
      const message = formData.get("message");

      if (!name || !email || !subject || !message) {
        if (formStatus) {
          formStatus.textContent = "Please fill out all fields.";
          formStatus.className = "form-status-message error";
        }
        return; // Stop submission
      }

      // Email validation using regex (more robust)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (formStatus) {
          formStatus.textContent = "Please enter a valid email address.";
          formStatus.className = "form-status-message error";
        }
        return; // Stop submission
      }

      // Disable button and show sending message
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      if (formStatus) {
        formStatus.textContent = ""; // Clear previous status
        formStatus.className = "form-status-message";
      }

      // --- Form Submission using Fetch (Example for Formspree) ---
      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          // Success
          if (formStatus) {
            formStatus.textContent =
              "Thanks for your message! I'll get back to you soon.";
            formStatus.className = "form-status-message success";
          }
          contactForm.reset(); // Clear the form
        } else {
          // Handle server errors (e.g., Formspree error)
          const data = await response.json();
          if (Object.hasOwn(data, "errors")) {
            if (formStatus)
              formStatus.textContent = data["errors"]
                .map((error) => error["message"])
                .join(", ");
          } else {
            if (formStatus)
              formStatus.textContent =
                "Oops! There was a problem sending your message.";
          }
          if (formStatus) formStatus.className = "form-status-message error";
        }
      } catch (error) {
        // Handle network errors
        console.error("Form submission error:", error);
        if (formStatus) {
          formStatus.textContent = "Network error. Please try again later.";
          formStatus.className = "form-status-message error";
        }
      } finally {
        // Re-enable button and restore text
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  // --- Footer Logic ---

  // Set dynamic copyright year
  if (copyrightYearSpan) {
    copyrightYearSpan.textContent = new Date().getFullYear();
  }
}); // End DOMContentLoaded