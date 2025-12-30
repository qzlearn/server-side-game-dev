---
description: Deploy game server to production with Docker and Kubernetes
allowed-tools: Read, Bash
version: "2.0.0"

# Input Schema
input:
  required:
    - environment
  optional:
    - scale
    - image_tag
    - dry_run
  validation:
    environment:
      type: string
      enum: [dev, staging, prod]
    scale:
      type: integer
      min: 1
      max: 100
      default: 3
    image_tag:
      type: string
      pattern: "^[a-z0-9][a-z0-9.-]*$"
      default: latest
    dry_run:
      type: boolean
      default: false

# Output Schema
output:
  success:
    deployment_id: string
    replicas_ready: integer
    health_check_url: string
  error:
    code: string
    message: string
    rollback_triggered: boolean

# Error Handling
error_handling:
  on_build_failure: abort
  on_push_failure: retry_3x
  on_deploy_failure: rollback_previous
  on_health_check_failure: rollback_and_alert

# Retry Configuration
retry_config:
  max_attempts: 3
  backoff: exponential
  initial_delay_s: 10
  max_delay_s: 120
---

# /deploy

Deploy **game server to production** environment with zero-downtime rolling updates.

## Usage

```bash
/deploy [environment] [--scale=N] [--image-tag=TAG] [--dry-run]
```

## Environments

| Environment | Cluster | Replicas | Purpose |
|-------------|---------|----------|---------|
| `dev` | dev-cluster | 1 | Development testing |
| `staging` | staging-cluster | 3 | Pre-production validation |
| `prod` | prod-cluster | 10+ | Production traffic |

## Deployment Pipeline

```mermaid
graph LR
    A[Build] --> B[Test]
    B --> C[Push Image]
    C --> D[Deploy]
    D --> E[Health Check]
    E -->|Pass| F[Complete]
    E -->|Fail| G[Rollback]
```

## Deployment Steps

### 1. Build Docker Image
```bash
docker build -t game-server:${TAG} \
  --build-arg VERSION=${TAG} \
  --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  .
```

### 2. Run Tests
```bash
docker run --rm game-server:${TAG} npm test
```

### 3. Push to Registry
```bash
docker tag game-server:${TAG} ${REGISTRY}/game-server:${TAG}
docker push ${REGISTRY}/game-server:${TAG}
```

### 4. Deploy to Kubernetes
```bash
kubectl set image deployment/game-server \
  game-server=${REGISTRY}/game-server:${TAG} \
  --namespace=${ENVIRONMENT}

kubectl rollout status deployment/game-server \
  --namespace=${ENVIRONMENT} \
  --timeout=300s
```

### 5. Verify Health
```bash
kubectl get pods -l app=game-server -n ${ENVIRONMENT}

# Check health endpoint
curl -f https://game.${ENVIRONMENT}.example.com/health
```

## Rollback Procedure

```bash
# Automatic rollback on failure
kubectl rollout undo deployment/game-server -n ${ENVIRONMENT}

# Manual rollback to specific revision
kubectl rollout undo deployment/game-server -n ${ENVIRONMENT} --to-revision=N
```

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Alerts configured
- [ ] Runbook updated

## Troubleshooting

### Common Failure Modes

| Error | Root Cause | Solution |
|-------|------------|----------|
| Image pull error | Registry auth | Check imagePullSecrets |
| CrashLoopBackOff | App crash | Check logs, fix code |
| Readiness probe fail | Slow startup | Increase initialDelaySeconds |
| OOMKilled | Memory exceeded | Increase limits |

### Debug Checklist

```bash
# Check deployment status
kubectl describe deployment game-server -n ${ENV}

# Check pod logs
kubectl logs -l app=game-server -n ${ENV} --tail=100

# Check events
kubectl get events -n ${ENV} --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -l app=game-server -n ${ENV}
```

## Example Output

```
Deploying game-server to prod...

✓ Building image: game-server:v1.2.3
✓ Running tests: 142/142 passed
✓ Pushing to registry: gcr.io/project/game-server:v1.2.3
✓ Updating deployment: 10 replicas
✓ Health check: https://game.prod.example.com/health

Deployment complete!
- Deployment ID: deploy-abc123
- Replicas ready: 10/10
- Duration: 4m 32s
```
