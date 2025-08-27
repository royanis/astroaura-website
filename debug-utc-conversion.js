// Quick test to debug UTC conversion
console.log('=== UTC CONVERSION DEBUG ===');

// Test the timezone conversion directly
const testDate = '1985-01-04';
const testTime = '06:30';
const testLocation = {
    name: 'Prayagraj, India',
    lat: 25.4358,
    lng: 81.8463,
    timezone: 'Asia/Kolkata'
};

console.log('Input:', testDate, testTime, testLocation.timezone);

// Manual UTC conversion: 6:30 AM IST = 1:00 AM UTC
const expectedUTC = new Date('1985-01-04T01:00:00.000Z');
console.log('Expected UTC:', expectedUTC.toISOString());
console.log('Expected Julian Day:', calculateJulianDay(expectedUTC));

// Test our timezone converter
async function testConversion() {
    try {
        const timezoneService = new TimezoneService();
        const converter = new TimezoneAwareConverter(timezoneService);
        
        const result = await converter.convertBirthTimeToUTC(testDate, testTime, testLocation);
        
        console.log('Our UTC result:', result.utc.toISOString());
        console.log('Our Julian Day:', calculateJulianDay(result.utc));
        
        const timeDiff = Math.abs(result.utc.getTime() - expectedUTC.getTime()) / (1000 * 60);
        console.log('Time difference:', timeDiff, 'minutes');
        
    } catch (error) {
        console.error('Conversion failed:', error);
    }
}

function calculateJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    
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
    
    return jd + timeFraction;
}

// Run the test if in browser environment
if (typeof window !== 'undefined') {
    testConversion();
}