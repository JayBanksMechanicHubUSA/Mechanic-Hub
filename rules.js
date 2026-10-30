/*
 * Mechanic Hub — form rules.
 * Single source of truth used by BOTH the browser (public/js/rules.js) and the
 * server (server.js). The server always re-validates; browser checks are only
 * for a faster, friendlier experience.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MHRules = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var US_STATES = [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
    ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'],
    ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
    ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
    ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'],
    ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
    ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
    ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['PR', 'Puerto Rico'], ['RI', 'Rhode Island'],
    ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
    ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'],
    ['WY', 'Wyoming']
  ];
  var STATE_CODES = US_STATES.map(function (s) { return s[0]; });
  var YNM = ['Yes', 'No', 'Maybe'];

  var FORMS = {
    client: {
      first_name: { label: 'First name', type: 'text', required: true, max: 60 },
      last_name: { label: 'Last name', type: 'text', required: true, max: 60 },
      shop_name: { label: 'Shop name', type: 'text', required: true, max: 160 },
      email: { label: 'Email address', type: 'email', required: true, max: 200 },
      phone: { label: 'Phone number', type: 'phone', required: true, max: 30 },
      city: { label: 'City', type: 'text', required: true, max: 100 },
      state: { label: 'State', type: 'enum', required: true, options: STATE_CODES },
      consent_authorized: { label: 'Contact consent', type: 'bool', required: true }
    },
    technician: {
      first_name: { label: 'First name', type: 'text', required: true, max: 60 },
      last_name: { label: 'Last name', type: 'text', required: true, max: 60 },
      email: { label: 'Email address', type: 'email', required: true, max: 200 },
      phone: { label: 'Phone number', type: 'phone', required: true, max: 30 },
      city: { label: 'City', type: 'text', required: true, max: 100 },
      state: { label: 'State', type: 'enum', required: true, options: STATE_CODES },
      tech_level: { label: 'Technician level', type: 'enum', required: true, options: ['Master', 'A-Level', 'B-Level', 'Other'] },
      years_experience: { label: 'Years of experience', type: 'int', required: true, min: 0, max: 60 },
      tool_value: { label: 'Total invested in tools', type: 'enum', required: true, options: ['Under $5,000', '$5,000–$15,000', '$15,000–$30,000', '$30,000–$50,000', 'Over $50,000'] },
      certifications: { label: 'Active certifications', type: 'text', max: 300 },
      consent_privacy: { label: 'Contact consent', type: 'bool', required: true }
    }
  };

  var RESUME = {
    maxBytes: 5 * 1024 * 1024,
    extensions: ['pdf', 'doc', 'docx']
  };

  // Strings stored with each submission so you can show exactly what someone agreed to.
  var CONSENT_TEXT = {
    client_authorized: 'I agree to the Privacy Policy and to be contacted by Mechanic Hub by phone, text (including automated or AI calls and texts) and email. Not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out.',
    client_sms: 'I agree to the Privacy Policy and to be contacted by Mechanic Hub by phone, text (including automated or AI calls and texts) and email. Not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out.',
    tech_privacy: 'I agree to the Privacy Policy and to be contacted by Mechanic Hub about job opportunities by phone, text (including automated or AI calls and texts) and email. Not a condition of applying. Msg & data rates may apply. Reply STOP to opt out.',
    tech_sms: 'I agree to the Privacy Policy and to be contacted by Mechanic Hub about job opportunities by phone, text (including automated or AI calls and texts) and email. Not a condition of applying. Msg & data rates may apply. Reply STOP to opt out.',
    version: '2026-10-30'
  };

  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

  function normalizePhone(v) {
    var digits = String(v).replace(/\D/g, '');
    if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1);
    return digits;
  }

  /** Validate one value. Returns an error string or ''. `value` is string, array (multi) or boolean. */
  function checkField(rule, value) {
    var isEmpty = value === undefined || value === null || value === '' || value === false ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      if (!rule.required) return '';
      if (rule.type === 'bool') return 'Please check this box to continue.';
      if (rule.type === 'enum' || rule.type === 'multi') return 'Please choose ' + (rule.type === 'multi' ? 'at least one option.' : 'an option.');
      return 'Please enter your ' + rule.label.toLowerCase() + '.';
    }
    if (rule.type === 'multi') {
      if (!Array.isArray(value)) value = [value];
      if (rule.min && value.length < rule.min) return 'Please choose at least ' + rule.min + ' option.';
      for (var i = 0; i < value.length; i++) if (rule.options.indexOf(value[i]) === -1) return 'Please choose from the listed options.';
      return '';
    }
    if (rule.type === 'bool') return '';
    var s = String(value).trim();
    if (rule.max && s.length > rule.max) return 'Please keep this under ' + rule.max + ' characters.';
    if (rule.minLen && s.length < rule.minLen) return 'Please add a little more detail (at least ' + rule.minLen + ' characters).';
    switch (rule.type) {
      case 'email':
        return EMAIL_RE.test(s) ? '' : 'Enter a valid email address, like name@yourshop.com.';
      case 'phone':
        var d = normalizePhone(s);
        if (!/^[0-9+().\-\s]+$/.test(s)) return 'Use digits only, like (555) 555-0123.';
        return d.length === 10 ? '' : 'Enter a 10-digit U.S. phone number, like (555) 555-0123.';
      case 'int':
        if (!/^\d+$/.test(s)) return 'Enter a whole number.';
        var n = parseInt(s, 10);
        if (rule.min !== undefined && n < rule.min) return 'Enter a number of at least ' + rule.min + '.';
        if (rule.max !== undefined && n > rule.max) return 'Enter a number no higher than ' + rule.max + '.';
        return '';
      case 'url':
        var u = /^https?:\/\//i.test(s) ? s : 'https://' + s;
        try { var p = new URL(u); return /\./.test(p.hostname) ? '' : 'Enter a valid web address.'; }
        catch (e) { return 'Enter a valid web address.'; }
      case 'enum':
        return rule.options.indexOf(s) === -1 ? 'Please choose from the listed options.' : '';
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s))) return 'Enter a valid date.';
        return '';
      default:
        return '';
    }
  }

  function formatPhone(v) {
    var d = normalizePhone(v);
    return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : String(v).trim();
  }

  return { FORMS: FORMS, US_STATES: US_STATES, RESUME: RESUME, CONSENT_TEXT: CONSENT_TEXT, checkField: checkField, normalizePhone: normalizePhone, formatPhone: formatPhone };
});
