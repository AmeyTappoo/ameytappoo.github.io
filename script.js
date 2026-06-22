const OPENROUTER_API_KEY = "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";
const OPENROUTER_MODEL = "openrouter/free";
let currentUser = null;
let authMode = "login";
let previewChartInstance = null;
let resultsChartInstance = null;
function showPage(pageId) {
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
const cleanId = pageId.replace('#', '');
const target = document.getElementById(cleanId);
 if (target) {
        target.classList.add('active');
    }
document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', linkHref === cleanId);
});
window.scrollTo({ top:0, behavior: "instant"})
const mobileMenu = document.getElementById('navLinksMobile');
if (mobileMenu) mobileMenu.classList.remove('active')
}
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        showPage(href);
    });
});
const heroStartBtn = document.getElementById('heroStartBtn');
if (heroStartBtn) {
    heroStartBtn.addEventListener('click', () => showPage('portfolio-page'));
}
const seeHowItWorksBtn = document.getElementById('seeHowItWorksBtn');
if (seeHowItWorksBtn) {
    seeHowItWorksBtn.addEventListener('click', () => showPage('learn-page'));
}
const hamburgerBtn = document.getElementById('hamburger');
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        const mobileMenu = document.getElementById('navLinksMobile');
        if (mobileMenu) mobileMenu.classList.toggle('active');
    });
}
function renderPreviewChart() {
    const ctx = document.getElementById('previewChart');
    if (!ctx) return;
    previewChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['ETFs', 'Shares', 'Bonds'],
            datasets: [{
                data: [50, 30, 20],
                backgroundColor: ['#5B8DEF', '#3DD9A8', '#F2A93B'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '68%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
}
renderPreviewChart();
const riskSlider = document.getElementById('risk');
const riskValueLabel = document.getElementById('riskValue');

if (riskSlider && riskValueLabel) {
    riskSlider.addEventListener('input', () => {
        riskValueLabel.innerText = riskSlider.value;
    });
}
function setupFirebase() {
    const { onAuthStateChanged } = window.firebaseFns;
    onAuthStateChanged(window.firebaseAuth, (user) => {
        currentUser = user;
        const greeting = document.getElementById('userGreeting');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
 
        if (user) {
            if (greeting) {
                greeting.textContent = `Hi, ${user.email.split('@')[0]}`;
                greeting.classList.remove('hidden');
            }
            if (loginBtn) loginBtn.classList.add('hidden');
            if (signupBtn) signupBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if (greeting) greeting.classList.add('hidden');
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (signupBtn) signupBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    });
}
if (window.firebaseAuth) {
    setupFirebase();
} else {
    window.addEventListener ('firebase-ready', setupFirebase);
}
const authModal = document.getElementById('authModal');
function openAuthModal(mode) {
    authMode=mode;
    const modalTitle = document.getElementById ('authModalTitle');
    const submitBtn = document.getElementById ('authSubmitBtn');
    const switchText = document.getElementById ('authSwitchText');
    const switchLink = document.getElementById ('authSwitchLink');
    const authError = document.getElementById ('authError');
    if (modalTitle) modalTitle.textContent=mode==='login'?"Log in to Quantara": 'Create your account';
    if (submitBtn) submitBtn.textContent=mode==='login'?'Log in ':'Sign up';
    if (switchText) switchText.textContent=mode==='login'?"Don't have an account?":"Already have an account";
    if (switchLink) switchLink.textContent=mode==='login'?'Sign up':'Log in'
    if (authError) authError.classList.add('hidden');
    if (authModal) authModal.classList.remove('hidden')
}
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal('signup'));

const modalClose= document.getElementById('modalClose');
if (modalClose) modalClose.addEventListener('click',() => {
    if (authModal) authModal.classList.add('hidden');
});

const authSwitchLink = document.getElementById('authSwitchLink');
if (authSwitchLink) {
    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal(authMode === 'login' ? 'signup' : 'login');

    });
}

const logoutBtn= document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await window.firebaseFns.signOut(window.firebaseAuth);
        showPage('home');
    });
}

const authForm = document.getElementById('authForm');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');
        if (errorEl) errorEl.classList.add('hidden')
            try {
        if (authMode==='login'){
            await window.firebaseFns.signInWithEmailAndPassword(window.firebaseAuth, email, password);
        } else {
            const cred = await window.firebaseFns.createUserWithEmailAndPassword(window.firebaseAuth, email, password);
            await window.firebaseFns.setDoc (
                window.firebaseFns.doc(window.firebaseDb, "users", cred.user.uid),
                { email, createdAt: window.firebaseFns.serverTimestamp()}
            );
        }
        if (authModal) authModal.classList.add('hidden')
        authForm.reset();
        } catch (err) {
            if (errorEl) {
                errorEl.textContent= friendlyAuthError(err.code);
                errorEl.classList.remove('hidden');
            }
        }
    });
}

function friendlyAuthError(code){
    const map= {
        'auth/email-already-in-use': 'That email is already registered. Try logging in instead',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/user-not-found': 'No account was found with that email',
        'auth/invalid-credential': 'Incorrect email or password'
    };
    return map[code] || 'Something went wrong. Please try again.';
}

const portfolioForm = document.getElementById('portfolioForm');
if (portfolioForm) {
    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
     
        const profile = {
            fullName: document.getElementById('fullName').value,
            age: document.getElementById('age').value,
            goal: document.getElementById('goal').value,
            horizon: document.getElementById('horizon').value,
            risk: document.getElementById('risk').value
        };
     
        document.getElementById('intakeView').classList.add('hidden');
        document.getElementById('loadingView').classList.remove('hidden');
     
        try {
            const recommendation = await getAIRecommendation(profile);
            renderResults(profile, recommendation);
     
            // Save to Firestore if logged in
            if (currentUser && window.firebaseDb) {
                try {
                    await window.firebaseFns.addDoc(
                        window.firebaseFns.collection(window.firebaseDb, "portfolios"),
                        {
                            userId: currentUser.uid,
                            profile,
                            recommendation,
                            createdAt: window.firebaseFns.serverTimestamp()
                        }
                    );
                } catch (dbErr) {
                    console.warn("Could not save portfolio to Firestore:", dbErr);
                }
            }
     
            document.getElementById('loadingView').classList.add('hidden');
            document.getElementById('resultsView').classList.remove('hidden');
     
        } catch (err) {
            console.error(err);
            document.getElementById('loadingView').classList.add('hidden');
            document.getElementById('intakeView').classList.remove('hidden');
            alert("Sorry, Quantara couldn't generate your portfolio right now. Please check your OpenRouter API key / connection and try again.\n\n" + err.message);
        }
    });
}
 
const backToFormBtn = document.getElementById('backToFormBtn');
if (backToFormBtn) {
    backToFormBtn.addEventListener('click', () => {
        document.getElementById('resultsView').classList.add('hidden');
        document.getElementById('intakeView').classList.remove('hidden');
    });
}
 

async function getAIRecommendation(profile) {
    const prompt = `You are Quantara, an AI investment portfolio advisor for everyday Australians who cannot afford traditional financial advice.
 
A user has submitted the following profile:
- Name: ${profile.fullName}
- Age: ${profile.age}
- Investment goal: ${profile.goal}
- Time horizon: ${profile.horizon}
- Risk tolerance: ${profile.risk}/5 (1 = very low risk, 5 = very high risk)
 
Based on this profile, recommend a portfolio allocation across exactly three asset classes: ETFs, Shares, and Bonds. The three percentages MUST add up to exactly 100.
Additionally, recommend 3 specific real-world investment instruments available to Australians (such as ASX-listed ETFs like VAS or VGS, blue-chip ASX Shares like BHP or CBA, or Australian bond options like IAF)
Then write:
1. A plain-English explanation (2-3 sentences, no jargon) of why this specific allocation suits this user.
2. A short educational note (2-3 sentences) explaining what the dominant asset class in their portfolio actually is, written for someone with no investing background.
 
Respond with ONLY valid JSON in exactly this format, with no markdown formatting, no backticks, and no extra text:
{
  "etf": <number>,
  "shares": <number>,
  "bonds": <number>,
  "explanation": "<string>",
  "education": "<string>"
}`;
 
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: "user", content: prompt }]
        })
    });
 
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }
    
    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    

    const startIdx = rawText.indexOf('{');
    const endIdx = rawText.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
        throw new Error("The AI provided an invalid response format. Please try submitting again.");
    }
    
    const cleanJson = rawText.substring(startIdx, endIdx + 1);

    let parsed;
    try {
        parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
        throw new Error("Couldn't parse the AI's response format correctly. Please generate again.");
    }

    
    parsed.etf = parseInt(parsed.etf) || 0;
    parsed.shares = parseInt(parsed.shares) || 0;
    parsed.bonds = parseInt(parsed.bonds) || 0;

    
    const total = parsed.etf + parsed.shares + parsed.bonds;
    if (total !== 100 && total > 0) {
        const scale = 100 / total;
        parsed.etf = Math.round(parsed.etf * scale);
        parsed.shares = Math.round(parsed.shares * scale);
        parsed.bonds = 100 - parsed.etf - parsed.shares;
    } else if (total === 0) {
        parsed.etf = 40;
        parsed.shares = 40;
        parsed.bonds = 20;
    }

    return parsed;
}
 

function renderResults(profile, rec) {
    document.getElementById('resultUserName').textContent = profile.fullName;
    document.getElementById('resultSummary').textContent =
        `Based on risk tolerance ${profile.risk}/5 and a ${profile.horizon.toLowerCase()} horizon, targeting: ${profile.goal.toLowerCase()}.`;
 
    document.getElementById('explanationText').textContent = rec.explanation;
 
    const eduWrap = document.getElementById('educationContent');
    if (eduWrap) {
        eduWrap.innerHTML = `<p>${rec.education}</p>`;
    }
 
    
    const ctx = document.getElementById('resultsChart');
    if (ctx) {
        if (resultsChartInstance) resultsChartInstance.destroy();
        resultsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['ETFs', 'Shares', 'Bonds'],
                datasets: [{
                    data: [rec.etf, rec.shares, rec.bonds],
                    backgroundColor: ['#5B8DEF', '#3DD9A8', '#F2A93B'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '68%',
                plugins: { legend: { display: false } }
            }
        });
    }
 
    
    const legend = document.getElementById('allocationLegend');
    if (legend) {
        legend.innerHTML = `
            <div class="leg-row"><span class="leg-name"><i style="background:#5B8DEF"></i>ETFs</span><span class="leg-pct">${rec.etf}%</span></div>
            <div class="leg-row"><span class="leg-name"><i style="background:#3DD9A8"></i>Shares</span><span class="leg-pct">${rec.shares}%</span></div>
            <div class="leg-row"><span class="leg-name"><i style="background:#F2A93B"></i>Bonds</span><span class="leg-pct">${rec.bonds}%</span></div>
        `;
    }
}
 

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Thanks for your message! (This is a student prototype — messages aren't actually sent anywhere yet.)");
        e.target.reset();
    });
}
