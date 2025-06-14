// Navigation functionality for CISEPA Dashboard

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const createMobileNav = () => {
    const nav = document.querySelector('.main-nav');
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '☰';
    navToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    navToggle.addEventListener('click', function() {
      nav.classList.toggle('nav-open');
      this.innerHTML = nav.classList.contains('nav-open') ? '✕' : '☰';
    });
    
    document.querySelector('.site-header').appendChild(navToggle);
  };

  // Handle dropdown menus for keyboard accessibility
  const setupAccessibleDropdowns = () => {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const dropdown = this.nextElementSibling;
          const isExpanded = dropdown.style.display === 'block';
          
          // Close all other dropdowns
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
          });
          
          // Toggle current dropdown
          dropdown.style.display = isExpanded ? 'none' : 'block';
          this.setAttribute('aria-expanded', !isExpanded);
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.style.display = 'none';
        });
        
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
          toggle.setAttribute('aria-expanded', 'false');
        });
      }
    });
  };

  // Smooth scrolling for anchor links
  const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80, // Offset for fixed header
              behavior: 'smooth'
            });
            
            // Update URL without page reload
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  };

  // Active link highlighting
  const highlightActiveLink = () => {
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentPath || 
          (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Also highlight section if scrolled to it
    window.addEventListener('scroll', function() {
      const scrollPosition = window.scrollY;
      
      document.querySelectorAll('section[id]').forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          const id = section.getAttribute('id');
          
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  };

  // Initialize navigation functionality
  const initNavigation = () => {
    if (window.innerWidth < 768) {
      createMobileNav();
    }
    
    setupAccessibleDropdowns();
    setupSmoothScrolling();
    highlightActiveLink();
  };

  // Run initialization
  initNavigation();
  
  // Update on window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768 && !document.querySelector('.nav-toggle')) {
      createMobileNav();
    }
  });
});
