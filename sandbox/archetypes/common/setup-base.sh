#!/usr/bin/env bash
set -euo pipefail

public_key="${1:-}"
if [[ -z "${public_key}" ]]; then
  echo "BENCH_PUBLIC_KEY is required" >&2
  exit 1
fi

apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  openssh-server \
  python3 \
  sudo \
  systemd \
  systemd-sysv
rm -rf /var/lib/apt/lists/*

useradd -m -s /bin/bash azureuser
install -d -m 700 -o azureuser -g azureuser /home/azureuser/.ssh
printf '%s\n' "${public_key}" > /home/azureuser/.ssh/authorized_keys
chown azureuser:azureuser /home/azureuser/.ssh/authorized_keys
chmod 600 /home/azureuser/.ssh/authorized_keys

install -d -m 755 /run/sshd
printf 'azureuser ALL=(ALL) NOPASSWD:ALL\n' > /etc/sudoers.d/90-azureuser
chmod 440 /etc/sudoers.d/90-azureuser

systemctl enable ssh.service
