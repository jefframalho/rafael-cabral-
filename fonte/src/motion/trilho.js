// Trilho: uma fileira de cartões que rola de lado (data-trilho no bloco, data-faixa na fileira). Rola com o trackpad,
// com o dedo, arrastando com o mouse, pelas setas (data-ant, data-prox) e pelas setas do teclado. Os passos mostram
// onde a fileira está: data-atual, data-total e a linha de .passos__linha. O total é o número de paradas, não de
// cartões: com quatro à vista e sete na fileira, são quatro paradas.
const dois = (n) => String(n).padStart(2, '0');

export function trilhos() {
  const todos = [...document.querySelectorAll('[data-trilho]')].map((raiz) => {
    const faixa = raiz.querySelector('[data-faixa]');
    if (!faixa) return null;
    const itens = [...faixa.children];
    const ant = raiz.querySelector('[data-ant]');
    const prox = raiz.querySelector('[data-prox]');
    const nEl = raiz.querySelector('[data-atual]');
    const tEl = raiz.querySelector('[data-total]');
    const linha = raiz.querySelector('.passos__linha');
    let passo = 1, total = 1, max = 0;

    function mede() {
      if (itens.length < 2) return;
      passo = itens[1].offsetLeft - itens[0].offsetLeft || 1;
      max = faixa.scrollWidth - faixa.clientWidth;
      total = Math.max(1, Math.round(max / passo) + 1);
      if (tEl) tEl.textContent = dois(total);
      linha?.style.setProperty('--fatia', `${100 / total}%`);
      raiz.classList.toggle('trilho--parado', max < 4);
      pinta();
    }
    function pinta() {
      const x = faixa.scrollLeft;
      const i = x >= max - 2 ? total - 1 : Math.min(total - 1, Math.round(x / passo));
      if (nEl) nEl.textContent = dois(i + 1);
      linha?.style.setProperty('--pos', (max > 0 ? (x / max) * (total - 1) : 0).toFixed(3));
      if (ant) ant.disabled = x < 2;
      if (prox) prox.disabled = x > max - 2;
    }
    const parada = () => (faixa.scrollLeft >= max - 2 ? total - 1 : Math.round(faixa.scrollLeft / passo));
    const vai = (k) => faixa.scrollTo({ left: Math.min(max, Math.max(0, k) * passo), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

    faixa.addEventListener('scroll', pinta, { passive: true });
    ant?.addEventListener('click', () => vai(parada() - 1));
    prox?.addEventListener('click', () => vai(parada() + 1));
    faixa.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowRight') { vai(parada() + 1); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { vai(parada() - 1); ev.preventDefault(); }
    });

    // arrastar com o mouse (o dedo e o trackpad já rolam a fileira sozinhos)
    let x0 = 0, rolagem0 = 0, puxando = false, andou = 0;
    faixa.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType !== 'mouse' || ev.button !== 0 || max < 4) return;
      puxando = true; andou = 0; x0 = ev.clientX; rolagem0 = faixa.scrollLeft;
    });
    addEventListener('pointermove', (ev) => {
      if (!puxando) return;
      const dx = ev.clientX - x0;
      andou = Math.max(andou, Math.abs(dx));
      if (andou > 4) { faixa.classList.add('puxando'); faixa.scrollLeft = rolagem0 - dx; }
    });
    const solta = () => {
      if (!puxando) return;
      puxando = false;
      if (!faixa.classList.contains('puxando')) return;
      faixa.classList.remove('puxando');
      vai(parada());
    };
    addEventListener('pointerup', solta);
    addEventListener('pointercancel', solta);
    // depois de um arrasto, o clique que sobra não abre nada
    faixa.addEventListener('click', (ev) => { if (andou > 6) { ev.preventDefault(); ev.stopPropagation(); andou = 0; } }, true);
    faixa.addEventListener('dragstart', (ev) => ev.preventDefault());

    mede();
    return { mede };
  }).filter(Boolean);
  return { mede: () => todos.forEach((t) => t.mede()) };
}
