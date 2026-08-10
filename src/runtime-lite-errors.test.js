import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWindrunnerLite } from "./lite.js";

describe("Lite Runtime Error Handling", () => {
  let onErrorSpy;
  let runtime;

  beforeEach(() => {
    onErrorSpy = vi.fn();
    runtime = createWindrunnerLite({
      autoStart: false,
      onError: onErrorSpy,
    });
  });

  describe("Excluded Utilities - Transform Category", () => {
    it("should report lite-mode-excluded error for rotate utility", () => {
      runtime.processClassName("rotate-45");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("rotate-45");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transforms");
      expect(errorContext.baseToken).toBe("rotate-45");
      expect(errorContext.details).toContain("not available in lite build");
      expect(errorContext.details).toContain("transforms");
    });

    it("should report lite-mode-excluded error for scale utility", () => {
      runtime.processClassName("scale-150");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("scale-150");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transforms");
    });

    it("should report lite-mode-excluded error for translate utility", () => {
      runtime.processClassName("translate-x-4");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("translate-x-4");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transforms");
    });
  });

  describe("Excluded Utilities - Filter Category", () => {
    it("should report lite-mode-excluded error for blur utility", () => {
      runtime.processClassName("blur-sm");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("blur-sm");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("filters");
    });

    it("should report lite-mode-excluded error for backdrop-blur utility", () => {
      runtime.processClassName("backdrop-blur-md");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("backdrop-blur-md");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("filters");
    });

    it("should report lite-mode-excluded error for brightness utility", () => {
      runtime.processClassName("brightness-150");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("brightness-150");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("filters");
    });
  });

  describe("Excluded Utilities - Transition Category", () => {
    it("should report lite-mode-excluded error for transition utility", () => {
      runtime.processClassName("transition");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("transition");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transitions");
    });

    it("should report lite-mode-excluded error for duration utility", () => {
      runtime.processClassName("duration-300");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("duration-300");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transitions");
    });
  });

  describe("Excluded Utilities - Animation Category", () => {
    it("should report lite-mode-excluded error for animate-spin utility", () => {
      runtime.processClassName("animate-spin");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("animate-spin");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("animations");
    });

    it("should report lite-mode-excluded error for animate-bounce utility", () => {
      runtime.processClassName("animate-bounce");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("animate-bounce");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("animations");
    });
  });

  describe("Excluded Variants - Advanced Variants Category", () => {
    it("should report lite-mode-excluded error for group-hover variant", () => {
      runtime.processClassName("group-hover:bg-blue-500");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("group-hover:bg-blue-500");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("group-hover");
    });

    it("should report lite-mode-excluded error for peer-checked variant", () => {
      runtime.processClassName("peer-checked:text-green-500");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("peer-checked:text-green-500");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("peer-checked");
    });

    it("should report lite-mode-excluded error for has-* variant", () => {
      runtime.processClassName("has-[:checked]:bg-red-500");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("has-[:checked]:bg-red-500");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("has-[:checked]");
    });

    it("should report lite-mode-excluded error for data-* variant", () => {
      runtime.processClassName("data-[state=open]:block");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("data-[state=open]:block");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("data-[state=open]");
    });

    it("should report lite-mode-excluded error for aria-* variant", () => {
      runtime.processClassName("aria-[expanded=true]:rotate-180");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("aria-[expanded=true]:rotate-180");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("aria-[expanded=true]");
    });

    it("should report lite-mode-excluded error for arbitrary variant", () => {
      runtime.processClassName("[&>span]:text-blue-500");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("[&>span]:text-blue-500");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("[&>span]");
    });

    it("should report lite-mode-excluded error for named group variant", () => {
      runtime.processClassName("group-hover/sidebar:bg-gray-100");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(className).toBe("group-hover/sidebar:bg-gray-100");
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.variants).toContain("group-hover/sidebar");
    });
  });

  describe("Included Utilities - Should Not Trigger Errors", () => {
    it("should not call onError for flex utility", () => {
      runtime.processClassName("flex");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for spacing utility", () => {
      runtime.processClassName("p-4");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for color utility", () => {
      runtime.processClassName("bg-blue-500");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for basic effect utility", () => {
      runtime.processClassName("shadow-lg");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("Included Variants - Should Not Trigger Errors", () => {
    it("should not call onError for hover variant", () => {
      runtime.processClassName("hover:bg-blue-500");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for focus variant", () => {
      runtime.processClassName("focus:ring-2");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for dark mode variant", () => {
      runtime.processClassName("dark:bg-gray-900");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it("should not call onError for responsive breakpoint", () => {
      runtime.processClassName("md:flex");

      // Should succeed without error
      expect(onErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple excluded utilities in a batch", () => {
      runtime.processClassName("rotate-45");
      runtime.processClassName("blur-sm");
      runtime.processClassName("transition");

      expect(onErrorSpy).toHaveBeenCalledTimes(3);

      const calls = onErrorSpy.mock.calls;
      expect(calls[0][1].category).toBe("transforms");
      expect(calls[1][1].category).toBe("filters");
      expect(calls[2][1].category).toBe("transitions");
    });

    it("should prioritize variant exclusion over utility exclusion when both are present", () => {
      // Even though rotate is excluded, the variant is checked first
      runtime.processClassName("group-hover:rotate-45");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
    });

    it("should handle excluded utility with included variant", () => {
      runtime.processClassName("hover:rotate-45");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transforms");
    });

    it("should handle included utility with excluded variant", () => {
      runtime.processClassName("group-hover:flex");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
    });
  });

  describe("Error Context Validation", () => {
    it("should provide complete error context for excluded utilities", () => {
      runtime.processClassName("rotate-90");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      // Verify all expected properties are present
      expect(errorContext).toHaveProperty("reason");
      expect(errorContext).toHaveProperty("category");
      expect(errorContext).toHaveProperty("baseToken");
      expect(errorContext).toHaveProperty("details");

      // Verify values
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("transforms");
      expect(errorContext.baseToken).toBe("rotate-90");
      expect(errorContext.details).toContain("not available in lite build");
    });

    it("should provide complete error context for excluded variants", () => {
      runtime.processClassName("peer-focus:bg-red-500");

      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      const [className, errorContext] = onErrorSpy.mock.calls[0];

      // Verify all expected properties
      expect(errorContext).toHaveProperty("reason");
      expect(errorContext).toHaveProperty("category");
      expect(errorContext).toHaveProperty("baseToken");
      expect(errorContext).toHaveProperty("variants");
      expect(errorContext).toHaveProperty("details");

      // Verify values
      expect(errorContext.reason).toBe("lite-mode-excluded");
      expect(errorContext.category).toBe("advanced-variants");
      expect(errorContext.baseToken).toBe("bg-red-500");
      expect(errorContext.variants).toContain("peer-focus");
    });
  });
});
