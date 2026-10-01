import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Distância de leitura por card, prévia do próximo e escala da pilha.
const SCROLL_PER_CARD = 1.15;
const PREVIEW_GAP = 14;
const NEXT_SCALE = 0.965;

export function useCollectionStack(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const section = document.querySelector<HTMLElement>('.family-showcase');
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('.family-panel'));
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      section.classList.add('stack-ready');
      const stories = cards.map(card => card.querySelector<HTMLElement>('.family-story')!);
      const labels = cards.map(card => card.querySelector<HTMLElement>('.family-photo span')!);
      cards.forEach((card, index) => {
        gsap.set(card, { yPercent: index ? 100 : 0, y: index ? PREVIEW_GAP + (index - 1) * 24 : 0, scale: index ? NEXT_SCALE - (index - 1) * .025 : 1, zIndex: index + 1, transformOrigin: 'center top' });
        gsap.set([stories[index], labels[index]], { opacity: index ? 0 : 1, y: index ? 14 : 0 });
      });
      const timeline = gsap.timeline({ scrollTrigger: {
        id: 'collection-stack', trigger: section, start: 'top top',
        end: () => `+=${window.innerHeight * cards.length * SCROLL_PER_CARD}`,
        pin: true, pinSpacing: true, scrub: true, invalidateOnRefresh: true,
        onUpdate: self => {
          const active = Math.min(cards.length - 1, Math.floor(((self.animation?.time() ?? 0) + .15) / 1.5));
          cards.forEach((card, index) => {
            card.inert = index !== active;
            card.setAttribute('aria-hidden', String(index !== active));
          });
        },
      }});
      // Cada card recebe um trecho de leitura antes da troca.
      cards.forEach((_, index) => {
        const start = index * 1.5;
        timeline.to({}, { duration: .7 }, start);
        if (index === cards.length - 1) return;
        timeline.to([stories[index], labels[index]], { opacity: 0, y: -14, duration: .25, ease: 'power1.inOut' }, start + .7);
        // Os anteriores permanecem atrás: cada nova peça forma outra camada.
        cards.slice(0, index + 1).forEach((previous, previousIndex) => {
          const depth = index + 1 - previousIndex;
          timeline.to(previous, { yPercent: 0, y: -14 * depth, scale: 1 - .035 * depth, duration: .8, ease: 'power1.inOut' }, start + .7);
        });
        timeline.to(cards[index + 1], { yPercent: 0, y: 0, scale: 1, duration: .8, ease: 'power1.inOut' }, start + .7);
        timeline.to([stories[index + 1], labels[index + 1]], { opacity: 1, y: 0, duration: .35, ease: 'power1.out' }, start + 1.15);
        if (cards[index + 2]) timeline.to(cards[index + 2], { yPercent: 100, y: PREVIEW_GAP, scale: NEXT_SCALE, duration: .8, ease: 'power1.inOut' }, start + .7);
      });
      const images = Array.from(section.querySelectorAll('img'));
      const refresh = () => ScrollTrigger.refresh();
      images.forEach(image => { if (!image.complete) image.addEventListener('load', refresh, { once: true }); });
      cards.forEach((card, index) => { card.inert = index !== 0; card.setAttribute('aria-hidden', String(index !== 0)); });
      return () => {
        images.forEach(image => image.removeEventListener('load', refresh));
        section.classList.remove('stack-ready');
        cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
      };
    });
    return () => media.revert();
  }, [enabled]);
}
