# Security Policy

## Supported Versions

AnimeSenpai is continuously deployed from the `main` branch to [animesenpai.online](https://www.animesenpai.online). Security fixes are applied directly to the latest production release.

| Version / Branch | Supported |
| ---------------- | --------- |
| `main` (Production — `animesenpai.online`) | Yes |
| Older commits / archived branches | No |

---

## Reporting a Vulnerability

We take security and user privacy seriously. **Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, report vulnerabilities privately through one of these channels:

1. **GitHub Private Vulnerability Reporting (Preferred):**  
   Use the **"Report a vulnerability"** button in the [Security tab](https://github.com/PurohitBhagyesh/anime-watch-recommendation/security) of this repository.
2. **Direct Security Email:**  
   Send details to **security@animesenpai.online** (or backup contact listed in `/.well-known/security.txt`).

### What to Include

- A clear description of the vulnerability and potential impact
- Step-by-step reproduction instructions or proof-of-concept
- Affected URLs, components, or files
- Any suggested mitigation or patch (optional)

### Response Timeline

- **Acknowledgment:** Within **48 hours** of receiving your report
- **Triage & Assessment:** Within **5 business days**
- **Fix & Coordinated Disclosure:** Critical and high-severity issues are prioritized for immediate patching; we will coordinate disclosure timing with you once the fix is deployed.

---

## Security & Privacy Architecture

- **No Video Hosting or Untrusted Media Proxies:** Trailers load exclusively through YouTube's official privacy-enhanced player (`youtube-nocookie.com`).
- **Public Read-Only Catalog API:** Anime metadata is fetched live from the official AniList GraphQL API (`https://graphql.anilist.co`).
- **Zero Secret Leakage:** CI runs automated secret and credential leak detection on every push and pull request (`.github/workflows/ci.yml`) alongside GitGuardian scanning.
- **User Data Ownership & Deletion:** Watchlists are stored locally in browser `localStorage` by default. Optional Firebase accounts support full self-service permanent deletion (Firebase Auth + Firestore profile + local browser storage) directly from `/settings`.
- **RFC 9116 Discovery:** Security contact metadata is published at `https://www.animesenpai.online/.well-known/security.txt`.

---

## Scope & Safe Harbor

In-scope targets:
- `https://www.animesenpai.online`
- Source code in `frontend/` and `backend/` of this repository

Out-of-scope targets:
- Third-party infrastructure (AniList, YouTube, Firebase/Google Cloud, Vercel, Cloudflare)
- Denial-of-service (DoS/DDoS), spam, or social engineering

Good-faith security research following this policy will not result in legal action. Thank you for helping keep AnimeSenpai safe for the anime community.
