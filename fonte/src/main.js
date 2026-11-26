// Taveira & Sodré: liga a rolagem, o hero (entrada e carrossel das áreas), o topo, as camadas (seção que sobe por cima
// da anterior), as entradas das seções, a paralaxe das fotos, os trilhos de cartões, os painéis (menu e leitura) e o
// assunto do contato.
// Não há tela de carregamento: a entrada do hero começa assim que a foto e as duas fontes chegam.
import { criarRolagem, remede } from './motion/rolagem.js';
import { hero } from './motion/hero.js';
import { topo } from './motion/topo.js';
import { revelacoes } from './motion/revela.js';
import { paralaxe } from './motion/paralaxe.js';
import { gruda } from './motion/gruda.js';
import { trilhos } from './motion/trilho.js';
import { folhas } from './motion/folha.js';
import { contato } from './motion/contato.js';
import { interacoes } from './motion/interacoes.js';

const html = document.documentElement;
window.__tsVivo = true;

// sem transição no primeiro quadro: a trava sai depois de dois quadros, e só então a entrada pode começar
// (com tudo em cache, a foto e as fontes chegam antes disso e a entrada sairia sem movimento)
const assentou = new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => { html.classList.add('assentou'); ok(); })));

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const FONTES = ['600 1em "Red Hat Display Variable"', '400 1em "Red Hat Text Variable"'];

async function iniciar() {
  criarRolagem();
  const h = hero();
  const t = topo();
  const tr = trilhos();
  const g = gruda();
  folhas();
  contato();
  interacoes();

  // a entrada espera a foto do hero e as fontes; depois de 2,4 s entra do jeito que estiver
  const foto = document.querySelector('.hero__fundo img');
  const fotoPronta = !foto ? null : foto.complete
    ? foto.decode?.().catch(() => {})
    : new Promise((ok) => { foto.addEventListener('load', ok, { once: true }); foto.addEventListener('error', ok, { once: true }); });
  await Promise.race([Promise.all([fotoPronta, ...FONTES.map((f) => document.fonts.load(f).catch(() => {}))]), espera(2400)]);
  await assentou;
  await new Promise(requestAnimationFrame);

  h?.entra();
  revelacoes();
  paralaxe();

  // a página mudou de tamanho (janela, fontes ou imagens que chegaram): tudo mede de novo
  const mede = () => { g?.mede(); h?.mede(); t?.mede(); tr?.mede(); remede(); };
  let tempo = 0, largura = innerWidth, altura = innerHeight;
  addEventListener('resize', () => {
    // no celular a barra do navegador sobe e desce: só a largura, ou um salto grande de altura, pede nova medida
    if (innerWidth === largura && Math.abs(innerHeight - altura) < 120) return;
    largura = innerWidth; altura = innerHeight;
    clearTimeout(tempo);
    tempo = setTimeout(mede, 100);
  });
  mede();
  document.fonts.ready.then(mede);
  addEventListener('load', mede, { once: true });
}

iniciar();
