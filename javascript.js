<script>
(function(){
  "use strict";

  // ----- CONSTANTES -----
  const IVA_COMPRA = 1.21;
  const IVA_VENTA = 0.21;
  const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/pb8y7wan55b6inhft6mufphkv1j0y76d';
  const f2 = n => (Number(n || 0)).toFixed(2).replace('.', ',') + ' €';
  const pct = n => (Number(n || 0)).toFixed(1).replace('.', ',') + ' %';
  const VINILO_M2 = { htv: 15, adhesivo: 18, transfer: 8 };
  const LASER_PRESETS = {
    grabado_boligrafo: { maq: 2, man: 4 }, grabado_libreta: { maq: 4, man: 4 }, grabado_tabla: { maq: 8, man: 5 },
    grabado_metal: { maq: 5, man: 5 }, corte_simple: { maq: 8, man: 6 }, grabado_superficie: { maq: 15, man: 8 },
    grabado_premium: { maq: 20, man: 10 }, manual: null
  };
  const TRAMOS_321DTF = [
    { min: 1, max: 1, precio: 10.50 }, { min: 2, max: 5, precio: 9.98 }, { min: 6, max: 10, precio: 9.03 },
    { min: 11, max: 25, precio: 7.98 }, { min: 26, max: 60, precio: 7.45 }, { min: 61, max: 100, precio: 7.35 },
    { min: 101, max: Infinity, precio: 7.14 }
  ];
  const PROV_CONFIG = {
    '321dtf': { nombre: '321DTF', ancho_cm: 56, alto_cm: 100, coste_pliego: 10.50, envio: 3.50, envio_gratis_desde: null },
    'dtfbarcelona': { nombre: 'DTF Barcelona', ancho_cm: 60, alto_cm: 100, coste_pliego: 9.15, envio: 6.90, envio_gratis_desde: 50 },
    'tudtf': { nombre: 'TuDTF', ancho_cm: 56, alto_cm: 100, coste_pliego: 10.90, envio: 4.90, envio_gratis_desde: 150 },
    'dtfrapido': { nombre: 'DTFRápido', ancho_cm: 55, alto_cm: 100, coste_pliego: 9.65, envio: 0, envio_gratis_desde: 0 },
    'amazon': { nombre: 'Amazon (vinilo)', ancho_cm: 30.5, alto_cm: 300, coste_pliego: 14.20, envio: 0, envio_gratis_desde: 0 },
    'propio': { nombre: 'Producción propia', ancho_cm: 0, alto_cm: 0, coste_pliego: 0, envio: 0, envio_gratis_desde: 0 },
    'ninguno': { nombre: '—', ancho_cm: 0, alto_cm: 0, coste_pliego: 0, envio: 0, envio_gratis_desde: 0 }
  };
  const TECNICAS = {
    ninguna: { proveedores: [] },
    dtf_textil: { proveedores: ['321dtf', 'dtfbarcelona', 'tudtf', 'dtfrapido'] },
    dtf_oro: { proveedores: ['321dtf', 'dtfbarcelona', 'tudtf', 'dtfrapido'] },
    sublimacion: { proveedores: ['dtfbarcelona', 'tudtf'] },
    vinilo: { proveedores: ['amazon', 'propio'] },
    dtf_uv: { proveedores: ['321dtf', 'dtfbarcelona', 'tudtf', 'dtfrapido'] },
    bordado: { proveedores: ['propio'] },
    laser: { proveedores: ['propio'] }
  };
  const TRAMOS_VENTA = [
    { min: 1, max: 20, dto: 0.00 }, { min: 21, max: 49, dto: 0.02 }, { min: 50, max: 99, dto: 0.06 },
    { min: 100, max: 149, dto: 0.12 }, { min: 150, max: 199, dto: 0.15 }, { min: 200, max: Infinity, dto: 0.20 }
  ];
  const PERFILES_BLANCOS = {
    toleshop: [ {min:1,max:9,dto:0},{min:10,max:24,dto:0.05},{min:25,max:49,dto:0.10},{min:50,max:99,dto:0.15},{min:100,max:Infinity,dto:0.20} ],
    suave: [ {min:1,max:9,dto:0},{min:10,max:24,dto:0.03},{min:25,max:49,dto:0.06},{min:50,max:99,dto:0.10},{min:100,max:Infinity,dto:0.15} ],
    sin_descuento: [ {min:1,max:Infinity,dto:0} ]
  };
  const VALUETOP_DESCUENTOS = {
    0: 0, 1: 0.005, 2: 0.004, 3: 0.003, 4: 0.0025, 5: 0.002, 6: 0.0015, 7: 0.001, 8: 0.0005, 9: 0.0002
  };

  // ----- HELPERS -----
  function setText(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }
  function getTramoBlanco(q, tramos) { for(const t of tramos) if(q>=t.min && q<=t.max) return t; return tramos[tramos.length-1] || {dto:0,label:'Sin tramo'}; }
  function getTramoVenta(q) { for(let i=0;i<TRAMOS_VENTA.length;i++) if(q>=TRAMOS_VENTA[i].min && q<=TRAMOS_VENTA[i].max) return i; return TRAMOS_VENTA.length-1; }
  function get321Precio(metros) { for(const t of TRAMOS_321DTF) if(metros>=t.min && metros<=t.max) return t; return TRAMOS_321DTF[TRAMOS_321DTF.length-1]; }

  // Gestión de tramos blancos (artículo 1)
  function setTramosBlancos(tramos) {
    const rows = [1,2,3,4,5];
    rows.forEach((n,idx)=>{
      const t = tramos[idx] || {min:'',max:'',dto:0};
      document.getElementById(`tb${n}_min`).value = Number.isFinite(t.min) ? t.min : '';
      document.getElementById(`tb${n}_max`).value = t.max===Infinity ? 999999 : (Number.isFinite(t.max)?t.max:'');
      document.getElementById(`tb${n}_dto`).value = ((t.dto||0)*100).toFixed(1).replace(/\.0$/,'');
    });
  }
  function getTramosBlancosFromUI() {
    const out = [];
    for(let n=1;n<=5;n++){
      const min = parseInt(document.getElementById(`tb${n}_min`).value,10);
      const maxRaw = parseInt(document.getElementById(`tb${n}_max`).value,10);
      const dto = (parseFloat(document.getElementById(`tb${n}_dto`).value)||0)/100;
      if(!Number.isFinite(min)||!Number.isFinite(maxRaw)) continue;
      out.push({ min, max: maxRaw>=999999 ? Infinity : maxRaw, dto, label: (maxRaw>=999999?`${min}+ ud`:`${min}–${maxRaw} ud`) });
    }
    out.sort((a,b)=>a.min-b.min);
    return out;
  }
  function applyPerfilBlanco() {
    const perfil = document.getElementById('perfil_blanco').value;
    if(perfil!=='personalizado') setTramosBlancos(PERFILES_BLANCOS[perfil]||PERFILES_BLANCOS.toleshop);
    calc();
  }

  // Presupuesto
  function getTodayLocalISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset*60000);
    return local.toISOString().slice(0,10);
  }
  function getNextBudgetNumber() {
    const key = 'benditolab_budget_counter_26';
    let counter = parseInt(localStorage.getItem(key)||'1',10);
    if(!Number.isFinite(counter)||counter<1) counter=1;
    return `PRESU-26/${String(counter).padStart(4,'0')}`;
  }
  function advanceBudgetNumber() {
    const key = 'benditolab_budget_counter_26';
    let counter = parseInt(localStorage.getItem(key)||'1',10);
    if(!Number.isFinite(counter)||counter<1) counter=1;
    localStorage.setItem(key, String(counter+1));
  }
  function initBudgetMeta() {
    const numeroEl = document.getElementById('numero_presupuesto');
    const fechaEl = document.getElementById('fecha_presupuesto');
    if(numeroEl && !numeroEl.value.trim()) numeroEl.value = getNextBudgetNumber();
    if(fechaEl && !fechaEl.value) fechaEl.value = getTodayLocalISO();
  }

  // Proveedores y UI
  function populateProveedorSelect(selectId, tecnicaVal) {
    const sp = document.getElementById(selectId);
    const current = sp.value;
    const proveedores = TECNICAS[tecnicaVal]?.proveedores || [];
    sp.innerHTML = '';
    proveedores.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = PROV_CONFIG[key].nombre;
      sp.appendChild(opt);
    });
    if(proveedores.includes(current)) sp.value = current;
  }

  // Cálculo de personalización para un artículo (devuelve objeto con costes y detalles)
  function calcularPersonalizacion(art) {
    const pref = art === 2 ? '2' : '';
    const tecnica = document.getElementById(`tecnica${pref}`).value;
    if(tecnica === 'ninguna') return { pers_ud: 0, coste_total_mat: 0, coste_total_mat_sin_iva: 0, iva_mat_proveedor: 0, total_proveedor_personalizacion_con_iva: 0, envio_prov_total: 0, show_pliegos: false, detalle: null };

    const cantidad = Math.max(0, parseInt(document.getElementById(`cantidad${pref}`).value,10)||0);
    const dis_ancho = parseFloat(document.getElementById(`dis_ancho${pref}`).value)||0;
    const dis_alto = parseFloat(document.getElementById(`dis_alto${pref}`).value)||0;
    const posiciones = parseInt(document.getElementById(`posiciones${pref}`).value,10)||0;
    const persActiva = (dis_ancho>0 && dis_alto>0 && posiciones>0) || tecnica==='bordado' || tecnica==='laser';
    let cantidad_pers = (cantidad === 0 && persActiva) ? 1 : cantidad;

    const proveedor_key = document.getElementById(`proveedor_sel${pref}`).value;
    const prov = PROV_CONFIG[proveedor_key] || PROV_CONFIG['ninguno'];
    const MC = 0.2;

    let pers_ud = 0, coste_total_mat = 0, coste_total_mat_sin_iva = 0, iva_mat_proveedor = 0, total_proveedor_personalizacion_con_iva = 0;
    let envio_prov_total = 0, show_pliegos = false, detalle = null;

    if(tecnica === 'bordado' && art === 1) { // solo artículo 1 tiene campos de bordado
      const puntadas = parseInt(document.getElementById('puntadas').value,10)||5000;
      const bord_colores = parseInt(document.getElementById('bord_colores').value,10)||1;
      const bord_pos = parseInt(document.getElementById('bord_pos').value,10)||1;
      const bord_picaje = parseInt(document.getElementById('bord_picaje').value,10)||0;
      const bord_coste_puntada = parseFloat(document.getElementById('bord_coste_puntada').value)||0.0015;
      const bord_manipulacion = parseFloat(document.getElementById('bord_manipulacion').value)||1.25;
      const bord_picaje_coste = parseFloat(document.getElementById('bord_picaje_coste').value)||10;
      const bord_extra_color = parseFloat(document.getElementById('bord_extra_color').value)||0.15;
      const coste_puntadas_ud = puntadas * bord_coste_puntada * bord_pos;
      const extra_colores_ud = Math.max(0, bord_colores-1) * bord_extra_color * bord_pos;
      const coste_manipulacion_ud = bord_manipulacion * bord_pos;
      const coste_picaje_ud = bord_picaje ? (bord_picaje_coste / cantidad_pers) : 0;
      pers_ud = coste_puntadas_ud + extra_colores_ud + coste_manipulacion_ud + coste_picaje_ud;
      coste_total_mat = pers_ud * cantidad_pers;
      show_pliegos = true;
      detalle = { proveedor:'Producción propia', tramo: puntadas.toLocaleString()+' puntadas', dims: f2(bord_coste_puntada) };
    } else if(tecnica === 'laser' && art === 1) {
      const laser_maq = parseFloat(document.getElementById('laser_maq').value)||0;
      const laser_man = parseFloat(document.getElementById('laser_man').value)||0;
      const laser_extra_ud = parseFloat(document.getElementById('laser_extra_ud').value)||0;
      const laser_coste_hora = parseFloat(document.getElementById('laser_coste_hora').value)||0.63;
      const laser_coste_mo = parseFloat(document.getElementById('laser_coste_mo').value)||15;
      const coste_maquina_ud = (laser_maq/60)*laser_coste_hora;
      const coste_mano_obra_ud = (laser_man/60)*laser_coste_mo;
      pers_ud = coste_maquina_ud + coste_mano_obra_ud + laser_extra_ud;
      coste_total_mat = pers_ud * cantidad_pers;
      show_pliegos = true;
      detalle = { proveedor: 'Láser', tramo: f2(laser_coste_hora) };
    } else if(tecnica === 'vinilo') {
      const vinilo_tipo = document.getElementById(`vinilo_tipo${pref}`).value;
      const area_diseno_m2 = (dis_ancho * dis_alto) / 10000;
      const area_total_m2 = area_diseno_m2 * posiciones * cantidad_pers;
      const tarifa_m2 = VINILO_M2[vinilo_tipo] || 15;
      coste_total_mat_sin_iva = area_total_m2 * tarifa_m2;
      coste_total_mat = coste_total_mat_sin_iva * IVA_COMPRA;
      iva_mat_proveedor = coste_total_mat - coste_total_mat_sin_iva;
      pers_ud = coste_total_mat / cantidad_pers;
      envio_prov_total = 0;
      total_proveedor_personalizacion_con_iva = coste_total_mat;
      show_pliegos = true;
      detalle = { proveedor: prov.nombre, tramo: vinilo_tipo };
    } else if(tecnica !== 'ninguna') {
      const pw = prov.ancho_cm, ph = prov.alto_cm;
      if(pw>0 && ph>0 && persActiva) {
        const dh = Math.floor((pw - 2*MC + MC) / (dis_ancho + MC));
        const dv = Math.floor((ph - 2*MC + MC) / (dis_alto + MC));
        const dis_pliego = Math.max(1, dh*dv);
        const total_imp = cantidad_pers * posiciones;
        const num_pliegos = Math.ceil(total_imp / dis_pliego);
        if(proveedor_key==='321dtf' && tecnica==='dtf_textil') {
          const t = get321Precio(num_pliegos);
          coste_total_mat_sin_iva = t.precio * num_pliegos;
        } else {
          coste_total_mat_sin_iva = prov.coste_pliego * num_pliegos;
        }
        coste_total_mat = coste_total_mat_sin_iva * IVA_COMPRA;
        iva_mat_proveedor = coste_total_mat - coste_total_mat_sin_iva;
        pers_ud = coste_total_mat / cantidad_pers;
        let envio_prov_sin = 0;
        if(prov.envio_gratis_desde===null) envio_prov_sin = prov.envio;
        else if(coste_total_mat_sin_iva >= prov.envio_gratis_desde) envio_prov_sin = 0;
        else envio_prov_sin = prov.envio_gratis_desde===0 ? 0 : prov.envio;
        envio_prov_total = envio_prov_sin * IVA_COMPRA;
        total_proveedor_personalizacion_con_iva = coste_total_mat + envio_prov_total;
        show_pliegos = true;
      }
    }

    return { pers_ud, coste_total_mat, coste_total_mat_sin_iva, iva_mat_proveedor, total_proveedor_personalizacion_con_iva, envio_prov_total, show_pliegos, detalle };
  }

  // Cálculo completo de un artículo
  function calcularArticulo(art) {
    const pref = art === 2 ? '2' : '';
    const cantidad = Math.max(0, parseInt(document.getElementById(`cantidad${pref}`).value,10)||0);
    const precio_blanco = parseFloat(document.getElementById(`precio_blanco${pref}`).value)||0;
    const pack_ud = parseFloat(document.getElementById(`pack_coste${pref}`).value)||0;
    const otros_fijos = parseFloat(document.getElementById(`otros_fijos${pref}`).value)||0;

    // Descuento blancos (art2 usa mismos tramos que art1)
    const usarDtoAuto = art===1 ? document.getElementById('usar_dto_blanco_auto').checked : true;
    const usarDtoManual = art===1 ? document.getElementById('usar_dto_blanco_manual').checked : false;
    const dtoManual = art===1 ? Math.min(0.25, (parseFloat(document.getElementById('dto_blanco_manual').value)||0)/100) : 0;
    const tramosBlancos = getTramosBlancosFromUI();
    const tramoBlanco = getTramoBlanco(cantidad, tramosBlancos);
    const dtoAplicado = usarDtoManual ? dtoManual : (usarDtoAuto ? (tramoBlanco.dto||0) : 0);
    
    const precio_final_sin_iva = precio_blanco * (1 - dtoAplicado);
    const precio_con_iva = precio_final_sin_iva * IVA_COMPRA;
    const subtotal_sin_iva = precio_final_sin_iva * cantidad;
    const subtotal_con_iva = precio_con_iva * cantidad;
    const envio_sin_iva = (cantidad<=0) ? 0 : (subtotal_sin_iva>=100 ? 0 : 5.95);
    const envio_total = envio_sin_iva * IVA_COMPRA;
    const total_blancos = subtotal_con_iva + envio_total;

    // Personalización
    const pers = calcularPersonalizacion(art);
    const costes_fijos_ud = pers.pers_ud + pack_ud + (cantidad>0 ? otros_fijos/cantidad : 0) + (cantidad>0 ? envio_total/cantidad : 0) + (cantidad>0 ? pers.envio_prov_total/cantidad : 0);
    const coste_total_ud = (cantidad>0 ? precio_con_iva : 0) + costes_fijos_ud;

    // Descuento venta
    const ti = getTramoVenta(cantidad);
    const dto_nominal = TRAMOS_VENTA[ti].dto;
    const blanco_dto_nom = (cantidad>0 ? precio_con_iva : 0) * (1 - dto_nominal);
    const pvp_dto_nom = blanco_dto_nom + costes_fijos_ud;
    
    return {
      cantidad, precio_blanco, dtoAplicado, precio_con_iva, subtotal_con_iva, envio_total, total_blancos,
      pers_ud: pers.pers_ud, pack_ud, otros_fijos, costes_fijos_ud, coste_total_ud,
      pvp_sin_iva: pvp_dto_nom, // provisional, luego se ajusta con margen mínimo global
      ti, dto_nominal,
      show_pliegos: pers.show_pliegos, detalle: pers.detalle,
      // para el combinado
      coste_total_pedido: coste_total_ud * (cantidad || 1)
    };
  }

  // Cálculo principal
  function calc() {
    const margen_min = parseInt(document.getElementById('margen_min').value,10)/100;
    const divisor = 1 - margen_min;
    
    // Artículo 1
    const a1 = calcularArticulo(1);
    
    // Artículo 2 (si está habilitado)
    const hab2 = document.getElementById('habilitar_articulo2').checked;
    let a2 = null;
    if(hab2) {
      a2 = calcularArticulo(2);
    }
    
    // Combinar cantidades y totales
    const cantTotal = a1.cantidad + (a2?.cantidad || 0);
    const costeTotalPedido = (a1.coste_total_ud * (a1.cantidad || 1)) + (a2 ? a2.coste_total_ud * (a2.cantidad || 1) : 0);
    const costeMedioUd = cantTotal > 0 ? costeTotalPedido / cantTotal : 0;
    
    // PVP sin IVA combinado (antes de ValueTop)
    let pvpSinIvaCombinado = 0;
    if(cantTotal > 0) {
      const ingresosSinIva1 = a1.pvp_sin_iva * (a1.cantidad || 1);
      const ingresosSinIva2 = a2 ? a2.pvp_sin_iva * (a2.cantidad || 1) : 0;
      pvpSinIvaCombinado = (ingresosSinIva1 + ingresosSinIva2) / cantTotal;
    }
    
    // Aplicar ValueTop
    const vtNivel = document.getElementById('valuetop_nivel').value;
    const vtDto = VALUETOP_DESCUENTOS[vtNivel] || 0;
    let pvpConDto = pvpSinIvaCombinado * (1 - vtDto);
    
    // Respetar margen mínimo
    const pvpMinimo = costeMedioUd / divisor;
    let pvpFinalSinIva, capped = false;
    if(pvpConDto >= pvpMinimo) {
      pvpFinalSinIva = pvpConDto;
    } else {
      pvpFinalSinIva = pvpMinimo;
      capped = true;
    }
    
    const pvpFinalConIva = pvpFinalSinIva * (1 + IVA_VENTA);
    const totalPedidoConIva = pvpFinalConIva * cantTotal;
    const beneficioTotal = (pvpFinalSinIva - costeMedioUd) * cantTotal;
    const margenReal = pvpFinalSinIva > 0 ? ((pvpFinalSinIva - costeMedioUd) / pvpFinalSinIva) * 100 : 0;

    // --- Actualizar UI ---
    setText('margen_val_display', (margen_min*100).toFixed(0)+'%');
    setText('r_coste_ud', f2(costeMedioUd));
    setText('r_total_blancos', f2((a1.total_blancos||0) + (a2?.total_blancos||0)));
    setText('r_pvp_dto_sin', f2(pvpFinalSinIva));
    setText('r_pvp_dto_con', f2(pvpFinalConIva));
    setText('r_ben_total', f2(beneficioTotal));
    setText('r_total_iva', f2(totalPedidoConIva));
    
    // Detalle construcción (simplificado)
    const detalleDiv = document.getElementById('detalle_construccion');
    let html = `<div class="brow"><span class="bl">Artículo ① base</span><span class="bv">${f2(a1.precio_con_iva)} x ${a1.cantidad} ud</span></div>`;
    if(a2) html += `<div class="brow"><span class="bl">Artículo ② base</span><span class="bv">${f2(a2.precio_con_iva)} x ${a2.cantidad} ud</span></div>`;
    html += `<div class="brow"><span class="bl">+ Personalización total</span><span class="bv">${f2((a1.pers_ud*(a1.cantidad||1)) + (a2?.pers_ud*(a2?.cantidad||1)||0))}</span></div>`;
    html += `<div class="brow"><span class="bl">+ Packaging / otros / envíos</span><span class="bv">${f2((a1.costes_fijos_ud - a1.pers_ud)*(a1.cantidad||1) + (a2 ? (a2.costes_fijos_ud - a2.pers_ud)*(a2.cantidad||1) : 0))}</span></div>`;
    if(vtDto > 0) html += `<div class="brow"><span class="bl">Descuento ValueTop (${(vtDto*100).toFixed(2)}%)</span><span class="bv">- ${f2(pvpSinIvaCombinado * vtDto * cantTotal)}</span></div>`;
    if(capped) html += `<div class="brow"><span class="bl" style="color:#E24B4A;">Ajuste a margen mínimo</span><span class="bv" style="color:#E24B4A;">+ ${f2((pvpFinalSinIva - pvpConDto) * cantTotal)}</span></div>`;
    detalleDiv.innerHTML = html;
    
    setText('b_pvp_final_sin', f2(pvpFinalSinIva));
    setText('b_iva', f2(pvpFinalSinIva*IVA_VENTA));
    setText('b_pvp_final_con', f2(pvpFinalConIva));
    setText('b_ben_ud', f2(pvpFinalSinIva - costeMedioUd));
    setText('b_ben_total', f2(beneficioTotal));
    setText('b_ingresos_sin', f2(pvpFinalSinIva * cantTotal));
    setText('b_total_iva', f2(totalPedidoConIva));
    
    // Margen bar
    const bar = document.getElementById('margin_bar');
    bar.style.width = Math.max(0, Math.min(100, margenReal))+'%';
    bar.className = 'bar-fill'+(margenReal < margen_min*100 ? ' amber':'');
    setText('bar_pct', pct(margenReal));
    document.getElementById('bar_min_line').style.left = (margen_min*100)+'%';
    setText('bar_min_label', 'mín '+(margen_min*100).toFixed(0)+'%');
    
    // Actualizar campos artículo 1
    setText('res_blanco_tarifa_ud', f2(a1.precio_blanco));
    setText('res_blanco_dto', (a1.dtoAplicado*100).toFixed(1).replace('.',',')+' %');
    setText('res_blanco_final_sin', f2(a1.precio_blanco*(1-a1.dtoAplicado)));
    setText('res_blanco_ahorro', f2(a1.precio_blanco*a1.dtoAplicado*a1.cantidad));
    setText('res_blanco_ud', f2(a1.precio_con_iva));
    setText('res_blanco_cant', a1.cantidad+' ud');
    setText('res_blanco_subtotal_sin', f2(a1.precio_blanco*(1-a1.dtoAplicado)*a1.cantidad));
    setText('res_blanco_subtotal', f2(a1.subtotal_con_iva));
    setText('res_blanco_envio', a1.cantidad>0 ? (a1.envio_total>0 ? f2(a1.envio_total) : 'Gratis') : f2(0));
    setText('res_blanco_total', f2(a1.total_blancos));
    
    if(a2) {
      setText('res_blanco_ud2', f2(a2.precio_con_iva));
      setText('res_blanco_subtotal2', f2(a2.subtotal_con_iva));
      setText('res_blanco_total2', f2(a2.total_blancos));
    }
    
    // Badge tramo venta (usamos el del artículo 1 como referencia)
    const ti = a1.ti;
    const badge = document.getElementById('tramo_badge');
    badge.textContent = `Tramo ${TRAMOS_VENTA[ti].label} · ${(a1.dto_nominal*100).toFixed(0)}% dto base` + (capped ? ' (limitado)' : '');
  }

  // Eventos y UI
  function updateTecnicaUI(art) {
    const pref = art===2 ? '2' : '';
    const t = document.getElementById(`tecnica${pref}`).value;
    populateProveedorSelect(`proveedor_sel${pref}`, t);
    document.getElementById(`bloque_area${pref}`).style.display = (t!=='ninguna' && t!=='bordado' && t!=='laser') ? 'block' : 'none';
    if(art===1) {
      document.getElementById('bloque_bordado').style.display = t==='bordado' ? 'block' : 'none';
      document.getElementById('bloque_laser').style.display = t==='laser' ? 'block' : 'none';
    }
    document.getElementById(`bloque_vinilo_tipo${pref}`).style.display = t==='vinilo' ? 'block' : 'none';
    calc();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // Inicializar
    initBudgetMeta();
    applyPerfilBlanco();
    populateProveedorSelect('proveedor_sel', 'dtf_textil');
    populateProveedorSelect('proveedor_sel2', 'dtf_textil');
    
    // Listeners artículo 1
    document.getElementById('tecnica').addEventListener('change', ()=>updateTecnicaUI(1));
    document.getElementById('perfil_blanco').addEventListener('change', applyPerfilBlanco);
    document.getElementById('margen_min').addEventListener('input', calc);
    document.getElementById('laser_tipo').addEventListener('change', ()=>{ applyLaserPreset(); calc(); });
    const slider = document.getElementById('slider_cant');
    const cantI = document.getElementById('cantidad');
    slider.addEventListener('input', ()=>{ cantI.value=slider.value; setText('slider_out',slider.value+' ud'); calc(); });
    cantI.addEventListener('input', ()=>{ slider.value=cantI.value; setText('slider_out',cantI.value+' ud'); calc(); });
    
    // Artículo 2
    document.getElementById('habilitar_articulo2').addEventListener('change', function(){
      document.getElementById('articulo2_container').style.display = this.checked ? 'block' : 'none';
      calc();
    });
    document.getElementById('tecnica2').addEventListener('change', ()=>updateTecnicaUI(2));
    const slider2 = document.getElementById('slider_cant2');
    const cantI2 = document.getElementById('cantidad2');
    slider2.addEventListener('input', ()=>{ cantI2.value=slider2.value; setText('slider_out2',slider2.value+' ud'); calc(); });
    cantI2.addEventListener('input', ()=>{ slider2.value=cantI2.value; setText('slider_out2',cantI2.value+' ud'); calc(); });
    
    // Inputs genéricos
    const inputs = ['precio_blanco','pack_coste','otros_fijos','dis_ancho','dis_alto','posiciones','vinilo_tipo',
      'usar_dto_blanco_auto','usar_dto_blanco_manual','dto_blanco_manual',
      'precio_blanco2','pack_coste2','otros_fijos2','dis_ancho2','dis_alto2','posiciones2','vinilo_tipo2',
      'valuetop_nivel'
    ];
    inputs.forEach(id=>{ const el=document.getElementById(id); if(el){ el.addEventListener('input',calc); el.addEventListener('change',calc); } });
    
    // Botones email/notion (implementación básica)
    document.getElementById('btn_email_presupuesto').addEventListener('click', ()=>{
      const cliente = document.getElementById('email_cliente').value;
      if(!cliente) { alert('Introduce el email del cliente'); return; }
      const total = document.getElementById('r_total_iva').textContent;
      alert(`Simulación: Enviando presupuesto a ${cliente} por ${total}`);
      advanceBudgetNumber();
      document.getElementById('numero_presupuesto').value = getNextBudgetNumber();
    });
    document.getElementById('btn_guardar_notion').addEventListener('click', ()=>{
      alert('Simulación: Guardando en Notion...');
    });
    
    calc();
  });
})();
</script>