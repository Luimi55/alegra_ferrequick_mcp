import type{ SimplifiedAddress } from "./SimplifiedAddress.ts";

export interface SimplifiedClient {
  id: string | null;
  name: string | null;
  identification: string | null;
  phonePrimary: string | null;
  phoneSecondary: string | null;
  mobile: string | null;
  email: string | null;
  identificationType: string | null;
  address: SimplifiedAddress | null;
}
