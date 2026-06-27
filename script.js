// ── FETCH GITHUB PROJECTS ──
async function fetchGitHubProjects() {
  try {
    const response = await fetch('https://api.github.com/users/PraveenMuddulur/repos?sort=stars&order=desc&per_page=6&type=all');
    const repos = await response.json();
    
    if (!Array.isArray(repos)) throw new Error('Invalid response');
    
    const container = document.getElementById('githubProjects');
    if (!container) return;

    // Add custom GitHub topic names you want to use for hiding repos from the portfolio.
    const hiddenPortfolioTags = new Set([
      'hide-from-portfolio',
      'portfolio-hide'
    ]);
    
    // Filter and sort repos
    const filtered = repos
      .filter(r => {
        const repoTopics = Array.isArray(r.topics) ? r.topics.map(t => String(t).toLowerCase()) : [];
        const hasHiddenTag = repoTopics.some(topic => hiddenPortfolioTags.has(topic));
        return !hasHiddenTag && (!r.fork || r.stargazers_count > 0);
      })
      .slice(0, 6);
    
    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--ink3)"><p style="font-size:13px">No repositories found</p></div>';
      return;
    }
    
    container.innerHTML = filtered.map((repo, idx) => `
      <div class="github-card fade-up" style="transition-delay:${idx * 0.08}s">
        <div class="gh-header">
          <span class="gh-icon">📁</span>
          ${repo.stargazers_count > 0 ? `<span class="gh-star">★ ${repo.stargazers_count}</span>` : ''}
        </div>
        <div class="gh-name">${repo.name}</div>
        <div class="gh-desc">${repo.description || 'No description provided'}</div>
        <div class="gh-meta">
          ${repo.language ? `<div class="gh-lang">${repo.language}</div>` : ''}
          <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-link">View on GitHub →</a>
      </div>
    `).join('');
    
    // Reobserve new elements for animations
    document.querySelectorAll('.github-card').forEach(el => obs.observe(el));
  } catch (error) {
    console.log('GitHub API rate limit or network issue:', error);
    const container = document.getElementById('githubProjects');
    if (container) {
      container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--ink3)"><p style="font-size:13px">Unable to load repositories at the moment</p></div>';
    }
  }
}

// ── INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS ──
const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('v'); }), {threshold: 0.1});
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// Fetch GitHub projects on page load
window.addEventListener('load', fetchGitHubProjects);

// ── SKILL BARS ANIMATION ──
const bObs = new IntersectionObserver(es => {
  es.forEach(e => { 
    if(e.isIntersecting){ 
      const f = e.target.querySelector('.bar-fill'); 
      if(f && !f.dataset.animated) {
        f.dataset.animated = true;
        f.style.width = f.dataset.w + '%'; 
      }
    } 
  });
}, {threshold: 0.3});
document.querySelectorAll('.skill-row').forEach(r => bObs.observe(r));

// ── COUNTER ANIMATION ──
function countUp(id, target) {
  const el = document.getElementById(id);
  if(!el) return;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now-start)/1600, 1);
    el.textContent = Math.round((1-Math.pow(1-p,3)) * target);
    if(p<1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const cObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if(!e.isIntersecting) return;
    cObs.unobserve(e.target);
    const ids = ['c1','c2','c3','c4'];
    const vals = [12, 75, 1500, 21];
    ids.forEach((id,i) => { if(e.target.querySelector('#'+id)) countUp(id, vals[i]); });
  });
}, {threshold:0.5});
document.querySelectorAll('.stat-cell').forEach(el => cObs.observe(el));

// ── ACTIVE NAV ON SCROLL ──
const sections = ['about','skills','projects','experience','contact'];
const navLinks = document.querySelectorAll('.sb-nav a');
const sObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if(e.isIntersecting){
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.sb-nav a[href="#${e.target.id}"]`);
      if(link) link.classList.add('active');
    }
  });
}, {threshold: 0.4});
sections.forEach(id => { const el = document.getElementById(id); if(el) sObs.observe(el); });

// ── SMOOTH SCROLL TO SECTION ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if(href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({behavior: 'smooth'});
    }
  });
});

// ── PAGE LOAD ANIMATION ──
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});
document.body.style.opacity = '0.98';
