  /* Status.js
   Simplified scrollspy + interactions for Status.html
   - center-based active detection
   - click smooth scroll (center)
   - simple ripple effect
   - keyboard support (Enter / Space)
   - rAF throttled scroll handler
*/
(function(){
  const main = document.getElementById('main');
  const sections = Array.from(document.querySelectorAll('.section'));
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar a'));

  // Get vertical center of the scrolling viewport (.main)
  function mainCenterY(){
    const r = main.getBoundingClientRect();
    return r.top + r.height / 2;
  }

  // Find the section whose center is closest to the main center
  function findClosestSection(){
    const center = mainCenterY();
    let closest = null;
    let minDist = Infinity;
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      const secCenter = r.top + r.height / 2;
      const d = Math.abs(secCenter - center);
      if(d < minDist){ minDist = d; closest = s; }
    });
    return closest;
  }

  // Update active link based on center-most section
  function updateActive(){
    const closest = findClosestSection();
    if(!closest) return;
    const id = closest.id;
    sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  }

  // Throttle scroll handling with rAF
  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateActive(); ticking = false; });
  }

  // Create a small ripple element inside a link and remove it after animation
  function createRipple(link, e){
    const rect = link.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.2;
    ripple.style.width = ripple.style.height = size + 'px';
    const clientX = e.clientX || (rect.left + rect.width/2);
    const clientY = e.clientY || (rect.top + rect.height/2);
    ripple.style.left = (clientX - rect.left - size/2) + 'px';
    ripple.style.top = (clientY - rect.top - size/2) + 'px';
    link.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  // Wire a sidebar link: click scrolling + ripple + keyboard
  function wireLink(link){
    link.addEventListener('click', e => {
      const target = document.getElementById(link.dataset.section);
      if(target){
        e.preventDefault();
        // immediate visual feedback
        sidebarLinks.forEach(l => l.classList.toggle('active', l === link));
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      createRipple(link, e);
    });

    link.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        link.click();
      }
    });
  }

  function init(){
    if(!main) return;
    // initial active
    updateActive();
    // events
    window.addEventListener('resize', updateActive);
    main.addEventListener('scroll', onScroll, { passive: true });
    sidebarLinks.forEach(wireLink);
    // ensure links are keyboard-focusable
    sidebarLinks.forEach(l => l.setAttribute('tabindex', '0'));
  }

  // Run init once DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
