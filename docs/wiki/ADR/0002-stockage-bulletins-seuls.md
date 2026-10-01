# ADR 0002 – Stockage des bulletins seuls (Event Sourcing)

**Statut** : accepté · **Date** : 2026-10-01

---

## Contexte

Dans une élection, la sincérité du scrutin et la confiance citoyenne reposent sur la vérifiabilité intégrale du dépouillement. Si une application stocke directement les compteurs de voix ou la liste finale des élus, plusieurs risques critiques apparaissent :
1. Risque d'incohérence entre les votes exprimés et les totaux affichés suite à un bug ou une interruption.
2. Impossibilité d'effectuer un recomptage indépendant ou d'auditer l'ordre d'arrivée des votes.
3. Rigidité empêchant de recalculer instantanément le résultat sous une autre modalité ou un seuil différent.

---

## Décision

L'état primaire persistant de l'élection est constitué exclusivement de :
1. La configuration initiale (`Config` : candidats, sièges, mode, barème).
2. La séquence immuable des **bulletins horodatés** (`Bulletin[]`).

Tous les résultats (voix par candidat, pourcentages, quorums, repêchages, élus) sont considérés comme des **états dérivés déterministes**, recalculés à la volée par le moteur pur (`engine/`).

---

## Conséquences

### Positives
- **Intégrité et auditabilité parfaites** : le scrutin peut être rejoué à l'identique bulletin par bulletin.
- **Zéro désynchronisation possible** : le tableau de bord reflète toujours exactement la somme des bulletins présents dans l'urne virtuelle.
- **Flexibilité pédagogique** : possibilité de simuler d'autres modes de scrutin ou de modifier le seuil de repêchage sur le même ensemble de bulletins réels.
- **Export standardisé** : l'export CSV/JSON liste précisément les bulletins sans fardeau de structures dérivées instables.

### Négatives
- Recalcul complet à chaque nouveau bulletin inséré. Étant donné la volumétrie typique d'une école (20 à 300 élèves), ce coût de calcul est négligeable (< 2 ms).
