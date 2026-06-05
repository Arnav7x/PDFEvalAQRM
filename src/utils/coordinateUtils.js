const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;

export const convertPixelToPercent = (pixelValue, containerSize) => {
  if (!containerSize) return 0;
  return roundToTwoDecimals((pixelValue / containerSize) * 100);
};

export const convertPercentToPixel = (percentValue, containerSize) => {
  if (!containerSize) return 0;
  return Math.round((percentValue / 100) * containerSize);
};

export const applyBufferBox = (x, y, width, height, bufferPercent = 5) => {
  const safeWidth = clamp(Number(width) || 0, 0, 100);
  const safeHeight = clamp(Number(height) || 0, 0, 100);
  const bufferedWidth = clamp(safeWidth + bufferPercent, 0, 100);
  const bufferedHeight = clamp(safeHeight + bufferPercent, 0, 100);

  const centeredX = (Number(x) || 0) - ((bufferedWidth - safeWidth) / 2);
  const centeredY = (Number(y) || 0) - ((bufferedHeight - safeHeight) / 2);

  return {
    x: roundToTwoDecimals(clamp(centeredX, 0, 100 - bufferedWidth)),
    y: roundToTwoDecimals(clamp(centeredY, 0, 100 - bufferedHeight)),
    width: roundToTwoDecimals(bufferedWidth),
    height: roundToTwoDecimals(bufferedHeight)
  };
};

export const normalizeRegionBounds = (region) => {
  const width = clamp(Number(region.width) || 0, 0, 100);
  const height = clamp(Number(region.height) || 0, 0, 100);
  const x = clamp(Number(region.x) || 0, 0, 100 - width);
  const y = clamp(Number(region.y) || 0, 0, 100 - height);

  return {
    ...region,
    page: Math.max(1, Number(region.page) || 1),
    x: roundToTwoDecimals(x),
    y: roundToTwoDecimals(y),
    width: roundToTwoDecimals(width),
    height: roundToTwoDecimals(height)
  };
};
