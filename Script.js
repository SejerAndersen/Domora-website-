// JavaScript til mobilmenu
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const mobileMenu = document.querySelector('.nav-mobile');
    const closeBtn = document.querySelector('.mobile-menu-close');
    
    menuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('active');
    });
    
    closeBtn.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
    });
    
    // Luk mobilmenu når der klikkes på et link
    const mobileLinks = document.querySelectorAll('.mobile-nav-list a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    });
    
    // Header scroll effekt
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.padding = '0.7rem 0';
            header.style.backgroundColor = 'rgba(8, 8, 8, 0.95)';
        } else {
            header.style.padding = '1.5rem 0';
            header.style.backgroundColor = 'rgba(8, 8, 8, 0.8)';
        }
    });
    
    // Marquee pause animation på hover (kun på forsiden)
    const marquee = document.querySelector('.marquee');
    if (marquee) {
        marquee.addEventListener('mouseenter', () => {
            marquee.style.animationPlayState = 'paused';
        });
        
        marquee.addEventListener('mouseleave', () => {
            marquee.style.animationPlayState = 'running';
        });
    }
    
    // Back to top button (primært til services siden)
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});