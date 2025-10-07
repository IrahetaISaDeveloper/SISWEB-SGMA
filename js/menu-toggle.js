// menu-toggle.js - VERSIÓN CORREGIDA CON TOGGLE COMPLETO
console.log('🔧 menu-toggle.js cargando...');

function initMenuToggle() {
    console.log('🚀 Iniciando menu toggle...');
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const offcanvas = document.getElementById('offcanvas');
    const overlay = document.getElementById('overlay');

    // Verificar elementos críticos
    if (!hamburgerBtn || !offcanvas) {
        console.log('⏳ Elementos del menu no encontrados, reintentando en 100ms...');
        setTimeout(initMenuToggle, 100);
        return;
    }

    console.log('✅ Elementos del menu encontrados:', {
        hamburgerBtn: !!hamburgerBtn,
        closeBtn: !!closeBtn,
        offcanvas: !!offcanvas,
        overlay: !!overlay
    });

    // Abrir offcanvas
    hamburgerBtn.addEventListener('click', () => {
        console.log('📱 Abriendo offcanvas');
        offcanvas.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Cerrar offcanvas
    function closeOffcanvas() {
        console.log('📱 Cerrando offcanvas');
        offcanvas.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Cerrar todos los dropdowns al cerrar offcanvas
        closeAllDropdowns();
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeOffcanvas);
    }

    if (overlay) {
        overlay.addEventListener('click', closeOffcanvas);
    }

    // Función para cerrar todos los dropdowns
    function closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-content-sidebar');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    // Función para toggle dropdown - CORREGIDA
    function toggleDropdown(element, event) {
        if (window.innerWidth <= 768) {
            if (event) event.preventDefault();
            const dropdownContent = element.nextElementSibling;
            
            if (!dropdownContent || !dropdownContent.classList.contains('dropdown-content-sidebar')) {
                console.log('❌ Dropdown content no encontrado');
                return;
            }
            
            console.log('🎯 Dropdown element:', dropdownContent);
            console.log('🎯 Current display:', dropdownContent.style.display);
            
            // Verificar estilo computado
            const computedStyle = window.getComputedStyle(dropdownContent);
            console.log('🎯 Computed display:', computedStyle.display);
            
            const isVisible = dropdownContent.style.display === 'block';
            
            console.log('📱 Toggle dropdown - Visible:', isVisible);
            
            // Cerrar todos los dropdowns primero
            closeAllDropdowns();
            
            // Abrir/cerrar el dropdown actual
            if (!isVisible) {
                console.log('🔓 ABRIENDO DROPDOWN');
                dropdownContent.style.display = 'block';
                
                // Verificar después de aplicar cambios
                setTimeout(() => {
                    const newComputedStyle = window.getComputedStyle(dropdownContent);
                    console.log('🔍 Después de abrir:');
                    console.log('🔍 - style.display:', dropdownContent.style.display);
                    console.log('🔍 - computed display:', newComputedStyle.display);
                    
                    // Forzar si es necesario
                    if (newComputedStyle.display !== 'block') {
                        console.log('⚠️  Forzando display block con !important');
                        dropdownContent.style.setProperty('display', 'block', 'important');
                    }
                }, 50);
            } else {
                console.log('🔒 CERRANDO DROPDOWN');
                dropdownContent.style.display = 'none';
            }
        }
    }

    // Asignar la función a los dropdowns del offcanvas
    const dropdownToggles = document.querySelectorAll('.offcanvas .dropdown-toggle');
    console.log('📱 Dropdown toggles encontrados:', dropdownToggles.length);
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            console.log('🎯 Dropdown clickeado');
            toggleDropdown(this, e);
        });
    });

    // Cerrar offcanvas al hacer clic en enlaces normales
    const offcanvasLinks = document.querySelectorAll('.offcanvas .enlace-sidebar:not(.dropdown-toggle)');
    offcanvasLinks.forEach(link => {
        link.addEventListener('click', closeOffcanvas);
    });

    // Cerrar dropdowns al hacer clic fuera de ellos
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isDropdownToggle = event.target.closest('.dropdown-toggle');
            const isDropdownContent = event.target.closest('.dropdown-content-sidebar');
            
            if (!isDropdownToggle && !isDropdownContent) {
                console.log('👆 Clic fuera de dropdown - cerrando todos');
                closeAllDropdowns();
            }
        }
    });

    // Cerrar offcanvas con Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeOffcanvas();
        }
    });

    // Cerrar offcanvas al redimensionar a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeOffcanvas();
            // Cerrar dropdowns
            closeAllDropdowns();
        }
    });

    // Hacer la función global para onclick
    window.toggleDropdown = function(element) {
        toggleDropdown(element, window.event);
    };
    
    console.log('🎉 Menu toggle inicializado correctamente');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenuToggle);
} else {
    // DOM ya está listo
    initMenuToggle();
}

// También exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMenuToggle };
}