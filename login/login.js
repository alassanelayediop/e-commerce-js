const API = "http://localhost:8081";

function showTab(tab) {
    document.getElementById("form-login").style.display    = tab === "login"    ? "block" : "none";
    document.getElementById("form-register").style.display = tab === "register" ? "block" : "none";
    document.getElementById("tab-login").classList.toggle("active",    tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
}

async function login() {
    const email       = document.getElementById("login-email").value.trim();
    const mot_de_passe = document.getElementById("login-mdp").value;
    if (!email || !mot_de_passe) return Swal.fire({ icon:"warning", text:"Remplis tous les champs." });

    const res  = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ nom: data.nom, email: data.email }));
        Swal.fire({ icon:"success", title:`Bienvenue ${data.nom} !`, timer:1200, showConfirmButton:false })
            .then(() => window.location.href = "index.html");
    } else {
        Swal.fire({ icon:"error", title:"Échec", text: data.error });
    }
}

async function register() {
    const nom         = document.getElementById("reg-nom").value.trim();
    const email       = document.getElementById("reg-email").value.trim();
    const mot_de_passe = document.getElementById("reg-mdp").value;
    if (!nom || !email || !mot_de_passe)
        return Swal.fire({ icon:"warning", text:"Remplis tous les champs." });
    if (mot_de_passe.length < 6)
        return Swal.fire({ icon:"warning", text:"Mot de passe trop court (min 6 caractères)." });

    const res  = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, mot_de_passe })
    });
    const data = await res.json();
    if (res.ok) {
        Swal.fire({ icon:"success", title:"Compte créé !", text:"Tu peux maintenant te connecter." })
            .then(() => showTab("login"));
    } else {
        Swal.fire({ icon:"error", title:"Erreur", text: data.error });
    }
}

// Si déjà connecté, rediriger directement
if (localStorage.getItem("token")) window.location.href = "index.html";