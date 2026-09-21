#!/bin/bash
set -euo pipefail
cd /opt/Toyooran
echo "dir=$(pwd)"
git remote -v
git status -sb
echo "--- health ---"
curl -fsS http://127.0.0.1:3000/api/health || true
echo
echo "--- container ---"
docker ps --filter name=toyooran-app --format '{{.Names}} {{.Image}} {{.Status}}'
echo "--- forgejo ---"
curl -sS -o /dev/null -w 'forgejo_http %{http_code}\n' http://127.0.0.1:3002/
systemctl is-active forgejo-runner docker nginx
