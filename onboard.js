const SUPABASE_URL = 'https://yrirrlfmjjfzcvmkuzpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaXJybGZtampmemN2bWt1enBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODk1MzQsImV4cCI6MjA2ODc2NTUzNH0.Iyn8te51bM2e3Pvdjrx3BkG14WcBKuqFhoIq2PSwJ8A';
const ONBOARDING_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/onboard_new_customer`;

const form = document.getElementById('onboardingForm');
const submitButton = document.getElementById('submitOnboarding');
const message = document.getElementById('onboardingMessage');
const result = document.getElementById('onboardingResult');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `alert alert-${type}`;
  message.hidden = false;
}

function clearFeedback() {
  message.hidden = true;
  result.hidden = true;
}

function maskCard(number) {
  const value = String(number || '');
  return value ? `•••• •••• •••• ${value.slice(-4)}` : 'Not generated';
}

function buildPayload() {
  return {
    p_first_name: form.firstName.value.trim(),
    p_last_name: form.lastName.value.trim(),
    p_dob: form.dob.value,
    p_address: form.address.value.trim(),
    p_city: form.city.value.trim(),
    p_mobile_no: form.mobile.value.trim(),
    p_email: form.email.value.trim() || null,
    p_mobile_no2: form.alternateMobile.value.trim() || null
  };
}

function renderResult(created, mobile) {
  document.getElementById('resultCustomerId').textContent = created.out_customer_id ?? 'Created';
  document.getElementById('resultAccount').textContent = created.out_account_number ?? 'Generated';
  document.getElementById('resultDebitCard').textContent = maskCard(created.out_debit_card_number);
  document.getElementById('resultCreditCard').textContent = maskCard(created.out_credit_card_number);
  document.getElementById('openCustomerLink').href = `index.html?mobileNo=${encodeURIComponent(mobile)}`;
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('reset', clearFeedback);

form.addEventListener('submit', async event => {
  event.preventDefault();
  clearFeedback();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = buildPayload();
  submitButton.disabled = true;
  submitButton.textContent = 'Creating…';
  showMessage('Creating the customer and generating account and card details…', 'info');

  try {
    const response = await fetch(ONBOARDING_ENDPOINT, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.message || body?.details || `Request failed (${response.status})`);
    }

    const created = Array.isArray(body) ? body[0] : body;
    form.reset();
    showMessage('Customer onboarding completed successfully.', 'success');
    renderResult(created || {}, payload.p_mobile_no);
  } catch (error) {
    showMessage(error.message || 'Unable to create the customer. Please try again.', 'danger');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Create Customer';
  }
});
