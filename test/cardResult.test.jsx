import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardResult from "../src/components/CardResult.jsx";
import { drawCard } from "../src/api.js";

vi.mock("../src/api.js", () => ({
  drawCard: vi.fn(),
  health: vi.fn(),
}));

const baseCard = {
  id: "c1",
  cardName: "Steady Ground",
  message: "You can set part of this down.",
  context: "Notice one thing that is already okay.",
  theme: "anchor",
  kind: "validation",
  reminders: [],
};

beforeEach(() => {
  localStorage.clear();
  drawCard.mockReset();
});

describe("CardResult — shared result view (doc §4.2)", () => {
  it("renders the card and its core actions", () => {
    render(<CardResult card={baseCard} source={{ mode: "input", input: "x" }} />);
    expect(screen.getByText("Steady Ground")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save this card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask a follow-up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send a spark/i })).toBeInTheDocument();
  });

  it("allows exactly ONE follow-up, then offers only Save / Draw a new card", async () => {
    const user = userEvent.setup();
    drawCard.mockResolvedValue({
      id: "c2",
      cardName: "Steady Ground",
      message: "Trust the next small step.",
      context: "",
      theme: "path",
      kind: "followup",
      reminders: [],
    });
    const onReplace = vi.fn();
    render(
      <CardResult card={baseCard} source={{ mode: "input", input: "x" }} onReplace={onReplace} />
    );

    await user.click(screen.getByRole("button", { name: /ask a follow-up/i }));
    const box = screen.getByPlaceholderText(/one follow-up/i);
    await user.type(box, "What about Thursday?");
    await user.click(screen.getByRole("button", { name: /send follow-up/i }));

    await waitFor(() => expect(onReplace).toHaveBeenCalledTimes(1));
    expect(drawCard).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "follow_up", input: "What about Thursday?" })
    );
    // No second follow-up is offered.
    expect(screen.queryByRole("button", { name: /ask a follow-up/i })).not.toBeInTheDocument();
    // Re-draw is now framed as "Draw a new card".
    expect(screen.getByRole("button", { name: /draw a new card/i })).toBeInTheDocument();
  });

  it("read-only mode hides follow-up and re-draw, keeps Save and Send a Spark (doc §4.4)", () => {
    render(<CardResult card={baseCard} readOnly />);
    expect(screen.queryByRole("button", { name: /ask a follow-up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /draw a different card/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save this card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send a spark/i })).toBeInTheDocument();
  });
});
