class MenuHamburguesa {
    constructor() {
        this.sidebar = null;
        this.hamburgerBtn = null;
        this.overlay = null;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.createHamburgerButton();
        this.createOverlay();
        this.sidebar = document.querySelector('.sidebar');
        this.setupEventListeners();
        this.handleResize();
    }

    createHamburgerButton() {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.classList.add('hamburger-btn');
        hamburgerBtn.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        hamburgerBtn.setAttribute('aria-label', 'Abrir menú de navegación');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        
        document.body.appendChild(hamburgerBtn);
        this.hamburgerBtn = hamburgerBtn;
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.classList.add('sidebar-overlay');
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    setupEventListeners() {
        // Toggle menu on hamburger button click
        this.hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking overlay
        this.overlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close menu when clicking sidebar links (mobile)
        const sidebarLinks = this.sidebar.querySelectorAll('.enlace-sidebar');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    this.closeMenu();
                }
            });
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Prevent menu close when clicking inside sidebar
        this.sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.sidebar.contains(e.target) && !this.hamburgerBtn.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.sidebar.classList.add('sidebar-open');
        this.hamburgerBtn.classList.add('hamburger-active');
        this.overlay.classList.add('overlay-active');
        document.body.classList.add('menu-open');
        
        this.hamburgerBtn.setAttribute('aria-expanded', 'true');
        this.hamburgerBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
        
        // Animate hamburger to X
        this.animateHamburgerToX();
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.sidebar.classList.remove('sidebar-open');
        this.hamburgerBtn.classList.remove('hamburger-active');
        this.overlay.classList.remove('overlay-active');
        document.body.classList.remove('menu-open');
        
        this.hamburgerBtn.setAttribute('aria-expanded', 'false');
        this.hamburgerBtn.setAttribute('aria-label', 'Abrir menú de navegación');
        
        // Animate X back to hamburger
        this.animateXToHamburger();
    }

    handleResize() {
        if (window.innerWidth > 1024) {
            this.closeMenu();
            this.hamburgerBtn.style.display = 'none';
            this.overlay.style.display = 'none';
        } else {
            this.hamburgerBtn.style.display = 'flex';
            this.overlay.style.display = 'block';
        }
    }

    animateHamburgerToX() {
        const lines = this.hamburgerBtn.querySelectorAll('.hamburger-line');
        if (lines.length >= 3) {
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        }
    }

    animateXToHamburger() {
        const lines = this.hamburgerBtn.querySelectorAll('.hamburger-line');
        if (lines.length >= 3) {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    }

    // Public method to initialize the menu hamburguesa
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            new MenuHamburguesa();
        });
    }
}

// Auto-initialize when script is loaded
MenuHamburguesa.init();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuHamburguesa;
}
