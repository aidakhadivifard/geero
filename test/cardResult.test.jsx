import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardResult from "../src/components/CardResult.jsx";

const card = { id: "c1", intent: "feel", title: "Tired is a real weather. Not a failing.", body: "Do less today." };

beforeEach(() => localStorage.clear());

// Build order #3/#6 — card result component.
describe("CardResult", () => {
  it("renders the card and core actions", () => {
    render(<CardResult card={card} />);
    expect(screen.getByText(/Tired is a real weather/)).toBeInTheDocument();
    expect(screen.getByText(/Do less today/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /collect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send a spark/i })).toBeInTheDocument();
  });

  it("collecting toggles saved state", async () => {
    const user = userEvent.setup();
    render(<CardResult card={card} />);
    await user.click(screen.getByRole("button", { name: /^collect/i }));
    expect(screen.getByText(/collected/i)).toBeInTheDocument();
  });

  it("offers ONE follow-up and calls onFollowUp with the question", async () => {
    const user = userEvent.setup();
    const onFollowUp = vi.fn().mockResolvedValue(undefined);
    render(<CardResult card={card} canFollowUp onFollowUp={onFollowUp} />);

    await user.click(screen.getByRole("button", { name: /ask something about this card/i }));
    await user.type(screen.getByPlaceholderText(/what does this mean/i), "What about work?");
    await user.click(screen.getByRole("button", { name: /^ask$/i }));

    expect(onFollowUp).toHaveBeenCalledWith("What about work?");
  });

  it("hides the follow-up affordance when canFollowUp is false", () => {
    render(<CardResult card={card} canFollowUp={false} />);
    expect(screen.queryByText(/ask something about this card/i)).not.toBeInTheDocument();
  });

  it("read-only hides follow-up and Today reset, keeps Collect + Spark", () => {
    render(<CardResult card={card} readOnly onReset={() => {}} canFollowUp />);
    expect(screen.queryByText(/ask something about this card/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /today/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /collect/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send a spark/i })).toBeInTheDocument();
  });
});
