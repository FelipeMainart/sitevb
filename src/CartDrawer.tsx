import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuArrowLeft, LuArrowRight, LuCheck, LuMapPin, LuMinus, LuPlus, LuShoppingBag, LuTrash2, LuUserRound, LuX } from 'react-icons/lu';
import { currency, products } from './catalog';

export type CartLine = { id: string; color: string; size: string; quantity: number };
export type OrderDetails = { nome: string; telefone: string; cpf: string; cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
const formatCpf = (value: string) => value.replace(/\D/g, '').slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
const validCpf = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (size: number) => { const sum = Array.from({ length: size }, (_, i) => Number(digits[i]) * (size + 1 - i)).reduce((a, b) => a + b, 0); return (sum * 10) % 11 % 10; };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
};
type Props = {
  cart: CartLine[];
  count: number;
  total: number;
  onClose: () => void;
  onAdjust: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onSubmit: (details: OrderDetails) => void;
};

export default function CartDrawer({ cart, count, total, onClose, onAdjust, onRemove, onSubmit }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<OrderDetails>({ nome: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });
  const stageRef = useRef<HTMLDivElement>(null);
  const goTo = (next: 1 | 2 | 3) => {
    if (next > 1 && count < 6) return;
    setStep(next);
    stageRef.current?.scrollTo({ top: 0 });
  };
  const review = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDetails(Object.fromEntries(Object.keys(details).map(key => [key, String(data.get(key) ?? '').trim()])) as OrderDetails);
    goTo(3);
  };
  useEffect(() => { if (count < 6 && step > 1) setStep(1); }, [count, step]);
  useEffect(() => { if (step > 1) sheetRef.current?.querySelector<HTMLElement>('.order-stage h3[tabindex="-1"]')?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !sheetRef.current) return;
      const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [onClose]);

  return <>
    <motion.div className="order-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}/>
    <motion.aside ref={sheetRef} className="order-sheet" role="dialog" aria-modal="true" aria-labelledby="order-title" initial={reduceMotion ? false : { x: '100%' }} animate={{ x: 0 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={{ type: 'spring', stiffness: 250, damping: 31 }}>
      <header className="order-header">
        <div className="order-heading"><img className="order-brand-mark" src="/assets/vb-mark.png" alt="Veste Bem"/><div><span className="order-kicker">VESTE BEM / SEU PEDIDO</span><h2 id="order-title">Sua sacola<span>.</span></h2></div></div>
        <button ref={closeRef} type="button" className="order-close" onClick={onClose} aria-label="Fechar sacola"><LuX aria-hidden="true"/></button>
      </header>
      <nav className="order-steps" aria-label="Etapas do pedido">{(['Suas peças', 'Seus dados', 'Revisar pedido'] as const).map((label, index) => { const number = (index + 1) as 1 | 2 | 3; return <div className="order-step-wrap" key={label}>{index > 0 && <i aria-hidden="true"/>}<button type="button" className={step === number ? 'current' : number < step ? 'complete' : ''} onClick={() => number < step && goTo(number)} disabled={number >= step} aria-current={step === number ? 'step' : undefined}><b>{String(number).padStart(2, '0')}</b><span>{label}</span></button></div>; })}</nav>
      {cart.length === 0 ? <div className="order-empty"><div className="order-empty-image"><img src="/assets/colete-u.webp" alt="Colete de alfaiataria Veste Bem"/></div><div className="order-empty-copy"><span className="order-kicker">UMA COLEÇÃO PARA ESCOLHER</span><h3>Seu próximo look<br/><em>começa aqui.</em></h3><p>Sua sacola está vazia. Explore os modelos e combine pelo menos seis peças como preferir.</p><button type="button" className="order-primary" onClick={onClose}>CONTINUAR EXPLORANDO <LuArrowRight aria-hidden="true"/></button></div></div> :
        <div className="order-stage" ref={stageRef}>
        {step === 1 && <div className="order-layout order-layout--pieces">
          <section className="order-cart-panel" aria-labelledby="cart-panel-title">
            <div className="order-section-heading"><span className="order-kicker">01 / ESCOLHA DAS PEÇAS</span><div><h3 id="cart-panel-title" tabIndex={-1}>Sua seleção</h3><span className="order-item-count">{count} {count === 1 ? 'PEÇA' : 'PEÇAS'}</span></div><p>Revise modelos, variantes e quantidades antes de continuar.</p></div>
            <div className="order-items">{cart.map((line, index) => { const product = products.find(item => item.id === line.id)!; return <motion.article layout="position" className="order-item" key={`${line.id}-${line.color}-${line.size}`}><img src={product.image} alt=""/><div className="order-item-content"><div className="order-item-top"><div><span>{product.family}</span><h4>{product.name}</h4></div><button type="button" className="order-remove" onClick={() => onRemove(index)} aria-label={`Remover ${product.name} da sacola`} title="Remover peça"><LuTrash2 aria-hidden="true"/></button></div><p>{line.color} <span aria-hidden="true">·</span> {line.size}</p><div className="order-item-bottom"><div className="order-counter"><button type="button" onClick={() => onAdjust(index, -1)} aria-label={`Diminuir quantidade de ${product.name}`}><LuMinus aria-hidden="true"/></button><span aria-label={`Quantidade ${line.quantity}`}>{line.quantity}</span><button type="button" onClick={() => onAdjust(index, 1)} aria-label={`Aumentar quantidade de ${product.name}`}><LuPlus aria-hidden="true"/></button></div><strong>{currency(product.price * line.quantity)}</strong></div></div></motion.article>; })}</div>
          </section>
          <aside className="order-next-panel" aria-label="Resumo da sacola"><span className="order-kicker">SEU PEDIDO</span><h3>Do seu jeito,<br/><em>peça por peça.</em></h3><p>Combine modelos, cores e tamanhos livremente. São seis peças para começar.</p><div className="order-summary"><div className="order-minimum-title"><span>{count >= 6 ? <LuCheck aria-hidden="true"/> : <LuShoppingBag aria-hidden="true"/>} Pedido mínimo</span><strong>{count} / 6</strong></div><div className="order-progress" role="progressbar" aria-label="Progresso do pedido mínimo" aria-valuemin={0} aria-valuemax={6} aria-valuenow={Math.min(count, 6)}>{Array.from({ length: 6 }, (_, i) => <span key={i} className={i < count ? 'filled' : ''}/>)}</div><p>{count < 6 ? `Faltam ${6 - count} ${6 - count === 1 ? 'peça' : 'peças'} para continuar.` : 'Quantidade mínima atingida. Sua seleção está pronta.'}</p><div className="order-total"><span>Subtotal das peças</span><strong>{currency(total)}</strong></div><small>Frete e pagamento serão combinados no WhatsApp.</small></div><button className="order-primary order-submit" type="button" disabled={count < 6} onClick={() => goTo(2)}><span>CONTINUAR PARA SEUS DADOS</span><LuArrowRight aria-hidden="true"/></button></aside>
        </div>}
        {step === 2 && <section className="order-form-panel order-form-panel--step" aria-labelledby="form-panel-title"><div className="order-form-inner"><div className="order-section-heading"><span className="order-kicker">02 / DADOS PARA ENTREGA</span><h3 id="form-panel-title" tabIndex={-1}>Para onde vamos enviar?</h3><p>Preencha seus dados para preparar o pedido. Você poderá conferir tudo antes de enviar.</p></div>
            <form className="order-details-form" onSubmit={review}>
              <div className="order-field-group"><div className="order-group-title"><LuUserRound aria-hidden="true"/><span>Dados pessoais</span></div><div className="order-field-grid"><label className="order-field">Nome completo<input name="nome" defaultValue={details.nome} autoComplete="name" required placeholder="Seu nome completo"/></label><label className="order-field">Telefone com DDD<input name="telefone" defaultValue={details.telefone} type="tel" autoComplete="tel" inputMode="tel" required placeholder="(62) 99999-9999"/></label><label className="order-field order-field--cpf">CPF<input name="cpf" defaultValue={details.cpf} type="text" autoComplete="off" inputMode="numeric" minLength={14} maxLength={14} required placeholder="000.000.000-00" onChange={event => { const input = event.currentTarget; input.value = formatCpf(input.value); input.setCustomValidity(input.value.length === 14 && !validCpf(input.value) ? "CPF inválido" : ""); }}/></label></div></div>
              <div className="order-field-group"><div className="order-group-title"><LuMapPin aria-hidden="true"/><span>Endereço de entrega</span></div><div className="order-field-grid"><label className="order-field order-field--small order-field--zip">CEP<input name="cep" defaultValue={details.cep} autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" title="Informe 8 números, com ou sem hífen" required placeholder="00000-000"/></label><label className="order-field order-field--wide order-field--street">Rua / avenida<input name="rua" defaultValue={details.rua} autoComplete="address-line1" required placeholder="Nome da rua ou avenida"/></label><label className="order-field order-field--small order-field--number">Número<input name="numero" defaultValue={details.numero} autoComplete="address-line2" required placeholder="Nº"/></label><label className="order-field order-field--wide order-field--complement"><span>Complemento <small>OPCIONAL</small></span><input name="complemento" defaultValue={details.complemento} placeholder="Apartamento, bloco, referência..."/></label><label className="order-field order-field--bairro">Bairro<input name="bairro" defaultValue={details.bairro} required placeholder="Seu bairro"/></label><label className="order-field order-field--city">Cidade<input name="cidade" defaultValue={details.cidade} autoComplete="address-level2" required placeholder="Cidade"/></label><label className="order-field order-field--uf">UF<input name="uf" defaultValue={details.uf} autoComplete="address-level1" maxLength={2} minLength={2} required placeholder="GO"/></label></div></div>
              <div className="order-step-actions"><button className="order-back" type="button" onClick={() => goTo(1)}><LuArrowLeft aria-hidden="true"/> VOLTAR ÀS PEÇAS</button><button className="order-primary" type="submit"><span>REVISAR PEDIDO</span><LuArrowRight aria-hidden="true"/></button></div>
            </form>
          </div></section>}
          {step === 3 && <div className="order-review" aria-labelledby="review-title"><div className="order-review-heading"><span className="order-kicker">03 / ANTES DE ENVIAR</span><h3 id="review-title" tabIndex={-1}>Tudo certo com o seu pedido?</h3><p>Confira as peças e o endereço. Você pode voltar e alterar qualquer detalhe.</p></div><div className="order-review-grid"><section className="order-review-card" aria-labelledby="review-pieces-title"><div className="order-review-card-head"><h4 id="review-pieces-title">Suas peças <span>({count})</span></h4><button type="button" onClick={() => goTo(1)}>EDITAR</button></div><div className="order-review-lines">{cart.map(line => { const product = products.find(item => item.id === line.id)!; return <div className="order-review-line" key={`${line.id}-${line.color}-${line.size}`}><img src={product.image} alt=""/><div><strong>{product.name}</strong><small>{line.color} · {line.size} · {line.quantity} {line.quantity === 1 ? 'peça' : 'peças'}</small></div><span>{currency(product.price * line.quantity)}</span></div>; })}</div><div className="order-review-total"><span>Subtotal das peças</span><strong>{currency(total)}</strong></div></section><section className="order-review-card" aria-labelledby="review-details-title"><div className="order-review-card-head"><h4 id="review-details-title">Seus dados e entrega</h4><button type="button" onClick={() => goTo(2)}>EDITAR</button></div><div className="order-review-detail"><LuUserRound aria-hidden="true"/><div><span>DADOS PESSOAIS</span><strong>{details.nome}</strong><p>{details.telefone}<br/>CPF {details.cpf}</p></div></div><div className="order-review-detail"><LuMapPin aria-hidden="true"/><div><span>ENDEREÇO DE ENTREGA</span><strong>{details.rua}, {details.numero}{details.complemento ? `, ${details.complemento}` : ''}</strong><p>{details.bairro} · {details.cidade}/{details.uf}<br/>CEP {details.cep}</p></div></div></section></div><div className="order-review-footer"><div className="order-next-note"><FaWhatsapp aria-hidden="true"/><span>A equipe confirma disponibilidade, frete e pagamento na conversa.</span></div><div className="order-step-actions"><button className="order-back" type="button" onClick={() => goTo(2)}><LuArrowLeft aria-hidden="true"/> VOLTAR AOS DADOS</button><button className="order-primary" type="button" onClick={() => onSubmit(details)}><span>ENVIAR PEDIDO PELO WHATSAPP</span><LuArrowRight aria-hidden="true"/></button></div></div></div>}
        </div>}
    </motion.aside>
  </>;
}
