import { formatGuestName, sanitizeEntryId } from "@/invite/utils";

export type InviteLookupResult = {
  found: boolean;
  name?: string;
  entryId?: string;
};

export const lookupInviteByName = async (
  rawName: string
): Promise<InviteLookupResult> => {
  const formattedName = formatGuestName(rawName);

  if (!formattedName) {
    return { found: false };
  }

  let response: Response;

  try {
    response = await fetch("/api/invite-lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ name: formattedName }),
    });
  } catch {
    throw new Error("INVITE_LOOKUP_UNAVAILABLE");
  }

  const payload = (await response.json().catch(() => null)) as
    | { found?: boolean; name?: string; entryId?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message || "We could not check the guest list right now."
    );
  }

  return {
    found: Boolean(payload?.found),
    name: formatGuestName(payload?.name),
    entryId: sanitizeEntryId(payload?.entryId),
  };
};
