export interface OriginalCategory {
  id: string | null;
  idParent: string | null;
  name: string | null;
  text: string | null;
  code: string | null;
  description: string | null;
  type: string | null;
  readOnly: boolean | null;
  nature: string | null;
  blocked: string | null;
  status: string | null;
  categoryRule: {
    id: string | null;
    name: string | null;
    key: string | null;
  } | null;
  use: string | null;
  showThirdPartyBalance: boolean | null;
}
