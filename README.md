## Projet 4 — Système de messagerie asynchrone avec file d'attente


## Objectif
Concevoir un système où plusieurs services communiquent de façon asynchrone via
une file de messages plutôt que des appels directs (découplage producteur/consommateur).

## Architecture
```
   ┌──────────────┐    publie    ┌─────────────────┐  consomme  ┌──────────────────┐
   │  Producteur  │ ──────────► │   RabbitMQ       │ ─────────► │  Consommateur    │
   │ (API REST)   │             │ (Message Broker)  │            │ (Worker email)   │
   └──────────────┘             └─────────────────-┘            └──────────────────┘
                                     ▲
                                     │ consomme
                                ┌────┴─────────────┐
                                │  Consommateur 2  │
                                │ (Worker rapport) │
                                └──────────────────┘
```

## Files de messages
| File | Producteur | Consommateur | Usage |
|------|-----------|-------------|-------|
| `email.queue` | Toute action utilisateur | worker-email | Envoi d'emails |
| `report.queue` | Scheduler quotidien | worker-report | Génération de rapports |

## Démarrage
```bash
cp .env.example .env
docker-compose up --build
# RabbitMQ UI : http://localhost:15672 (guest/guest)
# API Producteur : http://localhost:3000
```

## Question d'entretien
> **Pourquoi préférer une communication asynchrone à un appel API synchrone ?**
>
> L'asynchronisme découple les services : si le worker email est en panne, l'action
> utilisateur est quand même acceptée et le message est conservé dans la file.
> Le système est aussi plus résilient aux pics de charge : les messages s'accumulent
> dans la file et sont traités à la capacité du consommateur, sans saturer le producteur.

## Ligne CV
> « Système de messagerie asynchrone — file d'attente RabbitMQ, découplage producteur/consommateur. »
