// Folhas: os dois painéis que abrem por cima da página, o menu (#menu) e o painel de leitura (#painel), que mostra o
// detalhe de uma área ou um artigo. São <dialog>: o foco fica preso dentro, Esc fecha e o resto da página espera.
// · data-abre="menu" ou data-abre="painel" num botão abre a folha; com data-painel="nome", o painel recebe o
//   conteúdo do <template data-painel="nome"> (src/sections/painel.html);
// · data-fecha fecha; um link para um ponto da página (#contato) fecha e leva até lá.
import { travar, soltar, irPara } from './rolagem.js';

const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const SAIDA = 200; // ms da saída (o mesmo tempo do CSS, em menu.css)

export function folhas() {
  const lista = [...document.querySelectorAll('dialog.folha')];
  if (!lista.length || typeof HTMLDialogElement === 'undefined') return;

  function abre(dlg, gatilho) {
    if (dlg.open) return;
    clearTimeout(dlg._saindo);
    dlg.classList.remove('fechando');
    travar();
    dlg.showModal();
    dlg.querySelector('.folha__painel')?.scrollTo(0, 0);
    gatilho?.setAttribute('aria-expanded', 'true');
    dlg._gatilho = gatilho;
    // dois quadros: a folha nasce fechada e só então desliza
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('aberta')));
  }

  function fecha(dlg, depois) {
    if (!dlg.open || dlg.classList.contains('fechando')) return;
    dlg.classList.remove('aberta');
    dlg.classList.add('fechando');
    dlg._gatilho?.setAttribute('aria-expanded', 'false');
    dlg._saindo = setTimeout(() => {
      dlg.classList.remove('fechando');
      dlg.close();
      soltar();
      depois?.();
    }, reduzido() ? 0 : SAIDA);
  }

  document.addEventListener('click', (ev) => {
    const g = ev.target.closest?.('[data-abre]');
    if (!g) return;
    const dlg = document.getElementById(g.dataset.abre);
    if (!dlg) return;
    ev.preventDefault();
    if (g.dataset.painel) {
      const molde = document.querySelector(`template[data-painel="${g.dataset.painel}"]`);
      const corpo = dlg.querySelector('[data-painel-corpo]');
      if (!molde || !corpo) return;
      corpo.replaceChildren(molde.content.cloneNode(true));
    }
    // um botão dentro de uma folha que abre outra (o menu leva a um artigo): fecha a primeira antes
    const dentro = g.closest('dialog.folha');
    if (dentro && dentro !== dlg) fecha(dentro, () => abre(dlg, null));
    else abre(dlg, g);
  });

  for (const dlg of lista) {
    dlg.addEventListener('cancel', (ev) => { ev.preventDefault(); fecha(dlg); });
    dlg.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-fecha]')) { ev.preventDefault(); fecha(dlg); return; }
      const a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      const alvo = document.getElementById(a.getAttribute('href').slice(1));
      if (!alvo) return;
      ev.preventDefault();
      ev.stopPropagation();
      // o assunto do botão vai junto para o contato (src/motion/contato.js escuta o mesmo clique pelo document)
      if (a.dataset.assunto) document.dispatchEvent(new CustomEvent('assunto', { detail: a.dataset.assunto }));
      fecha(dlg, () => irPara(alvo));
    });
  }
}
