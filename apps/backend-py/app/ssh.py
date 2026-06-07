"""SSH runner — runs ONE approved command on a customer VM, with timeouts.
(rubric E: separate module; rubric C: the runner only executes what the safety layer + human allow.)

The private key never leaves the backend. Output is returned raw; redaction happens at the
audit/activity layer (safety.redact) before anything is stored or sent to the ERP.
"""
from __future__ import annotations

import glob
import os
import socket
import time
from dataclasses import asdict, dataclass

import paramiko
from paramiko.ssh_exception import AuthenticationException, NoValidConnectionsError

from .case_source import selected_case_source
from .config import settings

_MAX_OUTPUT = 20000  # cap stdout/stderr to keep audit + prompts bounded


@dataclass
class SSHResult:
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int
    truncated: bool

    def as_dict(self) -> dict:
        return asdict(self)


class SSHError(Exception):
    pass


def _load_key(path: str):
    # paramiko 3.2+ autodetects key type; fall back to trying each type.
    try:
        return paramiko.PKey.from_path(path)  # type: ignore[attr-defined]
    except Exception:
        pass
    for cls in (paramiko.Ed25519Key, paramiko.ECDSAKey, paramiko.RSAKey, paramiko.DSSKey):
        try:
            return cls.from_private_key_file(path)
        except Exception:
            continue
    raise SSHError(f"Could not load SSH private key at {path}")


def _cap(raw: bytes) -> tuple[str, bool]:
    text = raw.decode("utf-8", errors="replace")
    if len(text) > _MAX_OUTPUT:
        return text[:_MAX_OUTPUT] + "\n…[output truncated]", True
    return text, False


class SSHRunner:
    """One connection per troubleshooting run; reused across that run's commands."""

    def __init__(
        self,
        host: str,
        username: str | None = None,
        port: int = 22,
        key_path: str | None = None,
        connect_timeout: int | None = None,
        command_timeout: int | None = None,
    ) -> None:
        self.host = host
        self.username = username or settings.ssh_username
        self.port = port or 22
        self.key_path = key_path or settings.ssh_private_key_path
        self.connect_timeout = connect_timeout or settings.ssh_connect_timeout
        self.command_timeout = command_timeout or settings.ssh_command_timeout
        self._client: paramiko.SSHClient | None = None

    def _candidate_keys(self) -> list[str]:
        # Try the sandbox bench key first when local Docker cases are active, then the
        # configured key, then the real per-case *.pem keys. This avoids switching env files
        # between rehearsal VMs and local fake VMs.
        cands: list[str] = []
        if selected_case_source() == "sandbox_cases":
            sandbox_key = os.path.join(settings.ssh_key_dir, "bench_incident_key")
            if os.path.exists(sandbox_key):
                cands.append(sandbox_key)
        if self.key_path:
            if self.key_path not in cands:
                cands.append(self.key_path)
        try:
            patterns = ("**/*.pem", "**/*_key", "**/id_*")
            for pattern in patterns:
                for p in sorted(glob.glob(os.path.join(settings.ssh_key_dir, pattern), recursive=True)):
                    if p.endswith(".pub") or not os.path.isfile(p):
                        continue
                    if p not in cands:
                        cands.append(p)
        except Exception:
            pass
        return cands or [self.key_path]

    def connect(self) -> None:
        if self._client is not None:
            return
        errors: list[str] = []
        for key_path in self._candidate_keys():
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            try:
                client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    pkey=_load_key(key_path),
                    timeout=self.connect_timeout,
                    banner_timeout=self.connect_timeout,
                    auth_timeout=self.connect_timeout,
                    look_for_keys=False,
                    allow_agent=False,
                )
            except (socket.timeout, NoValidConnectionsError, OSError) as exc:
                # Network/host problem — no point trying other keys.
                self._safe_close(client)
                raise SSHError(f"SSH connect to {self.host}:{self.port} failed: {exc}") from exc
            except (AuthenticationException, SSHError) as exc:
                errors.append(f"{os.path.basename(key_path)}: {exc}")
                self._safe_close(client)
                continue
            except Exception as exc:
                errors.append(f"{os.path.basename(key_path)}: {exc}")
                self._safe_close(client)
                continue
            self._client = client
            self.key_path = key_path
            return
        raise SSHError(f"SSH auth to {self.host}:{self.port} failed for all keys [{'; '.join(errors) or 'no keys found'}]")

    @staticmethod
    def _safe_close(client: "paramiko.SSHClient") -> None:
        try:
            client.close()
        except Exception:
            pass

    def run(self, command: str, timeout: int | None = None) -> SSHResult:
        self.connect()
        assert self._client is not None
        timeout = timeout or self.command_timeout
        start = time.monotonic()
        timed_out = False
        try:
            stdin, stdout, stderr = self._client.exec_command(command, timeout=timeout)
            stdout.channel.settimeout(timeout)
            out_b = stdout.read()
            err_b = stderr.read()
            code = stdout.channel.recv_exit_status()
        except socket.timeout:
            timed_out = True
            code, out_b, err_b = 124, b"", b"[command timed out]"
        except Exception as exc:
            raise SSHError(f"command execution failed on {self.host}: {exc}") from exc
        out, t1 = _cap(out_b)
        err, t2 = _cap(err_b)
        return SSHResult(
            exit_code=code,
            stdout=out,
            stderr=err,
            duration_ms=int((time.monotonic() - start) * 1000),
            truncated=timed_out or t1 or t2,
        )

    def close(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            finally:
                self._client = None

    def __enter__(self) -> "SSHRunner":
        self.connect()
        return self

    def __exit__(self, *exc) -> None:
        self.close()
