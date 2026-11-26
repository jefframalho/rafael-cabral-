// Contato: um botão com data-assunto="Direito Civil" (o de cada área, por exemplo) leva o assunto junto. A seção de
// contato passa a mostrar "Assunto: Direito Civil", e as mensagens do WhatsApp e do e-mail já saem com ele.
// Os links ficam no HTML, com a mensagem padrão: data-via="whats" e data-via="email".
export function contato() {
  const sec = document.querySelector('.contato');
  if (!sec) return;
  const aviso = sec.querySelector('[data-assunto-aviso]');
  const nome = sec.querySelector('[data-assunto-nome]');
  const vias = [...document.querySelectorAll('[data-via]')].map((a) => ({ a, base: a.getAttribute('href') }));

  function poe(assunto) {
    for (const { a, base } of vias) {
      if (!assunto) { a.setAttribute('href', base); continue; }
      const u = new URL(base, location.href);
      if (a.dataset.via === 'whats') u.searchParams.set('text', `Olá! Quero falar sobre ${assunto}.`);
      if (a.dataset.via === 'email') u.searchParams.set('subject', `Quero falar sobre ${assunto}`);
      a.setAttribute('href', a.dataset.via === 'email' ? u.href.replace(/\+/g, '%20') : u.href);
    }
    if (nome) nome.textContent = assunto || '';
    if (aviso) aviso.hidden = !assunto;
  }

  document.addEventListener('click', (ev) => {
    const b = ev.target.closest?.('[data-assunto]');
    if (b) poe(b.dataset.assunto);
    if (ev.target.closest?.('[data-assunto-tira]')) poe('');
  });
  document.addEventListener('assunto', (ev) => poe(ev.detail));
}
