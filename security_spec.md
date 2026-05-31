# Security Specification: SPMB SDN 4 Kronggen Firestore Rules

This document outlines the visual application data invariants, the threat modeling payloads, and the verified security layout.

## 1. Data Invariants
- **Student**: Any guest can register as a student. All new registrations MUST start with the "Pending" status and cannot be modified by other unauthenticated users. Only authenticated administrators (panitia) can reject, verify, or change a student's status.
- **Kegiatan & Logos**: Only authenticated staff can modify custom logos or upload new school kegiatan documentations.

## 2. Threat Modeling: The "Dirty Dozen" (Audit Scenarios)
1. **Unauthenticated Status Escalation**: A malicious guest registers and manually sets their status to "Diterima" instead of "Pending".
2. **Identity Theft / Shadow Field Injection**: Injecting extra system properties (e.g. `isAdmin: true` or `role: 'editor'`) inside a collection document.
3. **Missing or Improper ID Format**: Storing documents with massive character ID values containing special paths (`../`) to poisoning databases.
4. **Invalid Enum Poisoning**: Setting gender (`jenisKelamin`) to any string other than 'L' or 'P'.
5. **Path Manipulation on Registration**: Forcing status updates on student registrations without proper staff Google Drive session auth.
6. **Malicious Kegiatan Injection**: Direct write payload attempting to publish unverified kegiatan posts without authentication context.
7. **Logo Hijacking**: Unauthorized overwriting of default custom sdn or dinas logos by anonymous guests.
8. **Malicious Document Deletion**: Attempt by an unauthenticated guest to delete another registered candidate by triggering standard document deletion over the SDK.
9. **No-Size-Check Attack**: Sending infinite length text payloads within text inputs leading to denial of wallet cost explosions.
10. **Malicious Batch Updates**: Issuing batched writes on students with missing schema attributes.
11. **Spoofed Admin Session**: Client claims or state bypass in application rules.
12. **Out of Range Attributes**: Supplying impossible school distances with invalid formats (e.g., non-string ID).

## 3. Test Cases Configuration (`firestore.rules.test.ts`)
The `firestore.rules` are configured to prevent all draft scenarios by checking:
- **`request.auth != null`** on all modifications of status and configs.
- **Keys and values validation**, checking precise type and string size.
- **`isValidId`** string patterns checking.
