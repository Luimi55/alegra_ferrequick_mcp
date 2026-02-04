import type { OriginalAddress } from "./OriginalAddress.ts";

export interface OriginalClient {
  id: string | null;
  name: string | null;
  identification: string | null;
  phonePrimary: string | null;
  phoneSecondary: string | null;
  fax: string | null;
  mobile: string | null;
  email: string | null;
  regime: string | null;
  identificationType: string | null;
  address: OriginalAddress | null;
}
