# 🚀 CI/CD is Fun — End-to-End Pipeline Demo

A deliberately simple Node.js app used to teach a **complete, production-shaped CI/CD pipeline**:

```
Push to GitHub
   │
   ├──► Stage 1: Tests (CI)
   ├──► Stage 2: CodeQL static code scanning (SAST)     ← run in parallel
   │
   └──► Stage 3: Docker build → Trivy image scan → push to Docker Hub
              │
              └──► Stage 4: Deploy to Azure Container Instances (CD)
```

The pipeline demonstrates two different kinds of security scanning:

| Scan | Tool | What it checks | When it runs |
|------|------|----------------|--------------|
| SAST | CodeQL | Vulnerabilities in *your source code* (injection, unsafe patterns) | Every push & PR |
| Container scanning | Trivy | CVEs in the *built image* (base OS packages, Node runtime) | Before pushing to Docker Hub |

## Prerequisites

1. A GitHub account (Actions is free for public repos)
2. A Docker Hub account
3. An Azure account (free tier works — ACI is billed per second)
4. Azure CLI installed locally (`az`)

## Setup

### 1. Docker Hub

Create an **access token** (never use your password):
Docker Hub → Account Settings → Security → New Access Token → scope: *Read & Write*.

### 2. Azure

```bash
az login

# Create a resource group
az group create --name rg-cicd-demo --location southafricanorth

# Create a service principal scoped to ONLY that resource group (least privilege)
az ad sp create-for-rbac \
  --name "sp-cicd-demo" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-cicd-demo \
  --sdk-auth
```

Copy the **entire JSON output** — that becomes the `AZURE_CREDENTIALS` secret.

### 3. GitHub Secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | The access token from step 1 |
| `AZURE_CREDENTIALS` | The full JSON from `az ad sp create-for-rbac --sdk-auth` |

### 4. Personalize

In `.github/workflows/ci-cd.yml`, change `ACI_DNS_LABEL` to something unique to you
(DNS labels are globally unique per region).

### 5. Push and watch

```bash
git add .
git commit -m "feat: initial pipeline"
git push origin main
```

Watch the **Actions** tab. When it finishes, visit:

```
http://<your-dns-label>.southafricanorth.azurecontainer.io:3000
```

## Teaching Talking Points 🎓

1. **Pipeline gates** — `needs: [test, codeql]` means the image is never built if tests
   or SAST fail. Break the test on purpose and show the pipeline stop.
2. **PRs vs pushes** — the `if:` condition means PRs get tested and scanned but never
   deployed. This models trunk-based development.
3. **Immutable tags** — we deploy `:${{ github.sha }}`, never `:latest`. Ask mentees:
   *why is deploying `:latest` dangerous?* (You can't tell what's actually running;
   rollbacks are ambiguous.)
4. **Least privilege everywhere** — Docker Hub token instead of password; service
   principal scoped to one resource group; workflow `permissions:` block; non-root
   `USER node` in the Dockerfile.
5. **Break it on purpose** — add a vulnerable base image (`FROM node:14`) and watch
   Trivy fail the build. Nothing teaches security gates like a red ❌.
6. **Environments & approvals** — the `environment: production` line lets you add a
   required reviewer in repo settings, demonstrating manual approval gates.
7. **Rollback demo** — re-run the deploy job of an older green run: since each image
   is tagged with its SHA, that *is* your rollback.

## Cleanup (avoid charges)

```bash
az group delete --name rg-cicd-demo --yes --no-wait
```
