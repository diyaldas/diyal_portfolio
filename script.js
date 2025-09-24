// Portfolio Website Scripts
document.addEventListener('DOMContentLoaded', function () {
    // Theme Toggle Functionality
    const themeToggle = document.querySelector('.js-theme-toggle');
    const currentTheme = localStorage.getItem('site-theme') || 'light';

    // Apply saved theme on load
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleAria(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('site-theme', newTheme);
            updateThemeToggleAria(newTheme);
        });
    }

    function updateThemeToggleAria(theme) {
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
            themeToggle.setAttribute('aria-pressed', theme === 'dark');
        }
    }

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.js-mobile-nav');
    const navMenu = document.querySelector('.nav__menu');
    let isNavOpen = false;

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', function () {
            isNavOpen = !isNavOpen;
            this.setAttribute('aria-expanded', isNavOpen);
            navMenu.classList.toggle('is-open', isNavOpen);

            // Trap focus when nav is open
            if (isNavOpen) {
                trapFocus(navMenu);
            }
        });

        // Close mobile nav when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isNavOpen) {
                    mobileNavToggle.click();
                }
            });
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isNavOpen) {
                mobileNavToggle.click();
            }
        });
    }

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update focus for keyboard users
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateForm()) {
                submitForm();
            }
        });

        // Real-time validation
        const formFields = contactForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        });
    }

    function validateForm() {
        let isValid = true;
        const fields = [
            { id: 'name', required: true, minLength: 2 },
            { id: 'email', required: true, type: 'email' },
            { id: 'phone', required: false, type: 'phone' },
            { id: 'message', required: true, minLength: 10 }
        ];

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(fieldConfig) {
        if (typeof fieldConfig === 'object') {
            // Called from validateForm
            const field = document.getElementById(fieldConfig.id);
            return validateSingleField(field, fieldConfig);
        } else {
            // Called from event listener
            const field = fieldConfig;
            const config = getFieldConfig(field.id);
            return validateSingleField(field, config);
        }
    }

    function validateSingleField(field, config) {
        if (!field) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (config.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (isValid && config.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation (simple digits check)
        if (isValid && config.type === 'phone' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Minimum length validation
        if (isValid && config.minLength && value.length < config.minLength) {
            isValid = false;
            errorMessage = `Must be at least ${config.minLength} characters`;
        }

        // Update field state
        updateFieldErrorState(field, isValid, errorMessage);
        return isValid;
    }

    function getFieldConfig(fieldId) {
        const configs = {
            name: { required: true, minLength: 2 },
            email: { required: true, type: 'email' },
            phone: { required: false, type: 'phone' },
            message: { required: true, minLength: 10 }
        };
        return configs[fieldId] || {};
    }

    function updateFieldErrorState(field, isValid, errorMessage) {
        field.classList.remove('is-invalid', 'is-valid');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('is-invalid');
            const errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            errorElement.style.cssText = 'color: #e53e3e; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            field.parentNode.appendChild(errorElement);
        } else {
            field.classList.add('is-valid');
        }
    }

    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('is-invalid');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    function submitForm() {
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone') || 'Not provided';
        const message = formData.get('message');

        // Show success message
        showToast('Message sent successfully!', { type: 'success' });

        // Clear form
        contactForm.reset();
        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.classList.remove('is-valid');
        });

        // Mailto fallback
        const subject = `Portfolio Contact from ${encodeURIComponent(name)}`;
        const body = `${encodeURIComponent(message)}\n\nPhone: ${encodeURIComponent(phone)}`;
        const mailtoLink = `mailto:diyalwasandani@gmail.com?subject=${subject}&body=${body}`;

        // Open mailto in new tab after a short delay
        setTimeout(() => {
            window.open(mailtoLink, '_blank');
        }, 1000);
    }

    // Project Modal Functionality
    const projectCards = document.querySelectorAll('.project-card');
    let currentModal = null;

    projectCards.forEach(card => {
        const viewCodeBtn = card.querySelector('.btn--outline');
        const projectImage = card.querySelector('.project-card__image img');

        const openModal = () => {
            const modal = createProjectModal(card);
            document.body.appendChild(modal);
            modal.classList.add('is-open');
            currentModal = modal;

            // Trap focus in modal
            trapFocus(modal);
        };

        if (viewCodeBtn) {
            viewCodeBtn.addEventListener('click', openModal);
        }

        if (projectImage) {
            projectImage.addEventListener('click', openModal);
        }

        // Add keyboard support for project cards
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    });

    function createProjectModal(card) {
        const title = card.querySelector('.project-card__title').textContent;
        const description = card.querySelector('.project-card__description').textContent;
        const imageSrc = card.querySelector('img').src;
        const tags = Array.from(card.querySelectorAll('.project-card__tags li')).map(li => li.textContent);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal__content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <button class="modal__close" aria-label="Close modal">×</button>
                <img src="${imageSrc}" alt="${title} - project screenshot" style="width: 100%; height: auto;">
                <div style="padding: 2rem;">
                    <h3 id="modal-title">${title}</h3>
                    <p>${description}</p>
                    <div class="project-card__tags" style="margin: 1rem 0;">
                        ${tags.map(tag => `<span style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; margin-right: 0.5rem;">${tag}</span>`).join('')}
                    </div>
                    <p><strong>Note:</strong> This is a template project. Replace with your actual project details.</p>
                </div>
            </div>
        `;

        // Close modal handlers
        const closeModal = () => {
            modal.classList.remove('is-open');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                currentModal = null;
            }, 300);
        };

        modal.querySelector('.modal__close').addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function handleEscape(e) {
            if (e.key === 'Escape' && currentModal === modal) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        });

        return modal;
    }

    // CV Download Handler
    const downloadCvBtn = document.querySelector('a[href*="Diyal_Das_CV.pdf"]');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            try {
                // Check if file exists
                const response = await fetch('assets/Diyal_Das_CV.pdf', { method: 'HEAD' });
                if (response.ok) {
                    // Trigger download
                    const link = document.createElement('a');
                    link.href = this.href;
                    link.download = 'Diyal_Das_CV.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    throw new Error('File not found');
                }
            } catch (error) {
                showToast('CV file not available at the moment. Please try again later.', { type: 'error' });
                console.error('CV download error:', error);
            }
        });
    }

    // Reveal on Scroll with Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Toast Notification Utility
    function showToast(message, options = {}) {
        const { type = 'info', duration = 4000 } = options;
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#e53e3e' : '#38a169'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 10000;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Focus Trap Utility
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }

    // Performance: Lazy load images that are not in viewport
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});