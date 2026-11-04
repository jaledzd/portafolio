/* =========================================================
   JADD PORTFOLIO — Interacciones
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // Foto de perfil: si no existe assets/profile.jpg,
  // se mantienen las iniciales JA.
  const profileImage = document.getElementById("profileImage");
  const profileFallback = document.getElementById("profileFallback");

  if (profileImage && profileFallback) {
    profileImage.addEventListener("load", () => {
      profileImage.style.display = "block";
      profileFallback.style.display = "none";
    });

    profileImage.addEventListener("error", () => {
      profileImage.style.display = "none";
      profileFallback.style.display = "grid";
    });
  }

  // Cierra el menú móvil al seleccionar una sección.
  const navbarContent = document.getElementById("navbarContent");

  const navLinks = document.querySelectorAll(
    "#navbarContent .nav-link, #navbarContent .btn"
  );

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navbarContent && navbarContent.classList.contains("show")) {
        bootstrap.Collapse
          .getOrCreateInstance(navbarContent)
          .hide();
      }
    });
  });

  // Año automático en el footer.
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  // Formulario de contacto: envío real a AWS API Gateway
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  // Endpoint de API Gateway obtenido de Terraform
  const urlApiContacto = "https://1vjgzfxpzf.execute-api.eu-north-1.amazonaws.com/contacto";

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Validar los campos del formulario
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const botonEnviar = contactForm.querySelector(
        'button[type="submit"]'
      );

      // Recoger los valores de los inputs
      const datosContacto = {
        nombre: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        mensaje: document.getElementById("message").value.trim()
      };

      try {
        // Evitar envíos duplicados
        if (botonEnviar) botonEnviar.disabled = true;

        formStatus.textContent = "Enviando tu mensaje...";

        // Enviar los datos a API Gateway
        const respuesta = await fetch(urlApiContacto, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datosContacto)
        });

        const resultado = await respuesta.json();

        // Comprobar la respuesta de Lambda
        if (!respuesta.ok || !resultado.exito) {
          throw new Error(
            resultado.mensaje || "No se ha podido enviar el mensaje."
          );
        }

        // Mostrar confirmación y limpiar el formulario
        formStatus.textContent =
          "¡Mensaje enviado correctamente! Gracias por contactar conmigo.";

        contactForm.reset();

      } catch (error) {
        console.error("Error al enviar el formulario:", error);

        formStatus.textContent =
          error.message === "Failed to fetch"
            ? "No se ha podido conectar con el servidor. Inténtalo de nuevo."
            : error.message || "Ha ocurrido un error al enviar el mensaje.";

      } finally {
        // Volver a habilitar el botón
        if (botonEnviar) botonEnviar.disabled = false;
      }
    });
  }


  // Aviso reutilizable.
  function showToast(message) {
    const toast = document.getElementById("toastMessage");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // La foto desciende con el scroll y se detiene centrada en «Sobre mí».
  const profileStage = document.querySelector(".profile-stage");
  const aboutSection = document.querySelector("#sobre-mi");
  let profileStartTop = 0;

  function measureProfile() {
    if (!profileStage) return;
    profileStage.style.transform = "";
    profileStartTop = profileStage.getBoundingClientRect().top + window.scrollY;
  }

  function moveProfile() {
    if (!profileStage || !aboutSection || window.innerWidth < 992) {
      if (profileStage) profileStage.style.transform = "";
      return;
    }

    const stageHeight = profileStage.offsetHeight;
    const aboutRect = aboutSection.getBoundingClientRect();
    const aboutCenter = aboutRect.top + window.scrollY + aboutRect.height / 2;
    const stopAt = Math.max(0, aboutCenter - profileStartTop - stageHeight / 2);
    const movement = Math.min(Math.max(0, window.scrollY), stopAt);

    profileStage.style.transform = `translate3d(0, ${movement}px, 0)`;
  }

  measureProfile();
  window.addEventListener("scroll", moveProfile, { passive: true });
  window.addEventListener("resize", () => {
    measureProfile();
    moveProfile();
  });
  moveProfile();

  // Desplegar las categorías adicionales del stack bajo demanda.
  const techToggle = document.getElementById("toggleTechGroups");
  const extraTechGroups = document.querySelectorAll(".tech-group-extra");

  if (techToggle && extraTechGroups.length) {
    techToggle.addEventListener("click", () => {
      const willExpand = techToggle.getAttribute("aria-expanded") !== "true";

      extraTechGroups.forEach((group) => {
        group.hidden = !willExpand;
      });

      techToggle.setAttribute("aria-expanded", String(willExpand));
      techToggle.innerHTML = willExpand
        ? 'Mostrar menos <i class="bi bi-chevron-up" aria-hidden="true"></i>'
        : 'Mostrar todas las tecnologías <i class="bi bi-chevron-down" aria-hidden="true"></i>';

      if (willExpand) {
        // Esperar a que el navegador pinte las filas antes de medir su anchura.
        requestAnimationFrame(() => {
          extraTechGroups.forEach((group) => refreshTechControls(group));
          extraTechGroups[0].scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
  }

  // Carruseles del stack: una fila independiente por categoría.
  const techGroups = Array.from(document.querySelectorAll(".tech-group"));

  function refreshTechControls(group) {
    const track = group.querySelector(".tech-track");
    const previous = group.querySelector('[data-tech-direction="-1"]');
    const next = group.querySelector('[data-tech-direction="1"]');

    if (!track || !previous || !next || group.hidden) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const hasOverflow = maxScroll > 2;

    track.classList.toggle("is-overflowing", hasOverflow);
    previous.hidden = !hasOverflow;
    next.hidden = !hasOverflow;
    previous.disabled = !hasOverflow || track.scrollLeft <= 2;
    next.disabled = !hasOverflow || track.scrollLeft >= maxScroll - 2;
  }

  // Carruseles del stack: recalcular también al desplegar categorías.
  techGroups.forEach((group) => {
    const track = group.querySelector(".tech-track");
    const previous = group.querySelector('[data-tech-direction="-1"]');
    const next = group.querySelector('[data-tech-direction="1"]');

    if (!track || !previous || !next) return;

    previous.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.82, behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.82, behavior: "smooth" });
    });

    track.addEventListener("scroll", () => refreshTechControls(group), { passive: true });
    window.addEventListener("resize", () => refreshTechControls(group));
    refreshTechControls(group);
  });
  
  // Carruseles reutilizables para Proyectos y Certificados.
  const contentCarousels = document.querySelectorAll("[data-content-carousel]");

  contentCarousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-content-track]");
    const previous = carousel.querySelector('[data-content-direction="-1"]');
    const next = carousel.querySelector('[data-content-direction="1"]');
    const toggle = carousel.querySelector("[data-content-toggle]");

    if (!track || !previous || !next || !toggle) return;

    function refreshContentControls() {
      const expanded = carousel.classList.contains("is-expanded");
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const hasOverflow = maxScroll > 2;

      carousel.classList.toggle("has-overflow", hasOverflow);
      previous.hidden = expanded || !hasOverflow;
      next.hidden = expanded || !hasOverflow;
      previous.disabled = !hasOverflow || track.scrollLeft <= 2;
      next.disabled = !hasOverflow || track.scrollLeft >= maxScroll - 2;
      toggle.hidden = !hasOverflow && track.children.length <= 2;
    }

    previous.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.82, behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.82, behavior: "smooth" });
    });

    track.addEventListener("scroll", refreshContentControls, { passive: true });
    window.addEventListener("resize", refreshContentControls);

    toggle.addEventListener("click", () => {
      const willExpand = !carousel.classList.contains("is-expanded");
      carousel.classList.toggle("is-expanded", willExpand);
      toggle.setAttribute("aria-expanded", String(willExpand));
      toggle.innerHTML = willExpand
        ? 'Mostrar menos <i class="bi bi-chevron-up" aria-hidden="true"></i>'
        : 'Mostrar más <i class="bi bi-chevron-down" aria-hidden="true"></i>';

      if (!willExpand) track.scrollTo({ left: 0, behavior: "smooth" });

      requestAnimationFrame(refreshContentControls);
    });

    refreshContentControls();
  });

});