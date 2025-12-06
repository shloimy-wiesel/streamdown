import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Streamdown } from "../index";

describe("Table Fullscreen Button", () => {
  const markdownWithTable = `
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Value 1  |
| Row 2    | Data 2   | Value 2  |
| Row 3    | Data 3   | Value 3  |
`;

  it("should render table with fullscreen button when controls are enabled", () => {
    render(<Streamdown>{markdownWithTable}</Streamdown>);

    const fullscreenButton = screen.getByTitle("View fullscreen");
    expect(fullscreenButton).toBeDefined();
  });

  it("should not render fullscreen button when table controls are disabled", () => {
    render(
      <Streamdown controls={{ table: false }}>{markdownWithTable}</Streamdown>
    );

    const fullscreenButton = screen.queryByTitle("View fullscreen");
    expect(fullscreenButton).toBeNull();
  });

  it("should not render fullscreen button when fullscreen control is explicitly disabled", () => {
    render(
      <Streamdown controls={{ table: { fullscreen: false } }}>
        {markdownWithTable}
      </Streamdown>
    );

    const fullscreenButton = screen.queryByTitle("View fullscreen");
    expect(fullscreenButton).toBeNull();
  });

  it("should open fullscreen modal when button is clicked", async () => {
    render(<Streamdown>{markdownWithTable}</Streamdown>);

    const fullscreenButton = screen.getByTitle("View fullscreen");
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      const exitButton = screen.getByTitle("Exit fullscreen");
      expect(exitButton).toBeDefined();
    });
  });

  it("should display table content in fullscreen modal", async () => {
    render(<Streamdown>{markdownWithTable}</Streamdown>);

    const fullscreenButton = screen.getByTitle("View fullscreen");
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      // Check that table content is visible in fullscreen
      const cells = screen.getAllByText(/Row 1|Column 1/);
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it("should close fullscreen modal when exit button is clicked", async () => {
    render(<Streamdown>{markdownWithTable}</Streamdown>);

    const fullscreenButton = screen.getByTitle("View fullscreen");
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      const exitButton = screen.getByTitle("Exit fullscreen");
      expect(exitButton).toBeDefined();
    });

    const exitButton = screen.getByTitle("Exit fullscreen");
    fireEvent.click(exitButton);

    await waitFor(() => {
      const exitButtonAfter = screen.queryByTitle("Exit fullscreen");
      expect(exitButtonAfter).toBeNull();
    });
  });

  it("should show other table controls alongside fullscreen button", () => {
    render(<Streamdown>{markdownWithTable}</Streamdown>);

    const fullscreenButton = screen.getByTitle("View fullscreen");
    const copyButton = screen.getByTitle("Copy table");
    const downloadButton = screen.getByTitle("Download table");

    expect(fullscreenButton).toBeDefined();
    expect(copyButton).toBeDefined();
    expect(downloadButton).toBeDefined();
  });
});
