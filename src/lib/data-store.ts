import { Organization, QRCode, SessionUser } from './types';

const STORAGE_KEYS = {
  USER: 'reviewqr_user',
  ORG: 'reviewqr_org',
  QRS: 'reviewqr_qrcodes',
};

const emptyOrganization: Organization = { id: '', name: '', slug: '' };

function getUserScopedKey(key: string): string {
  if (typeof window === 'undefined') return key;
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const userId = storedUser ? (JSON.parse(storedUser) as SessionUser).id : null;
    return userId ? `${key}:${userId}` : `${key}:anonymous`;
  } catch {
    return `${key}:anonymous`;
  }
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to read the cached account display details:', error);
    return null;
  }
}

export function setStoredUser(user: SessionUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function getStoredOrg(): Organization {
  if (typeof window === 'undefined') return emptyOrganization;
  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEYS.ORG));
    return data ? JSON.parse(data) : emptyOrganization;
  } catch (error) {
    console.error('Failed to read browser-local business display details:', error);
    return emptyOrganization;
  }
}

export function setStoredOrg(org: Partial<Organization>): Organization {
  if (typeof window === 'undefined') return { ...emptyOrganization, ...org };
  const current = getStoredOrg();
  const updated = { ...current, ...org, updatedAt: new Date().toISOString() };
  localStorage.setItem(getUserScopedKey(STORAGE_KEYS.ORG), JSON.stringify(updated));
  return updated;
}

export function saveOrgLogo(logoUrl: string, logoPath?: string): Organization {
  return setStoredOrg({ logoUrl, logoPath });
}

export function saveOrgThumbnail(thumbnailUrl: string, thumbnailPath?: string): Organization {
  return setStoredOrg({ thumbnailUrl, thumbnailPath });
}

export function getStoredQRCodes(): QRCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEYS.QRS));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read browser-local QR design data:', error);
    return [];
  }
}

export function saveQRCode(qr: Omit<QRCode, 'id'> & { id?: string }): QRCode {
  const pName = qr.placementName || qr.placementType;
  if (typeof window === 'undefined') {
    const newQR: QRCode = {
      ...qr,
      ...(pName ? { placementName: pName } : {}),
      ...(qr.placementType || pName ? { placementType: qr.placementType || pName } : {}),
      id: qr.id || `qr_${Date.now()}`,
      createdAt: qr.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newQR;
  }
  const qrs = getStoredQRCodes();
  const id = qr.id || `qr_${Date.now()}`;
  const now = new Date().toISOString();
  const existingIdx = qrs.findIndex((item) => item.id === id);

  let result: QRCode;
  if (existingIdx >= 0) {
    result = {
      ...qrs[existingIdx],
      ...qr,
      ...(pName ? { placementName: pName } : {}),
      id,
      updatedAt: now,
    };
    qrs[existingIdx] = result;
  } else {
    result = {
      ...qr,
      ...(pName ? { placementName: pName } : {}),
      id,
      createdAt: qr.createdAt || now,
      updatedAt: now,
    };
    qrs.unshift(result);
  }
  localStorage.setItem(getUserScopedKey(STORAGE_KEYS.QRS), JSON.stringify(qrs));
  return result;
}

export function deleteQRCode(id: string): boolean {
  if (typeof window === 'undefined') return true;
  const qrs = getStoredQRCodes();
  const filtered = qrs.filter((q) => q.id !== id);
  localStorage.setItem(getUserScopedKey(STORAGE_KEYS.QRS), JSON.stringify(filtered));
  return true;
}
