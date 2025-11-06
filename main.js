      // Menu móvil
      const btn = document.getElementById('menuBtn');
      const drawer = document.getElementById('drawer');
      btn?.addEventListener('click', () => {
        const open = drawer.style.display === 'block';
        drawer.style.display = open ? 'none' : 'block';
        btn.setAttribute('aria-expanded', String(!open));
      });

      // Sombra en header al hacer scroll
      const header = document.querySelector('header');
      const toggleHeaderShadow = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
      toggleHeaderShadow();
      window.addEventListener('scroll', toggleHeaderShadow);

      // Resaltar sección activa en menú
      const links = [...document.querySelectorAll('.nav-link')];
      const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      const onScroll = () => {
        let idx = sections.findIndex(sec => sec.getBoundingClientRect().top - 120 > 0) - 1;
        if (idx < 0) idx = sections.length - 1;
        links.forEach(l => l.classList.remove('active'));
        links[idx]?.classList.add('active');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Animación de aparición por sección
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
        })
      },{ threshold:.16 });
      document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

      // Modal demo
      const modal = document.getElementById('modalDemo');
      const btnDemo = document.getElementById('btnDemo');
      const closeDemo = document.getElementById('closeDemo');
      btnDemo?.addEventListener('click', ()=> modal.classList.add('open'));
      closeDemo?.addEventListener('click', ()=> modal.classList.remove('open'));
      modal?.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('open'); });

      // Toast simple para CTA
      const toastWrap = document.getElementById('toasts');
      function showToast(msg){
        const t = document.createElement('div'); t.className='toast'; t.textContent=msg; toastWrap.appendChild(t);
        requestAnimationFrame(()=> t.classList.add('show'));
        setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 300); }, 2600);
      }
      document.getElementById('ctaComienza')?.addEventListener('click', (e)=>{
        showToast('Listo, te llevamos al registro ▶');
      });

// Toggle login/registro
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn?.addEventListener('click', () => container?.classList.add("active"));
loginBtn?.addEventListener('click', () => container?.classList.remove("active"));






