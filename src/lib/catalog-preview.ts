export type PreviewRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  zone: string;
  category: 'Andina' | 'Cafetería' | 'Pollo' | 'Chifa' | 'Mercado';
  visual: string;
  sourceKind: 'reference';
};

// Referencias de investigación de mercado de Puno. No son comercios afiliados,
// no exponen contacto y nunca deben publicarse como disponibles sin validación.
export const previewRestaurants: PreviewRestaurant[] = [
  { id: 'mojsa', name: 'Mojsa Restaurante', cuisine: 'Novoandina / peruana', zone: 'Centro / Plaza de Armas', category: 'Andina', visual: '⛰️', sourceKind: 'reference' },
  { id: 'casona', name: 'La Casona Restaurant', cuisine: 'Parrilla / pizzería / andina', zone: 'Centro / Plaza de Armas', category: 'Andina', visual: '🔥', sourceKind: 'reference' },
  { id: 'corregidor', name: 'Café Bar Casa del Corregidor', cuisine: 'Café / carta ligera', zone: 'Centro / Plaza de Armas', category: 'Cafetería', visual: '☕', sourceKind: 'reference' },
  { id: 'loving-hut', name: 'Loving Hut Puno', cuisine: 'Cocina vegana', zone: 'Centro / Plaza de Armas', category: 'Andina', visual: '🌿', sourceKind: 'reference' },
  { id: 'rancho', name: 'Pollería El Rancho', cuisine: 'Pollo a la brasa', zone: 'Centro / Plaza de Armas', category: 'Pollo', visual: '🍗', sourceKind: 'reference' },
  { id: 'plaza-oriental', name: 'Plaza Oriental Restaurant', cuisine: 'Chifa', zone: 'Centro / Plaza de Armas', category: 'Chifa', visual: '🥢', sourceKind: 'reference' },
  { id: 'mercado-central', name: 'Mercado Central de Puno', cuisine: 'Desayunos, caldos y jugos', zone: 'Mercado Central / Jr. Oquendo', category: 'Mercado', visual: '🥣', sourceKind: 'reference' },
  { id: 'bellavista', name: 'Mercado Bellavista', cuisine: 'Comida popular y jugos', zone: 'Barrio Bellavista', category: 'Mercado', visual: '🍊', sourceKind: 'reference' },
];

export const previewCategories = ['Todos', 'Andina', 'Cafetería', 'Pollo', 'Chifa', 'Mercado'] as const;
