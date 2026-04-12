import { render, renderHook, act } from "@testing-library/react";
import Toast, { useToast } from "@/components/ui/Toast";

describe("useToast", () => {
  it("keeps showToast referentially stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useToast(4000));
    const first = result.current.showToast;
    rerender();
    expect(result.current.showToast).toBe(first);
  });

  it("updates toast element when showToast is invoked", () => {
    const { result } = renderHook(() => useToast(4000));
    expect(result.current.toastElement).toBeNull();
    act(() => {
      result.current.showToast("Saved", "success");
    });
    expect(result.current.toastElement).not.toBeNull();
  });
});

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("invokes onClose after duration", () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="info" duration={1000} onClose={onClose} />);
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(onClose).toHaveBeenCalled();
  });
});
