import { describe, expect, it } from "vitest";
import { REDACTION_CAP_BYTES, redactSecrets } from "../safety/redaction.js";

describe("safety - redaction", () => {
  describe("private key blocks", () => {
    it("redacts RSA private key block spanning multiple lines", () => {
      const input = [
        "-----BEGIN RSA PRIVATE KEY-----",
        "MIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4YRFP",
        "nRQaFRoTJHpBNdlQ7j+5KVfLbHNN0GEkRWHvYHbZ",
        "-----END RSA PRIVATE KEY-----",
      ].join("\n");
      const result = redactSecrets(input);
      expect(result).not.toContain("BEGIN RSA PRIVATE KEY");
      expect(result).not.toContain("MIIEpAIBAAK");
      expect(result).toContain("«redacted»");
    });

    it("redacts OpenSSH private key block spanning multiple lines", () => {
      const input = [
        "-----BEGIN OPENSSH PRIVATE KEY-----",
        "b3BlbnNzaC1rZXktdjEAAAAA",
        "BG5vbmUAAAAEbm9uZQAAAAAAAAB",
        "-----END OPENSSH PRIVATE KEY-----",
      ].join("\n");
      const result = redactSecrets(input);
      expect(result).not.toContain("BEGIN OPENSSH PRIVATE KEY");
      expect(result).not.toContain("b3BlbnNzaC1rZXktdjEAAAAA");
      expect(result).toContain("«redacted»");
    });

    it("redacts EC private key block spanning multiple lines", () => {
      const input = [
        "-----BEGIN EC PRIVATE KEY-----",
        "MHQCAQEEIOaLsGmRpG2MYNHoQIaEW4sOVgQi",
        "rkWFi1VTdqnMp",
        "-----END EC PRIVATE KEY-----",
      ].join("\n");
      const result = redactSecrets(input);
      expect(result).not.toContain("BEGIN EC PRIVATE KEY");
      expect(result).toContain("«redacted»");
    });

    it("redacts multi-line key block with many base64 lines (dotall regression)", () => {
      const lines = [
        "-----BEGIN RSA PRIVATE KEY-----",
        "MIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4YRFP",
        "nRQaFRoTJHpBNdlQ7j+5KVfLbHNN0GEkRWHvYHbZ",
        "wMrGYaLm3V+5JJcds3xHn/ygWep4YRFPnRQaFRoT",
        "JHpBNdlQ7j+5KVfLbHNN0GEkRWHvYHbZwMrGYaLm",
        "3V+5JJcds3xHn/ygWep4YRFPnRQaFRoTJHpBNdlQ",
        "-----END RSA PRIVATE KEY-----",
      ].join("\n");
      const result = redactSecrets(lines);
      expect(result).not.toContain("BEGIN RSA PRIVATE KEY");
      expect(result).not.toContain("MIIEpAIBAAK");
      expect(result).toContain("«redacted»");
    });
  });

  describe("password= / passwd=", () => {
    it("redacts password=hunter2", () => {
      expect(redactSecrets("password=hunter2")).toBe("password=«redacted»");
    });

    it("redacts passwd=s3cr3t", () => {
      expect(redactSecrets("passwd=s3cr3t")).toBe("passwd=«redacted»");
    });

    it("redacts PASSWORD=foo (case-insensitive)", () => {
      expect(redactSecrets("PASSWORD=foo")).toBe("PASSWORD=«redacted»");
    });
  });

  describe("token=", () => {
    it("redacts token=abc123xyz", () => {
      expect(redactSecrets("token=abc123xyz")).toBe("token=«redacted»");
    });

    it("redacts PHOENIX_TOKEN=xyz (env-var-style key containing TOKEN)", () => {
      const result = redactSecrets("PHOENIX_TOKEN=xyz");
      expect(result).not.toContain("xyz");
      expect(result).toContain("«redacted»");
    });
  });

  describe("secret=", () => {
    it("redacts secret=mysecretvalue", () => {
      expect(redactSecrets("secret=mysecretvalue")).toBe("secret=«redacted»");
    });
  });

  describe("api_key= / api-key=", () => {
    it("redacts api_key=abc", () => {
      expect(redactSecrets("api_key=abc")).toBe("api_key=«redacted»");
    });

    it("redacts api-key=abc", () => {
      expect(redactSecrets("api-key=abc")).toBe("api-key=«redacted»");
    });
  });

  describe("Authorization header", () => {
    it("redacts Authorization: Bearer token", () => {
      const result = redactSecrets("Authorization: Bearer eyJhbGci...");
      expect(result).toContain("Authorization:");
      expect(result).not.toContain("eyJhbGci");
      expect(result).toContain("«redacted»");
    });

    it("redacts authorization: basic (case-insensitive)", () => {
      const result = redactSecrets("authorization: basic dXNlcjpwYXNz");
      expect(result).toContain("authorization:");
      expect(result).not.toContain("dXNlcjpwYXNz");
      expect(result).toContain("«redacted»");
    });
  });

  describe("JWT standalone", () => {
    it("redacts a bare JWT not prefixed by Bearer", () => {
      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const result = redactSecrets(`config: jwt=${jwt}`);
      expect(result).not.toContain(jwt);
      expect(result).toContain("«redacted»");
    });

    it("does not touch ordinary dotted text", () => {
      expect(redactSecrets("service.unit.name is active")).toBe("service.unit.name is active");
    });
  });

  describe("Bearer token standalone", () => {
    it("redacts standalone Bearer token", () => {
      const result = redactSecrets("Bearer eyJhbGciOiJIUzI1...");
      expect(result).toContain("Bearer");
      expect(result).not.toContain("eyJhbGciOiJIUzI1");
      expect(result).toContain("«redacted»");
    });
  });

  describe("DB connection strings", () => {
    it("redacts postgres:// connection string", () => {
      const result = redactSecrets("postgres://user:hunter2@localhost:5432/mydb");
      expect(result).toContain("postgres://");
      expect(result).not.toContain("hunter2");
      expect(result).toContain("«redacted»");
    });

    it("redacts postgresql:// connection string", () => {
      const result = redactSecrets("postgresql://admin:pass@db.host/prod");
      expect(result).toContain("postgresql://");
      expect(result).not.toContain("pass@db.host");
      expect(result).toContain("«redacted»");
    });

    it("redacts mysql:// connection string", () => {
      const result = redactSecrets("mysql://root:pass@127.0.0.1/app");
      expect(result).toContain("mysql://");
      expect(result).not.toContain("pass@127.0.0.1");
      expect(result).toContain("«redacted»");
    });
  });

  describe("AWS / Azure key patterns", () => {
    it("redacts AWS access key (AKIA* 20-char)", () => {
      const result = redactSecrets("key: AKIAIOSFODNN7EXAMPLE");
      expect(result).not.toContain("AKIAIOSFODNN7EXAMPLE");
      expect(result).toContain("«redacted»");
    });

    it("redacts Azure SAS token sig= fragment", () => {
      const result = redactSecrets("sv=2021&se=2025-01-01&sig=abc123XYZ%2Fdef456GHIjkl789%3D%3D");
      expect(result).not.toContain("abc123XYZ");
      expect(result).toContain("sig=«redacted»");
    });
  });

  describe("ENV-style secret key=value", () => {
    it("redacts SOME_SECRET_KEY=actualvalue", () => {
      const result = redactSecrets("SOME_SECRET_KEY=actualvalue");
      expect(result).not.toContain("actualvalue");
      expect(result).toContain("«redacted»");
    });

    it("redacts DATABASE_URL=postgres://user:pass@host/db", () => {
      const result = redactSecrets("DATABASE_URL=postgres://user:pass@host/db");
      expect(result).not.toContain("pass@host");
      expect(result).toContain("«redacted»");
    });
  });

  describe("context preservation", () => {
    it("preserves key name after redacting token=abc123", () => {
      const result = redactSecrets("token=abc123");
      expect(result).toContain("token=");
    });

    it("preserves key name after redacting password=secret", () => {
      const result = redactSecrets("password=secret");
      expect(result).toContain("password=");
    });
  });

  describe("clean pass-through", () => {
    it('does not alter "systemctl status nginx"', () => {
      expect(redactSecrets("systemctl status nginx")).toBe("systemctl status nginx");
    });

    it('does not alter "exit code: 0"', () => {
      expect(redactSecrets("exit code: 0")).toBe("exit code: 0");
    });
  });

  describe("16 KB input cap", () => {
    it("REDACTION_CAP_BYTES equals 16384", () => {
      expect(REDACTION_CAP_BYTES).toBe(16384);
    });

    it("caps output to at most REDACTION_CAP_BYTES when input exceeds cap", () => {
      const big = "a".repeat(REDACTION_CAP_BYTES + 1000);
      const result = redactSecrets(big);
      expect(result.length).toBeLessThanOrEqual(REDACTION_CAP_BYTES);
    });
  });

  describe("pure function", () => {
    it("produces identical output on repeated calls with same input", () => {
      const input = "token=abc123 password=hunter2 systemctl status nginx";
      expect(redactSecrets(input)).toBe(redactSecrets(input));
    });
  });
});
