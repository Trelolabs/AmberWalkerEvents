import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };

export function createSocialImage(title: string) {
  const heading = title.replace(/ \| Amber Walker Events$/, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 96px",
        color: "white",
        background: "#000",
        textAlign: "center",
      }}
    >
      <div style={{ color: "#a8afd8", fontSize: 28, letterSpacing: 8, textTransform: "uppercase" }}>Amber Walker Events</div>
      <div style={{ width: 120, height: 3, margin: "44px 0", background: "#a8afd8" }} />
      <div style={{ maxWidth: 980, fontSize: heading.length > 68 ? 48 : 62, lineHeight: 1.08 }}>{heading}</div>
      <div style={{ marginTop: 42, fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}>Luxury event planning across North America</div>
    </div>,
    socialImageSize,
  );
}
