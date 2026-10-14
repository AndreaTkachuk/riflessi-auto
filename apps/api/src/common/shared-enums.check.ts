// Compile-time only: fails `nest build` if the enums in @riflessi/shared
// drift from the Prisma schema. Emits no runtime code.
import type * as Shared from '@riflessi/shared';
import type * as Db from '../generated/prisma/client.js';

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

export type SharedEnumsMatchPrisma = [
  Assert<Equals<Shared.Role, Db.Role>>,
  Assert<Equals<Shared.BodyType, Db.BodyType>>,
  Assert<Equals<Shared.ModelBadge, Db.ModelBadge>>,
  Assert<Equals<Shared.FuelType, Db.FuelType>>,
  Assert<Equals<Shared.Transmission, Db.Transmission>>,
  Assert<Equals<Shared.EmissionClass, Db.EmissionClass>>,
];
