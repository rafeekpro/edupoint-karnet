# Kubectl Configuration for Self-Hosted Agents

## Problem
Kubectl is installed on self-hosted agents but not configured to connect to the cluster.
Error: `connection refused` to `localhost:8080`

## Solutions

### Option 1: Add kubeconfig to Agent (Recommended)

1. On the self-hosted agent machine, create kubeconfig:
```bash
sudo mkdir -p /home/azureuser/.kube
sudo cp /path/to/your/kubeconfig /home/azureuser/.kube/config
sudo chown -R azureuser:azureuser /home/azureuser/.kube
sudo chmod 600 /home/azureuser/.kube/config
```

2. Test kubectl:
```bash
sudo -u azureuser kubectl get nodes
```

### Option 2: Use Environment Variable in Pipeline

Add to your pipeline variables:
```yaml
variables:
  KUBECONFIG: /path/to/kubeconfig/on/agent
```

### Option 3: Configure kubectl in Pipeline

Add this step before any kubectl commands:
```yaml
- task: Bash@3
  displayName: 'Configure kubectl'
  inputs:
    targetType: 'inline'
    script: |
      # Create .kube directory
      mkdir -p $HOME/.kube
      
      # Write kubeconfig from variable
      echo "$(KUBECONFIG_CONTENT)" | base64 -d > $HOME/.kube/config
      chmod 600 $HOME/.kube/config
      
      # Test connection
      kubectl cluster-info
```

Then add `KUBECONFIG_CONTENT` to your variable group (base64 encoded).

### Option 4: Use Service Principal (Azure AKS)

If using Azure AKS:
```yaml
- task: AzureCLI@2
  displayName: 'Get AKS credentials'
  inputs:
    azureSubscription: 'your-service-connection'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az aks get-credentials --resource-group YOUR_RG --name YOUR_AKS --overwrite-existing
      kubectl get nodes
```

### Option 5: Mount kubeconfig in Docker Agent

If agent runs in Docker, mount kubeconfig:
```bash
docker run -d \
  -v /path/to/kubeconfig:/home/azureuser/.kube/config:ro \
  -e KUBECONFIG=/home/azureuser/.kube/config \
  your-agent-image
```

## Verification

After configuration, run:
```bash
kubectl config view
kubectl cluster-info
kubectl get nodes
```

## Security Notes

1. Never commit kubeconfig to git
2. Use Azure Key Vault or secure variables for sensitive data
3. Limit kubeconfig permissions (read-only where possible)
4. Consider using service accounts with limited permissions