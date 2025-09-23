// app/assets/js/distromanager.js

// Distribution (Nebula) Anbindung für den Launcher.
// Lädt die distribution.json und liefert sie an den Rest der App.

// Abhängigkeiten
const { DistributionAPI } = require('helios-core/common')
const ConfigManager = require('./configmanager')

/**
 * Azacraft Distribution URL (fest verdrahtet).
 * Diese URL wird immer verwendet – Nutzeränderungen in den Settings
 * werden ignoriert (siehe get/set unten).
 */
exports.REMOTE_DISTRO_URL = 'https://launcher.azacraft.de/manifest/distribution.json'

// DistributionAPI-Instanz
const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // wird vom Preloader injiziert
    null, // wird vom Preloader injiziert
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api

/**
 * Getter/Setter „gelockt“ auf die feste Azacraft-URL.
 * Falls andere Teile der App versuchen, die URL zu lesen/setzen,
 * sorgen diese Funktionen dafür, dass immer unsere URL genutzt wird.
 */
exports.getDistributionURL = () => exports.REMOTE_DISTRO_URL
exports.setDistributionURL = () => { /* Änderung ignoriert – Lockdown */ }
