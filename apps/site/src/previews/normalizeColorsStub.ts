const clampChannel = (value: number) => Math.max(0, Math.min(255, value));

const expandHex = (hex: string) =>
  hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");

const rgbaToInt = (red: number, green: number, blue: number, alpha = 255) =>
  (((clampChannel(red) & 255) << 24) |
    ((clampChannel(green) & 255) << 16) |
    ((clampChannel(blue) & 255) << 8) |
    (clampChannel(alpha) & 255)) >>>
  0;

const parseAlpha = (value: string | undefined) => {
  if (!value) {
    return 255;
  }

  if (value.endsWith("%")) {
    return Math.round((Number.parseFloat(value) / 100) * 255);
  }

  const parsed = Number.parseFloat(value);
  return parsed <= 1 ? Math.round(parsed * 255) : Math.round(parsed);
};

export default function normalizeColor(color: unknown): number | null {
  if (typeof color === "number") {
    return color >>> 0 === color ? color : null;
  }

  if (typeof color !== "string") {
    return null;
  }

  const value = color.trim().toLowerCase();

  if (value === "transparent") {
    return 0;
  }

  if (value.startsWith("#")) {
    const raw = value.slice(1);
    const hex =
      raw.length === 3 || raw.length === 4
        ? expandHex(raw)
        : raw.length === 6
          ? `${raw}ff`
          : raw;

    return hex.length === 8 ? Number.parseInt(hex, 16) >>> 0 : null;
  }

  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.%]+))?\s*\)$/
  );

  if (rgb) {
    return rgbaToInt(
      Math.round(Number.parseFloat(rgb[1] ?? "0")),
      Math.round(Number.parseFloat(rgb[2] ?? "0")),
      Math.round(Number.parseFloat(rgb[3] ?? "0")),
      parseAlpha(rgb[4])
    );
  }

  return null;
}
