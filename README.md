# ⚡ MedMemory AI

> An open-source, AI-native clinical intelligence engine. Track, parse, and map longitudinal patient medical history locally.

---

## 📚 Central Documentation Portal
For enterprise architecture blueprints, detailed multi-agent workflows, database designs, and front-end interface integrations, please visit our centralized tracking zones:

* **Install App APK:** [Latest Release](https://github.com/MedMemory-AI/frontend-app/releases/latest)
* **Local Setup Guide:** [./setup.txt](https://github.com/MedMemory-AI/frontend-app/blob/main/setup.txt)
* 🌐 **Live Documentation Portal:** [medmemory-ai.github.io/docs](https://medmemory-ai.github.io/docs/)
* 🏛️ **Global Organization Workspace:** [@MedMemory-AI](https://github.com/MedMemory-AI)

---

## 🚀 Local Quick Start

If you are a contributor working specifically on this codebase, you can fire up the local development engine using these steps:

### Detailed Guide: [Local Setup Guide](https://medmemory-ai.github.io/docs/Guides/Local-Setup/)

---

## Setup Guide (Frontend)
***For Local Setup's***

- **Option -1 (Web-based)**
```bash
npx expo start --web
```
    -> Open `laptop-ip:8081` in Browser

---

- **Option -2 (USB Cable)**
```bash
-> Connect `Laptop <-> Mobile` via `USB cable`  (Mobile: `Dev Opts -> Turn ON USB debug, Install via USB, USB debug security`)
```
```bash
npx expo run:android --device
```
```bash
Run `adb reverse tcp:8081 tcp:8081` in Laptop's Shell
```
```bash
-> Open App in Mobile
```
```bash
-> Unplug cable & Turn OFF  `Mobile`: USB debug, Install via USB, USB debug security & Dev Opts
```

---

## 🤝 How to Contribute
Before submitting a Pull Request, please read our centralized [Contributing Guidelines](https://github.com/MedMemory-AI/.github/blob/main/CONTRIBUTING.md). Ensure you match local code-style rules and always execute your task variations on a dedicated feature branch (feat/your-patch).
