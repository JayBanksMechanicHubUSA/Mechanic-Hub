/* Mechanic Hub — site behaviour: navigation, form validation and submission. */
(function () {
  'use strict';
  var PREVIEW = !!window.MH_PREVIEW;

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function closeNav() {
    if (!toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); toggle.focus(); }
    });
  }
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var yr = document.querySelectorAll('[data-year]');
  for (var y = 0; y < yr.length; y++) yr[y].textContent = new Date().getFullYear();

  /* ---------- Forms ---------- */
  var R = window.MHRules;
  var FORM_KEYS = { 'client-form': 'client', 'tech-form': 'technician' };

  function collect(form, rules) {
    var fd = new FormData(form), out = {};
    Object.keys(rules).forEach(function (name) {
      var rule = rules[name];
      if (rule.type === 'multi') out[name] = fd.getAll(name);
      else if (rule.type === 'bool') out[name] = fd.get(name) === 'yes';
      else out[name] = (fd.get(name) || '').toString().trim();
    });
    return out;
  }

  function errEl(form, name) {
    var prefix = form.id === 'client-form' ? 'c-' : 't-';
    return document.getElementById(prefix + name + '-err');
  }

  function setError(form, name, msg) {
    var el = errEl(form, name);
    var input = form.querySelector('[name="' + name + '"]');
    var field = input && (input.closest('.field') || input.closest('.consent'));
    if (el) el.textContent = msg || '';
    if (field) field.classList.toggle('has-error', !!msg);
    if (input && input.type !== 'radio' && input.type !== 'checkbox') {
      if (msg) { input.setAttribute('aria-invalid', 'true'); if (el) input.setAttribute('aria-errormessage', el.id); }
      else { input.removeAttribute('aria-invalid'); }
    }
    if (input && input.type === 'checkbox' && input.closest('.consent')) {
      input.closest('.consent').classList.toggle('has-error', !!msg);
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
  }

  function checkResume(form) {
    var input = form.querySelector('input[type="file"][name="resume"]');
    if (!input || !input.files || !input.files[0]) return '';
    var f = input.files[0];
    var ext = (f.name.split('.').pop() || '').toLowerCase();
    if (R.RESUME.extensions.indexOf(ext) === -1) return 'Upload a PDF, DOC or DOCX file.';
    if (f.size > R.RESUME.maxBytes) return 'That file is over 5 MB. Please upload a smaller file.';
    if (f.size === 0) return 'That file appears to be empty.';
    return '';
  }

  function validate(form, rules, onlyName) {
    var data = collect(form, rules), firstBad = null;
    Object.keys(rules).forEach(function (name) {
      if (onlyName && name !== onlyName) return;
      var msg = R.checkField(rules[name], data[name]);
      setError(form, name, msg);
      if (msg && !firstBad) firstBad = name;
    });
    if (!onlyName || onlyName === 'resume') {
      var rmsg = checkResume(form);
      if (form.querySelector('[name="resume"]')) setError(form, 'resume', rmsg);
      if (rmsg && !firstBad) firstBad = 'resume';
    }
    return firstBad;
  }

  function showStatus(form, kind, title, body) {
    var box = form.querySelector('.form-status');
    box.className = 'form-status is-' + kind;
    box.innerHTML = '';
    var t = document.createElement('strong'); t.textContent = title;
    var b = document.createElement('span'); b.textContent = body;
    box.appendChild(t); box.appendChild(b);
    box.hidden = false;
  }

  function showSuccess(form, kind, ref) {
    var wrap = form.closest('[data-form-wrap]');
    var box = document.createElement('div');
    box.className = 'form-success';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    var isClient = kind === 'client';
    box.innerHTML =
      '<div class="tick" aria-hidden="true">✓</div>' +
      '<h2>' + (isClient ? 'Inquiry received.' : 'Profile received.') + '</h2>' +
      '<p>' + (isClient
        ? 'Thanks. We have your role details and will be in touch to talk through the search, the timeline and your ad budget.'
        : 'Thanks. We\'ll review your experience and reach out when a role fits your skills and goals. We won\'t share your profile with a shop before talking it through with you.') + '</p>' +
      '<p class="ref"></p>' +
      '<a class="btn" href="/">Back to home</a>';
    box.querySelector('.ref').textContent = ref ? 'Reference: ' + ref : '';
    if (PREVIEW) {
      box.querySelector('h2').textContent = 'Looks good. Preview only.';
      box.querySelectorAll('p')[0].textContent = 'Every field passed validation. This preview isn\'t connected to a server, so nothing was sent. On your live site, this form posts securely to your server, which stores it and forwards it to GoHighLevel once connected.';
      var again = document.createElement('button');
      again.type = 'button'; again.className = 'btn'; again.textContent = 'Back to the form';
      again.addEventListener('click', function () { box.remove(); form.hidden = false; form.querySelector('input:not([type=hidden])').focus(); });
      box.querySelector('a.btn').replaceWith(again);
    }
    form.hidden = true;
    wrap.appendChild(box);
    box.focus();
    box.scrollIntoView({ block: 'start' });
  }

  function setLoading(btn, on) {
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  Object.keys(FORM_KEYS).forEach(function (id) {
    var form = document.getElementById(id);
    if (!form || !R) return;
    var kind = FORM_KEYS[id];
    var rules = R.FORMS[kind];
    var started = form.querySelector('[name="form_started"]');
    if (started) started.value = String(Date.now());

    // Validate a field once the person leaves it, then live while they fix it.
    form.addEventListener('focusout', function (e) {
      var n = e.target.name;
      if (n && (rules[n] || n === 'resume') && e.target.type !== 'radio' && e.target.type !== 'checkbox') validate(form, rules, n);
    });
    form.addEventListener('input', function (e) {
      var n = e.target.name; if (!n) return;
      var field = e.target.closest('.field, .consent');
      if (field && field.classList.contains('has-error')) validate(form, rules, n);
    });
    form.addEventListener('change', function (e) {
      var n = e.target.name; if (!n) return;
      if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.type === 'file' || e.target.tagName === 'SELECT') validate(form, rules, n);
    });
    // Tidy phone numbers into (555) 555-0123 once entered.
    form.querySelectorAll('[data-validate="phone"]').forEach(function (inp) {
      inp.addEventListener('blur', function () { if (R.normalizePhone(inp.value).length === 10) inp.value = R.formatPhone(inp.value); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      status.hidden = true;
      var bad = validate(form, rules);
      if (bad) {
        showStatus(form, 'error', 'Please check the highlighted fields.', 'A few details need fixing before we can send this.');
        var target = form.querySelector('[name="' + bad + '"]');
        if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'center' }); }
        return;
      }
      if (PREVIEW) { showSuccess(form, kind, ''); return; }

      var btn = form.querySelector('button[type="submit"]');
      setLoading(btn, true);
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 45000);
      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'fetch' },
        signal: ctrl.signal
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { res: res, body: body }; });
      }).then(function (r) {
        clearTimeout(timer);
        setLoading(btn, false);
        if (r.res.ok && r.body && r.body.ok) { showSuccess(form, kind, r.body.reference); return; }
        if (r.res.status === 422 && r.body.errors) {
          var first = null;
          Object.keys(r.body.errors).forEach(function (n) { setError(form, n, r.body.errors[n]); if (!first) first = n; });
          showStatus(form, 'error', 'Please check the highlighted fields.', 'Our server flagged a few details.');
          var t = first && form.querySelector('[name="' + first + '"]'); if (t) t.focus();
          return;
        }
        if (r.res.status === 429) {
          showStatus(form, 'error', 'Too many attempts.', r.body.message || 'Please wait a few minutes and try again.');
          return;
        }
        showStatus(form, 'error', 'We couldn\'t send this.', (r.body && r.body.message) || 'Something went wrong on our side. Your details are still in the form, so please try again shortly.');
      }).catch(function () {
        clearTimeout(timer);
        setLoading(btn, false);
        showStatus(form, 'error', 'Connection problem.', 'We couldn\'t reach our server. Check your connection and try again. Your details are still in the form.');
      });
    });
  });
})();
