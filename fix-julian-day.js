#!/usr/bin/env node

/**
 * Fix Julian Day calculation and verify test case
 */

function calculateJulianDayCorrect(year, month, day, hour = 0, minute = 0, second = 0) {
    // Standard Julian Day calculation algorithm
    let a, y, m;
    
    if (month <= 2) {
        y = year - 1;
        m = month + 12;
    } else {
        y = year;
        m = month;
    }
    
    // Gregorian calendar correction
    let b = 0;
    if (year > 1582 || (year === 1582 && month > 10) || (year === 1582 && month === 10 && day >= 15)) {
        a = Math.floor(y / 100);
        b = 2 - a + Math.floor(a / 4);
    }
    
    // Standard formula
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
    
    // Add time fraction
    const timeFraction = (hour + minute / 60 + second / 3600) / 24;
    
    return jd + timeFraction;
}

// Let's also try a different approach - using a known reference
function calculateJulianDayAlternative(year, month, day, hour = 0, minute = 0, second = 0) {
    // Alternative calculation using JavaScript Date
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const jd = (date.getTime() / 86400000) + 2440587.5;
    return jd;
}

console.log('=== Corrected Julian Day Calculation ===\n');

// Test both methods
const jd_standard = calculateJulianDayCorrect(1985, 1, 4, 1, 0, 0);
const jd_alternative = calculateJulianDayAlternative(1985, 1, 4, 1, 0, 0);

console.log(`Standard method: JD ${jd_standard}`);
console.log(`Alternative method: JD ${jd_alternative}`);

// The correct JD for Jan 4, 1985, 1:00 UTC should be around 2446066.541667
// Let's use the alternative method which should be more reliable
const jd_jan4_1h = jd_alternative;
console.log(`Using JD: ${jd_jan4_1h}`);

// Now let's test what Moon position we should expect
// Using the corrected JD
const T = (jd_jan4_1h - 2451545.0) / 36525.0;
console.log(`\nT (centuries from J2000): ${T}`);

// Calculate fundamental arguments with corrected T
const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000;
const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000;

console.log(`Fundamental arguments:`);
console.log(`D = ${D % 360}°`);
console.log(`M = ${M % 360}°`);
console.log(`Mp = ${Mp % 360}°`);
console.log(`F = ${F % 360}°`);

// Mean longitude
const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
console.log(`\nMean longitude: ${L0 % 360}°`);

// Apply main periodic term
const MpRad = (Mp % 360) * Math.PI / 180;
const mainCorrection = 6.288774 * Math.sin(MpRad);
let moonLongitude = L0 + mainCorrection;
// Proper normalization to 0-360
while (moonLongitude < 0) moonLongitude += 360;
while (moonLongitude >= 360) moonLongitude -= 360;

console.log(`Main periodic correction: ${mainCorrection}°`);
console.log(`Moon longitude (with main term): ${moonLongitude}°`);

// Convert to zodiac
const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const signIndex = Math.floor(moonLongitude / 30);
const degree = Math.floor(moonLongitude % 30);
const minute = Math.floor((moonLongitude % 1) * 60);

console.log(`\nCalculated position: ${signs[signIndex]} ${degree}°${minute}'`);
console.log(`Expected position: Gemini 6°44' (66.73°)`);

const expectedLongitude = 66.73;
const difference = Math.abs(moonLongitude - expectedLongitude);
const normalizedDiff = difference > 180 ? 360 - difference : difference;
console.log(`Difference: ${normalizedDiff.toFixed(2)}° (${(normalizedDiff * 60).toFixed(1)} arc minutes)`);

// Let's also check if the expected position might be wrong
// Maybe the test case is for a different time or the expected value is incorrect
console.log('\n=== Checking different interpretations ===');

// Maybe 6:30 AM IST is actually 6:30 AM local solar time?
// Or maybe the expected position is for a different moment?

// Let's try a few hours around the target time
for (let hour = 0; hour < 24; hour += 2) {
    const testJD = calculateJulianDayCorrect(1985, 1, 4, hour, 0, 0);
    const testT = (testJD - 2451545.0) / 36525.0;
    const testL0 = 218.3164477 + 481267.88123421 * testT - 0.0015786 * testT * testT + testT * testT * testT / 538841 - testT * testT * testT * testT / 65194000;
    const testMp = 134.9633964 + 477198.8675055 * testT + 0.0087414 * testT * testT + testT * testT * testT / 69699 - testT * testT * testT * testT / 14712000;
    const testMpRad = (testMp % 360) * Math.PI / 180;
    const testCorrection = 6.288774 * Math.sin(testMpRad);
    const testMoonLong = (testL0 + testCorrection) % 360;
    
    const testDiff = Math.abs(testMoonLong - expectedLongitude);
    const testNormDiff = testDiff > 180 ? 360 - testDiff : testDiff;
    
    console.log(`${hour}:00 UTC - Moon: ${testMoonLong.toFixed(2)}°, Diff: ${testNormDiff.toFixed(2)}°`);
}