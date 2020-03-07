(() => {
  const navbar = document.querySelector('.navbar');
  const toggler = document.querySelector('.navbar-toggler');
  const navContent = document.getElementById('navbar__content');
  const links = document.querySelectorAll('.nav-link');

  links.forEach(link => {
    // Closes the Responsive Menu on Menu Item Click
    link.addEventListener('click', () => {
      if (navContent.classList.contains('show')) {
        toggler.click();
      }
    });
  });

  // Keep track of when the mobile menu is showing
  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'aria-expanded')) {
      if (toggler.getAttribute('aria-expanded') === 'true') {
        navbar.classList.add('navbar--expanded');
      }
      else {
        navbar.classList.remove('navbar--expanded');
      }
    }
  });

  observer.observe(toggler, { attributes: true });
})();