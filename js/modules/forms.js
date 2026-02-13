// forms.js - Form validation and submission
export function setupFormValidation() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(contactForm)) {
      showMessage('Lütfen tüm zorunlu alanları doldurunuz.', 'error');
      return;
    }

    try {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Gönderiliyor...';

      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      contactForm.reset();
      showMessage('Mesajınız başarıyla gönderildi!', 'success');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Mesajı Gönder';
    } catch (error) {
      showMessage('Bir hata oluştu. Lütfen tekrar deneyiniz.', 'error');
      console.error('Form submission error:', error);
    }
  });

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]');
      
      try {
        // Simulate subscription (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 500));
        showMessage('E-bültenimize abone oldunuz!', 'success');
        email.value = '';
      } catch (error) {
        showMessage('Abone olma işlemi başarısız oldu.', 'error');
      }
    });
  }
}

function validateForm(form) {
  const inputs = form.querySelectorAll('[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('border-red-500');
      isValid = false;
    } else {
      input.classList.remove('border-red-500');
    }

    if (input.type === 'email' && !isValidEmail(input.value)) {
      input.classList.add('border-red-500');
      isValid = false;
    }
  });

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showMessage(message, type) {
  const formMessage = document.getElementById('formMessage');
  const messageIcon = document.getElementById('messageIcon');
  const messageText = document.getElementById('messageText');

  if (!formMessage || !messageText) return;

  messageText.textContent = message;
  formMessage.classList.remove('hidden', 'bg-green-50', 'bg-red-50');
  messageIcon.classList.remove('text-green-500', 'text-red-500');
  messageText.classList.remove('text-green-700', 'text-red-700');

  if (type === 'success') {
    formMessage.classList.add('bg-green-50');
    messageIcon.classList.add('text-green-500');
    messageText.classList.add('text-green-700');
  } else {
    formMessage.classList.add('bg-red-50');
    messageIcon.classList.add('text-red-500');
    messageText.classList.add('text-red-700');
  }

  setTimeout(() => {
    formMessage.classList.add('hidden');
  }, 5000);
}