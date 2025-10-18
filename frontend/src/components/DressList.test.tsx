import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import DressList from "./DressList";

type DressListProps = ComponentProps<typeof DressList>;

const createDress = (overrides: Partial<DressListProps["dresses"][number]> = {}) => ({
  id: 1,
  name: "Test Dress",
  image_path: "1.png",
  silhouette: "A-line",
  shipin48hrs: true,
  neckline: "V-neck",
  strapsleevelayout: "Straps",
  length: "Floor Length",
  collection: "Golden Hour",
  fabric: "Organza",
  color: "Ivory",
  backstyle: "Zip-up",
  price: 1500,
  size_range: "2-18",
  tags: ["elegant"],
  weddingvenue: ["garden"],
  season: "spring",
  embellishments: ["beading"],
  features: ["pockets"],
  has_pockets: true,
  corset_back: false,
  score: 1000,
  ...overrides,
});

const commonProps: Pick<DressListProps, "sectionOrder" | "selectedOrder"> = {
  sectionOrder: ["Color", "Fabric"],
  selectedOrder: {
    color: ["Ivory", "White"],
    fabric: ["Organza", "Chiffon"],
  },
};

describe("DressList match insights", () => {
  it("displays counts for high-priority and total matches", () => {
    render(
      <DressList
        dresses={[createDress({ id: 11 })]}
        totalCount={1}
        {...commonProps}
      />
    );

    expect(
      screen.getByLabelText(/This item has 2 features in your top 3\. Overall matches: 2 features\./)
    ).toBeInTheDocument();
  });

  it("uses singular language when only one feature matches", () => {
    render(
      <DressList
        dresses={[createDress({ id: 22, color: "White", fabric: "Lace" })]}
        totalCount={1}
        {...commonProps}
      />
    );

    expect(
      screen.getByLabelText(/This item has 1 feature in your top 3\. Overall matches: 1 feature\./)
    ).toBeInTheDocument();
  });

  it("omits the insight badge when a dress has no selected features", () => {
    render(
      <DressList
        dresses={[createDress({ id: 33, color: "Blue", fabric: "Tulle", features: [], tags: [], score: 0 })]}
        totalCount={1}
        {...commonProps}
      />
    );

    expect(screen.queryByTestId("match-insights-33")).not.toBeInTheDocument();
  });

  it("adjusts the top label when fewer than three priorities exist", () => {
    render(
      <DressList
        dresses={[createDress({ id: 44 })]}
        totalCount={1}
        sectionOrder={["Color"]}
        selectedOrder={{ color: ["Ivory"] }}
      />
    );

    expect(
      screen.getByLabelText(/This item has 1 feature in your top 1\. Overall matches: 1 feature\./)
    ).toBeInTheDocument();
  });
});
