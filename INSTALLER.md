# 📦 Installation finale — fichiers prêts à copier

Tout ce dont tu as besoin est dans ce dossier `final/`. Tu n'as plus rien à
écrire à la main : tu **remplaces** tes fichiers et tu **colles** le dossier
d'interface.

---

## 1. L'interface

```bash
cd ~/habit-tracker-api/api
mkdir -p public
# copie index.html depuis demo-prep/interface/ dans api/public/
```

Résultat : `~/habit-tracker-api/api/public/index.html`

---

## 2. Remplacer les 3 fichiers de l'API

| Fichier fourni dans `final/` | Remplace | Quoi de neuf |
|---|---|---|
| `server.js` | `api/server.js` | + interface statique + endpoint `/metrics` + compteurs prom-client |
| `package.json` | `api/package.json` | + dépendance `prom-client` |
| `prometheus/prometheus.yml` | `prometheus/prometheus.yml` | + cible `habit-api` (métriques de l'API) |

```bash
cd ~/habit-tracker-api
# 1) server.js
cp chemin/vers/final/server.js api/server.js
# 2) package.json
cp chemin/vers/final/package.json api/package.json
# 3) config prometheus
mkdir -p prometheus
cp chemin/vers/final/prometheus/prometheus.yml prometheus/prometheus.yml
```

---

## 3. Remplacer le docker-compose.yaml

```bash
cd ~/habit-tracker-api
# Sauvegarde de l'ancien (par sécurité)
cp docker-compose.yaml docker-compose.yaml.bak
# Remplacement par la version complète (avec monitoring)
cp chemin/vers/final/docker-compose.yaml docker-compose.yaml
```

Le nouveau compose ajoute : `prometheus`, `cadvisor`, `node-exporter`, `grafana`.
✅ Ton réseau `habit_network` et ton volume `postgres_data` sont conservés
(donc ta base de données **ne sera pas perdue**).

---

## 4. Relancer la stack

```bash
cd ~/habit-tracker-api
docker compose build api        # rebuild l'image avec prom-client + interface
docker compose up -d
docker compose ps
```

Tu dois voir **7 conteneurs** :
`api`, `db`, `adminer`, `prometheus`, `cadvisor`, `node-exporter`, `grafana`.

---

## 5. Vérifications finales

| Quoi | Comment |
|---|---|
| Interface | http://localhost:3000 → message + liste des habitudes |
| Métriques API | http://localhost:3000/metrics → plein de lignes `http_requests_total...` |
| Prometheus | http://localhost:9090 → **Status → Targets** : `cadvisor`, `node-exporter`, `habit-api` en **UP** |
| Grafana | http://localhost:3001 → `admin` / `admin` |

---

## 6. Requêtes de démo Prometheus

```
# Nombre total de requêtes reçues par l'API
http_requests_total

# Requêtes par seconde sur l'API (sur 1 minute)
rate(http_requests_total[1m])

# Durée moyenne des requêtes de l'API
rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])

# CPU consommé par le conteneur API
rate(container_cpu_usage_seconds_total{name="habit_tracker_api"}[1m])

# Mémoire utilisée par la base de données
container_memory_usage_bytes{name="habit_tracker_db"}
```

> 💡 **Astuce démo** : ouvre le graphe `rate(http_requests_total[1m])`, puis
> recharge plusieurs fois l'interface http://localhost:3000 → la courbe monte
> en direct. Effet garanti devant le boss. 🎯

---

## ⚠️ Important avant de pousser sur GitHub

Une fois que tout marche en local, commit et push :

```bash
cd ~/habit-tracker-api
git add -A
git commit -m "Add UI interface and Prometheus monitoring"
git push origin main
```

Le webhook déclenchera Jenkins automatiquement. Vérifie que le build passe
(il va installer `prom-client` en plus, donc légèrement plus long).
