(function () {
    // ----- counter animation for stats (projects & clients) -----
    const projectsSpan = document.getElementById('projectsCounter');
    const clientsSpan = document.getElementById('clientsCounter');

    let projectsCounted = false;
    let clientsCounted = false;

    function animateNumber(element, start, end, duration = 1500) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.innerText = currentValue;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Intersection Observer to trigger counters when stats section is visible
    const statsSection = document.getElementById('about');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!projectsCounted) {
                    animateNumber(projectsSpan, 0, 478, 1400);
                    projectsCounted = true;
                }
                if (!clientsCounted) {
                    animateNumber(clientsSpan, 0, 312, 1400);
                    clientsCounted = true;
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    if (statsSection) observer.observe(statsSection);

    // Set default numbers if observer fails to fire initially? but fine, also immediate if already visible
    if (statsSection && window.IntersectionObserver) {
        // already handled above
    } else {
        // fallback: show numbers anyway after page load for old browsers
        setTimeout(() => {
            if (!projectsCounted) projectsSpan.innerText = "478";
            if (!clientsCounted) clientsSpan.innerText = "312";
        }, 500);
    }

    // ----- Contact form handling (sweet alert simulation) -----
    const contactForm = document.getElementById('contactForm');
    const feedbackDiv = document.getElementById('formFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('nameInput')?.value.trim();
            const email = document.getElementById('emailInput')?.value.trim();
            const message = document.getElementById('messageInput')?.value.trim();

            if (!name || !email || !message) {
                feedbackDiv.innerHTML = '<span class="text-danger">⚠️ Please fill in all fields.</span>';
                return;
            }
            if (!email.includes('@') || !email.includes('.')) {
                feedbackDiv.innerHTML = '<span class="text-danger">📧 Enter a valid email address.</span>';
                return;
            }
            feedbackDiv.innerHTML = '<span class="text-success">✨ Thanks ' + name + '! We’ll reach out soon.</span>';
            contactForm.reset();
            setTimeout(() => { feedbackDiv.innerHTML = ''; }, 4000);
        });
    }

    // ----- Newsletter subscription toast-style alert -----
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterInput = document.getElementById('newsletterEmail');
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', function () {
            const emailVal = newsletterInput.value.trim();
            if (!emailVal || !emailVal.includes('@')) {
                alert('Please enter a valid email address to subscribe.');
                return;
            }
            alert(`🎉 Awesome! ${emailVal} has been subscribed. Expect weekly inspiration.`);
            newsletterInput.value = '';
        });
    }

    // smooth scroll for all anchor links that start with #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#" || href === "") return;
            const targetElem = document.querySelector(href);
            if (targetElem) {
                e.preventDefault();
                targetElem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();