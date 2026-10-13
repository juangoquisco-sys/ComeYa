import { z } from 'zod';

export const restaurantApplicationSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  cuisine: z.string().trim().min(2).max(100),
  zone: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(180),
  applicantRole: z.enum(['Propietario(a)', 'Representante legal', 'Administrador(a) autorizado(a)']),
});
