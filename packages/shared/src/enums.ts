// Mirrors of the Prisma enums (apps/api/prisma/schema.prisma).
// The API checks at compile time that they stay identical: apps/api/src/common/shared-enums.check.ts

export const Role = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  DEALER: 'DEALER',
  USER: 'USER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const BodyType = {
  HATCHBACK: 'HATCHBACK',
  SEDAN: 'SEDAN',
  WAGON: 'WAGON',
  SUV: 'SUV',
  COUPE: 'COUPE',
  CONVERTIBLE: 'CONVERTIBLE',
  MPV: 'MPV',
  PICKUP: 'PICKUP',
  VAN: 'VAN',
} as const;
export type BodyType = (typeof BodyType)[keyof typeof BodyType];

export const ModelBadge = {
  NEW_MODEL: 'NEW_MODEL',
  NEW_GENERATION: 'NEW_GENERATION',
  FACELIFT: 'FACELIFT',
} as const;
export type ModelBadge = (typeof ModelBadge)[keyof typeof ModelBadge];

export const FuelType = {
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  LPG: 'LPG',
  CNG: 'CNG',
  HYBRID: 'HYBRID',
  PLUG_IN_HYBRID: 'PLUG_IN_HYBRID',
  ELECTRIC: 'ELECTRIC',
} as const;
export type FuelType = (typeof FuelType)[keyof typeof FuelType];

export const Transmission = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
} as const;
export type Transmission = (typeof Transmission)[keyof typeof Transmission];

export const EmissionClass = {
  EURO_4: 'EURO_4',
  EURO_5: 'EURO_5',
  EURO_6: 'EURO_6',
  EURO_6D: 'EURO_6D',
  EURO_7: 'EURO_7',
} as const;
export type EmissionClass = (typeof EmissionClass)[keyof typeof EmissionClass];
