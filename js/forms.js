
$(function(){

  // ------- CONFIG PRECIOS --------
  const precios = {
    "Lavado básico":   {"Sedan":10000,"SUV":11000,"Pick up":12000},
    "Lavado Meguiar’s":{"Sedan":12000,"SUV":13000,"Pick up":14000}
  };

  // ------- HELPERS --------
  function crc(n){ return '₡ ' + (n||0).toLocaleString('es-CR'); }
  function isLaboral(fecha){
    if(!fecha) return false;
    const d = new Date(fecha+'T12:00:00');
    const day = d.getDay();
    return day>=1 && day<=6; // 1=Lunes ... 6=Sábado
  }
  function horaValida(hhmm){
    if(!hhmm) return false;
    const [h,m] = hhmm.split(':').map(Number);
    const mins = h*60 + m;
    return mins>=360 && mins<=900; // 06:00–15:00
  }

  // ------- VALIDACIONES EN UI --------
  const $fecha = $('input[name="fecha_servicio"]');
  $fecha.on('change', function(){
    const v = this.value; if(!v) return;
    if(!isLaboral(v)){
      alert('No se puede agendar el domingo: elige de lunes a sábado.');
      this.value='';
    }
  });
  const $hora = $('input[name="hora_servicio"]');
  $hora.attr({min:'06:00',max:'15:00',step:900}).on('change', function(){
    const t=this.value; if(!t) return;
    const [h,m]=t.split(':').map(Number); const mins=h*60+m;
    if(mins<360||mins>900){
      alert('Hora fuera del horario (6:00 a 15:00).');
      this.value='';
    }
  });

  // ------- LECTURA DE SELECCIONES --------
  function compute(){
    const paquete = $('#selPaquete').val();
    const veh     = $('#selVehiculo').val();
    const base    = (precios[paquete] && precios[paquete][veh]) ? precios[paquete][veh] : 0;

    const extras = [];
    $('input[name="extra"]:checked').each(function(){
      const [n,p] = (this.value||'').split('|');
      const val   = parseInt(p||'0',10)||0;
      extras.push({nombre:n, precio:val, eval:(val===0)});
    });

    const extrasTxt = extras.length
      ? extras.map(x => `${x.nombre} — ${x.eval ? 'según evaluación' : crc(x.precio)}`).join('\n')
      : 'Ninguno';

    return {
      paquete,
      veh,
      base,
      extras,
      extrasTxt,
      tipo_lavado_nombre: paquete||'-',
      tipo_lavado_precio: crc(base),
      tipo_vehiculo_nombre: veh||'-',
      tipo_vehiculo_precio: crc(base) // referencia del combo
    };
  }

  // ------- MENSAJE FORMATEADO --------
  function construirMensaje(){
    const f = new FormData(document.getElementById('frmContacto'));
    const email=(f.get('email')||'').trim();
    const nombre=(f.get('nombre')||'').trim();
    const tel=(f.get('telefono')||'').trim();
    const fecha=f.get('fecha_servicio');
    const hora=f.get('hora_servicio');

    const C = compute();

    const cuerpo = [
      'Cita Autolavado',
      `Email: ${email}`,
      `Nombre completo: ${nombre}`,
      `Número de teléfono: ${tel}`,
      '',
      `Fecha del servicio: ${fecha||'-'}`,
      `Hora del servicio (CR): ${hora||'-'}`,
      '',
      `Tipo de lavado: ${C.tipo_lavado_nombre} (${C.tipo_lavado_precio})`,
      `Tipo de vehículo: ${C.tipo_vehiculo_nombre} (${C.tipo_vehiculo_precio})`,
      `Servicios adicionales:`,
      C.extrasTxt
    ].join('\n');

    return {cuerpo, email, nombre, tel, fecha, hora, C};
  }

  // ------- FEEDBACK UI --------
  function showStatus(kind, msg){
    const $s = $('#sendStatus');
    $s.removeClass('d-none alert-info alert-success alert-danger')
      .addClass('alert-'+kind).text(msg);
  }

  function canUseEmailJS(){
    const cfg = (window.__LUX_EMAIL__||{});
    return !!(window.emailjs && cfg.EMAILJS_PUBLIC_KEY && cfg.EMAILJS_SERVICE_ID && cfg.EMAILJS_TEMPLATE_ID);
  }

  async function enviarConEmailJS(){
    const cfg = window.__LUX_EMAIL__ || {};
    const {cuerpo, email, nombre, tel, fecha, hora, C} = construirMensaje();

    emailjs.init(cfg.EMAILJS_PUBLIC_KEY);
    const params = {
      to_email: cfg.TO_EMAIL || 'diegomonge0899@gmail.com',
      cc_email: cfg.CC_EMAIL || 'di360ray@gmail.com',
      from_email: email,
      user_name: nombre,
      user_phone: tel,
      fecha_servicio: fecha||'-',
      hora_servicio: hora||'-',
      subject: cfg.SUBJECT || 'Cita Autolavado',
      message: cuerpo,
      tipo_lavado_nombre: C.tipo_lavado_nombre,
      tipo_lavado_precio: C.tipo_lavado_precio,
      tipo_vehiculo_nombre: C.tipo_vehiculo_nombre,
      tipo_vehiculo_precio: C.tipo_vehiculo_precio,
      extras_list: C.extrasTxt
    };
    return emailjs.send(cfg.EMAILJS_SERVICE_ID, cfg.EMAILJS_TEMPLATE_ID, params);
  }

  // ------- CLICK: ENVIAR CORREO --------
  $('#btnCorreo').on('click', async function(){
    // Validación mínima
    const f = new FormData(document.getElementById('frmContacto'));
    const email=(f.get('email')||'').trim();
    const nombre=(f.get('nombre')||'').trim();
    const tel=(f.get('telefono')||'').trim();
    const fecha=f.get('fecha_servicio');
    const hora=f.get('hora_servicio');

    function isEmail(x){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x); }
    function isTelCR(x){ return /^\+?\s*506\s*\d{8}$/.test(x) || /^\d{8}$/.test(x); }

    if(!isEmail(email)){ alert('Ingresa un correo válido.'); return; }
    if(nombre.length<3){ alert('Ingresa tu nombre completo.'); return; }
    if(!isTelCR(tel)){ alert('Ingresa un teléfono CR válido (8 dígitos, con o sin +506).'); return; }
    if(!fecha || !(/\d{4}-\d{2}-\d{2}/.test(fecha))){ alert('Elige una fecha.'); return; }
    if(!hora || !(/\d{2}:\d{2}/.test(hora))){ alert('Elige una hora.'); return; }
    // Reglas de negocio
    const d = new Date(fecha+'T12:00:00'); if(d.getDay()===0){ alert('Los domingos no atendemos.'); return; }
    const [hh,mm] = hora.split(':').map(Number); const mins = hh*60+mm;
    if(mins<360 || mins>900){ alert('Horario: 06:00 a 15:00.'); return; }

    if(canUseEmailJS()){
      try{
        showStatus('info','Enviando correo...');
        $(this).prop('disabled', true);
        await enviarConEmailJS();
        showStatus('success','¡Correo enviado correctamente! Revisa tu bandeja.');
      }catch(err){
        console.error(err);
        showStatus('danger','No se pudo enviar con EmailJS. Intentando abrir tu cliente de correo...');
        // Fallback a mailto
        const {cuerpo} = construirMensaje();
        const subject = encodeURIComponent('Cita Autolavado');
        const body = encodeURIComponent(cuerpo);
        window.location.href = `mailto:diegomonge0899@gmail.com?cc=di360ray@gmail.com&subject=${subject}&body=${body}`;
      }finally{
        $(this).prop('disabled', false);
      }
    }else{
      // Sin EmailJS configurado: mailto
      const {cuerpo} = construirMensaje();
      const subject = encodeURIComponent('Cita Autolavado');
      const body = encodeURIComponent(cuerpo);
      window.location.href = `mailto:diegomonge0899@gmail.com?cc=di360ray@gmail.com&subject=${subject}&body=${body}`;
    }
  });

  // ------- CLICK: WHATSAPP --------
  $('#btnWhatsApp').on('click', function(){
    const {cuerpo} = construirMensaje();
    const encoded = encodeURIComponent(cuerpo);
    window.open(`https://api.whatsapp.com/send?phone=50684529792&text=${encoded}`, '_blank');
  });

});
