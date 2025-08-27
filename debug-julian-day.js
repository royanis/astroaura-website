#!/usr/bin/env node

/**
 * Debug Julian Day calculation for the primary test case
 */

function calculateJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    
    console.log(`Date components: ${year}-${month}-${day} ${hour}:${minute}:${second} UTC`);
    
    let a, b, y, m;
    
    if (month <= 2) {
        y = year - 1;
        m = month + 12;
    } else {
        y = year;
        m = month;
    }
    
    // Gregorian calendar correction
    if (year > 1582 || (year === 1582 && month > 10) || (year === 1582 && month === 10 && day >= 15)) {
        a = Math.floor(y / 100);
        b = 2 - a + Math.floor(a / 4);
    } else {
        b = 0;
    }
    
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
    
    // Add time fraction
    const timeFraction = (hour + minute / 60 + second / 3600) / 24;
    
    console.log(`Base JD: ${jd}, Time fraction: ${timeFraction}`);
    
    return jd + timeFraction;
}

console.log('=== Julian Day Debug ===\n');

// Test case: January 4, 1985, 6:30 AM IST
// IST = UTC + 5:30, so 6:30 AM IST = 1:00 AM UTC
console.log('Primary test case: January 4, 1985, 6:30 AM IST');

const istDate = new Date('1985-01-04T06:30:00+05:30');
const utcDate = new Date('1985-01-04T01:00:00Z');

console.log('IST Date:', istDate.toISOString());
console.log('UTC Date:', utcDate.toISOString());

const jd1 = calculateJulianDay(utcDate);
console.log(`Calculated JD: ${jd1}`);

// Expected JD from astronomical sources for Jan 4, 1985, 1:00 AM UTC
const expectedJD = 2446066.041667;
console.log(`Expected JD: ${expectedJD}`);
console.log(`Difference: ${Math.abs(jd1 - expectedJD)}`);

// Let's also check what the Moon position should be around this time
// Using a simple approximation to see if we're in the right ballpark
const daysSinceJ2000 = jd1 - 2451545.0;
const approxMoonLongitude = (218.316 + 13.176396 * daysSinceJ2000) % 360;
console.log(`\nApproximate Moon longitude: ${approxMoonLongitude.toFixed(2)}°`);

// Convert to zodiac
const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const signIndex = Math.floor(approxMoonLongitude / 30);
const degree = Math.floor(approxMoonLongitude % 30);
console.log(`Approximate position: ${signs[signIndex]} ${degree}°`);

console.log('\nExpected: Gemini 6°44\' (66.73°)');

// The issue might be that we need to use a different reference time
// Let's try calculating for the exact moment when the Moon should be at 66.73°
console.log('\n=== Reverse calculation ===');
const targetLongitude = 66.73;
// If Moon moves ~13.176° per day, how many days from J2000 to reach 66.73°?
const j2000MoonLongitude = 218.316;
let daysDiff = (targetLongitude - j2000MoonLongitude) / 13.176396;
if (daysDiff < 0) daysDiff += 360 / 13.176396; // Add full lunar month if negative

console.log(`Days from J2000 to reach target: ${daysDiff.toFixed(2)}`);
const targetJD = 2451545.0 + daysDiff;
console.log(`Target JD: ${targetJD.toFixed(6)}`);

const targetDate = new Date((targetJD - 2440587.5) * 86400000);
console.log(`Target date: ${targetDate.toISOString()}`);