/**
 * detect.js
 *
 * function： ユーザエージェント検出用
 **/

const detectInAppBrowser = function (ua) {
  // get lower ua
  ua = ua.toLowerCase().trim();
  // initialize
  let terminal = '';
  let browser = '';
  let isIOS;

  // iOS Chrome
  if (ua.includes('crios')) {
    terminal = 'iOS';
    browser = 'chrome';
  }

  // terminal detection
  // iOS
  if (ua.includes('iphone') || ua.includes('ipod') || ua.includes('ipad')) {
    terminal = 'iOS';
    isIOS = true;

    // android
  } else if (ua.includes('android')) {
    terminal = 'android';

    // Facebook
  } else if (ua.includes('fbios') || ua.includes('fb_iab')) {
    terminal = 'facebook';

    // Instagram 
  } else if (ua.includes('instagram')) {
    terminal = 'instagram';

    // line
  } else if (ua.includes(' line/')) {
    terminal = 'line';
  }

  // safari
  if (isIOS && ua.includes('safari')) {
    browser = 'safari';
  }

  // chrome
  if (ua.includes('chrome')) {
    browser = 'chrome';
  }

  // firefox
  if (ua.includes('firefox')) {
    browser = 'firefox';
  }

  // edge
  if (ua.includes('edg') || ua.includes('edge')) {
    browser = 'edge';
  }

  return [terminal, browser];
}