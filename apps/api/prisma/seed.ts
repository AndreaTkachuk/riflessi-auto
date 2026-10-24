// Catalog reference data. Run with: pnpm prisma db seed
// Idempotent: brands are matched by slug, so it can be run again at any time
// (also against Neon: DATABASE_URL='<direct url>' pnpm prisma db seed).
// For existing brands it updates name and country; logoUrl and models are never touched.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { slugify } from '@riflessi/shared';
import { PrismaClient } from '../src/generated/prisma/client.js';

// country: Italian name of the brand's home country; null when not verified.
const BRANDS: { name: string; country: string | null }[] = [
  { name: 'Abarth', country: 'Italia' },
  { name: 'Alba', country: null },
  { name: 'Alfa Romeo', country: 'Italia' },
  { name: 'Alpine', country: 'Francia' },
  { name: 'Aston Martin', country: 'Regno Unito' },
  { name: 'Audi', country: 'Germania' },
  { name: 'Bentley', country: 'Regno Unito' },
  { name: 'Bestune', country: 'Cina' },
  { name: 'BMW', country: 'Germania' },
  { name: 'BYD', country: 'Cina' },
  { name: 'Cadillac', country: 'Stati Uniti' },
  { name: 'Caterham', country: 'Regno Unito' },
  { name: 'Changan', country: 'Cina' },
  { name: 'Chery', country: 'Cina' },
  { name: 'Chevrolet', country: 'Stati Uniti' },
  { name: 'Chrysler', country: 'Stati Uniti' },
  { name: 'Cirelli', country: 'Italia' },
  { name: 'Citroën', country: 'Francia' },
  { name: 'Cupra', country: 'Spagna' },
  { name: 'Dacia', country: 'Romania' },
  { name: 'Dallara', country: 'Italia' },
  { name: 'Denza', country: 'Cina' },
  { name: 'DFSK', country: 'Cina' },
  { name: 'Dodge', country: 'Stati Uniti' },
  { name: 'Dongfeng', country: 'Cina' },
  { name: 'DR', country: 'Italia' },
  { name: 'DS', country: 'Francia' },
  { name: 'EMC', country: null },
  { name: 'EVO', country: 'Italia' },
  { name: 'Ferrari', country: 'Italia' },
  { name: 'Fiat', country: 'Italia' },
  { name: 'Ford', country: 'Stati Uniti' },
  { name: 'Geely', country: 'Cina' },
  { name: 'Genesis', country: 'Corea del Sud' },
  { name: 'GMC', country: 'Stati Uniti' },
  { name: 'GWM', country: 'Cina' },
  { name: 'Honda', country: 'Giappone' },
  { name: 'Hongqi', country: 'Cina' },
  { name: 'Hyundai', country: 'Corea del Sud' },
  { name: 'ICH-X', country: null },
  { name: 'Ineos', country: 'Regno Unito' },
  { name: 'Jaecoo', country: 'Cina' },
  { name: 'Jeep', country: 'Stati Uniti' },
  { name: 'KGM', country: 'Corea del Sud' },
  { name: 'Kia', country: 'Corea del Sud' },
  { name: 'KTM', country: 'Austria' },
  { name: 'Lamborghini', country: 'Italia' },
  { name: 'Lancia', country: 'Italia' },
  { name: 'Land Rover', country: 'Regno Unito' },
  { name: 'Leapmotor', country: 'Cina' },
  { name: 'Lepas', country: 'Cina' },
  { name: 'Lexus', country: 'Giappone' },
  { name: 'Lotus', country: 'Regno Unito' },
  { name: 'Lynk & Co', country: 'Cina' },
  { name: 'Maserati', country: 'Italia' },
  { name: 'Mazda', country: 'Giappone' },
  { name: 'McLaren', country: 'Regno Unito' },
  { name: 'Mercedes-Benz', country: 'Germania' },
  { name: 'MG', country: 'Cina' },
  { name: 'M-Hero', country: 'Cina' },
  { name: 'Militem', country: 'Italia' },
  { name: 'Mini', country: 'Regno Unito' },
  { name: 'Mitsubishi', country: 'Giappone' },
  { name: 'Morgan', country: 'Regno Unito' },
  { name: 'Nissan', country: 'Giappone' },
  { name: 'Omoda', country: 'Cina' },
  { name: 'Opel', country: 'Germania' },
  { name: 'Peugeot', country: 'Francia' },
  { name: 'Polestar', country: 'Svezia' },
  { name: 'Porsche', country: 'Germania' },
  { name: 'Renault', country: 'Francia' },
  { name: 'Rolls-Royce', country: 'Regno Unito' },
  { name: 'SEAT', country: 'Spagna' },
  { name: 'Škoda', country: 'Repubblica Ceca' },
  { name: 'Smart', country: 'Germania' },
  { name: 'Sportequipe', country: 'Italia' },
  { name: 'Subaru', country: 'Giappone' },
  { name: 'Suzuki', country: 'Giappone' },
  { name: 'SWM', country: 'Italia' },
  { name: 'Tesla', country: 'Stati Uniti' },
  { name: 'Tiger', country: null },
  { name: 'Toyota', country: 'Giappone' },
  { name: 'Volkswagen', country: 'Germania' },
  { name: 'Volvo', country: 'Svezia' },
  { name: 'Voyah', country: 'Cina' },
  { name: 'Xpeng', country: 'Cina' },
  { name: 'Zeekr', country: 'Cina' },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const before = await prisma.brand.count();
    for (const { name, country } of BRANDS) {
      const slug = slugify(name);
      await prisma.brand.upsert({
        where: { slug },
        create: { name, slug, country },
        update: { name, country },
      });
    }
    const after = await prisma.brand.count();
    console.log(
      `Brands: ${BRANDS.length} in seed, ${after - before} created, ${after} total.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
