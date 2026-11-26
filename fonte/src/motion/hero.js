// Hero: a entrada, o carrossel das áreas e a passagem para a seção seguinte.
// Tudo é lido do HTML: cada botão de .hero__areas é uma área, a frase de mesma posição em .hero__falas é a dela, e
// data-socio diz qual pessoa do cartão aparece. O número de áreas é o número de botões.
import { aoRolar } from './rolagem.js';

const TROCA = 5600; // ms que cada área fica na tela
const doisDigitos = (n) => String(n).padStart(2, '0');

export function hero() {
  const el = document.querySelector('[data-hero]');
  if (!el) return null;
  const palco = el.querySelector('.hero__palco');
  const veu = el.querySelector('.hero__veu');
  const trilho = el.querySelector('.hero__areas');
  const chips = [...el.querySelectorAll('.hero__areas .chip')];
  const falas = [...el.querySelectorAll('.hero__fala')];
  const pessoas = [...el.querySelectorAll('.hero__pessoa')];
  const tempos = [...el.querySelectorAll('.hero__tempo i')];
  const atual = el.querySelector('[data-atual]');
  const total = el.querySelector('[data-total]');
  const linha = el.querySelector('.passos__linha');
  const n = Math.min(chips.length, falas.length);
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let passado = 0; // ms já contados da área atual
  let antes = 0;
  let rodando = false;
  let coberto = false;
  let altura = el.offsetHeight;

  if (total) total.textContent = doisDigitos(n);
  linha?.style.setProperty('--fatia', `${100 / n}%`);

  function vai(k, pelaPessoa = false) {
    i = ((k % n) + n) % n;
    chips.forEach((c, j) => {
      c.classList.toggle('ativo', j === i);
      c.setAttribute('aria-pressed', String(j === i));
    });
    falas.forEach((f, j) => f.classList.toggle('ativa', j === i));
    const socio = chips[i].dataset.socio;
    pessoas.forEach((p) => p.classList.toggle('ativa', p.dataset.socio === socio));
    if (atual) atual.textContent = doisDigitos(i + 1);
    linha?.style.setProperty('--pos', String(i));
    passado = 0;
    pinta();
    // no celular as áreas são um trilho de lado: a área da vez fica à vista (só o trilho anda, nunca a página)
    if (trilho && trilho.scrollWidth > trilho.clientWidth + 4) {
      const c = chips[i].parentElement;
      trilho.scrollTo({ left: c.offsetLeft - (trilho.clientWidth - c.offsetWidth) / 2, behavior: pelaPessoa && !reduzido ? 'smooth' : 'auto' });
    }
  }
  const pinta = () => { const p = Math.min(1, passado / TROCA); for (const t of tempos) t.style.transform = `scaleX(${p.toFixed(4)})`; };

  // o relógio do carrossel: roda sozinho, com o cursor em cima ou não; só espera com o hero coberto ou a aba escondida
  function relogio(agora) {
    const dt = Math.min(100, agora - antes);
    antes = agora;
    if (rodando && !coberto && !document.hidden) {
      passado += dt;
      if (passado >= TROCA) vai(i + 1);
      else pinta();
    }
    requestAnimationFrame(relogio);
  }

  chips.forEach((c, j) => c.addEventListener('click', () => vai(j, true)));
  el.querySelector('[data-volta]')?.addEventListener('click', () => vai(i - 1, true));
  el.querySelector('[data-avanca]')?.addEventListener('click', () => vai(i + 1, true));
  // setas do teclado com o foco no carrossel
  el.addEventListener('keydown', (ev) => {
    if (!ev.target.closest('.hero__areas, .hero__passos')) return;
    if (ev.key === 'ArrowRight') { vai(i + 1, true); foca(); ev.preventDefault(); }
    if (ev.key === 'ArrowLeft') { vai(i - 1, true); foca(); ev.preventDefault(); }
  });
  const foca = () => { if (document.activeElement?.classList.contains('chip')) chips[i].focus({ preventScroll: true }); };

  // a passagem: enquanto a seção seguinte sobe por cima, o palco sobe um pouco e escurece
  function passagem(y) {
    const c = Math.max(0, Math.min(1, y / altura));
    const era = coberto;
    coberto = c >= 1;
    if (coberto !== era) el.classList.toggle('coberto', coberto);
    if (coberto || reduzido) return;
    palco.style.transform = `translate3d(0, ${(-c * 0.075 * innerHeight).toFixed(1)}px, 0)`;
    veu.style.opacity = (c * 0.6).toFixed(3);
  }
  aoRolar(passagem);

  function mede() {
    altura = el.offsetHeight;
    passagem(window.scrollY);
  }
  mede();

  vai(0);
  return {
    mede,
    /** a entrada: a foto assenta, o título sobe linha a linha e as peças chegam */
    entra() {
      el.classList.add('entrou');
      document.querySelector('[data-topo]')?.classList.add('entrou');
      setTimeout(() => document.querySelector('[data-topo]')?.classList.add('assentado'), 1500);
      antes = performance.now();
      setTimeout(() => { rodando = true; }, reduzido ? 0 : 1300);
      requestAnimationFrame(relogio);
    },
  };
}
