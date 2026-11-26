// Rolagem: suave no computador (Lenis), nativa no toque e com movimento reduzido. Um relógio só para o site: a cada
// quadro em que a página andou, quem se inscreveu em aoRolar() recebe a posição.
import Lenis from 'lenis';

const html = document.documentElement;
let lenis = null;
const ouvintes = new Set();
let ultimo = -1;

/** posição da rolagem, em px */
export const posicao = () => (lenis ? lenis.scroll : window.scrollY);
/** chama f(y) nos quadros em que a rolagem mudou; devolve a função que cancela */
export const aoRolar = (f) => { ouvintes.add(f); return () => ouvintes.delete(f); };
/** força um desenho no próximo quadro (depois de medir de novo, por exemplo) */
export const redesenha = () => { ultimo = -1; };

function quadro(t) {
  lenis?.raf(t);
  const y = posicao();
  if (y !== ultimo) {
    ultimo = y;
    for (const f of ouvintes) f(y);
  }
  requestAnimationFrame(quadro);
}

export function criarRolagem() {
  history.scrollRestoration = 'manual';
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toque = html.classList.contains('toque');
  if (!reduzido && !toque) {
    lenis = new Lenis({
      lerp: 0.115,
      // gesto mais de lado do que para baixo fica com o navegador (é um trilho de cartões rolando); o toque também
      virtualScroll: ({ event, deltaX, deltaY }) => !(event.type === 'wheel' && Math.abs(deltaX) > Math.abs(deltaY)),
    });
  }
  requestAnimationFrame(quadro);

  // links para um ponto da página: a rolagem vai até lá
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest?.('a[href^="#"]');
    if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    const id = a.getAttribute('href').slice(1);
    const alvo = id ? document.getElementById(id) : null;
    if (!alvo) { if (!id) ev.preventDefault(); return; }
    ev.preventDefault();
    irPara(alvo);
  });
  return lenis;
}

/** posição de uma seção do <main> na página. Uma seção presa (.gruda) mente na medida comum, então a conta é a
    soma das alturas das seções anteriores. */
export function topoDe(el) {
  if (!el.parentElement?.matches('main')) return el.getBoundingClientRect().top + window.scrollY;
  let y = el.parentElement.offsetTop;
  for (let p = el.previousElementSibling; p; p = p.previousElementSibling) y += p.offsetHeight;
  return y;
}

/** leva a rolagem até um elemento */
export function irPara(alvo, { na_hora = false } = {}) {
  const topo = topoDe(alvo);
  if (lenis) lenis.scrollTo(topo, na_hora ? { immediate: true, force: true } : { duration: 1.5, easing: (x) => 1 - Math.pow(1 - x, 4), force: true });
  else window.scrollTo({ top: topo, behavior: na_hora || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

/** a página para de rolar enquanto um painel está aberto */
let travas = 0;
export function travar() {
  if (travas++ > 0) return;
  html.style.setProperty('--barra', `${innerWidth - html.clientWidth}px`);
  html.classList.add('travado');
  lenis?.stop();
}
export function soltar() {
  if (travas === 0 || --travas > 0) return;
  html.classList.remove('travado');
  html.style.removeProperty('--barra');
  lenis?.start();
}

/** medir de novo (a altura da página mudou) */
export const remede = () => { lenis?.resize(); redesenha(); };
