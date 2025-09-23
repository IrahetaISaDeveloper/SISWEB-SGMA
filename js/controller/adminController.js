// controllers/adminController.js

const establecerEnlaceActivo = () => {
    const enlacesNavegacion = document.querySelectorAll('.barra-navegacion-centro .enlace-navegacion');
    const enlacePerfilUsuario = document.querySelector('.barra-navegacion-derecha .info-usuario-enlace');
    const rutaActual = window.location.pathname.split('/').pop();

    enlacesNavegacion.forEach(enlace => {
        enlace.classList.remove('active');
        const hrefEnlace = enlace.getAttribute('href');

        if (hrefEnlace && hrefEnlace.includes(rutaActual)) {
            enlace.classList.add('active');
        }
    });

    if (rutaActual === 'perfil-coord.html' && enlacePerfilUsuario) {
        // Puedes agregar lógica visual adicional si es necesario
    }
};

const initAdminController = () => {
    document.addEventListener('DOMContentLoaded', () => {
        const enlacePerfilUsuario = document.querySelector('.barra-navegacion-derecha .info-usuario-enlace');

        if (enlacePerfilUsuario) {
            enlacePerfilUsuario.addEventListener('click', function (e) {
                // Permite la navegación predeterminada al perfil
            });
        }

        establecerEnlaceActivo();
        window.addEventListener('hashchange', establecerEnlaceActivo);
    });
};

export { initAdminController };