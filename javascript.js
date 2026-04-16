<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculadora B2B - Bendito Lab</title>
  <style>
    /* ... (Mantenemos tus estilos CSS anteriores) ... */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #6366f1; --primary-dark: #4f46e5; --primary-light: #818cf8;
      --secondary: #8b5cf6; --accent: #ec4899; --success: #10b981;
      --success-light: #d1fae5; --warning: #f59e0b; --danger: #ef4444;
      --bg-primary: #ffffff; --bg-secondary: #f9fafb; --bg-tertiary: #f3f4f6;
      --border: #e5e7eb; --text-primary: #111827; --text-secondary: #6b7280;
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1); --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    body { font-family: sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: var(--text-primary); padding: 20px; }
    .wrap { max-width: 1200px; margin: 0 auto; }
    .brand-header { background: var(--bg-primary); border-radius: 16px; padding: 40px; margin-bottom: 30px; box-shadow: var(--shadow-xl); display: flex; align-items: center; gap: 30px; }
    .card, .results, .margen-config { background: var(--bg-primary); border-radius: 12px; padding: 30px; margin-bottom: 24px; box-shadow: var(--shadow-md); border: 1px solid var(--border); }
    .sec-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    input, select, textarea { width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 8px; }
    .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .sub-block { background: var(--bg-tertiary); border-left: 4px solid var(--primary); padding: 20px; border-radius: 8px; margin: 15px 0; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 20px 0; }
    .metric { background: var(--bg-secondary); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid var(--border); }
    .mv { font-size: 22px; font-weight: 700; color: var(--primary); }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; }
    .brow { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
    .bar-bg { width: 100%; height: 10px; background: #eee; border-radius: 5px; position: relative; margin: 10px 0; }
    .bar-fill { height: 100%; background: var(--success); border-radius: 5px; width: 0%; transition: 0.5s; }
    .bar-min-line { position: absolute; top: -5px; width: 2px; height: 20px; background: var(--danger); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="brand-header">
      <div class="brand-copy">
        <h1>Calculadora B2B Bendito Lab</h1>
        <p>Configuración de márgenes y presupuestos corporativos</p>
      </div>
    </div>

    <div class="margen-config">
      <div class="sec-title">🎯 Estrategia de Margen</div>
      <div class="grid2">
        <div class="field">
          <label>Margen mínimo deseado</label>
          <input type="range" id="margen_min" min="30" max="80" value="60">
          <div id="margen_val_display" style="text-align:right; font-weight:bold;">60%</div>
        </div>
        <div class="field">
          <label>Nivel ValueTop</label>
          <select id="valuetop_nivel">
            <option value="0">Sin ValueTop</option>
            <option value="1">Top 1% (0.5% dto)</option>
            </select>
        </div>
      </div>
    </div>

    <div class="card" id="articulo1">
      <div class="sec-title">📦 Artículo Principal</div>
      <div class="grid2">
        <div class="field"><label>Coste Blanco (€)</label><input type="number" id="precio_blanco" value="10" step="0.01"></div>
        <div class="field"><label>Cantidad</label><input type="number" id="cantidad" value="10"><input type="range" id="slider_cant" min="0" max="500" value="10"><span id="slider_out">10 ud</span></div>
      </div>
      
      <div class="sub-block">
        <label>Descuento Proveedor (Tramos)</label>
        <select id="perfil_blanco">
          <option value="toleshop">Toleshop Estándar</option>
          <option value="suave">Suave</option>
          <option value="personalizado">Personalizado</option>
        </select>
        <div class="grid2" style="margin-top:10px;">
            <label><input type="checkbox" id="usar_dto_blanco_auto" checked> Automático</label>
            <label><input type="checkbox" id="usar_dto_blanco_manual"> Manual</label>
            <input type="number" id="dto_blanco_manual" placeholder="%" style="width:80px">
        </div>
        <div style="display:none">
            <input id="tb1_min"><input id="tb1_max"><input id="tb1_dto">
            <input id="tb2_min"><input id="tb2_max"><input id="tb2_dto">
            <input id="tb3_min"><input id="tb3_max"><input id="tb3_dto">
            <input id="tb4_min"><input id="tb4_max"><input id="tb4_dto">
            <input id="tb5_min"><input id="tb5_max"><input id="tb5_dto">
        </div>
      </div>

      <div class="field">
        <label>Técnica de Personalización</label>
        <select id="tecnica">
          <option value="ninguna">Sin personalizar</option>
          <option value="dtf_textil" selected>DTF Textil</option>
          <option value="vinilo">Vinilo</option>
          <option value="bordado">Bordado</option>
          <option value="laser">Láser</option>
        </select>
      </div>

      <div id="bloque_area" class="sub-block">
        <div class="grid3">
          <div class="field"><label>Ancho (cm)</label><input type="number" id="dis_ancho" value="10"></div>
          <div class="field"><label>Alto (cm)</label><input type="number" id="dis_alto" value="10"></div>
          <div class="field"><label>Posiciones</label><input type="number" id="posiciones" value="1"></div>
        </div>
        <div class="field"><label>Proveedor</label><select id="proveedor_sel"></select></div>
        <div class="field" id="bloque_vinilo_tipo" style="display:none">
            <label>Tipo Vinilo</label>
            <select id="vinilo_tipo"><option value="htv">HTV Textil</option></select>
        </div>
      </div>

      <div id="bloque_bordado" style="display:none" class="sub-block">
        <input type="hidden" id="puntadas" value="5000">
        <input type="hidden" id="bord_colores" value="1">
        <input type="hidden" id="bord_pos" value="1">
        <input type="hidden" id="bord_picaje" value="0">
        <input type="hidden" id="bord_coste_puntada" value="0.0015">
        <input type="hidden" id="bord_manipulacion" value="1.25">
      </div>
      <div id="bloque_laser" style="display:none" class="sub-block">
        <input type="hidden" id="laser_maq" value="5">
        <input type="hidden" id="laser_man" value="2">
        <input type="hidden" id="laser_extra_ud" value="0">
      </div>

      <div class="grid2">
        <div class="field"><label>Packaging (€/ud)</label><input type="number" id="pack_coste" value="0"></div>
        <div class="field"><label>Otros Fijos (€ total)</label><input type="number" id="otros_fijos" value="0"></div>
      </div>
    </div>

    <div style="margin-bottom:20px;">
        <label><input type="checkbox" id="habilitar_articulo2"> Añadir segundo artículo</label>
    </div>
    <div id="articulo2_container" style="display:none" class="card">
        <div class="sec-title">📦 Artículo Secundario</div>
        <div class="grid2">
            <div class="field"><label>Coste Blanco 2 (€)</label><input type="number" id="precio_blanco2" value="0"></div>
            <div class="field"><label>Cantidad 2</label><input type="number" id="cantidad2" value="0"><input type="range" id="slider_cant2" min="0" max="500" value="0"><span id="slider_out2">0 ud</span></div>
        </div>
        <div class="field">
            <label>Técnica 2</label>
            <select id="tecnica2"><option value="ninguna">Sin personalizar</option><option value="dtf_textil">DTF Textil</option></select>
        </div>
        <div id="bloque_area2" style="display:none" class="sub-block">
            <div class="grid3">
                <input type="number" id="dis_ancho2" value="0">
                <input type="number" id="dis_alto2" value="0">
                <input type="number" id="posiciones2" value="0">
            </div>
            <select id="proveedor_sel2"></select>
            <select id="vinilo_tipo2" style="display:none"><option value="htv">HTV</option></select>
        </div>
        <input type="number" id="pack_coste2" value="0" style="display:none">
        <input type="number" id="otros_fijos2" value="0" style="display:none">
    </div>

    <div class="results">
      <div class="sec-title">📊 Resumen del Presupuesto</div>
      <div id="tramo_badge" class="sub-block" style="background:#eef2ff; color:#4f46e5; font-weight:bold;">Tramo detectado...</div>
      
      <div class="metrics">
        <div class="metric"><div class="ml">PVP sin IVA / ud</div><div class="mv" id="r_pvp_dto_sin">0,00 €</div></div>
        <div class="metric"><div class="ml">PVP con IVA / ud</div><div class="mv" id="r_pvp_dto_con">0,00 €</div></div>
        <div class="metric"><div class="ml">Beneficio Total</div><div class="mv" id="r_ben_total" style="color:var(--success)">0,00 €</div></div>
        <div class="metric"><div class="ml">Total Pedido (IVA inc)</div><div class="mv" id="r_total_iva" style="font-size:28px">0,00 €</div></div>
      </div>

      <div class="bar-wrap">
        <div style="display:flex; justify-content:space-between"><span>Margen Real</span><span id="bar_pct">0%</span></div>
        <div class="bar-bg">
          <div id="margin_bar" class="bar-fill"></div>
          <div id="bar_min_line" class="bar-min-line"></div>
        </div>
      </div>

      <div id="detalle_construccion" style="margin-top:20px; font-size:14px; color:var(--text-secondary)"></div>

      <div style="margin-top:30px;" class="grid2">
          <input type="email" id="email_cliente" placeholder="Email del cliente">
          <button class="btn-primary" id="btn_email_presupuesto">Enviar Presupuesto</button>
      </div>
    </div>
  </div>

  <div style="display:none">
      <span id="res_blanco_tarifa_ud"></span><span id="res_blanco_dto"></span>
      <span id="res_blanco_final_sin"></span><span id="res_blanco_ud"></span>
      <span id="res_blanco_cant"></span><span id="res_blanco_subtotal"></span>
      <span id="res_blanco_envio"></span><span id="res_blanco_total"></span>
      <span id="res_blanco_ahorro"></span><span id="res_blanco_subtotal_sin"></span>
      <span id="r_coste_ud"></span><span id="r_total_blancos"></span>
      <span id="b_pvp_final_sin"></span><span id="b_iva"></span><span id="b_pvp_final_con"></span>
      <span id="b_ben_ud"></span><span id="b_ben_total"></span><span id="b_ingresos_sin"></span>
      <span id="b_total_iva"></span><span id="res_blanco_ud2"></span>
      <span id="res_blanco_subtotal2"></span><span id="res_blanco_total2"></span>
      <input id="laser_tipo"><input id="numero_presupuesto"><input id="fecha_presupuesto">
      <button id="btn_guardar_notion"></button>
  </div>

  <script>
    /* ... (Aquí va todo el script que me pasaste antes) ... */
    // Solo asegúrate de envolverlo en el (function(){...})() que ya tienes.
  </script>
</body>
</html>
