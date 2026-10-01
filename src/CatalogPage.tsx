import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LuArrowRight, LuMinus, LuPlus, LuShoppingBag } from 'react-icons/lu';
import { products, currency } from './catalog';
import type { Product } from './catalog';

type Variant = { color: string; size: string; qty: number };
type Props = {
  active: Record<string, Variant>;
  changeVariant: (id: string, field: 'color' | 'size' | 'qty', value: string | number) => void;
  addItem: (product: Product) => void;
  count: number;
  total: number;
  openCart: () => void;
};

const families = [
  { id: 'coletes', name: 'Coletes', line: 'A peça que transforma a composição.', detail: 'Gola V ou U, duas formas de criar presença com a precisão da alfaiataria.' },
  { id: 'blusas', name: 'Blusas', line: 'Leveza com intenção em cada escolha.', detail: 'Decotes V e U para combinar a estrutura da alfaiataria com o seu ritmo.' },
  { id: 'macaquinhos', name: 'Macaquinho', line: 'Um look inteiro em um gesto.', detail: 'Praticidade e elegância reunidas em uma peça só.' },
];

function Choice({ selected, onClick, group, children }: { selected: boolean; onClick: () => void; group: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return <motion.button type="button" className={`catalog-choice${selected ? ' chosen' : ''}`} onClick={onClick} aria-pressed={selected} whileTap={{ scale: .96 }}>
    {selected && <motion.span className="catalog-selection" layoutId={group} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true"/>}
    <span className="catalog-choice-label">{children}</span>
  </motion.button>;
}

export default function CatalogPage({ active, changeVariant, addItem, count, total, openCart }: Props) {
  const [filter, setFilter] = useState('todos');
  const reduceMotion = useReducedMotion();
  const visible = filter === 'todos' ? families : families.filter(family => family.id === filter);
  return <main className="catalog-main" id="catalogo">
    <section className="catalog-hero">
      <div className="catalog-hero-text"><span className="eyebrow"><i/> VESTE BEM / CATÁLOGO</span><h1>Escolha o que<br/><em>veste você.</em></h1><p><span className="catalog-hero-long">Peças de alfaiataria para combinar como quiser. Encontre seus modelos, organize o pedido e finalize os detalhes com a nossa equipe.</span><span className="catalog-hero-short">Combine seus modelos e monte seu pedido com a gente.</span></p><div className="catalog-hero-foot"><span>05 MODELOS · 03 LINHAS</span><span>PEDIDO MÍNIMO DE 06 PEÇAS</span></div></div>
      <div className="catalog-hero-image"><img src="/assets/colete-u.webp" alt="Modelo vestindo colete de alfaiataria"/><span>UMA COLEÇÃO, MUITAS FORMAS DE SER.</span></div>
    </section>
    <div className="catalog-toolbar"><div><span className="eyebrow">ENCONTRE SUA PEÇA</span><h2>O catálogo.</h2></div><div className="catalog-filters" role="group" aria-label="Filtrar peças">{[{ id: 'todos', name: 'Todas' }, ...families].map(item => <Choice key={item.id} group="catalog-filter" selected={filter === item.id} onClick={() => setFilter(item.id)}>{item.name}</Choice>)}</div></div>
    {visible.map((family, familyIndex) => <section className="catalog-family" id={family.id} key={family.id}>
      <div className="catalog-family-head"><span className="catalog-index">0{familyIndex + 1} / 03</span><div><h2>{family.name}<span>.</span></h2><p>{family.line} <small>{family.detail}</small></p></div></div>
      <div className="catalog-grid">{products.filter(product => product.family.toLowerCase() === (family.id === 'macaquinhos' ? 'macaquinhos' : family.id)).map((p, index) => {
        const v = active[p.id] || { color: p.colors[0], size: p.sizes[0], qty: 1 };
        return <motion.article className="catalog-card" key={p.id} initial={reduceMotion ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>
          <div className="catalog-card-photo"><img src={p.image} alt={`Foto ${p.conceptual ? 'ilustrativa ' : ''}de ${p.name}`} loading="lazy"/><span className="catalog-photo-index">VB — {String(index + 1).padStart(2, '0')}</span>{p.conceptual && <span className="catalog-photo-note">FOTO ILUSTRATIVA</span>}</div>
          <div className="catalog-card-info"><div className="catalog-card-heading"><div><span className="eyebrow">{p.family} / ALFAIATARIA</span><h3>{p.name}</h3></div><strong className="catalog-price">{currency(p.price)}<small>/ peça</small></strong></div><p className="catalog-description">{p.description}</p>
            <div className="catalog-variant-row"><fieldset className="catalog-colors"><legend>Cor <span>{v.color}</span></legend>{p.colors.length > 1 ? <div className="catalog-chips">{p.colors.map(color => <Choice key={color} group={`${p.id}-color`} selected={v.color === color} onClick={() => changeVariant(p.id, 'color', color)}>{color}</Choice>)}</div> : <span className="catalog-pending">Cores disponíveis sob consulta</span>}</fieldset><fieldset className="catalog-sizes"><legend>Tamanho</legend>{p.sizes[0] === 'A confirmar' ? <span className="catalog-pending">A confirmar com a equipe</span> : <div className="catalog-chips">{p.sizes.map(size => <Choice key={size} group={`${p.id}-size`} selected={v.size === size} onClick={() => changeVariant(p.id, 'size', size)}>{size}</Choice>)}</div>}</fieldset></div>
            <div className="catalog-purchase"><div className="catalog-qty"><motion.button type="button" aria-label={`Diminuir quantidade de ${p.name}`} disabled={v.qty === 1} whileTap={{ scale: .8 }} onClick={() => changeVariant(p.id, 'qty', Math.max(1, v.qty - 1))}><LuMinus/></motion.button><AnimatePresence mode="popLayout" initial={false}><motion.span key={v.qty} aria-label={`Quantidade ${v.qty}`} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .16 }}>{v.qty}</motion.span></AnimatePresence><motion.button type="button" aria-label={`Aumentar quantidade de ${p.name}`} whileTap={{ scale: .8 }} onClick={() => changeVariant(p.id, 'qty', v.qty + 1)}><LuPlus/></motion.button></div><motion.button type="button" className="vb-button vb-button--primary catalog-add" onClick={() => addItem(p)} whileTap={{ scale: .98 }}><LuShoppingBag/><span>ADICIONAR À SACOLA</span><LuArrowRight/></motion.button></div>
            {p.conceptual && <small className="catalog-disclaimer">Imagem ilustrativa. Cor e tamanho serão confirmados no atendimento.</small>}
          </div>
        </motion.article>;
      })}</div>
    </section>)}
    <div className="catalog-end"><span>SEU JEITO DE VESTIR, SUA ESCOLHA.</span><p>Combine modelos e tamanhos livremente. A equipe confirma disponibilidade, frete e pagamento pelo WhatsApp.</p></div>
    <motion.button type="button" className="floating-cart" onClick={openCart} aria-label={`Abrir sacola com ${count} peças, subtotal ${currency(total)}`} whileTap={{ scale: .96 }}><span className="floating-icon"><LuShoppingBag/><AnimatePresence mode="wait" initial={false}><motion.b key={count} initial={reduceMotion ? false : { scale: .55, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 24 }}>{count}</motion.b></AnimatePresence></span><span className="floating-copy">SUA SACOLA <strong>{count ? currency(total) : 'ESCOLHA SUAS PEÇAS'}</strong></span><LuArrowRight className="floating-arrow"/></motion.button>
  </main>;
}
