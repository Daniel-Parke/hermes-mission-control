import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HindsightBrowser from "@/components/memory/HindsightBrowser";

describe("HindsightBrowser", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("does not fetch hindsight recall on mount", () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
    render(<HindsightBrowser />);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls recall endpoint when Recall is clicked with a query", async () => {
    const jsonResponse = (body: unknown) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => body,
      } as Response);

    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (url.includes("action=recall")) {
        return jsonResponse({
          data: {
            memories: [{ content: "x", id: "1" }],
            available: true,
            mode: "ok",
          },
        });
      }
      return jsonResponse({ data: { available: true } });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    render(<HindsightBrowser />);
    fireEvent.change(screen.getByPlaceholderText(/Search memories/), {
      target: { value: "project goals" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Recall$/ }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const recallUrl = fetchMock.mock.calls.map((c) => String(c[0])).find((u) => u.includes("action=recall"));
    expect(recallUrl).toBeDefined();
    expect(recallUrl).toContain(encodeURIComponent("project goals"));
  });
});
