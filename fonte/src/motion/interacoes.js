// Acabamento das interações:
// · .rolando no <html> enquanto a página rola com o cursor parado: sem isso o hover acende sozinho em tudo que
//   passa debaixo do cursor (a classe sai no primeiro movimento de verdade do mouse);
// · .tocado nos clicáveis durante o toque, a resposta do celular no lugar do hover.
const html = document.documentElement;
const CLICAVEL = 'a, button, [role="button"], [data-seta]';

export function interacoes() {
  let x = -1, y = -1;
  addEventListener('scroll', () => html.classList.add('rolando'), { passive: true });
  addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    // o Safari deixa movementX/Y em zero: compara a posição com a anterior
    if (ev.clientX === x && ev.clientY === y) return;
    x = ev.clientX; y = ev.clientY;
    html.classList.remove('rolando');
  }, { passive: true });

  // toque: a peça afunda 70 ms depois de o dedo encostar (um arrasto que começa nela não chega a marcar)
  let alvo = null, espera = 0, x0 = 0, y0 = 0;
  const solta = (el, depois = 180) => setTimeout(() => el.classList.remove('tocado'), depois);
  addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse') return;
    const el = ev.target.closest?.(CLICAVEL);
    if (!el) return;
    alvo = el; x0 = ev.clientX; y0 = ev.clientY;
    clearTimeout(espera);
    espera = setTimeout(() => alvo?.classList.add('tocado'), 70);
  }, { passive: true });
  addEventListener('pointermove', (ev) => {
    if (!alvo || ev.pointerType === 'mouse') return;
    if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 9) { clearTimeout(espera); solta(alvo, 0); alvo = null; }
  }, { passive: true });
  const fim = () => { if (!alvo) return; const el = alvo; alvo = null; clearTimeout(espera); el.classList.add('tocado'); solta(el); };
  addEventListener('pointerup', fim, { passive: true });
  addEventListener('pointercancel', () => { if (!alvo) return; clearTimeout(espera); solta(alvo, 0); alvo = null; }, { passive: true });
}
