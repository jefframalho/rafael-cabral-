// Lê conteudo/*.md e reescreve, entre os marcadores INFORMATIVOS, a lista de artigos (conteudo.html)
// e os painéis de leitura (painel.html). Rodado antes do build (prebuild no package.json).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'conteudo');
const secoes = join(raiz, 'src', 'sections');

function lerArtigo(arquivo) {
  const texto = readFileSync(join(pasta, arquivo), 'utf8').replace(/\r\n/g, '\n');
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${arquivo}: falta o bloco --- no início`);
  const meta = {};
  for (const linha of m[1].split('\n')) {
    const i = linha.indexOf(':');
    if (i > 0) meta[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
  }
  for (const campo of ['titulo', 'tema', 'imagem', 'data', 'resumo']) {
    if (!meta[campo]) throw new Error(`${arquivo}: campo "${campo}" é obrigatório`);
  }
  return { slug: arquivo.replace(/\.md$/, ''), ...meta, corpo: marked.parse(m[2].trim()) };
}

const artigos = readdirSync(pasta).filter((f) => f.endsWith('.md')).map(lerArtigo)
  .sort((a, b) => (b.data > a.data ? 1 : -1));

const cards = artigos.map((a) => `      <li class="artigo" data-seta>
        <div class="foto artigo__foto">
          <img src="/img/${a.imagem}-640.webp" srcset="/img/${a.imagem}-640.webp 640w, /img/${a.imagem}-1280.webp 1280w" sizes="(max-width: 899px) 78vw, 310px" width="640" height="360" alt="" loading="lazy" decoding="async">
        </div>
        <div class="artigo__corpo">
          <div>
            <p class="rotulo artigo__tema">${a.tema}</p>
            <h3 class="artigo__titulo"><button class="artigo__abre" type="button" data-abre="painel" data-painel="artigo-${a.slug}" aria-haspopup="dialog">${a.titulo}</button></h3>
          </div>
          <span class="seta artigo__seta" aria-hidden="true"><span class="seta__ic"><!-- @secao seta --></span></span>
        </div>
      </li>`).join('\n');

const templates = artigos.map((a) => `<template data-painel="artigo-${a.slug}">
  <figure class="foto painel__foto"><img src="/img/${a.imagem}-1280.webp" width="1280" height="720" alt="" decoding="async"></figure>
  <div class="painel__texto">
    <p class="rotulo">Artigo · ${a.tema}</p>
    <h2 class="painel__titulo">${a.titulo}</h2>
    <div class="texto painel__abre">${a.corpo}</div>
    <div class="acoes">
      <a class="botao" href="#contato" data-assunto="${a.tema}">
        <span class="botao__txt">Tirar uma dúvida sobre o tema</span>
        <span class="botao__seta"><!-- @secao seta --></span>
      </a>
    </div>
  </div>
</template>`).join('\n');

function trocar(arquivo, conteudo) {
  const caminho = join(secoes, arquivo);
  const s = readFileSync(caminho, 'utf8');
  const re = /<!-- INFORMATIVOS:INICIO -->[\s\S]*?<!-- INFORMATIVOS:FIM -->/;
  if (!re.test(s)) throw new Error(`${arquivo}: marcadores INFORMATIVOS não encontrados`);
  writeFileSync(caminho, s.replace(re, `<!-- INFORMATIVOS:INICIO -->\n${conteudo}\n<!-- INFORMATIVOS:FIM -->`));
}

trocar('conteudo.html', cards);
trocar('painel.html', templates);
console.log(`informativos: ${artigos.length} artigo(s) gerado(s)`);
