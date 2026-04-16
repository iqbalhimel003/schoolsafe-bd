#!/bin/bash
# ============================================================
# SchoolSafe BD — GitHub Auto-sync Setup Script
#
# Run this script if the Replit container was fully rebuilt
# and the SSH key / post-commit hook needs to be restored.
# ============================================================

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GITHUB_REPO="git@github.com:iqbalhimel003/schoolsafe-bd.git"
KEY_FILE="$HOME/.ssh/id_ed25519"

echo "=== SchoolSafe BD — GitHub Auto-sync Setup ==="
echo ""

# 1. Generate a new SSH key if one does not exist
if [ -f "$KEY_FILE" ]; then
  echo "✓ SSH key already exists at $KEY_FILE"
else
  echo "→ Generating new SSH key..."
  ssh-keygen -t ed25519 -C "schoolsafe-bd-replit-autosync" -f "$KEY_FILE" -N ""
  echo ""
  echo "NEW PUBLIC KEY (add this as a deploy key to the GitHub repo):"
  echo "  Repository: https://github.com/iqbalhimel003/schoolsafe-bd/settings/keys"
  echo ""
  cat "$KEY_FILE.pub"
  echo ""
  echo "After adding the deploy key, run this script again to complete setup."
  exit 0
fi

# 2. Configure SSH for github.com (no StrictHostKeyChecking — use known_hosts instead)
mkdir -p "$HOME/.ssh"
cat > "$HOME/.ssh/config" << 'SSH_CONFIG'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
SSH_CONFIG
chmod 600 "$HOME/.ssh/config"
echo "✓ SSH config written"

# Ensure github.com fingerprint is in known_hosts so SSH can verify the host
ssh-keyscan -t ed25519 github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null
sort -u "$HOME/.ssh/known_hosts" -o "$HOME/.ssh/known_hosts"
echo "✓ github.com fingerprint added to known_hosts"

# 3. Ensure 'origin' remote points to GitHub
cd "$REPO_ROOT"
if git remote get-url origin >/dev/null 2>&1; then
  CURRENT=$(git remote get-url origin)
  if [ "$CURRENT" = "$GITHUB_REPO" ]; then
    echo "✓ Remote 'origin' already configured correctly"
  else
    git remote set-url origin "$GITHUB_REPO"
    echo "✓ Remote 'origin' updated to: $GITHUB_REPO"
  fi
else
  git remote add origin "$GITHUB_REPO"
  echo "✓ Remote 'origin' added: $GITHUB_REPO"
fi

# 4. Install the post-commit hook (delegates to scripts/github-sync.mjs)
HOOK_PATH="$REPO_ROOT/.git/hooks/post-commit"
cat > "$HOOK_PATH" << 'POST_COMMIT'
#!/bin/sh
# Auto-sync to GitHub after every Replit checkpoint / commit.
# Delegates all logic (connector check + push) to scripts/github-sync.mjs.
export HOME=/home/runner
REPO_ROOT=/home/runner/workspace
node "$REPO_ROOT/scripts/github-sync.mjs" >> /tmp/github-sync.log 2>&1 &
POST_COMMIT
chmod +x "$HOOK_PATH"
echo "✓ Post-commit hook installed"

# 5. Test SSH connection
echo ""
echo "→ Testing SSH connection to GitHub..."
ssh -T git@github.com 2>&1 || true

echo ""
echo "=== Setup complete! Every Replit commit now auto-syncs to GitHub. ==="
