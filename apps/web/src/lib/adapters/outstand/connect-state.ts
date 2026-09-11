/**
 * Decode `state` OAuth loopback (T-013.1/T-013.2, T-015.3, ADR-105) — dipakai
 * Route Handler `/api/integrations/outstand/callback` dan Server Action
 * inisiasi (`initiateConnectAccountAction`/`initiateReconnectAccountAction`)
 * untuk membaca `redirectAccountId` (keputusan CREATE vs UPDATE
 * `ConnectedAccount`) dan `nonce` (CSRF-check, dicocokkan dengan cookie yang
 * diset saat inisiasi).
 *
 * **Keputusan desain (Prabowo, giliran T-015.3/T-013.1/2 — lihat ADR-105
 * poin 2 "Referensi"):** kontrak `ExchangeConnectCodeInput`/
 * `ConnectedAccountData` di `packages/shared` SENGAJA tidak diubah (kontrak
 * final ADR-105) — `ConnectedAccountData` tidak membawa `redirectAccountId`.
 * ADR-105 poin 2 sendiri menyatakan `WorkspaceService` yang MEMUTUSKAN
 * create/update dari `redirectAccountId` yang "dibawa lewat state", TAPI
 * tidak berarti `WorkspaceService` (Application Service, domain layer) yang
 * MENDEKODE string opaque `state` itu sendiri — bentuk wire `state` adalah
 * detail implementasi adapter (ACL boundary, AGENTS.md #6: domain tidak
 * boleh bergantung pada detail HTTP/adapter Outstand). Decode karena itu
 * dilakukan di layer infra/entry point (modul ini, dipakai Route Handler +
 * Server Action) — hasilnya (`redirectAccountId`) baru diteruskan sebagai
 * parameter EKSPLISIT ke `WorkspaceService.initiateConnectAccount`/
 * `completeAccountConnection`, yang sendiri tidak mengimpor apa pun dari
 * `lib/adapters/outstand`.
 *
 * **Terikat ke format Fake** — struktur JSON di sini SENGAJA sama persis
 * dengan `FakeConnectState`/`encodeFakeState` privat di
 * `fake-outstand-adapter.ts` (duplikasi kecil, bukan re-export, supaya file
 * itu — kontrak yang sudah ditetapkan ADR-105 — tidak perlu diubah sama
 * sekali). Real adapter (T-025) kemungkinan besar memakai skema `state`
 * yang sepenuhnya berbeda (ADR-105 poin 4: "Real adapter boleh memilih
 * pendekatan berbeda") — modul ini WAJIB direvisit saat itu terjadi, bukan
 * diasumsikan permanen lintas adapter.
 */
export interface DecodedConnectAccountState {
  redirectAccountId?: string;
  nonce: string;
}

export function decodeConnectAccountState(
  state: string,
): DecodedConnectAccountState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    throw new Error(
      "OutstandAdapter connect state tidak valid/rusak (loopback callback).",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { nonce?: unknown }).nonce !== "string"
  ) {
    throw new Error(
      "OutstandAdapter connect state tidak lengkap (loopback callback).",
    );
  }

  const { nonce, redirectAccountId } = parsed as {
    nonce: string;
    redirectAccountId?: unknown;
  };

  return {
    nonce,
    redirectAccountId:
      typeof redirectAccountId === "string" && redirectAccountId.length > 0
        ? redirectAccountId
        : undefined,
  };
}
