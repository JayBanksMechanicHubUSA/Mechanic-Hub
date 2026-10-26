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
      full_name: { label: 'Full name', type: 'text', required: true, max: 120 },
      business_name: { label: 'Business / shop name', type: 'text', required: true, max: 160 },
      work_email: { label: 'Work email', type: 'email', required: true, max: 200 },
      phone: { label: 'Phone number', type: 'phone', required: true, max: 30 },
      shop_city: { label: 'Shop city', type: 'text', required: true, max: 100 },
      shop_state: { label: 'Shop state', type: 'enum', required: true, options: STATE_CODES },
      locations_count: { label: 'Number of locations', type: 'int', required: true, min: 1, max: 999 },
      tech_level: { label: 'Technician level', type: 'enum', required: true, options: ['Master', 'A-Level', 'B-Level', 'Multiple levels'] },
      techs_needed: { label: 'Number of technicians', type: 'int', required: true, min: 1, max: 99 },
      position_description: { label: 'Position description', type: 'text', required: true, minLen: 20, max: 3000 },
      pay_range: { label: 'Pay range', type: 'text', required: true, max: 120 },
      website: { label: 'Business website', type: 'url', max: 200 },
      shop_type: { label: 'Shop type', type: 'enum', options: ['Independent repair shop', 'Dealership', 'Fleet maintenance', 'Other'] },
      hiring_timeline: { label: 'Hiring timeline', type: 'enum', options: ['As soon as possible', 'Within 30 days', 'Within 60 days', 'Within 90 days', 'Just exploring'] },
      open_nationwide: { label: 'Open to nationwide recruitment', type: 'enum', options: YNM },
      open_relocation: { label: 'Open to relocation candidates', type: 'enum', options: YNM },
      additional_info: { label: 'Additional information', type: 'text', max: 3000 },
      consent_authorized: { label: 'Authorization and Privacy Policy', type: 'bool', required: true },
      consent_sms: { label: 'Automated calls/texts consent', type: 'bool' }
    },
    technician: {
      full_name: { label: 'Full name', type: 'text', required: true, max: 120 },
      email: { label: 'Email address', type: 'email', required: true, max: 200 },
      phone: { label: 'Phone number', type: 'phone', required: true, max: 30 },
      city: { label: 'Current city', type: 'text', required: true, max: 100 },
      state: { label: 'Current state', type: 'enum', required: true, options: STATE_CODES },
      years_experience: { label: 'Years of experience', type: 'int', required: true, min: 0, max: 60 },
      tech_level: { label: 'Technician level', type: 'enum', required: true, options: ['Master', 'A-Level', 'B-Level', 'Other'] },
      employment_status: { label: 'Employment status', type: 'enum', required: true, options: ['Employed full-time', 'Employed part-time', 'Self-employed / mobile tech', 'Not currently employed', 'Other'] },
      expertise: {
        label: 'Areas of expertise', type: 'multi', required: true, min: 1,
        options: ['Engine diagnostics & repair', 'Electrical & electronics', 'Drivability', 'Transmission & drivetrain', 'Brakes, steering & suspension', 'HVAC', 'Hybrid & EV', 'Diesel', 'ADAS calibration', 'Maintenance & light repair', 'Other']
      },
      experience_summary: { label: 'Experience description', type: 'text', required: true, minLen: 20, max: 3000 },
      linkedin: { label: 'LinkedIn profile', type: 'url', max: 200 },
      certifications: { label: 'Certifications', type: 'text', max: 300 },
      makes_models: { label: 'Makes and models', type: 'text', max: 300 },
      diagnostic_equipment: { label: 'Diagnostic equipment', type: 'text', max: 300 },
      tool_value: { label: 'Tool value', type: 'enum', options: ['Under $5,000', '$5,000–$15,000', '$15,000–$30,000', '$30,000–$50,000', 'Over $50,000'] },
      bumper_to_bumper: { label: 'Bumper-to-bumper capability', type: 'enum', options: ['Yes', 'No', 'Partially'] },
      preferred_locations: { label: 'Preferred locations', type: 'text', max: 300 },
      min_compensation: { label: 'Minimum compensation', type: 'text', max: 120 },
      willing_relocate: { label: 'Willing to relocate', type: 'enum', options: YNM },
      relocation_notes: { label: 'Relocation notes', type: 'text', max: 1500 },
      start_date: { label: 'Earliest start date', type: 'date' },
      additional_info: { label: 'Additional information', type: 'text', max: 3000 },
      consent_privacy: { label: 'Privacy consent', type: 'bool', required: true },
      consent_sms: { label: 'Automated calls/texts consent', type: 'bool' }
    }
  };

  var RESUME = {
    maxBytes: 5 * 1024 * 1024,
    extensions: ['pdf', 'doc', 'docx']
  };

  // Strings stored with each submission so you can show exactly what someone agreed to.
  var CONSENT_TEXT = {
    client_authorized: 'I am authorized to submit this inquiry on behalf of the business named above, and I agree to the Privacy Policy. Mechanic Hub may contact me by email and phone about this inquiry.',
    client_sms: 'I agree to receive calls and text messages from Mechanic Hub about this inquiry at the number above, including calls and texts made using automated technology or an artificial or prerecorded voice. Consent is not a condition of service. Message and data rates may apply. Reply STOP to opt out.',
    tech_privacy: 'I agree that Mechanic Hub may store and process my information to consider me for automotive technician roles, as described in the Privacy Policy, and may contact me by email and phone about opportunities. I understand my profile won\'t be shared with an employer without first discussing the specific opportunity with me.',
    tech_sms: 'I agree to receive calls and text messages from Mechanic Hub about job opportunities at the number above, including calls and texts made using automated technology or an artificial or prerecorded voice. Consent is not a condition of applying. Message and data rates may apply. Reply STOP to opt out.',
    version: '2026-10-24'
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
