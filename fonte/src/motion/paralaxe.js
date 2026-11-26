// Paralaxe: o que tem data-desliza anda um pouco com a rolagem. Dentro de uma .foto, a imagem desliza dentro da
// moldura (ela tem sobra em cima e embaixo, então nunca abre o fundo); fora, a peça inteira (a marca d'água).
// O valor de data-desliza é a força: para a foto, a fração da sobra usada (1 = toda); para a peça solta, px por tela.
import { aoRolar, redesenha } from './rolagem.js';

export function paralaxe() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const itens = [...document.querySelectorAll('[data-desliza]')].map((el) => {
    const moldura = el.closest('.foto');
    return { el, moldura, alvo: moldura || el.parentElement, forca: Number(el.dataset.desliza) || 1, perto: false };
  });
  if (!itens.length) return;

  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      const it = itens.find((i) => i.alvo === e.target);
      if (it) it.perto = e.isIntersecting;
    }
    redesenha();
  }, { rootMargin: '25% 0px 25% 0px' });
  new Set(itens.map((i) => i.alvo)).forEach((a) => io.observe(a));

  aoRolar(() => {
    const vh = innerHeight;
    // primeiro todas as medidas, depois todas as escritas
    const medidas = itens.map((it) => {
      if (!it.perto) return null;
      const r = it.alvo.getBoundingClientRect();
      return Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
    });
    itens.forEach((it, k) => {
      const p = medidas[k];
      if (p === null) return;
      // a imagem tem 114% da moldura (7% de sobra de cada lado): 6% dela para um lado ou para o outro
      it.el.style.translate = it.moldura ? `0 ${(-p * 5.2 * it.forca).toFixed(2)}%` : `0 ${(p * it.forca).toFixed(1)}px`;
    });
  });
}
