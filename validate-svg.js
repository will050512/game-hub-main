const fs = require('fs');
const svg = fs.readFileSync('public/images/survivor-thumb.svg', 'utf8');

console.log('=== SVG Validation ===');
console.log('Has circle elements:', svg.includes('<circle'));
console.log('Has linearGradient:', svg.includes('linearGradient'));
console.log('Has filter:', svg.includes('<filter'));
console.log('Has correct viewBox:', svg.includes('viewBox="0 0 640 360"'));
console.log('Has role=img:', svg.includes('role="img"'));
console.log('Has aria-label:', svg.includes('aria-label'));
console.log('Has title text:', svg.includes('暗夜倖存者'));

const rects = (svg.match(/<rect/g) || []).length;
console.log('Rect count:', rects);

// Check for any curved path commands
const pathMatches = svg.match(/<path[^>]*d="[^"]*"/g);
let hasCurved = false;
if (pathMatches) {
  pathMatches.forEach(p => {
    if (/[\d\s][CQASZcqtaz]/.test(p)) hasCurved = true;
  });
}
console.log('Has curved paths:', hasCurved);
console.log('=== Validation Complete ===');
