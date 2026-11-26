// Topo: transparente sobre o hero; depois dele vira uma barra escura, que some quando a página desce e volta quando
// ela sobe. O realce da cápsula desliza até o link da seção em que a página está (cada <section> diz o seu em
// data-elo="#id-do-link"), ou até o link debaixo do cursor.
import { aoRolar, topoDe } from './rolagem.js';

export function topo() {
  const el = document.querySelector('[data-topo]');
  if (!el) return null;
  const nav = el.querySelector('.topo__nav');
  const elos = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const secoes = [...document.querySelectorAll('main > section')];
  const heroEl = document.querySelector('[data-hero]');

  let limite = 0; // rolagem em que a seção seguinte chega ao topo e o hero acaba
  let pontos = []; // [topo da seção, href do link]
  let yAntes = 0;
  let acumulado = 0;
  let aqui = null;
  let sobCursor = null;

  function mede() {
    limite = (heroEl ? heroEl.offsetHeight : innerHeight) - 96;
    pontos = secoes.map((s) => [topoDe(s), s.dataset.elo || `#${s.id}`]);
    realca();
  }

  function realca() {
    const a = sobCursor || aqui;
    if (!nav) return;
    if (!a) { nav.style.setProperty('--ro', '0'); return; }
    nav.style.setProperty('--rx', `${a.offsetLeft}px`);
    nav.style.setProperty('--rl', `${a.offsetWidth}px`);
    nav.style.setProperty('--ro', '1');
  }

  function desenha(y) {
    const solto = y > limite;
    el.classList.toggle('topo--solto', solto);
    // some depois de descer um trecho, volta depois de subir um pouco (folga para não piscar)
    const dy = y - yAntes;
    yAntes = y;
    if (!solto) { acumulado = 0; el.classList.remove('topo--some'); }
    else {
      acumulado = Math.sign(dy) === Math.sign(acumulado) ? acumulado + dy : dy;
      if (acumulado > 44) el.classList.add('topo--some');
      else if (acumulado < -28) el.classList.remove('topo--some');
    }
    // a seção que está a 40% da tela
    const olho = y + innerHeight * 0.4;
    let href = pontos.length ? pontos[0][1] : null;
    for (const [t, h] of pontos) if (t <= olho) href = h;
    const novo = elos.find((a) => a.getAttribute('href') === href) || null;
    if (novo !== aqui) {
      aqui?.classList.remove('aqui');
      aqui?.removeAttribute('aria-current');
      aqui = novo;
      aqui?.classList.add('aqui');
      aqui?.setAttribute('aria-current', 'true');
      realca();
    }
  }
  aoRolar(desenha);

  if (nav) {
    nav.addEventListener('pointerover', (ev) => {
      if (ev.pointerType !== 'mouse') return;
      const a = ev.target.closest('a');
      if (a && a !== sobCursor) { sobCursor = a; realca(); }
    });
    nav.addEventListener('pointerleave', () => { sobCursor = null; realca(); });
    nav.addEventListener('focusin', (ev) => { const a = ev.target.closest('a'); if (a) { sobCursor = a; realca(); } });
    nav.addEventListener('focusout', () => { sobCursor = null; realca(); });
  }

  mede();
  desenha(window.scrollY);
  return { mede };
}
