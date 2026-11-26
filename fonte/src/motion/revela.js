// Entradas: cada peça com data-revela (e cada marca d'água) ganha .visto quando chega à tela, uma vez; o movimento
// em si está no CSS (base.css). Os números com data-conta contam até o valor quando aparecem.
const html = document.documentElement;

export function revelacoes() {
  const pecas = [...document.querySelectorAll('[data-revela], .agua')];
  const numeros = [...document.querySelectorAll('[data-conta]')];
  // dentro de um grupo data-escada, as peças entram uma depois da outra
  for (const g of document.querySelectorAll('[data-escada]')) {
    [...g.querySelectorAll('[data-revela]')].forEach((p, i) => p.style.setProperty('--i', String(i)));
  }

  if (html.classList.contains('sem-entrada') || !('IntersectionObserver' in window)) {
    pecas.forEach((p) => p.classList.add('visto'));
    return;
  }

  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('visto');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.01 });
  pecas.forEach((p) => io.observe(p));

  const ioNumeros = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      conta(e.target);
      ioNumeros.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.6 });
  numeros.forEach((n) => { n.textContent = formata(n, 0); ioNumeros.observe(n); });

  // foco do teclado numa peça que ainda não entrou: ela aparece na hora
  document.addEventListener('focusin', (ev) => {
    for (let p = ev.target.closest?.('[data-revela]:not(.visto)'); p; p = p.parentElement?.closest('[data-revela]:not(.visto)')) p.classList.add('visto');
  });
}

const formata = (el, v) => `${el.dataset.antes || ''}${Math.round(v).toLocaleString('pt-BR', { useGrouping: el.dataset.milhar !== 'nao' })}${el.dataset.depois || ''}`;

function conta(el) {
  const fim = Number(el.dataset.conta);
  const de = Number(el.dataset.de || 0);
  const dur = 1500;
  const t0 = performance.now();
  const passo = (agora) => {
    const p = Math.min(1, (agora - t0) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = formata(el, de + (fim - de) * e);
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
