// ═══════════════════════════════════════
// FEATURES JS (Nuevas Funciones)
// ═══════════════════════════════════════

// 1. Botón de Silencio Global (Mute Button)
function toggleGlobalMute() {
  const body = document.body;
  const btn = document.getElementById('mute-btn-floating');
  body.classList.toggle('global-mute');
  
  if (body.classList.contains('global-mute')) {
    btn.classList.add('active');
    btn.textContent = '🌑';
    localStorage.setItem('cfg_global_mute', 'true');
  } else {
    btn.classList.remove('active');
    btn.textContent = '🌗';
    localStorage.setItem('cfg_global_mute', 'false');
  }
}

// Init Mute state
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('cfg_global_mute') === 'true') {
    document.body.classList.add('global-mute');
    const btn = document.getElementById('mute-btn-floating');
    if(btn) {
      btn.classList.add('active');
      btn.textContent = '🌑';
    }
  }
});

// 2. Tarjetas de Comunicación Personalizables
let customCards = [];
try { customCards = JSON.parse(localStorage.getItem('cfg_custom_cards') || '[]'); } catch(e) { customCards = []; }

function openCustomCardForm() {
  document.getElementById('custom-card-form').style.display = 'flex';
}

function closeCustomCardForm() {
  document.getElementById('custom-card-form').style.display = 'none';
  document.getElementById('cc-icon').value = '';
  document.getElementById('cc-title').value = '';
  document.getElementById('cc-text').value = '';
  document.getElementById('cc-sub').value = '';
}

function saveCustomCard() {
  const icon = document.getElementById('cc-icon').value.trim() || '💬';
  const title = document.getElementById('cc-title').value.trim();
  const text = document.getElementById('cc-text').value.trim();
  const sub = document.getElementById('cc-sub').value.trim();
  
  if (!title || !text) return alert('El título y el texto son obligatorios.');
  
  const id = 'custom_' + Date.now();
  customCards.push({ id, icon, title, text, sub });
  localStorage.setItem('cfg_custom_cards', JSON.stringify(customCards));
  
  // Add to commsCards global object
  if (typeof commsCards !== 'undefined') {
    commsCards[id] = { icon, text, sub };
  }
  
  closeCustomCardForm();
  renderCustomCards();
}

function deleteCustomCard(id, event) {
  event.stopPropagation();
  customCards = customCards.filter(c => c.id !== id);
  localStorage.setItem('cfg_custom_cards', JSON.stringify(customCards));
  renderCustomCards();
}

function renderCustomCards() {
  const container = document.getElementById('custom-cards-container');
  if (!container) return;
  
  container.innerHTML = customCards.map(c => `
    <div style="position:relative; margin-bottom:8px;">
      <button class="comm-btn" style="background:var(--surface); border-color:var(--border2); color:var(--text);" onclick="showCard('${c.id}')">
        ${c.icon} ${c.title}
      </button>
      <div onclick="deleteCustomCard('${c.id}', event)" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:var(--red); font-size:18px; padding:5px; cursor:pointer;">✕</div>
    </div>
  `).join('');
  
  // Ensure they are in the global commsCards object
  if (typeof commsCards !== 'undefined') {
    customCards.forEach(c => {
      commsCards[c.id] = { icon: c.icon, text: c.text, sub: c.sub };
    });
  }
}

// 3. Registro de Cucharas (Spoon Theory)
let dailySpoons = parseInt(localStorage.getItem('cfg_spoons_total')) || 12;
let usedSpoons = parseInt(localStorage.getItem('cfg_spoons_used')) || 0;
let lastSpoonDate = localStorage.getItem('cfg_spoons_date');

function initSpoons() {
  const today = new Date().toDateString();
  if (lastSpoonDate !== today) {
    usedSpoons = 0;
    lastSpoonDate = today;
    localStorage.setItem('cfg_spoons_used', usedSpoons);
    localStorage.setItem('cfg_spoons_date', lastSpoonDate);
  }
  renderSpoons();
}

function renderSpoons() {
  const display = document.getElementById('spoon-display');
  const status = document.getElementById('spoon-status');
  if (!display) return;
  
  let html = '';
  for (let i = 0; i < dailySpoons; i++) {
    const isUsed = i < usedSpoons;
    html += `<div class="spoon-icon ${isUsed ? 'used' : ''}" onclick="toggleSpoon(${i})">🥄</div>`;
  }
  display.innerHTML = html;
  
  const remaining = dailySpoons - usedSpoons;
  if (remaining > 6) status.innerHTML = `<span style="color:var(--green)">${t('spoonStable').replace('{n}', remaining)}</span>`;
  else if (remaining > 2) status.innerHTML = `<span style="color:var(--amber)">${t('spoonCaution').replace('{n}', remaining)}</span>`;
  else status.innerHTML = `<span style="color:var(--red)">${t('spoonCritical').replace('{n}', remaining)}</span>`;
}

function toggleSpoon(index) {
  if (index < usedSpoons) {
    usedSpoons = index; // Undo usage
  } else {
    usedSpoons = index + 1; // Use spoon
  }
  localStorage.setItem('cfg_spoons_used', usedSpoons);
  renderSpoons();
}

function addSpoon() {
  dailySpoons++;
  localStorage.setItem('cfg_spoons_total', dailySpoons);
  renderSpoons();
}

function removeSpoon() {
  if (dailySpoons > 1) {
    dailySpoons--;
    if (usedSpoons > dailySpoons) usedSpoons = dailySpoons;
    localStorage.setItem('cfg_spoons_total', dailySpoons);
    localStorage.setItem('cfg_spoons_used', usedSpoons);
    renderSpoons();
  }
}

// 4. Exportar a PDF
function exportarPDF() {
  window.print();
}

// 5. Modo Acompañante (Compartir Ubicación)
function compartirUbicacion() {
  const ct = C.ct || '';
  if (!ct) return alert('Configura el teléfono de tu contacto en Ajustes ⚙️');
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const msg = encodeURIComponent(`🆘 Hola, soy ${C.nombre || 'yo'}. Estoy en una crisis y necesito ayuda. Esta es mi ubicación actual: ${mapsUrl}`);
      window.open(`https://wa.me/${ct}?text=${msg}`, '_blank');
    }, function(error) {
      alert('No se pudo obtener la ubicación. Asegúrate de dar permisos de GPS.');
      const msg = encodeURIComponent(`🆘 Hola, soy ${C.nombre || 'yo'}. Estoy en una crisis y necesito ayuda. (No pude enviar mi ubicación GPS).`);
      window.open(`https://wa.me/${ct}?text=${msg}`, '_blank');
    });
  } else {
    alert('Tu navegador no soporta geolocalización.');
  }
}

// Hook into app initialization
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderCustomCards();
    initSpoons();
  }, 500);
});
