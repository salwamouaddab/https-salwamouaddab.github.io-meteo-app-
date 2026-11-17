// Transforme le code météo (0, 3, 45...) en texte + icône
function decrireCode(code) {
  if (code === 0) return { texte: "Ciel dégagé", icone: "☀️" };
  if (code === 1) return { texte: "Plutôt dégagé", icone: "🌤️" };
  if (code === 2) return { texte: "Partiellement nuageux", icone: "⛅" };
  if (code === 3) return { texte: "Couvert", icone: "☁️" };
  if (code === 45 || code === 48) return { texte: "Brouillard", icone: "🌫️" };
  if (code >= 51 && code <= 57) return { texte: "Bruine", icone: "🌦️" };
  if (code >= 61 && code <= 67) return { texte: "Pluie", icone: "🌧️" };
  if (code >= 71 && code <= 77) return { texte: "Neige", icone: "❄️" };
  if (code >= 80 && code <= 82) return { texte: "Averses", icone: "🌦️" };
  if (code >= 95) return { texte: "Orage", icone: "⛈️" };
  return { texte: "Inconnu", icone: "🌡️" };
}

const message = document.querySelector("#message");

// Affiche un message (normal ou erreur)
function afficherMessage(texte, estErreur) {
  message.textContent = texte;
  message.classList.toggle("erreur", estErreur === true);
}

// ÉTAPE A : trouver les coordonnées d'une ville à partir de son nom
async function trouverVille(nom) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nom)}&count=1&language=fr&format=json`;
  const reponse = await fetch(url);
  const donnees = await reponse.json();

  if (!donnees.results || donnees.results.length === 0) {
    return null; // ville introuvable
  }
  return donnees.results[0]; // contient name, country, latitude, longitude
}

// ÉTAPE B : charger la météo à partir des coordonnées
async function chargerMeteo(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`;
  const reponse = await fetch(url);
  const donnees = await reponse.json();
  const actuel = donnees.current;
  const infos = decrireCode(actuel.weather_code);

  document.querySelector("#temperature").textContent = Math.round(actuel.temperature_2m) + "°C";
  document.querySelector("#description").textContent = infos.texte;
  document.querySelector("#icone").textContent = infos.icone;
  document.querySelector("#vent").textContent = "💨 Vent : " + Math.round(actuel.wind_speed_10m) + " km/h";
}

// On enchaîne A puis B
async function rechercherVille(nom) {
  if (nom.trim() === "") {
    afficherMessage("Veuillez entrer le nom d'une ville.", true);
    return;
  }

  afficherMessage("Chargement...", false);

  try {
    const ville = await trouverVille(nom);

    if (ville === null) {
      afficherMessage("Ville introuvable : « " + nom + " ».", true);
      return;
    }

    await chargerMeteo(ville.latitude, ville.longitude);
    document.querySelector("#nomVille").textContent = ville.name + ", " + ville.country;
    afficherMessage("", false);
  } catch (erreur) {
    afficherMessage("Impossible de charger la météo. Vérifiez votre connexion.", true);
  }
}

// Quand on clique sur "Rechercher" (ou qu'on appuie sur Entrée)
document.querySelector("#formRecherche").addEventListener("submit", function (evenement) {
  evenement.preventDefault(); // empêche la page de se recharger
  rechercherVille(document.querySelector("#champVille").value);
});

// Au démarrage : on charge la ville écrite dans la case (Casablanca)
rechercherVille(document.querySelector("#champVille").value);