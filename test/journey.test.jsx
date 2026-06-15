import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../src/api.js", () => ({
  drawCard: vi.fn(),
  health: vi.fn(),
}));
import { drawCard, health } from "../src/api.js";
import App from "../src/App.jsx";

beforeEach(() => {
  localStorage.clear();
  health.mockResolvedValue({ ok: true, apiKey: true, fallback: false });
  drawCard.mockImplementation(async ({ intent }) =>
    intent === "daily"
      ? { title: "Today's morning perspective", body: "Arrive gently." }
      : { title: "An answer drawn for you", body: "Choose what keeps you honest." }
  );
});

// Build order #9 — core journey: open app -> daily card -> ask -> result ->
// collect -> appears in Saved.
describe("core journey", () => {
  it("daily card → draw a card → collect → shows in Saved", async () => {
    const user = userEvent.setup();
    render(<App />);

    // daily card loads
    expect(await screen.findByText(/Today's morning perspective/)).toBeInTheDocument();

    // ask the deck
    await user.type(screen.getByPlaceholderText(/Ask a question/i), "Should I take the job?");
    await user.click(screen.getByRole("button", { name: /draw a card/i }));
    expect(await screen.findByText(/An answer drawn for you/)).toBeInTheDocument();

    // collect it
    await user.click(screen.getByRole("button", { name: /^collect/i }));
    expect(await screen.findByText(/collected/i)).toBeInTheDocument();

    // it appears in Saved
    await user.click(screen.getByRole("button", { name: /^saved$/i }));
    expect(await screen.findByText(/An answer drawn for you/)).toBeInTheDocument();
  });
});
