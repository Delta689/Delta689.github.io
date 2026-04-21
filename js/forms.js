$(function () {
  const money = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0
  });

  const VEHICULOS = ["Sedan", "SUV", "Pick up"];
  let serviceData = null;

  function crc(n) {
    return money.format(Number(n || 0));
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 8);
  }

  function getFullPhone(localPhone) {
    const digits = normalizePhone(localPhone);
    return digits ? `+506 ${digits}` : "";
  }

  function isLaboral(fecha) {
    if (!fecha) return false;
    const d = new Date(fecha + "T12:00:00");
    const day = d.getDay();
    return day >= 1 && day <= 6;
  }

  function horaValida(hhmm) {
    if (!hhmm) return false;
    const [h, m] = hhmm.split(":").map(Number);
    const mins = h * 60 + m;
    return mins >= 360 && mins <= 900;
  }

  async function loadServices() {
    const res = await fetch("data/services.json");
    serviceData = await res.json();

    const $paquete = $("#selPaquete");
    const $vehiculo = $("#selVehiculo");
    const $extras = $("#extrasWrap");

    $paquete.html(`<option value="">Seleccionar paquete...</option>`);
    serviceData.paquetes.forEach(pkg => {
      $paquete.append(`<option value="${pkg.nombre}">${pkg.nombre}</option>`);
    });

    $vehiculo.html(`<option value="">Seleccionar vehículo...</option>`);
    VEHICULOS.forEach(v => {
      $vehiculo.append(`<option value="${v}">${v}</option>`);
    });

    $extras.html(serviceData.extras.map((extra, index) => {
      const value = `${extra.nombre}|${extra.precio == null ? 0 : extra.precio}|${extra.precio == null ? 1 : 0}`;
      const labelPrice = extra.precio == null ? "Según evaluación" : crc(extra.precio);

      return `
        <div class="col-md-6">
          <label class="form-check mini-extra w-100">
            <input class="form-check-input me-2" type="checkbox" name="extra" value="${value}" id="extra_${index}">
            <span class="fw-bold d-block">${extra.nombre}</span>
            <small class="text-secondary d-block">${extra.descripcion}</small>
            <small class="text-dark fw-semibold">${labelPrice}</small>
          </label>
        </div>
      `;
    }).join(""));

    const urlPackage = new URLSearchParams(window.location.search).get("paquete");
    if (urlPackage) $paquete.val(urlPackage);

    updateSummary();
  }

  function getPackage() {
    if (!serviceData) return null;
    return serviceData.paquetes.find(p => p.nombre === $("#selPaquete").val()) || null;
  }

  function getExtrasSelected() {
    return $('input[name="extra"]:checked').map(function () {
      const [nombre, precio, evaluacion] = (this.value || "").split("|");
      return {
        nombre,
        precio: Number(precio || 0),
        evaluacion: evaluacion === "1"
      };
    }).get();
  }

  function calculate() {
    const pkg = getPackage();
    const vehiculo = $("#selVehiculo").val();
    const extras = getExtrasSelected();

    const base = pkg && vehiculo && pkg.precios[vehiculo] ? pkg.precios[vehiculo] : 0;
    const extrasTotal = extras.reduce((acc, e) => acc + (e.evaluacion ? 0 : e.precio), 0);

    return {
      paquete: pkg ? pkg.nombre : "",
      vehiculo,
      base,
      extras,
      extrasTotal,
      total: base + extrasTotal
    };
  }

  function updateSummary() {
    const calc = calculate();
    const extrasText = calc.extras.length
      ? calc.extras.map(e => `
          <div class="line">
            <span>${e.nombre}</span>
            <span>${e.evaluacion ? "A evaluar" : crc(e.precio)}</span>
          </div>
        `).join("")
      : `<div class="line"><span>Extras</span><span>Ninguno</span></div>`;

    $("#summaryBox").html(`
      <div class="line">
        <span>Paquete</span>
        <strong>${calc.paquete || "-"}</strong>
      </div>
      <div class="line">
        <span>Vehículo</span>
        <strong>${calc.vehiculo || "-"}</strong>
      </div>
      <div class="line">
        <span>Precio base</span>
        <strong>${calc.base ? crc(calc.base) : "-"}</strong>
      </div>
      ${extrasText}
      <div class="line total">
        <span>Total estimado</span>
        <span>${calc.total ? crc(calc.total) : "-"}</span>
      </div>
      <small class="d-block mt-2 text-secondary">
        Los extras marcados como “A evaluar” no se suman al total hasta revisarlos.
      </small>
    `);
  }

  function buildMessage() {
    const form = new FormData(document.getElementById("frmContacto"));
    const calc = calculate();
    const localPhone = normalizePhone(form.get("telefono"));
    const fullPhone = getFullPhone(localPhone);

    const extrasList = calc.extras.length
      ? calc.extras.map(e => `${e.nombre} - ${e.evaluacion ? "Según evaluación" : crc(e.precio)}`).join("\n")
      : "Ninguno";

    const text = [
      "Solicitud de cita - LuxDetailing Center",
      `Nombre: ${(form.get("nombre") || "").trim()}`,
      `Email: ${(form.get("email") || "").trim()}`,
      `Teléfono: ${fullPhone || "-"}`,
      `Fecha: ${form.get("fecha_servicio") || "-"}`,
      `Hora: ${form.get("hora_servicio") || "-"}`,
      `Paquete: ${calc.paquete || "-"}`,
      `Vehículo: ${calc.vehiculo || "-"}`,
      `Precio base: ${calc.base ? crc(calc.base) : "-"}`,
      "Extras:",
      extrasList,
      `Total estimado: ${calc.total ? crc(calc.total) : "-"}`,
      "",
      `Mensaje adicional: ${(form.get("mensaje") || "").trim() || "Sin observaciones"}`
    ].join("\n");

    return { form, calc, text, extrasList, fullPhone };
  }

  function canUseEmailJS() {
    const cfg = window.__LUX_EMAIL__ || {};
    return !!(
      window.emailjs &&
      cfg.EMAILJS_PUBLIC_KEY &&
      cfg.EMAILJS_SERVICE_ID &&
      cfg.EMAILJS_TEMPLATE_ID &&
      !cfg.EMAILJS_PUBLIC_KEY.startsWith("PEGA_")
    );
  }

  async function sendEmailJS(payload) {
    const cfg = window.__LUX_EMAIL__ || {};

    emailjs.init(cfg.EMAILJS_PUBLIC_KEY);

    return emailjs.send(cfg.EMAILJS_SERVICE_ID, cfg.EMAILJS_TEMPLATE_ID, {
      to_email: cfg.TO_EMAIL,
      cc_email: cfg.CC_EMAIL,
      from_email: payload.form.get("email"),
      user_name: payload.form.get("nombre"),
      user_phone: payload.fullPhone,
      fecha_servicio: payload.form.get("fecha_servicio"),
      hora_servicio: payload.form.get("hora_servicio"),
      tipo_lavado_nombre: payload.calc.paquete || "-",
      tipo_vehiculo_nombre: payload.calc.vehiculo || "-",
      tipo_lavado_precio: payload.calc.base ? crc(payload.calc.base) : "-",
      extras_list: payload.extrasList,
      total_estimado: payload.calc.total ? crc(payload.calc.total) : "-",
      message: payload.text,
      subject: cfg.SUBJECT || "Solicitud de cita - LuxDetailing Center"
    });
  }

  function validateBeforeSend() {
    const form = new FormData(document.getElementById("frmContacto"));
    const email = (form.get("email") || "").trim();
    const nombre = (form.get("nombre") || "").trim();
    const tel = normalizePhone(form.get("telefono"));
    const fecha = form.get("fecha_servicio");
    const hora = form.get("hora_servicio");
    const paquete = $("#selPaquete").val();
    const vehiculo = $("#selVehiculo").val();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const telOk = /^\d{8}$/.test(tel);

    if (!nombre || nombre.length < 3) {
      alert("Ingresa tu nombre completo.");
      return false;
    }
    if (!emailOk) {
      alert("Ingresa un correo válido.");
      return false;
    }
    if (!telOk) {
      alert("Ingresa un número de 8 dígitos.");
      return false;
    }
    if (!fecha || !isLaboral(fecha)) {
      alert("Selecciona una fecha de lunes a sábado.");
      return false;
    }
    if (!hora || !horaValida(hora)) {
      alert("Selecciona una hora entre 6:00 am y 3:00 pm.");
      return false;
    }
    if (!paquete) {
      alert("Selecciona un paquete.");
      return false;
    }
    if (!vehiculo) {
      alert("Selecciona un tipo de vehículo.");
      return false;
    }

    return true;
  }

  $("#frmContacto").on("change input", "input, select, textarea", updateSummary);

  $("#telefono").on("input", function () {
    this.value = normalizePhone(this.value);
  });

  $('input[name="fecha_servicio"]').on("change", function () {
    if (this.value && !isLaboral(this.value)) {
      alert("No se atienden domingos. Selecciona de lunes a sábado.");
      this.value = "";
      updateSummary();
    }
  });

  $('input[name="hora_servicio"]').attr({
    min: "06:00",
    max: "15:00",
    step: 900
  }).on("change", function () {
    if (this.value && !horaValida(this.value)) {
      alert("Horario disponible de 6:00 am a 3:00 pm.");
      this.value = "";
      updateSummary();
    }
  });

  $("#btnCorreo").on("click", async function () {
    if (!validateBeforeSend()) return;

    const payload = buildMessage();
    const cfg = window.__LUX_EMAIL__ || {};
    const status = $("#sendStatus");

    status.removeClass("d-none alert-danger alert-success alert-info").addClass("alert alert-info").text("Enviando solicitud...");

    try {
      if (canUseEmailJS()) {
        await sendEmailJS(payload);
        status.removeClass("alert-info").addClass("alert-success").text("Solicitud enviada correctamente.");
      } else {
        const subject = encodeURIComponent(cfg.SUBJECT || "Solicitud de cita - LuxDetailing Center");
        const body = encodeURIComponent(payload.text);
        const to = encodeURIComponent(cfg.TO_EMAIL || window.__LUX_CONFIG__.EMAIL_MAIN);
        const cc = encodeURIComponent(cfg.CC_EMAIL || window.__LUX_CONFIG__.EMAIL_CC);
        window.location.href = `mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`;
        status.removeClass("alert-info").addClass("alert-success").text("Se abrió tu cliente de correo.");
      }
    } catch (error) {
      console.error(error);
      status.removeClass("alert-info").addClass("alert-danger").text("No se pudo enviar automáticamente. Intenta por WhatsApp.");
    }
  });

  $("#btnWhatsApp").on("click", function () {
    if (!validateBeforeSend()) return;

    const payload = buildMessage();
    const number = window.__LUX_CONFIG__.WHATSAPP_NUMBER;
    const text = encodeURIComponent(payload.text);
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  });

  loadServices().catch(error => {
    console.error(error);
    $("#extrasWrap").html(`<div class="alert alert-warning">No se pudieron cargar los servicios.</div>`);
  });
});