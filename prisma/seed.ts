import 'dotenv/config';
import { PrismaClient, RestaurantStatus } from '@prisma/client';

const prisma = new PrismaClient();

const references = [
  { slug: 'mojsa-restaurante', name: 'Mojsa Restaurante', cuisine: 'Novoandina / peruana', zone: 'Centro / Plaza de Armas' },
  { slug: 'la-casona-restaurant', name: 'La Casona Restaurant', cuisine: 'Parrilla / pizzería / andina', zone: 'Centro / Plaza de Armas' },
  { slug: 'cafe-bar-casa-del-corregidor', name: 'Café Bar Casa del Corregidor', cuisine: 'Café / carta ligera', zone: 'Centro / Plaza de Armas' },
  { slug: 'loving-hut-puno', name: 'Loving Hut Puno', cuisine: 'Cocina vegana', zone: 'Centro / Plaza de Armas' },
  { slug: 'polleria-el-rancho', name: 'Pollería El Rancho', cuisine: 'Pollo a la brasa', zone: 'Centro / Plaza de Armas' },
  { slug: 'plaza-oriental-restaurant', name: 'Plaza Oriental Restaurant', cuisine: 'Chifa', zone: 'Centro / Plaza de Armas' },
  { slug: 'mercado-central-de-puno', name: 'Mercado Central de Puno', cuisine: 'Desayunos, caldos y jugos', zone: 'Mercado Central / Jr. Oquendo' },
  { slug: 'mercado-bellavista', name: 'Mercado Bellavista', cuisine: 'Comida popular y jugos', zone: 'Barrio Bellavista' },
];

async function main() {
  for (const reference of references) {
    await prisma.restaurant.upsert({
      where: { slug: reference.slug },
      create: { ...reference, status: RestaurantStatus.REFERENCE, sourceLabel: 'Padrón de referencia de mercado de Puno' },
      update: { cuisine: reference.cuisine, zone: reference.zone },
    });
  }
}

main()
  .finally(async () => prisma.$disconnect());
