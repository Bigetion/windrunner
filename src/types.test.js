import { describe, it, expect, vi } from "vitest";
import {
  ErrorReasons,
  WarningSeverity,
  createErrorContext,
  createWarningContext,
} from "./types.js";
import { createWindrunner } from "./runtime.js";

// ─── ErrorReasons enumeration tests ──────────────────────────────────────────

describe("ErrorReasons", () => {
  it("should export all five error reason constants", () => {
    expect(ErrorReasons.PARSE_ERROR).toBe("parse-error");
    expect(ErrorReasons.UNKNOWN_UTILITY).toBe("unknown-utility");
    expect(ErrorReasons.UNKNOWN_VARIANT).toBe("unknown-variant");
    expect(ErrorReasons.COMPILATION_ERROR).toBe("compilation-error");
    expect(ErrorReasons.LITE_MODE_EXCLUDED).toBe("lite-mode-excluded");
  });

  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(ErrorReasons)).toBe(true);
    expect(() => {
      ErrorReasons.PARSE_ERROR = "modified";
    }).toThrow();
  });

  it("should have exactly 5 keys", () => {
    expect(Object.keys(ErrorReasons)).toHaveLength(5);
  });
});

// ─── WarningSeverity enumeration tests ───────────────────────────────────────

describe("WarningSeverity", () => {
  it("should export all three severity levels", () => {
    expect(WarningSeverity.LOW).toBe("low");
    expect(WarningSeverity.MEDIUM).toBe("medium");
    expect(WarningSeverity.HIGH).toBe("high");
  });

  it("should be frozen (immutable)", () => {
    expect(Object.isFrozen(WarningSeverity)).toBe(true);
    expect(() => {
      WarningSeverity.LOW = "modified";
    }).toThrow();
  });

  it("should have exactly 3 keys", () => {
    expect(Object.keys(WarningSeverity)).toHaveLength(3);
  });
});

// ─── createErrorContext factory tests ────────────────────────────────────────

describe("createErrorContext", () => {
  it("should create context with className, reason, and timestamp", () => {
    const before = Date.now();
    const ctx = createErrorContext("bg-unknown-500", "unknown-utility");
    const after = Date.now();

    expect(ctx.className).toBe("bg-unknown-500");
    expect(ctx.reason).toBe("unknown-utility");
    expect(ctx.timestamp).toBeGreaterThanOrEqual(before);
    expect(ctx.timestamp).toBeLessThanOrEqual(after);
  });

  it("should merge extra properties into context", () => {
    const ctx = createErrorContext("rotate-45", "lite-mode-excluded", {
      baseToken: "rotate-45",
      category: "transforms",
      variants: ["hover"],
      details: "Not available in lite build",
    });

    expect(ctx.className).toBe("rotate-45");
    expect(ctx.reason).toBe("lite-mode-excluded");
    expect(ctx.baseToken).toBe("rotate-45");
    expect(ctx.category).toBe("transforms");
    expect(ctx.variants).toEqual(["hover"]);
    expect(ctx.details).toBe("Not available in lite build");
  });

  it("should work with all error reason values", () => {
    for (const reason of Object.values(ErrorReasons)) {
      const ctx = createErrorContext("test-class", reason);
      expect(ctx.reason).toBe(reason);
      expect(ctx.className).toBe("test-class");
      expect(typeof ctx.timestamp).toBe("number");
    }
  });

  it("should not include extra properties if not provided", () => {
    const ctx = createErrorContext("foo", "parse-error");
    expect(ctx.baseToken).toBeUndefined();
    expect(ctx.variants).toBeUndefined();
    expect(ctx.category).toBeUndefined();
  });
});

// ─── createWarningContext factory tests ──────────────────────────────────────

describe("createWarningContext", () => {
  it("should create context with message, severity, and timestamp", () => {
    const before = Date.now();
    const ctx = createWarningContext("Cache eviction triggered", "low");
    const after = Date.now();

    expect(ctx.message).toBe("Cache eviction triggered");
    expect(ctx.severity).toBe("low");
    expect(ctx.timestamp).toBeGreaterThanOrEqual(before);
    expect(ctx.timestamp).toBeLessThanOrEqual(after);
  });

  it("should merge extra properties into context", () => {
    const ctx = createWarningContext("Deprecated usage", "medium", {
      className: "float-left",
      suggestion: "Use flex utilities instead",
    });

    expect(ctx.message).toBe("Deprecated usage");
    expect(ctx.severity).toBe("medium");
    expect(ctx.className).toBe("float-left");
    expect(ctx.suggestion).toBe("Use flex utilities instead");
  });

  it("should work with all severity levels", () => {
    for (const severity of Object.values(WarningSeverity)) {
      const ctx = createWarningContext("test warning", severity);
      expect(ctx.severity).toBe(severity);
      expect(typeof ctx.timestamp).toBe("number");
    }
  });
});

// ─── onWarning callback integration tests ────────────────────────────────────

describe("onWarning callback", () => {
  it("should invoke onWarning when cache eviction occurs", () => {
    const warnings = [];
    const runtime = createWindrunner({
      autoStart: false,
      maxCacheSize: 3,
      onWarning: (message, context) => {
        warnings.push({ message, context });
      },
    });

    // Fill cache to capacity
    runtime.processClassName("flex");
    runtime.processClassName("block");
    runtime.processClassName("inline");

    // This should trigger eviction and warning
    runtime.processClassName("hidden");

    expect(warnings.length).toBeGreaterThanOrEqual(1);
    const lastWarning = warnings[warnings.length - 1];
    expect(lastWarning.message).toContain("Cache eviction");
    expect(lastWarning.context.severity).toBe("low");
    expect(typeof lastWarning.context.timestamp).toBe("number");
  });

  it("should not invoke onWarning when callback is not provided", () => {
    // This should not throw even without onWarning
    const runtime = createWindrunner({
      autoStart: false,
      maxCacheSize: 2,
    });

    runtime.processClassName("flex");
    runtime.processClassName("block");
    runtime.processClassName("inline"); // triggers eviction, no error
  });

  it("should provide WarningContext with all required fields", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      maxCacheSize: 2,
      onWarning: (message, context) => {
        capturedContext = context;
      },
    });

    runtime.processClassName("flex");
    runtime.processClassName("block");
    runtime.processClassName("inline");

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.message).toBeDefined();
    expect(capturedContext.severity).toBeDefined();
    expect(capturedContext.timestamp).toBeDefined();
    expect(typeof capturedContext.timestamp).toBe("number");
  });
});

// ─── onError callback enhanced context tests ─────────────────────────────────

describe("onError callback with ErrorContext", () => {
  it("should provide ErrorContext with className, reason, and timestamp for parse errors", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      onError: (className, context) => {
        capturedContext = context;
      },
    });

    // An empty string or invalid class should trigger parse-error or unknown-utility
    runtime.processClassName("!!!invalid-class-that-wont-parse");

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.className).toBe("!!!invalid-class-that-wont-parse");
    expect(typeof capturedContext.timestamp).toBe("number");
    expect(typeof capturedContext.reason).toBe("string");
    expect(Object.values(ErrorReasons)).toContain(capturedContext.reason);
  });

  it("should provide ErrorContext with reason 'unknown-utility' for unrecognized utilities", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      onError: (className, context) => {
        capturedContext = context;
      },
    });

    runtime.processClassName("totally-fake-utility-xyz");

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.reason).toBe("unknown-utility");
    expect(capturedContext.className).toBe("totally-fake-utility-xyz");
  });

  it("should include baseToken and variants in context when parsing succeeds", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      onError: (className, context) => {
        capturedContext = context;
      },
    });

    runtime.processClassName("hover:unknown-utility-abc");

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.baseToken).toBeDefined();
    expect(capturedContext.variants).toBeDefined();
  });

  it("should include details string in context", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      onError: (className, context) => {
        capturedContext = context;
      },
    });

    runtime.processClassName("nonexistent-class");

    expect(capturedContext).not.toBeNull();
    expect(typeof capturedContext.details).toBe("string");
    expect(capturedContext.details.length).toBeGreaterThan(0);
  });

  it("should set reason to 'lite-mode-excluded' in lite mode", () => {
    let capturedContext = null;
    const runtime = createWindrunner({
      autoStart: false,
      __LITE_MODE__: true,
      onError: (className, context) => {
        capturedContext = context;
      },
    });

    runtime.processClassName("nonexistent-class");

    expect(capturedContext).not.toBeNull();
    expect(capturedContext.reason).toBe("lite-mode-excluded");
  });
});
