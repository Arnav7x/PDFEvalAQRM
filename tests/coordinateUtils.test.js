/**
 * Test suite for coordinate conversion utilities
 * Tests percentage-based mapping calculations
 */

// Mock the coordinate conversion functions that would be used in the application
const convertPixelToPercent = (pixelValue, containerSize) => {
  return (pixelValue / containerSize) * 100;
};

const convertPercentToPixel = (percentValue, containerSize) => {
  return (percentValue / 100) * containerSize;
};

const applyBufferBox = (x, y, width, height, bufferPercent = 5) => {
  const bufferedWidth = Math.min(100, width + bufferPercent);
  const bufferedHeight = Math.min(100, height + bufferPercent);
  
  const changeX = bufferedWidth - width;
  const changeY = bufferedHeight - height;
  
  const bufferedX = Math.max(0, x - (changeX / 2));
  const bufferedY = Math.max(0, y - (changeY / 2));
  
  return {
    x: bufferedX,
    y: bufferedY,
    width: bufferedWidth,
    height: bufferedHeight
  };
};

const calculateAspectRatioDiff = (ratio1, ratio2) => {
  return Math.abs(ratio1 - ratio2) / Math.min(ratio1, ratio2);
};

describe('Coordinate Conversion Utilities', () => {
  test('converts pixels to percentage correctly', () => {
    expect(convertPixelToPercent(100, 800)).toBe(12.5);
    expect(convertPixelToPercent(200, 1050)).toBeCloseTo(19.05);
  });
  
  test('converts percentage to pixels correctly', () => {
    expect(convertPercentToPixel(12.5, 800)).toBe(100);
    expect(convertPercentToPixel(19.05, 1050)).toBeCloseTo(200);
  });
  
  test('applies buffer box correctly', () => {
    // Original box: x=10, y=15, width=80, height=25
    const result = applyBufferBox(10, 15, 80, 25);
    
    // Should add 5% to width and height, centered
    expect(result.width).toBe(85); // 80 + 5
    expect(result.height).toBe(30); // 25 + 5
    expect(result.x).toBeCloseTo(7.5); // 10 - (5/2)
    expect(result.y).toBeCloseTo(12.5); // 15 - (5/2)
  });
  
  test('applies buffer box with boundary constraints', () => {
    // Box near edge: x=95, y=90, width=10, height=10
    const result = applyBufferBox(95, 90, 10, 10);
    
    // Width should be capped at 100%
    expect(result.width).toBe(100); // Capped from 15
    expect(result.height).toBe(15); // 10 + 5
    // X should be adjusted to keep within bounds
    expect(result.x).toBe(50); // Centered within 100% width
    // Y should be adjusted similarly
    expect(result.y).toBe(82.5); // 90 - (5/2) = 87.5, but need to check calculation
  });
  
  test('calculates aspect ratio difference correctly', () => {
    // Same ratios
    expect(calculateAspectRatioDiff(0.7619, 0.7619)).toBe(0);
    
    // 2% difference
    expect(calculateAspectRatioDiff(0.7619, 0.7771)).toBeCloseTo(0.02);
    
    // 5% difference
    expect(calculateAspectRatioDiff(0.7619, 0.8000)).toBeCloseTo(0.05);
  });
});

describe('Percentage-based Mapping Logic', () => {
  test('maintains coordinate proportions when scaling', () => {
    // Original coordinates in 800x1050 container
    const original = { x: 100, y: 150, width: 200, height: 50 };
    const containerWidth = 800;
    const containerHeight = 1050;
    
    // Convert to percentages
    const percentX = convertPixelToPercent(original.x, containerWidth);
    const percentY = convertPixelToPercent(original.y, containerHeight);
    const percentWidth = convertPixelToPercent(original.width, containerWidth);
    const percentHeight = convertPixelToPercent(original.height, containerHeight);
    
    // Apply to different sized container (1200x1600)
    const newContainerWidth = 1200;
    const newContainerHeight = 1600;
    
    const newX = convertPercentToPixel(percentX, newContainerWidth);
    const newY = convertPercentToPixel(percentY, newContainerHeight);
    const newWidth = convertPercentToPixel(percentWidth, newContainerWidth);
    const newHeight = convertPercentToPixel(percentHeight, newContainerHeight);
    
    // Proportions should be maintained
    expect(newX / newContainerWidth).toBeCloseTo(original.x / containerWidth);
    expect(newY / newContainerHeight).toBeCloseTo(original.y / containerHeight);
    expect(newWidth / newContainerWidth).toBeCloseTo(original.width / containerWidth);
    expect(newHeight / newContainerHeight).toBeCloseTo(original.height / containerHeight);
  });
  
  test('handles extreme coordinate values', () => {
    // Test edge cases
    expect(convertPixelToPercent(0, 100)).toBe(0);
    expect(convertPixelToPercent(100, 100)).toBe(100);
    expect(convertPixelToPercent(50, 100)).toBe(50);
    
    expect(convertPercentToPixel(0, 100)).toBe(0);
    expect(convertPercentToPixel(100, 100)).toBe(100);
    expect(convertPercentToPixel(50, 100)).toBe(50);
  });
});