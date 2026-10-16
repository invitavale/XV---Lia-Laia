// Variables globales
let isPlaying = false;
let player = null;
let playerReady = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

// Funciones globales para los botones del modal
function enterWithMusicClick() {
    // console.log('Función enterWithMusicClick() ejecutada');
    enableMusic = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // El player se precarga desde DOMContentLoaded (ver loadYouTubeAPI más abajo),
    // así que si ya está listo llamamos playVideo() de inmediato, dentro del mismo
    // tick del click. Eso es justo lo que iOS Safari exige para permitir el audio;
    // si el player se crea o se reproduce de forma asíncrona (fuera del gesto del
    // usuario), iOS lo bloquea en silencio y por eso antes no sonaba en iPhone.
    if (playerReady && player) {
        document.getElementById('musicPlayer').style.display = 'block';
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        isPlaying = true;
        updateMusicIcon();
        // En iOS/Safari a veces el primer playVideo() no arranca el audio
        // aunque sí "conecta" el gesto; reintentamos una vez, todavía
        // dentro del mismo ciclo de interacción del usuario.
        setTimeout(() => {
            if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
                player.unMute();
                player.playVideo();
            }
        }, 300);
    }
    // Si el player todavía no está listo (conexión lenta), onPlayerReady se
    // encarga de reproducir apenas termine de inicializar.
}

function enterWithoutMusicClick() {
    // console.log('Función enterWithoutMusicClick() ejecutada');
    enableMusic = false;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para configurar los botones directamente
function setupModalButtons() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    const modal = document.getElementById('welcomeModal');

    // console.log('Configurando botones del modal...', { enterWithMusic, enterWithoutMusic, modal });

    if (enterWithMusic) {
        enterWithMusic.onclick = function() {
            // console.log('Botón CON música clickeado');
            enableMusic = true;
            if (modal) {
                modal.style.display = 'none';
            }
            // Mismo arreglo que en enterWithMusicClick: reproducir de forma
            // síncrona dentro del click si el player ya está precargado.
            if (playerReady && player) {
                const musicPlayer = document.getElementById('musicPlayer');
                if (musicPlayer) musicPlayer.style.display = 'block';
                player.unMute();
                player.setVolume(100);
                player.playVideo();
                isPlaying = true;
                updateMusicIcon();
                setTimeout(() => {
                    if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
                        player.unMute();
                        player.playVideo();
                    }
                }, 300);
            }
        };
    }

    if (enterWithoutMusic) {
        enterWithoutMusic.onclick = function() {
            // console.log('Botón SIN música clickeado');
            enableMusic = false;
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOM cargado, inicializando...');
    initializeCountdown();
    initializeCarousel();
    setupModalButtons();

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    // Música: archivo propio (musica.mp3) en un <audio>; ya no se usa YouTube.
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) musicToggle.addEventListener('click', toggleMusic);
    const bg = document.getElementById('bgMusic');
    if (bg) {
        bg.addEventListener('play', () => { isPlaying = true; updateMusicIcon(); });
        bg.addEventListener('pause', () => { isPlaying = false; updateMusicIcon(); });
    }
});

// También configurar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    // console.log('Ventana completamente cargada');
    setupModalButtons();
});



// Cargar la API de YouTube
function loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

// Función llamada por la API de YouTube
function initializeYouTubePlayer() {
    if (player) return; // ya inicializado, evita crear el player dos veces

    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'vwp1yxtcD7I',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playlist: 'vwp1yxtcD7I'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    const musicPlayer = document.getElementById('musicPlayer');
    const musicToggle = document.getElementById('musicToggle');

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Caso borde: el usuario ya hizo click en "con música" antes de que el
    // player terminara de inicializar (ej. conexión lenta). Lo reproducimos
    // apenas esté listo.
    if (enableMusic && !isPlaying) {
        if (musicPlayer) musicPlayer.style.display = 'block';
        event.target.unMute();
        event.target.setVolume(100);
        event.target.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    updateMusicIcon();
}

function onPlayerError(event) {
    console.log('Error al cargar el video de YouTube');
    const musicPlayer = document.getElementById('musicPlayer');
    musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function toggleMusic() {
    const bg = document.getElementById('bgMusic');
    if (bg) {
        if (bg.paused) { bg.play().catch(() => {}); } else { bg.pause(); }
        return;
    }
    if (player) {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
        } else {
            player.playVideo();
            isPlaying = true;
        }
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (volumeIcon) {
        if (isPlaying) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#222" stroke-width="2"></path>
                <circle cx="6.5" cy="12" r="1" fill="#D98FA3"/>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <line x1="19" y1="9" x2="17" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <line x1="17" y1="9" x2="19" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <circle cx="6.5" cy="12" r="1" fill="#ff6b6b"/>
            `;
        }
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-11-20T18:30:00-04:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track) return;

    // calcular total dinámicamente
    const items = track.querySelectorAll('.carousel-item');
    totalSlides = items.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    // Ajuste inicial para asegurar cálculo correcto tras el render
    updateCarousel();
    requestAnimationFrame(updateCarousel);
    setTimeout(updateCarousel, 200);

    // Auto-play del carrusel
    setInterval(() => {
        nextSlide();
    }, 2500);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const items = track.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const container = track.parentElement;

        // Temporarily reset transform to measure actual positions
        const previousTransform = track.style.transform;
        track.style.transform = 'none';

        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1] ? items[1].getBoundingClientRect() : null;
        const stepWidth = Math.max(1, secondRect ? Math.round(secondRect.left - firstRect.left) : Math.round(firstRect.width));

        const containerWidth = Math.round(container.getBoundingClientRect().width);
        const visibleCount = Math.max(1, Math.floor((containerWidth + 1) / stepWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCount);

        // Detecta si hay que dar la vuelta (de la última foto a la 1, o viceversa)
        let wrapped = false;
        if (currentSlide > maxIndex) { currentSlide = 0; wrapped = true; }
        if (currentSlide < 0) { currentSlide = maxIndex; wrapped = true; }

        const trackRect = track.getBoundingClientRect();
        const baseLeft = Math.round(firstRect.left - trackRect.left);
        const translateXpx = -Math.round(baseLeft + (currentSlide * stepWidth));

        if (wrapped) {
            // Al dar la vuelta, salta directo a la foto 1 sin animar el regreso
            // (evita el efecto de "devolverse" deslizando hacia atrás por todas las fotos)
            const prevTransition = track.style.transition;
            track.style.transition = 'none';
            track.style.transform = `translateX(${translateXpx}px)`;
            void track.offsetWidth; // fuerza reflow para aplicar el salto sin animación
            track.style.transition = prevTransition || '';
        } else {
            // Apply transform
            track.style.transform = `translateX(${translateXpx}px)`;
        }
        // console.log('Carousel moved to slide:', { currentSlide, visibleCount, maxIndex, translateXpx, stepWidth, baseLeft });
    }
    updateSlideCounter();
    markCenterCarouselItem();
}

function nextSlide() {
    currentSlide++;
    updateCarousel();
}

function previousSlide() {
    currentSlide--;
    updateCarousel();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    if (currentSlideElement) currentSlideElement.textContent = (currentSlide + 1);
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
}

// Mark center carousel item on desktop
function markCenterCarouselItem() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));

    const firstItem = items[0];
    const container = track.parentElement;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.floor(containerWidth / itemWidth));

    const centerIndex = (currentSlide + Math.floor(visibleCount / 2)) % items.length;
    items[centerIndex].classList.add('is-center');
}

// Hook into carousel updates
const _origUpdateCarousel = typeof updateCarousel === 'function' ? updateCarousel : null;
if (_origUpdateCarousel) {
    window.updateCarousel = function() {
        _origUpdateCarousel();
        markCenterCarouselItem();
    };
}

window.addEventListener('resize', markCenterCarouselItem);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(markCenterCarouselItem, 200);
});

// Funciones de los botones
function openLocation(location) {
    // Enlaces de ejemplo (dirección ficticia) - ceremonia y celebración
    const mapsUrls = {
        ceremony: "https://maps.app.goo.gl/4PAgTDm5DHmakUKE7",
        reception: "https://maps.app.goo.gl/4PAgTDm5DHmakUKE7"
    };
    const mapsUrl = mapsUrls[location] || mapsUrls.ceremony;
    window.open(mapsUrl, '_blank');
}

// NOTA: esta es una plantilla de ejemplo. Reemplaza el contenido de estas
// funciones con tu propio enlace (Google Drive, Google Form, lista de
// regalos, etc.) cuando personalices la invitación.

function sharePhotos() {
    window.open('https://photos.app.goo.gl/qW3GZHucnAkyncnz8', '_blank');
}

function showDressCode() {
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDressCodeModal() {
    // El click dentro de la tarjeta del modal usa stopPropagation(), así que
    // esta función solo se dispara al hacer click en el fondo oscuro o en la X.
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showGifts() {
    const modal = document.getElementById('giftsModal');
    if (modal) modal.style.display = 'flex';
}

function closeGiftsModal() {
    const modal = document.getElementById('giftsModal');
    if (modal) modal.style.display = 'none';
}

function copyAccount() {
    const number = '776023806';
    const btn = document.querySelector('.copy-btn');
    const done = () => {
        if (btn) {
            btn.classList.add('copied');
            const label = btn.querySelector('.copy-label');
            if (label) label.textContent = '¡Copiado!';
            setTimeout(() => {
                btn.classList.remove('copied');
                if (label) label.textContent = 'Copiar';
            }, 2000);
        }
        showToast('¡Número copiado!', 'Cuenta Banco Popular: ' + number);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(number).then(done).catch(() => fallbackCopy(number, done));
    } else {
        fallbackCopy(number, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length); // iOS
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeGiftsModal(); closeDressCodeModal(); }
});

function confirmAttendance() {
    const message = 'Confirmo mi asistencia a los XV años de Lía Daniela y Laia Daniela 💗✨';
    window.open('https://wa.me/18298661824?text=' + encodeURIComponent(message), '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();

// ------------------------------------------------------------------
// Compatibilidad con vistas previas embebidas (iframes que crecen al
// alto del contenido o que bloquean los onclick="" en línea).
// En el sitio normal (invitavale.com) nada de esto cambia el diseño.
// ------------------------------------------------------------------
(function () {
    function fixFrameHeight() {
        // Si la ventana mide más de 1400px de alto, el visor está estirando
        // la página: la portada fija (100vh) taparía todas las secciones.
        if (window.innerHeight > 1400) {
            document.documentElement.classList.add('tall-frame');
        }
    }

    function bindInlineHandlers() {
        const actions = {
            "enterWithMusicClick()": () => enterWithMusicClick(),
            "enterWithoutMusicClick()": () => enterWithoutMusicClick(),
            "openLocation('reception')": () => openLocation('reception'),
            "showDressCode()": () => showDressCode(),
            "closeDressCodeModal()": () => closeDressCodeModal(),
            "closeDressCodeModal(event)": () => closeDressCodeModal(),
            "sharePhotos()": () => sharePhotos(),
            "showGifts()": () => showGifts(),
            "closeGiftsModal()": () => closeGiftsModal(),
            "copyAccount()": () => copyAccount(),
            "confirmAttendance()": () => confirmAttendance(),
            "event.stopPropagation()": (e) => e.stopPropagation()
        };
        document.querySelectorAll('[onclick]').forEach((el) => {
            const code = el.getAttribute('onclick').trim();
            const fn = actions[code];
            if (!fn) return;
            el.removeAttribute('onclick');
            // los botones de bienvenida ya tienen su handler en setupModalButtons
            if (el.id === 'enterWithMusic' || el.id === 'enterWithoutMusic') return;
            el.onclick = fn;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { fixFrameHeight(); bindInlineHandlers(); });
    } else {
        fixFrameHeight(); bindInlineHandlers();
    }
})();

// Animación sutil al hacer scroll: las tarjetas aparecen suavemente
(function () {
    function initReveal() {
        const items = document.querySelectorAll('.gold-card');
        if (!('IntersectionObserver' in window)) return;
        document.documentElement.classList.add('reveal-on');
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add('is-visible');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => io.observe(el));
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReveal);
    else initReveal();
})();

// ------------------------------------------------------------------
// Entrada con video. El primer toque del invitado:
//   1) reproduce el video de la puerta (silenciado, inline)
//   2) arranca la música de YouTube en el MISMO gesto (Safari/iOS)
// Al terminar el video (7.5 s) hay una transición dorada a la invitación.
// ------------------------------------------------------------------
(function () {
    let started = false;
    let finished = false;

    function startMusicInGesture() {
        enableMusic = true;
        const musicPlayer = document.getElementById('musicPlayer');
        const bg = document.getElementById('bgMusic');
        if (bg) {
            // play() se llama dentro del toque (Safari/iOS lo exige), pero en
            // silencio: así el audio queda "desbloqueado" y en el segundo 4 del
            // video solo hay que reiniciarlo y quitarle el mute.
            bg.muted = true;
            bg.volume = 1;
            const pr = bg.play();
            if (pr && typeof pr.catch === 'function') pr.catch(() => {});
            return;
        }
        if (playerReady && player) {
            if (musicPlayer) musicPlayer.style.display = 'block';
            try {
                player.unMute();
                player.setVolume(100);
                player.playVideo();
            } catch (e) {}
            isPlaying = true;
            updateMusicIcon();
            setTimeout(() => {
                try {
                    if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
                        player.unMute();
                        player.playVideo();
                    }
                } catch (e) {}
            }, 300);
        }
        // Si el player aún no está listo, onPlayerReady lo reproduce (enableMusic = true).
    }

    let musicReleased = false;
    function releaseMusic() {
        if (musicReleased) return;
        musicReleased = true;
        const bg = document.getElementById('bgMusic');
        const musicPlayer = document.getElementById('musicPlayer');
        if (!bg) return;
        try { bg.currentTime = 0; } catch (e) {}
        bg.muted = false;
        if (bg.paused) { const pr = bg.play(); if (pr && pr.catch) pr.catch(() => {}); }
        if (musicPlayer) musicPlayer.style.display = 'block';
        isPlaying = true;
        updateMusicIcon();
    }

    function endEverything() {
        document.documentElement.classList.remove('intro-lock');
        document.documentElement.classList.add('intro-done');
    }

    // ---- Mensaje palabra por palabra ----
    let msgStarted = false, msgEnded = false, msgTimer = null;
    function buildWords(el, startDelay, step) {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        let d = startDelay;
        words.forEach((w, i) => {
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = w;
            span.style.animationDelay = d.toFixed(2) + 's';
            el.appendChild(span);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
            d += step;
        });
        return d;
    }
    function endMessage() {
        if (msgEnded) return;
        msgEnded = true;
        clearTimeout(msgTimer);
        const msg = document.getElementById('introMessage');
        if (!msg) { endEverything(); return; }
        msg.classList.add('is-leaving');
        setTimeout(endEverything, 700);
        setTimeout(() => msg.remove(), 2000);
    }
    function startMessage() {
        if (msgStarted) return;
        msgStarted = true;
        const msg = document.getElementById('introMessage');
        if (!msg) { endEverything(); return; }
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let t = 0.6;
        msg.querySelectorAll('[data-reveal]').forEach((el) => {
            const kind = el.getAttribute('data-reveal');
            if (kind === 'title') { t = buildWords(el, t, 0.32) + 0.5; }
            else if (kind === 'text') { t = buildWords(el, t, reduce ? 0.02 : 0.17) + 0.7; }
            else { el.style.animationDelay = t.toFixed(2) + 's'; el.classList.add('w-block'); t += 1.2; }
        });
        msg.classList.add('is-on');
        // Se queda visible un momento para leerlo y luego entra a la invitación.
        msgTimer = setTimeout(endMessage, (t + 2.6) * 1000);
        const skip = document.getElementById('msgSkip');
        if (skip) skip.addEventListener('click', endMessage);
    }

    function finishIntro() {
        releaseMusic();
        if (finished) return;
        finished = true;
        const gate = document.getElementById('introGate');
        document.documentElement.classList.add('intro-leaving');
        if (gate) gate.classList.add('is-leaving');
        // El mensaje aparece detrás del destello dorado
        setTimeout(startMessage, 1100);
        setTimeout(() => {
            if (gate) gate.remove();
            document.documentElement.classList.remove('intro-leaving');
        }, 3800);
    }

    function startIntro(e) {
        if (e) e.preventDefault();
        if (started) return;
        started = true;
        const gate = document.getElementById('introGate');
        const video = document.getElementById('introVideo');
        startMusicInGesture();
        if (gate) gate.classList.add('is-playing');
        if (!video) { finishIntro(); return; }
        // El video suena (su audio se apaga solo en el segundo 6) y la
        // canción entra en el segundo 4.
        video.muted = false;
        video.volume = 1;
        let pr = video.play();
        if (pr && typeof pr.catch === 'function') {
            pr.catch(() => {
                // Si el navegador no deja reproducir con sonido, se intenta sin sonido.
                video.muted = true;
                const pr2 = video.play();
                if (pr2 && pr2.catch) pr2.catch(() => finishIntro());
            });
        }
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= 4) releaseMusic();
            if (video.duration && video.currentTime >= video.duration - 1.3) finishIntro();
        });
        video.addEventListener('ended', finishIntro);
        video.addEventListener('error', finishIntro);
        setTimeout(releaseMusic, 4500);   // seguridad por si timeupdate tarda
        setTimeout(finishIntro, 12000); // seguridad
    }

    function initIntro() {
        const gate = document.getElementById('introGate');
        if (!gate) { document.documentElement.classList.add('intro-done'); return; }
        document.documentElement.classList.add('intro-lock');
        gate.addEventListener('click', startIntro);
        gate.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') startIntro(e); });
        const skip = document.getElementById('introSkip');
        if (skip) skip.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!started) { started = true; startMusicInGesture(); }
            finishIntro();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initIntro);
    else initIntro();
})();
