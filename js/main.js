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

  // Formulario: validación visual, todavía sin envío real.
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      formStatus.textContent =
        "Formulario validado correctamente. El envío se activará cuando conectemos el backend.";

      contactForm.reset();
    });
  }

  // Enlaces sociales provisionales.
  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      showToast(
        `Añade aquí la URL de tu perfil de ${link.dataset.placeholderLink}.`
      );
    });
  });

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

  const profileStage = document.querySelector(".profile-stage");
  const aboutSection = document.querySelector("#experiencia");

  function moveProfile() {
      if (!profileStage || !aboutSection || window.innerWidth < 992) {
          if (profileStage) profileStage.style.transform = "";
          return;
      }

      const stageTop = profileStage.getBoundingClientRect().top + window.scrollY;
      const stageHeight = profileStage.offsetHeight;
      const aboutBottom = aboutSection.getBoundingClientRect().bottom + window.scrollY;

      const movement = Math.max(
          0,
          Math.min(
              window.scrollY,
              aboutBottom - stageTop - stageHeight - 40
          )
      );

      profileStage.style.transform = `translateY(${movement}px)`;
  }

  window.addEventListener("scroll", moveProfile);
  window.addEventListener("resize", moveProfile);
  moveProfile();

});