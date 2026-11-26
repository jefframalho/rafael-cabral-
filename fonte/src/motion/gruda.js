// Camadas: a seção com a classe .gruda prende quando o pé dela chega ao pé da tela, e a seguinte sobe por cima.
// É assim que a página troca de cor (escuro ↔ claro) sem uma linha reta passando solta. Enquanto é coberta, a seção
// de baixo escurece um pouco e sobe bem devagar. O rodapé faz o contrário: fica preso ao pé da tela, por baixo da
// página, e a última seção sobe e o revela (só quando ele cabe inteiro na tela).
// --alt (a altura da seção, usada pelo CSS para saber onde prender) é posta aqui.
import { aoRolar, topoDe } from './rolagem.js';

export function gruda() {
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const todas = [...document.querySelectorAll('.gruda')];
  // o hero cuida da própria passagem (src/motion/hero.js); as outras ganham um véu
  const itens = todas.filter((el) => !el.matches('[data-hero]')).map((el) => {
    const veu = document.createElement('div');
    veu.className = 'veu';
    veu.setAttribute('aria-hidden', 'true');
    el.append(veu);
    return { el, veu, inicio: 0, forca: el.classList.contains('s-noite') ? 0.5 : 0.26, c: -1 };
  });
  const rodape = document.querySelector('.rodape');

  function mede() {
    for (const el of todas) el.style.setProperty('--alt', `${el.offsetHeight}px`);
    for (const it of itens) { it.inicio = topoDe(it.el) + it.el.offsetHeight - innerHeight; it.c = -1; }
    rodape?.classList.toggle('rodape--por-baixo', rodape.offsetHeight <= innerHeight);
    desenha(window.scrollY);
  }

  function desenha(y) {
    if (reduzido) return;
    const vh = innerHeight;
    for (const it of itens) {
      const c = Math.max(0, Math.min(1, (y - it.inicio) / vh));
      if (c === it.c) continue;
      it.c = c;
      it.veu.style.opacity = (c * it.forca).toFixed(3);
      it.el.style.transform = c > 0 ? `translate3d(0, ${(-c * 0.05 * vh).toFixed(1)}px, 0)` : '';
    }
  }
  aoRolar(desenha);
  mede();
  return { mede };
}
