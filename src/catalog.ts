export type Product = { id: string; name: string; family: string; image: string; description: string; colors: string[]; sizes: string[]; price: number; conceptual?: boolean; position?: string };

export const products: Product[] = [
  { id: 'colete-u', name: 'Colete gola U', family: 'COLETES', image: '/assets/colete-u.webp', description: 'Contorno suave, presença marcante. Um essencial que encontra infinitas combinações.', colors: ['Preto', 'Bege', 'Cinza risca de giz'], sizes: ['P', 'M', 'G'], price: 50 },
  { id: 'blusa-u', name: 'Blusa gola U', family: 'BLUSAS', image: '/assets/blusa-u.webp', description: 'Uma nova leitura da alfaiataria para acompanhar seu ritmo com leveza e intenção.', colors: ['Sob consulta'], sizes: ['A confirmar'], price: 45, conceptual: true },
  { id: 'blusa-v', name: 'Blusa gola V', family: 'BLUSAS', image: '/assets/blusa-v.webp', description: 'A mesma liberdade, outro decote. Descubra as possibilidades desta nova linha.', colors: ['Sob consulta'], sizes: ['A confirmar'], price: 45, conceptual: true },
  { id: 'macaquinho', name: 'Macaquinho', family: 'MACAQUINHOS', image: '/assets/macaquinho.webp', description: 'A praticidade que você quer e a elegância que reconhece, em uma só peça.', colors: ['Sob consulta'], sizes: ['A confirmar'], price: 85, conceptual: true },
];

export const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
