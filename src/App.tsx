import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LuShoppingBag, LuArrowRight, LuArrowUpRight, LuMenu, LuX, LuMapPin } from 'react-icons/lu';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa6';
import { products, currency } from './catalog';
import type { Product } from './catalog';
import CatalogPage from './CatalogPage';
import CartDrawer from './CartDrawer';
import { useCollectionStack } from './useCollectionStack';
import type { CartLine, OrderDetails } from './CartDrawer';

gsap.registerPlugin(ScrollTrigger);
const WA = 'https://wa.me/5562994801843';
const IG = 'https://instagram.com/vbmodaalfaiataria';
type Line = CartLine;
const safeCart = (): Line[] => { try { const value = JSON.parse(localStorage.getItem('vb-cart-v2') || '[]'); return Array.isArray(value) ? value.filter((line: Line) => products.some(p => p.id === line.id) && Number.isInteger(line.quantity) && line.quantity > 0) : []; } catch { return []; } };
function App() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cart, setCart] = useState<Line[]>(safeCart);
  const [active, setActive] = useState<Record<string, { color: string; size: string; qty: number }>>({});
  const isCatalog = window.location.pathname.startsWith('/catalogo');
  useCollectionStack(!isCatalog);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + (products.find(p => p.id === line.id)?.price ?? 0) * line.quantity, 0);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => { localStorage.setItem('vb-cart-v2', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (window.scrollX !== 0) window.scrollTo(0, window.scrollY); }, []);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawer]);
  useEffect(() => {
    const update = () => {
      const bannerBottom = document.querySelector('.essence')?.getBoundingClientRect().top ?? 0;
      const progress = isCatalog ? 1 : Math.min(1, Math.max(0, (250 - bannerBottom) / 170));
      document.querySelector<HTMLElement>('.header')?.style.setProperty('--header-opacity', String(progress * .97));
      setScrolled(isCatalog || bannerBottom <= 80);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  useEffect(() => {
    // Tall sections scroll until their lower edge reaches the viewport, then the next section covers them.
    const sections = document.querySelectorAll<HTMLElement>('.home-main > section');
    const observer = new ResizeObserver(entries => {
      entries.forEach(({ target }) => {
        (target as HTMLElement).style.setProperty('--section-height', `${target.getBoundingClientRect().height}px`);
      });
    });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (isCatalog || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-copy > *', { y: 32, opacity: 0 }, { y: 0, opacity: 1, stagger: .13, duration: 1.15, ease: 'power3.out', delay: .15 });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => gsap.fromTo(el, { y: 72, opacity: 0, rotateX: 8 }, { y: 0, opacity: 1, rotateX: 0, ease: 'power3.out', duration: 1.1, scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
      gsap.fromTo('.essence-model', { y: 130, rotation: -4 }, { y: -35, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.essence', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.editorial-image img', { scale: 1.24 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.editorial', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    return () => { ctx.revert(); };
  }, []);
  useEffect(() => {
    if (isCatalog || reduced()) return;
    const svg = document.querySelector<SVGSVGElement>('.site-thread');
    const path = document.querySelector<SVGPathElement>('.site-thread-live');
    const base = document.querySelector<SVGPathElement>('.site-thread-base');
    const maskBackground = document.querySelector<SVGRectElement>('.site-thread-mask-background');
    const cutoutGroup = document.querySelector<SVGGElement>('.site-thread-cutouts');
    if (!svg || !path || !base || !maskBackground || !cutoutGroup) return;
    let tween: gsap.core.Tween | undefined;
    let frame = 0;
    const protectedElements = Array.from(document.querySelectorAll<HTMLElement>(
      '.hero-copy, .essence-heading, .essence-story, .essence-model, .intro-row, .fine-rule, .family-story, .family-end, .editorial-image-caption, .journey-heading, .journey-steps, .journey-cta, .assistance > div:first-child, .service-card, .instagram > div:last-child, .footer-main, .footer-bottom'
    ));
    const cutouts = protectedElements.map(element => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('fill', 'black');
      cutoutGroup.appendChild(rect);
      return { element, rect };
    });
    const updateCutouts = () => {
      const padding = window.innerWidth <= 600 ? 10 : 38;
      cutouts.forEach(({ element, rect }) => {
        const bounds = element.getBoundingClientRect();
        const inset = element.classList.contains('essence-model') ? 0 : padding;
        rect.setAttribute('x', `${bounds.left - inset}`);
        rect.setAttribute('y', `${bounds.top + window.scrollY - inset}`);
        rect.setAttribute('width', `${bounds.width + inset * 2}`);
        rect.setAttribute('height', `${bounds.height + inset * 2}`);
      });
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; updateCutouts(); });
    };
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = element;
      while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
      return top;
    };
    const draw = () => {
      tween?.scrollTrigger?.kill(); tween?.kill();
      const height = document.documentElement.scrollHeight, width = window.innerWidth;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.style.height = `${height}px`;
      maskBackground.setAttribute('width', `${width}`);
      maskBackground.setAttribute('height', `${height}`);
      const hero = document.querySelector<HTMLElement>('.hero');
      const heroEnd = hero ? documentTop(hero) + hero.offsetHeight : window.innerHeight;
      const right = width * .975, left = width * .025;
      const points: Array<[number, number]> = [[right, 0], [width * .94, heroEnd * .28], [right, heroEnd * .72], [right, heroEnd]];
      const addSection = (selector: string, side: number) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return;
        const top = documentTop(element);
        const inward = side === right ? width * .96 : width * .04;
        points.push([inward, top + element.offsetHeight * .18], [side, top + element.offsetHeight * .82]);
      };
      addSection('.essence', right);
      const firstHold = document.querySelector<HTMLElement>('.section-hold--essence');
      if (firstHold) points.push([width * .5, documentTop(firstHold) + firstHold.offsetHeight * .5]);
      addSection('.collection-intro', left);
      addSection('.family-showcase', left);
      addSection('.editorial', left);
      const secondHold = document.querySelector<HTMLElement>('.section-hold--editorial');
      if (secondHold) points.push([width * .5, documentTop(secondHold) + secondHold.offsetHeight * .5]);
      addSection('.assistance', right);
      addSection('.instagram', right);
      addSection('footer', right);
      points.push([right, height]);
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        const [x, y] = points[i], [previousX, previousY] = points[i - 1];
        const bend = Math.max(0, (y - previousY) * .45);
        d += ` C ${previousX} ${previousY + bend}, ${x} ${y - bend}, ${x} ${y}`;
      }
      path.setAttribute('d', d); base.setAttribute('d', d);
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      tween = gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });
      updateCutouts();
    };
    const timer = window.setTimeout(draw, 500);
    window.addEventListener('resize', draw); window.addEventListener('load', draw); window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); window.removeEventListener('resize', draw); window.removeEventListener('load', draw); window.removeEventListener('scroll', onScroll); tween?.scrollTrigger?.kill(); tween?.kill(); cutoutGroup.replaceChildren(); };
  }, []);

  const addItem = (product: Product) => {
    const variant = active[product.id] || { color: product.colors[0], size: product.sizes[0], qty: 1 };
    setCart(prev => { const index = prev.findIndex(item => item.id === product.id && item.color === variant.color && item.size === variant.size); if (index < 0) return [...prev, { id: product.id, ...variant, quantity: variant.qty }]; return prev.map((item, i) => i === index ? { ...item, quantity: item.quantity + variant.qty } : item); });
    setDrawer(true);
  };
  const changeVariant = (id: string, field: 'color' | 'size' | 'qty', value: string | number) => { const p = products.find(item => item.id === id)!; setActive(prev => ({ ...prev, [id]: { color: prev[id]?.color ?? p.colors[0], size: prev[id]?.size ?? p.sizes[0], qty: prev[id]?.qty ?? 1, [field]: value } })); };
  const adjust = (index: number, delta: number) => setCart(prev => prev.flatMap((line, i) => i !== index ? [line] : line.quantity + delta > 0 ? [{ ...line, quantity: line.quantity + delta }] : []));
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const sendOrder = (data: OrderDetails) => {
    if (count < 6) return;
    const lines = cart.map(line => { const p = products.find(item => item.id === line.id)!; return `• ${p.name} — ${line.color} / ${line.size} — ${line.quantity} un. × ${currency(p.price)} = ${currency(p.price * line.quantity)}`; });
    const message = [`Olá! Quero finalizar este pedido Veste Bem:`, '', ...lines, '', `Total das peças: ${currency(total)}`, `Quantidade: ${count} peças`, '', `Nome: ${data.nome}`, `Telefone: ${data.telefone}`, `CPF: ${data.cpf}`, `Endereço: ${data.rua}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''}`, `Bairro: ${data.bairro}`, `Cidade/UF: ${data.cidade}/${data.uf}`, `CEP: ${data.cep}`, '', 'Gostaria de confirmar disponibilidade, frete e pagamento.'].join('\n');
    window.open(`${WA}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return <>
    <a className="skip" href={isCatalog ? "#catalogo" : "#colecao"}>Pular para o conteúdo</a>
    {!isCatalog && <svg className="site-thread" aria-hidden="true" preserveAspectRatio="none"><defs><mask id="site-thread-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"><rect className="site-thread-mask-background" fill="white"/><g className="site-thread-cutouts"/></mask></defs><path className="site-thread-base" mask="url(#site-thread-mask)"/><path className="site-thread-live" mask="url(#site-thread-mask)"/></svg>}
    <header className={isCatalog ? 'header scrolled catalog-header' : scrolled ? 'header scrolled' : 'header'}><div className="header-inner"><a className="brand" href="/" aria-label="Veste Bem, início"><img src="/assets/logo-horizontal.png" alt="Veste Bem Moda Alfaiataria" /></a><nav className={menu ? 'nav open' : 'nav'} aria-label="Navegação principal" onClick={() => setMenu(false)}><a href="/catalogo/">Catálogo</a><a href="/#colecao">Coleção</a><a href="/#essencia">Nossa essência</a><a href="/#como-comprar">Como comprar</a><a href="/#atendimento">Atendimento</a></nav><div className="header-actions"><button className="bag-button" onClick={() => isCatalog ? setDrawer(true) : window.location.assign('/catalogo/')} aria-label={isCatalog ? `Abrir sacola, ${count} peças` : `Ir ao catálogo, ${count} peças na sacola`}><LuShoppingBag size={22} strokeWidth={1.8} aria-hidden="true"/><span className="bag-count">{count}</span></button><a className="header-contact" href={WA} target="_blank" rel="noreferrer">Fale com a gente <LuArrowUpRight aria-hidden="true"/></a><button className="mobile-toggle" onClick={() => setMenu(!menu)} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu}>{menu ? <LuX aria-hidden="true"/> : <LuMenu aria-hidden="true"/>}</button></div></div></header>
    {isCatalog ? <CatalogPage active={active} changeVariant={changeVariant} addItem={addItem} count={count} total={total} openCart={() => setDrawer(true)}/> : <main className="home-main">
      <section className="hero" id="inicio">
        <img className="hero-photo" src="/assets/hero-editorial.webp" alt="Modelo com colete verde de alfaiataria em cenário mediterrâneo" fetchPriority="high" />
        <div className="hero-copy"><span className="eyebrow"><i/> ALFAIATARIA FEMININA · GOIÂNIA</span><h1>Feita para <em>vestir</em><br/>o seu próprio<br/>caminho.</h1><p>Peças que acompanham quem você é. Coletes, blusas e macaquinhos em uma coleção para viver muitas versões de si.</p><div className="hero-ctas"><a className="vb-button vb-button--primary hero-primary" href="/catalogo/">VER O CATÁLOGO <LuArrowRight aria-hidden="true"/></a><a className="vb-button vb-button--contact hero-whats" href={WA} target="_blank" rel="noreferrer"><FaWhatsapp aria-hidden="true"/> CONVERSAR NO WHATSAPP <LuArrowRight aria-hidden="true"/></a></div></div>
      </section>
      <section className="essence" id="essencia"><div className="essence-inner"><div className="essence-heading" data-reveal><span className="eyebrow"><i/> NOSSA ESSÊNCIA</span><h2>Elegância que<br/>transcende<br/><em>tendências.</em></h2></div><div className="essence-story" data-reveal><p>A Veste Bem nasceu do cuidado com a alfaiataria feminina. Dos coletes às blusas e ao macaquinho, criamos peças que unem sofisticação, conforto e personalidade.</p><p>Acreditamos que a excelência está no cuidado com cada peça. Por isso dedicamos nossa atenção aos detalhes que fazem diferença: modelagem impecável, tecidos selecionados e acabamento refinado.</p><p>Cada peça é pensada para mulheres que valorizam elegância, presença e estilo em qualquer ocasião.</p></div></div><span className="essence-mark" aria-hidden="true">VB</span><img className="essence-model" src="/assets/essence-model.webp" alt="Modelo com colete bege de alfaiataria" /></section>
      <div className="section-hold section-hold--essence" aria-hidden="true" />
      <section className="collection-intro" id="colecao"><span className="eyebrow" data-reveal>02 / A COLEÇÃO</span><div className="intro-row" data-reveal><h2>Peças para <em>todas</em><br/>as suas versões.</h2><p>Do primeiro encontro com o espelho ao último compromisso do dia. Encontre a sua próxima peça favorita.</p></div><div className="fine-rule"><span>DESCUBRA CADA PEÇA</span><span>COLETE / BLUSA / MACAQUINHO</span></div></section>
      <section className="family-showcase" aria-label="Conheça nossas peças"><div className="family-stack-stage">
        <article className="family-panel family-panel--coletes"><div className="family-photo"><img src="/assets/colete-u.webp" alt="Modelo vestindo colete de alfaiataria" loading="lazy"/><span>01 / COLETES</span></div><div className="family-story"><span className="eyebrow">A ARTE DO CORTE</span><h3>Um detalhe.<br/><em>Outra presença.</em></h3><p>O colete gola U desenha a silhueta sem limitar o movimento. Seu contorno suave e a estrutura de alfaiataria trazem presença para uma peça que muda o look inteiro.</p><ul><li>Gola U</li><li>Estrutura de alfaiataria</li><li>Para sobreposições ou peça principal</li></ul><a className="vb-button vb-button--outline" href="/catalogo/#coletes">EXPLORAR COLETES <LuArrowRight aria-hidden="true"/></a></div></article>
        <article className="family-panel family-panel--blusas"><div className="family-photo"><img src="/assets/blusa-u.webp" alt="Imagem ilustrativa de blusa de alfaiataria" loading="lazy"/><span>02 / BLUSAS · IMAGEM ILUSTRATIVA</span></div><div className="family-story"><span className="eyebrow">LEVEZA COM FORMA</span><h3>Feitas para<br/><em>acompanhar.</em></h3><p>A precisão da alfaiataria encontra a leveza de uma blusa. Escolha entre a linha marcada da gola V e a delicadeza da gola U para compor dos dias comuns às ocasiões especiais.</p><ul><li>Gola V e gola U</li><li>Versáteis para diferentes combinações</li><li>Elegância com leveza</li></ul><a className="vb-button vb-button--outline" href="/catalogo/#blusas">EXPLORAR BLUSAS <LuArrowRight aria-hidden="true"/></a></div></article>
        <article className="family-panel family-panel--macaquinho"><div className="family-photo"><img src="/assets/macaquinho.webp" alt="Imagem ilustrativa de macaquinho de alfaiataria" loading="lazy"/><span>03 / MACAQUINHO · IMAGEM ILUSTRATIVA</span></div><div className="family-story"><span className="eyebrow">O LOOK EM UMA PEÇA</span><h3>Pronta em<br/><em>um gesto.</em></h3><p>Uma peça única com a presença de um look completo. O macaquinho reúne praticidade e acabamento de alfaiataria para quem quer se vestir com intenção, sem complicar.</p><ul><li>Praticidade de peça única</li><li>Presença da alfaiataria</li><li>Do dia à noite com novos acessórios</li></ul><a className="vb-button vb-button--outline" href="/catalogo/#macaquinhos">EXPLORAR MACAQUINHO <LuArrowRight aria-hidden="true"/></a></div></article>
        </div><div className="family-end"><span>DESCUBRA A COLEÇÃO COMPLETA</span><a className="vb-button vb-button--primary" href="/catalogo/">VER CATÁLOGO E PREÇOS <LuArrowRight aria-hidden="true"/></a></div>
      </section>
      <section className="editorial" id="como-comprar" aria-labelledby="journey-title">
        <div className="editorial-image"><img src="/assets/essencia.webp" alt="Modelo com colete marrom de alfaiataria" loading="lazy"/><div className="editorial-image-caption"><span>VESTE BEM / ALFAIATARIA FEMININA</span><strong>O seu jeito de vestir<br/>começa aqui.</strong></div></div>
        <div className="editorial-copy">
          <div className="journey-heading" data-reveal><span className="eyebrow">03 / DO SEU JEITO</span><h2 id="journey-title">Seu estilo não segue um roteiro.<br/><em>Seu pedido, sim.</em></h2><p>Da escolha das peças à conversa final, cada etapa respeita o seu jeito.</p></div>
          <div className="journey-steps" aria-label="Como comprar">
            <article className="journey-step" data-reveal><span className="journey-number">01</span><h3>Escolha</h3><p>Combine modelos, cores e tamanhos. O pedido mínimo é de seis peças, em qualquer combinação.</p></article>
            <article className="journey-step" data-reveal><span className="journey-number">02</span><h3>Organize</h3><p>Confira a sacola e preencha seus dados e o endereço de entrega.</p></article>
            <article className="journey-step" data-reveal><span className="journey-number">03</span><h3>Converse</h3><p>Envie o pedido pelo WhatsApp. Nossa equipe confirma disponibilidade, frete e pagamento.</p></article>
          </div>
          <a className="vb-button vb-button--outline journey-cta" href="/catalogo/">EXPLORAR O CATÁLOGO <LuArrowRight aria-hidden="true"/></a>
        </div>
      </section>
      <div className="section-hold section-hold--editorial" aria-hidden="true" />
      <section className="assistance" id="atendimento"><div data-reveal><span className="eyebrow light">04 / ATENDIMENTO PERSONALIZADO</span><h2>A peça certa começa<br/>com uma <em>boa conversa.</em></h2><p>Orientação de medidas, escolha do modelo e suporte durante o pedido. Cada detalhe fica mais simples quando alguém entende o que você procura.</p><div className="service-tags"><span>ESCOLHA DO MODELO</span><span>ORIENTAÇÃO DE MEDIDAS</span><span>ATENDIMENTO VIA WHATSAPP</span></div></div><div className="service-card" data-reveal><img src="/assets/logo-white.png" alt=""/><h3>Vamos encontrar<br/>a sua versão.</h3><p>Converse com a nossa equipe sobre modelos, cores e tamanhos.</p><a className="vb-button vb-button--gold" href={WA} target="_blank" rel="noreferrer">SOLICITAR ATENDIMENTO <LuArrowRight aria-hidden="true"/></a></div></section>
      <section className="instagram" id="instagram"><div className="insta-images"><img src="/assets/colete-u.webp" alt="Colete gola U" loading="lazy"/><img src="/assets/blusa-u.webp" alt="Imagem ilustrativa de blusa gola U" loading="lazy"/></div><div data-reveal><span className="eyebrow">05 / ACOMPANHE A VESTE BEM</span><h2>Mais formas<br/>de <em>vestir bem.</em></h2><p>Looks, combinações e novidades continuam no nosso Instagram. Inspire-se e encontre sua próxima peça.</p><a className="vb-button vb-button--outline" href={IG} target="_blank" rel="noreferrer"><FaInstagram aria-hidden="true"/> SEGUIR @VBMODAALFAIATARIA <LuArrowRight aria-hidden="true"/></a></div></section>
    </main>}
    <footer><div className="footer-main"><div className="footer-about"><a href="/"><img src="/assets/logo-white.png" alt="Veste Bem Moda Alfaiataria"/></a><p>Alfaiataria feminina em peças para acompanhar suas escolhas. Atendimento online para pedidos no atacado.</p><div className="footer-social"><a href={IG} target="_blank" rel="noreferrer" aria-label="Instagram da Veste Bem"><FaInstagram aria-hidden="true"/><span>Instagram</span></a><a href={WA} target="_blank" rel="noreferrer" aria-label="WhatsApp da Veste Bem"><FaWhatsapp aria-hidden="true"/><span>WhatsApp</span></a><a href="https://www.google.com/maps/search/?api=1&query=Shopping%20Via%20Norte%20Rua%20300%20Goi%C3%A2nia" target="_blank" rel="noreferrer" aria-label="Localização da Veste Bem"><LuMapPin aria-hidden="true"/><span>Localização</span></a></div></div><nav aria-label="Navegação do rodapé"><strong>NAVEGAÇÃO</strong><a href="/">Início</a><a href="/catalogo/">Catálogo</a><a href="/#colecao">Coleção</a><a href="/#essencia">Nossa essência</a><a href="/#como-comprar">Como comprar</a><a href="/#atendimento">Atendimento</a></nav><div className="footer-contact"><strong>CONTATO</strong><a href={WA} target="_blank" rel="noreferrer"><FaWhatsapp aria-hidden="true"/> (62) 99480-1843</a><a href={IG} target="_blank" rel="noreferrer"><FaInstagram aria-hidden="true"/> @vbmodaalfaiataria</a><span>Shopping Via Norte · Goiânia, GO</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Veste Bem. Todos os direitos reservados.</span><span>ALFAIATARIA FEMININA · GOIÂNIA</span></div></footer>
    <AnimatePresence>{drawer && <CartDrawer key="cart-drawer" cart={cart} count={count} total={total} onClose={closeDrawer} onAdjust={adjust} onRemove={index => setCart(prev => prev.filter((_, i) => i !== index))} onSubmit={sendOrder}/>}</AnimatePresence>
  </>;
}
export default App;
