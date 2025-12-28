---
description: Deploy game server to production with Docker and Kubernetes
allowed-tools: Read, Bash
---

# /deploy

Deploy **game server to production** environment.

## Usage

```
/deploy [environment] [--scale=10]
```

## Environments

- `dev` - Development cluster
- `staging` - Pre-production
- `prod` - Production

## Deployment Steps

1. Build Docker image
2. Push to registry
3. Update Kubernetes deployment
4. Verify health checks
5. Monitor metrics
