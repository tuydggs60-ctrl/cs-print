document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const cardImages = Array.from(document.querySelectorAll('.category-card .card-img img'))
        .map(img => img.src)
        .filter(src => src);

    if (hero && cardImages.length) {
        const randomImage = cardImages[Math.floor(Math.random() * cardImages.length)];
        hero.style.setProperty('--hero-image', `url("${randomImage}")`);
    }

    const searchBar = document.getElementById('search-bar');
    const cards = Array.from(document.querySelectorAll('.category-card'));

    if (searchBar && cards.length) {
        searchBar.addEventListener('input', () => {
            const query = searchBar.value.trim().toLowerCase();

            cards.forEach(card => {
                const title = card.textContent.toLowerCase();
                const altText = card.querySelector('img')?.alt.toLowerCase() || '';
                const matches = title.includes(query) || altText.includes(query);

                card.style.display = matches || query === '' ? '' : 'none';
            });
        });
    }

    const loginToggle = document.getElementById('login-toggle');
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    const loginTitle = document.getElementById('login-title');
    const registerModeBtn = document.getElementById('register-mode-btn');
    const loginModeBtn = document.getElementById('login-mode-btn');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const loginMessage2 = document.getElementById('login-message-2');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const visitorStatus = document.getElementById('visitor-status');
    const visitorNameLabel = document.getElementById('visitor-name-label');
    const welcomeBanner = document.getElementById('welcome-banner');
    const welcomeName = document.getElementById('welcome-name');
    const logoutButton = document.getElementById('logout-button');

    function showLoginMessage(message, isSuccess = false, target = loginMessage) {
        target.textContent = message;
        target.classList.toggle('success', isSuccess);
    }

    function getRegisteredUsers() {
        try {
            return JSON.parse(localStorage.getItem('ptk_registered_users') || '[]');
        } catch (error) {
            return [];
        }
    }

    function setMode(isRegister) {
        const showRegister = isRegister;

        registerForm.classList.toggle('hidden', !showRegister);
        loginForm.classList.toggle('hidden', showRegister);
        registerModeBtn.classList.toggle('active', showRegister);
        loginModeBtn.classList.toggle('active', !showRegister);
        loginTitle.textContent = showRegister ? 'Buat Akun Pengunjung' : 'Login Pengunjung';

        if (showRegister) {
            showLoginMessage('', false, loginMessage);
            showLoginMessage('', false, loginMessage2);
            registerUsernameInput.focus();
        } else {
            showLoginMessage('', false, loginMessage);
            showLoginMessage('', false, loginMessage2);
            loginUsernameInput.focus();
        }
    }

    function applyVisitorState() {
        const loggedIn = localStorage.getItem('ptk_visitor_login') === 'true';
        const visitorName = localStorage.getItem('ptk_visitor_name') || 'Pengunjung';

        if (loginToggle) {
            loginToggle.classList.toggle('hidden', loggedIn);
        }

        if (visitorStatus) {
            visitorStatus.classList.toggle('hidden', !loggedIn);
        }

        if (visitorNameLabel) {
            visitorNameLabel.textContent = visitorName;
        }

        if (welcomeBanner) {
            welcomeBanner.classList.toggle('hidden', !loggedIn);
        }

        if (welcomeName) {
            welcomeName.textContent = visitorName;
        }
    }

    function openLoginModal() {
        loginModal.classList.remove('hidden');
        loginModal.setAttribute('aria-hidden', 'false');
        setMode(true);
    }

    function closeLoginModal() {
        loginModal.classList.add('hidden');
        loginModal.setAttribute('aria-hidden', 'true');
        registerForm.reset();
        loginForm.reset();
        showLoginMessage('', false, loginMessage);
        showLoginMessage('', false, loginMessage2);
    }

    if (loginToggle) {
        loginToggle.addEventListener('click', openLoginModal);
    }

    if (closeLogin) {
        closeLogin.addEventListener('click', closeLoginModal);
    }

    if (registerModeBtn) {
        registerModeBtn.addEventListener('click', () => setMode(true));
    }

    if (loginModeBtn) {
        loginModeBtn.addEventListener('click', () => setMode(false));
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('ptk_visitor_login');
            localStorage.removeItem('ptk_visitor_name');
            localStorage.removeItem('ptk_visitor_email');
            localStorage.removeItem('ptk_visitor_username');
            applyVisitorState();
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.textContent = isPassword ? 'Sembunyikan' : 'Lihat';
            button.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Lihat password');
            input.focus();
        });
    });

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = registerUsernameInput.value.trim();
            const password = registerPasswordInput.value;

            if (!username || !password) {
                showLoginMessage('Username dan password wajib diisi.');
                return;
            }

            if (username.length < 3) {
                showLoginMessage('Username minimal 3 karakter.');
                return;
            }

            if (password.length < 4) {
                showLoginMessage('Password minimal 4 karakter.');
                return;
            }

            const usernameLower = username.trim().toLowerCase();
            const users = getRegisteredUsers();
            const exists = users.some(user => {
                return String(user.username || '').trim().toLowerCase() === usernameLower;
            });

            if (exists) {
                showLoginMessage('Username sudah digunakan. Silakan pilih username lain.');
                return;
            }

            users.push({
                username: usernameLower,
                password: String(password)
            });
            localStorage.setItem('ptk_registered_users', JSON.stringify(users));

            showLoginMessage(`Akun berhasil dibuat untuk ${usernameLower}.`, true);
            localStorage.setItem('ptk_visitor_login', 'true');
            localStorage.setItem('ptk_visitor_name', usernameLower);
            localStorage.setItem('ptk_visitor_username', usernameLower);
            applyVisitorState();
            setTimeout(() => {
                closeLoginModal();
            }, 1200);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value;

            if (!username || !password) {
                showLoginMessage('Username dan password wajib diisi.', false, loginMessage2);
                return;
            }

            if (username.length < 3) {
                showLoginMessage('Username minimal 3 karakter.', false, loginMessage2);
                return;
            }

            const registeredUsers = getRegisteredUsers();
            const match = registeredUsers.find(user => {
                return String(user.username || '').trim().toLowerCase() === username.trim().toLowerCase() && String(user.password || '') === String(password);
            });

            if (!match) {
                showLoginMessage('Username atau password salah. Silakan cek kembali.', false, loginMessage2);
                return;
            }

            const displayName = String(match.username || username).trim().toLowerCase();
            showLoginMessage(`Login berhasil. Selamat datang, ${displayName}!`, true, loginMessage2);
            localStorage.setItem('ptk_visitor_login', 'true');
            localStorage.setItem('ptk_visitor_name', displayName);
            localStorage.setItem('ptk_visitor_username', displayName);
            applyVisitorState();
            setTimeout(() => {
                closeLoginModal();
            }, 1200);
        });
    }

    applyVisitorState();

    const waNumber = '6285134625265';
    cards.forEach(card => {
        const imgEl = card.querySelector('.card-img img');
        const titleEl = card.querySelector('h3') || card.querySelector('h5');
        const title = titleEl ? titleEl.textContent.trim() : 'Produk';
        const imageUrl = imgEl ? imgEl.src : '';

        const a = document.createElement('a');
        a.href = `order.html?product=${encodeURIComponent(title)}`;
        a.className = 'btn-wa-card';
        a.textContent = 'Order via WA';
        a.style.cssText = 'display:inline-block;padding:8px 12px;background:#25D366;color:#fff;border-radius:6px;text-decoration:none;margin-top:8px;font-weight:700;';

        if (imageUrl) {
            card.appendChild(a);
        }
    });
});
