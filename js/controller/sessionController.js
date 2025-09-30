
import { me, logout } from "../service/authService.js";

// Estado de sesión global
export const auth = {
  ok: false,   // indica si la sesión está activa
  user: null,  // guarda datos del instructor autenticado
};

// Controla qué enlaces de menú deben mostrarse según el estado de sesión
export function ensureMenuLinks(shouldShow) {
  const loginLink = document.getElementById("loginLink");

  if (shouldShow) {
    // Se oculta el enlace "Iniciar sesión"
    loginLink?.classList.add("d-none");
    // Aquí puedes agregar enlaces específicos para instructores autenticados
  } else {
    // Se vuelve a mostrar el enlace "Iniciar sesión"
    loginLink?.classList.remove("d-none");
  }
}

// Renderiza la caja de usuario y ajusta el menú según el estado de autenticación
export async function renderUser() {
  // No hacer peticiones si estamos en la página de login
  const currentPath = window.location.pathname.toLowerCase();
  const isLoginPage = currentPath.includes('.html') || currentPath.endsWith('/') || currentPath.includes('login');
  
  if (isLoginPage) {
    return; // No verificar sesión en página de login
  }

  const userBox = document.getElementById("userBox");

  try {
    const info = await me();               // consulta al endpoint /meInstructor
    auth.ok = !!info?.authenticated;      // true si está autenticado
    auth.user = info?.instructor ?? null;

    if (auth.ok) {
      ensureMenuLinks(true);

      if (userBox) {
        // Construye saludo y botón de logout adaptado para instructores
        const userName = auth.user?.names || auth.user?.firstName || auth.user?.email || "instructor";
        userBox.innerHTML = `
          <span class="me-3">Hola, <strong>${userName}</strong></span>
          <button id="btnLogout" class="btn btn-outline-danger btn-sm">Salir</button>
        `;
        userBox.classList.remove("d-none");

        // Listener para logout
        document.getElementById("btnLogout")?.addEventListener("click", async () => {
          await logout();             // llama al backend para cerrar sesión
          auth.ok = false;
          auth.user = null;
          ensureMenuLinks(false);     // limpia enlaces del menú
          window.location.replace("index.html"); // redirige al login
        });
      }
    } else {
      // Caso: no autenticado
      auth.ok = false;
      auth.user = null;
      userBox?.classList.add("d-none");
      ensureMenuLinks(false);
    }
  } catch {
    // Caso: error consultando /meInstructor → se trata como no autenticado
    auth.ok = false;
    auth.user = null;
    document.getElementById("userBox")?.classList.add("d-none");
    ensureMenuLinks(false);
  }
}

// Verifica si hay sesión activa
// Si no existe sesión y redirect es true, se envía al login
export async function requireAuth({ redirect = true } = {}) {
  try {
    const info = await me();             // consulta al backend
    console.log(!!info?.authenticated);
    auth.ok = !!info?.authenticated;
    auth.user = info?.instructor ?? null;
  } catch {
    auth.ok = false;
    auth.user = null;
  }

  if (!auth.ok && redirect) {
    window.location.replace(".html");
  }
  return auth.ok; // devuelve booleano indicando si hay sesión
}

// Funciones para roles de instructores
export function getUserRole() {
  return auth.user?.role || "";
}

export function hasAuthority(authority) {
  return Array.isArray(auth.user?.authorities)
    ? auth.user.authorities.includes(authority)
    : false;
}

export const role = {
  isAdmin: () =>
    getUserRole() === "Animador" || hasAuthority("ROLE_Animador"),

  isDocente: () =>
    getUserRole() === "Docente" || hasAuthority("ROLE_Docente"),

  isCoordinadora: () =>
    getUserRole() === "Coordinadora" || hasAuthority("ROLE_Docente"),
};

// Refresca automáticamente la sesión y el menú solo en páginas que no son de login
window.addEventListener("pageshow", async (event) => {
  const currentPath = window.location.pathname.toLowerCase();
  const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('login');
  
  if (event.persisted && !isLoginPage) {
    await renderUser();
  }
});

// Inicialización automática para páginas protegidas
document.addEventListener('DOMContentLoaded', async () => {
  const currentPath = window.location.pathname.toLowerCase();
  const isLoginPage = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath.includes('login');
  
  // Solo renderizar usuario en páginas que NO son de login
  if (!isLoginPage) {
    await renderUser();
    
    // Verificar autenticación en páginas protegidas
    const protectedPages = ['coordi-index', 'dashboard', 'admin', 'panel'];
    
    if (protectedPages.some(page => currentPath.includes(page))) {
      await requireAuth();
    }
  }
});
