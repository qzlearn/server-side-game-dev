---
name: deployment
description: Game server deployment with Docker, Kubernetes, and global distribution strategies
sasmp_version: "1.3.0"
bonded_agent: 07-devops-deployment
bond_type: PRIMARY_BOND
---

# Game Server Deployment

Deploy **scalable game servers** with containerization and orchestration.

## Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

## Kubernetes Scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 3
  maxReplicas: 100
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70
```

See `assets/` for deployment templates.
