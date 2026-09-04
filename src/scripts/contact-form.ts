/**
 * Contact form enhancement.
 *
 * The form posts to Web3Forms natively with JavaScript disabled. This module
 * upgrades it: inline validation messages, a fetch submit that keeps the
 * visitor on the page, and a searchable country selector for the phone field.
 */

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const phoneE164 = form.querySelector<HTMLInputElement>('[data-phone-e164]')!;
  const phoneLocal = form.querySelector<HTMLInputElement>('#cf-phone')!;
  const fallbackEmail = form.dataset.fallbackEmail ?? '';

  /* ---------------------------------------------------------------- timing */

  // A human takes longer than this to read the labels and type three fields.
  const MIN_SECONDS = 3;
  const openedAt = Date.now();

  /* ------------------------------------------------------------ validation */

  const MESSAGES: Record<string, { valueMissing: string; typeMismatch?: string }> = {
    'cf-name': { valueMissing: 'Please tell me your name.' },
    'cf-email': {
      valueMissing: 'Please add an email address so I can reply.',
      typeMismatch: "That doesn't look like an email address.",
    },
    'cf-message': { valueMissing: 'Please add a short message.' },
  };

  const fields = Object.keys(MESSAGES)
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLInputElement | HTMLTextAreaElement => el !== null);

  function messageFor(field: HTMLInputElement | HTMLTextAreaElement): string {
    const copy = MESSAGES[field.id];
    if (!copy) return field.validationMessage;
    if (field.validity.valueMissing) return copy.valueMissing;
    if (field.validity.typeMismatch && copy.typeMismatch) return copy.typeMismatch;
    return field.validationMessage;
  }

  function showError(field: HTMLInputElement | HTMLTextAreaElement, show: boolean) {
    const target = form!.querySelector<HTMLElement>(`[data-error-for="${field.id}"]`);
    if (!target) return;
    if (show) {
      target.textContent = messageFor(field);
      field.setAttribute('aria-invalid', 'true');
    } else {
      target.textContent = '';
      field.removeAttribute('aria-invalid');
    }
  }

  for (const field of fields) {
    // Validate on blur, then live-correct once the visitor has been told.
    field.addEventListener('blur', () => showError(field, !field.checkValidity()));
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) showError(field, !field.checkValidity());
    });
  }

  function validateAll(): boolean {
    let firstInvalid: HTMLInputElement | HTMLTextAreaElement | undefined;
    for (const field of fields) {
      const ok = field.checkValidity();
      showError(field, !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  /* ------------------------------------------------------- country selector */

  const phone = form.querySelector<HTMLElement>('[data-phone]');
  let dial = '+233';

  if (phone) {
    const toggle = phone.querySelector<HTMLButtonElement>('[data-cc-toggle]')!;
    const menu = phone.querySelector<HTMLElement>('#cf-country-menu')!;
    const search = phone.querySelector<HTMLInputElement>('[data-cc-search]')!;
    const flag = phone.querySelector<HTMLImageElement>('[data-cc-flag]')!;
    const dialLabel = phone.querySelector<HTMLElement>('[data-cc-dial]')!;
    const empty = phone.querySelector<HTMLElement>('[data-cc-empty]')!;
    const options = [...phone.querySelectorAll<HTMLButtonElement>('.phone__option')];

    dial = dialLabel.textContent?.trim() || dial;

    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      if (open) search.focus();
    };

    toggle.addEventListener('click', () =>
      setOpen(toggle.getAttribute('aria-expanded') !== 'true')
    );

    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase().replace(/^\+/, '');
      let shown = 0;
      for (const option of options) {
        const { name = '', dial: d = '', code = '' } = option.dataset;
        const match =
          !q || name.toLowerCase().includes(q) || d.replace('+', '').includes(q) || code === q;
        option.parentElement!.hidden = !match;
        if (match) shown++;
      }
      empty.hidden = shown > 0;
    });

    for (const option of options) {
      option.addEventListener('click', () => {
        const { code, name, dial: d } = option.dataset;
        flag.src = `/flags/${code}.png`;
        dialLabel.textContent = d ?? '';
        dial = d ?? dial;
        toggle.setAttribute('aria-label', `Country calling code, currently ${name} ${d}`);
        setOpen(false);
        toggle.focus();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (e.target instanceof Node && !phone.contains(e.target)) setOpen(false);
    });
  }

  /** Country code plus the local number, digits only, in E.164 form. */
  function toE164(): string {
    const local = phoneLocal.value.replace(/\D/g, '').replace(/^0+/, '');
    return local ? `${dial}${local}` : '';
  }

  // Keep the hidden field current so a no-JS submit still carries the number.
  phoneLocal.addEventListener('input', () => {
    phoneE164.value = toE164();
  });

  /* ----------------------------------------------------------- submission */

  function setStatus(text: string, state: '' | 'success' | 'error' | 'pending') {
    status.textContent = text;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    if (!validateAll()) {
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }

    if ((Date.now() - openedAt) / 1000 < MIN_SECONDS) {
      setStatus('That was quick — give it a moment and try again.', 'error');
      return;
    }

    phoneE164.value = toE164();

    submit.disabled = true;
    submitLabel.textContent = 'Sending…';
    setStatus('Sending…', 'pending');

    try {
      const body = new FormData(form);
      // `redirect` only applies to the no-JS flow; drop it from the fetch.
      body.delete('redirect');
      body.delete('phone_local');

      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean };

      if (!res.ok || data.success === false) throw new Error('rejected');

      form.reset();
      setStatus('Thanks — your message is on its way.', 'success');
    } catch {
      // The typed message is untouched, so the visitor can retry or copy it.
      setStatus(`Couldn't send. Please email ${fallbackEmail} directly.`, 'error');
    } finally {
      submit.disabled = false;
      submitLabel.textContent = 'Send Message';
    }
  });
}
