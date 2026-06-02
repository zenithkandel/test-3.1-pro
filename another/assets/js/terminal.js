/* ===========================================================
   TERMINAL — easter egg 2.

   Press `~` (tilde) or Ctrl/Cmd+K to open a small terminal
   anchored to the bottom of the screen. Type a command, hit
   enter, get playful output. Esc to close.

   Commands:
       help          show this list
       about         who made this
       contact       how to reach Zenith
       secret        a small confession
       cowsay <txt>  say something with a cow
       fortune       a small fortune
       warp          engage warp drive (CSS filter pulse)
       clear         clear the screen
       exit          close the terminal
   =========================================================== */
(() => {
    'use strict';

    const term = document.getElementById('terminal');
    const out = document.getElementById('terminalOut');
    const form = document.getElementById('terminalForm');
    const input = document.getElementById('terminalInput');
    if (!term || !out || !form || !input) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const writeLine = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    };

    const BANNER = [
        '<span class="dim">zenith@portfolio:~$</span> type <span class="accent">help</span> to see commands. press <span class="accent">esc</span> to close.',
        '',
    ];

    const COMMANDS = {
        help() {
            return [
                '<span class="accent">Available commands:</span>',
                '  <span class="accent">help</span>            show this message',
                '  <span class="accent">about</span>           who made this',
                '  <span class="accent">contact</span>         how to reach Zenith',
                '  <span class="accent">secret</span>          a small confession',
                '  <span class="accent">cowsay &lt;text&gt;</span>  say something with a cow',
                '  <span class="accent">fortune</span>         a small fortune',
                '  <span class="accent">warp</span>            engage warp drive',
                '  <span class="accent">clear</span>           clear the screen',
                '  <span class="accent">exit</span>            close the terminal',
                '',
            ].join('\n');
        },
        about() {
            return [
                '<span class="accent">Zenith Kandel</span> — developer, security researcher, builder.',
                'Seventeen. Kathmandu, Nepal. Shipping from a quiet room.',
                'This site: HTML, CSS, vanilla JS, GSAP, Lenis.',
            ].join('\n');
        },
        contact() {
            return [
                'email:    zenithkandel0@gmail.com',
                'phone:    +977 980 617 6120',
                'web:      zenithkandel.com.np',
                'github:   @zenithkandel',
            ].join('\n');
        },
        secret() {
            return [
                '<span class="warn">// little-known fact</span>',
                'The Lifeline project was first demoed with a literal kitchen',
                'timer and two ESP boards taped to a window. Judges still gave',
                'it a prize. Hardware is mostly willpower.',
            ].join('\n');
        },
        fortune() {
            const f = [
                'Ship before it is perfect. — Z',
                'A clean README is a love letter to your future self.',
                'The first line of HTML you ever wrote is still online somewhere. Find it.',
                'Bug reports are just love letters with a CVE.',
                'Drink water. Ship.',
            ];
            return f[Math.floor(Math.random() * f.length)];
        },
        cowsay(args) {
            const text = (args || 'moo').toString().slice(0, 60);
            const top  = ' ' + '_'.repeat(text.length + 2);
            const mid  = '< ' + text + ' >';
            const bot  = ' ' + '-'.repeat(text.length + 2);
            return [
                top, mid, bot,
                '        \\   ^__^',
                '         \\  (oo)\\_______',
                '            (__)\\       )\\/\\',
                '                ||----w |',
                '                ||     ||',
            ].join('\n');
        },
        warp() {
            if (reduceMotion) return '<span class="warn">warp disabled (reduced motion)</span>';
            const body = document.body;
            body.style.transition = 'filter 0.45s ease';
            body.style.filter = 'blur(8px) saturate(1.6)';
            setTimeout(() => {
                body.style.filter = 'blur(0) saturate(1)';
                setTimeout(() => {
                    body.style.transition = '';
                    body.style.filter = '';
                }, 450);
            }, 320);
            return '<span class="accent">engaging warp drive…</span>';
        },
        clear() {
            out.innerHTML = '';
            return null;
        },
        exit() {
            closeTerm();
            return null;
        },
    };

    let lastFocus = null;

    const openTerm = () => {
        if (term.classList.contains('is-open')) return;
        lastFocus = document.activeElement;
        term.hidden = false;
        // Force reflow so the transition runs
        void term.offsetWidth;
        term.classList.add('is-open');
        if (!out.innerHTML.trim()) BANNER.forEach(writeLine);
        setTimeout(() => { try { input.focus(); } catch (e) { /* noop */ } }, 80);
    };

    const closeTerm = () => {
        if (!term.classList.contains('is-open')) return;
        term.classList.remove('is-open');
        setTimeout(() => { term.hidden = true; }, 340);
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* noop */ }
        }
    };

    /* ----- Open: ~ key OR Ctrl/Cmd+K ----- */
    window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        const inEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable);

        if (e.key === 'Escape' && term.classList.contains('is-open')) {
            closeTerm();
            return;
        }
        if (inEditable) return;
        if (e.key === '~' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (term.classList.contains('is-open')) closeTerm(); else openTerm();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (term.classList.contains('is-open')) closeTerm(); else openTerm();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = input.value;
        if (!raw.trim()) return;
        const [cmd, ...args] = raw.trim().split(/\s+/);
        writeLine('<span class="dim">$</span> ' + escapeHtml(raw));
        input.value = '';
        const fn = COMMANDS[cmd.toLowerCase()];
        if (!fn) {
            writeLine('<span class="warn">command not found:</span> ' + escapeHtml(cmd) + '. try <span class="accent">help</span>.');
            return;
        }
        const result = fn(args.join(' '));
        if (result !== null && result !== undefined) writeLine(result);
    });

    // Prevent the form's submit on Enter in the modal from doing anything
    // weird (it already preventDefaults, but just to be safe).
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closeTerm();
        }
    });
})();
