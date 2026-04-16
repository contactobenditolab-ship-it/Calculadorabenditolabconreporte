<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculadora B2B - Bendito Lab</title>
  <style>
    :root {
      --primary: #000000;
      --bg-body: #ffffff;
      --bg-card: #ffffff;
      --border-color: #e5e7eb;
      --text-main: #111827;
      --text-sub: #6b7280;
      --accent-green: #10b981;
      --accent-blue: #3b82f6;
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      --radius: 12px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; }

    body { background-color: var(--bg-body); color: var(--text-main); padding: 20px; line-height: 1.5; }
    .wrap { max-width: 600px; margin: 0 auto; }

    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { color: var(--text-sub); font-size: 14px; }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: var(--shadow);
    }

    .sec-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; color: var(--text-sub); display: flex; justify-content: space-between; align-items: center; }
    .sec-title span { color: var(--text-main); font-size: 16px; }

    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-main); }
    
    input[type="number"], select, textarea {
      width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background-color: #f9fafb;
    }

    input[type="range"] { width: 100%; margin: 10px 0; accent-color: var(--accent-blue); }

    .result-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .result-label { color: var(--text-sub); }
    .result-value { font-weight: 600; }

    .metric-card { border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
    .metric-label { font-size: 14px; color: var(--text-sub); }
    .metric-value { font-weight: 700; font-size: 15px; }
    .highlight { background: #f0fdf4; border-color: #dcfce7; }
    .highlight .metric-value { color: var(--accent-green); font-size: 18px; }

    .bar-container { height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; margin: 10px 0; }
    .bar-fill { height: 100%; background: var(--accent-green); width: 0%; transition: width 0.4s; }

    .btn { width: 100%; padding: 12px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; margin-bottom: 8px; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-black { background: #000; color: #fff; }
    .btn-outline { background: #fff; border: 1px solid var(--border-color); color: var(--text-main); }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  </style>
</head>
<body>

<div class="wrap">
  <div class="header">
    <h1>BENDITO LAB</h1>
    <p>Calculadora B2B Profesional</p>
  </div>

  <div class="card">
    <div class="sec-title">Margen de Venta <span id="val_margen_min">60%</span></div>
    <input type="range" id="input_margen" min="30" max="80" value="60">
    <div class="bar-container"><div id="bar_margen_real" class="bar-fill"></div></div>
    <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-sub)">
      <span>Margen Real: <b id="val_margen_real">0%</b></span>
      <span>Mínimo: <b id="val_margen_req">60%</b></span>
    </div>
  </div>

  <div class="card">
    <div class="sec-title">Configuración de Producto</div>
    <div class="field">
      <label>Coste unitario proveedor (sin IVA)</label>
      <input type="number" id="coste_base" value="8.00" step="0.01">
    </div>
    <div class="field">
      <label>Cantidad de unidades: <span id="val_cantidad">25</span></label>
      <input type="range" id="input_cantidad" min="1" max="500" value="25">
    </div>
    <div class="field">
        <label>Descuento Proveedor (%)</label>
        <input type="number" id="dto_prov" value="10">
    </div>
  </div>

  <div class="card">
    <div class="sec-title">Personalización DTF</div>
    <div class="grid">
      <div class="field"><label>Ancho (cm)</label><input type="number" id="p_ancho" value="10"></div>
      <div class="field"><label>Alto (cm)</label><input type="number" id="p_alto" value="10"></div>
    </div>
    <div class="field">
        <label>Posiciones por unidad</label>
        <input type="number" id="p_posiciones" value="1">
    </div>
  </div>

  <div class="card">
    <div class="sec-title">Resumen de Costes</div>
    <div class="result-row"><span class="result-label">Coste artículo (dto inc.)</span><span id="res_coste_art" class="result-value">0,00 €</span></div>
    <div class="result-row"><span class="result-label">Coste personalización / ud</span><span id="res_coste_pers" class="result-value">0,00 €</span></div>
    <div class="result-row" style="margin-top:10px; padding-top:10px; border-top:1px solid #eee;">
        <span class="result-label">Coste total unitario</span><span id="res_coste_total_ud" class="result-value">0,00 €</span>
    </div>
  </div>

  <div class="card">
    <div class="sec-title">Precio de Venta</div>
    <div class="metric-card"><span class="metric-label">PVP ud (sin IVA)</span><span id="res_pvp_sin" class="metric-value">0,00 €</span></div>
    <div class="metric-card"><span class="metric-label">PVP ud (con IVA)</span><span id="res_pvp_con" class="metric-value">0,00 €</span></div>
    <div class="metric-card highlight">
      <span class="metric-label">Total Pedido (IVA inc)</span>
      <span id="res_total_pedido" class="metric-value">0,00 €</span>
    </div>
  </div>

  <div style="margin-bottom:40px;">
    <button class="btn btn-black" onclick="alert('Enviando Presupuesto...')">📩 Enviar al cliente</button>
    <button class="btn btn-outline" onclick="window.print()">📄 Descargar PDF</button>
  </div>
</div>

<script>
    const inputs = document.querySelectorAll('input');
    
    function calcular() {
        // 1. Obtener valores
        const margenMin = document.getElementById('input_margen').value / 100;
        const costeBase = parseFloat(document.getElementById('coste_base').value) || 0;
        const cantidad = parseInt(document.getElementById('input_cantidad').value);
        const dtoProv = (parseFloat(document.getElementById('dto_prov').value) || 0) / 100;
        const pAncho = parseFloat(document.getElementById('p_ancho').value) || 0;
        const pAlto = parseFloat(document.getElementById('p_alto').value) || 0;
        const pPos = parseInt(document.getElementById('p_posiciones').value) || 1;

        // 2. Lógica de Costes
        const costeArtNeto = costeBase * (1 - dtoProv);
        
        // Simulación básica de coste DTF por área (simplificado para el ejemplo)
        // Estimamos un coste de 0.0005€ por cm2 + manipulación
        const areaCm2 = pAncho * pAlto * pPos;
        const costePersUd = (areaCm2 * 0.005) + 0.50; // 0.50€ de base por prenda

        const costeTotalUd = costeArtNeto + costePersUd;

        // 3. Cálculo de PVP basado en margen
        // Fórmula: PVP = Coste / (1 - Margen)
        const pvpSinIva = costeTotalUd / (1 - margenMin);
        const pvpConIva = pvpSinIva * 1.21;
        const totalPedido = pvpConIva * cantidad;

        // 4. Actualizar UI
        document.getElementById('val_margen_min').innerText = (margenMin * 100).toFixed(0) + '%';
        document.getElementById('val_margen_req').innerText = (margenMin * 100).toFixed(0) + '%';
        document.getElementById('val_cantidad').innerText = cantidad;
        
        document.getElementById('res_coste_art').innerText = costeArtNeto.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('res_coste_pers').innerText = costePersUd.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('res_coste_total_ud').innerText = costeTotalUd.toFixed(2).replace('.', ',') + ' €';
        
        document.getElementById('res_pvp_sin').innerText = pvpSinIva.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('res_pvp_con').innerText = pvpConIva.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('res_total_pedido').innerText = totalPedido.toFixed(2).replace('.', ',') + ' €';

        // Barra de margen real
        const margenReal = ((pvpSinIva - costeTotalUd) / pvpSinIva) * 100;
        document.getElementById('bar_margen_real').style.width = margenReal + '%';
        document.getElementById('val_margen_real').innerText = margenReal.toFixed(1) + '%';
    }

    // Escuchar cambios en todos los inputs
    inputs.forEach(input => {
        input.addEventListener('input', calcular);
    });

    // Ejecutar al cargar
    calcular();
</script>

</body>
</html>
