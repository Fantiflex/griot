#!/usr/bin/env python3
"""
Génère des dialogues synthétiques « Griot » à partir de seeds/topics.yaml.

Le générateur appelle n'importe quel serveur compatible OpenAI (Ollama, vLLM, ...).
La charte éthique est le prompt système ; les exemples « gold » servent de modèles de style.
Chaque sortie est un objet {"user": ..., "assistant": ...} converti au schéma data/SCHEMA.md.
La validation stricte est faite ensuite par validate.py.

Exemple :
  python scripts/generate_synthetic.py --lang fr --n 400 --out data/synthetic_fr.jsonl \
      --base-url http://localhost:11434/v1 --model gemma3:12b
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
from pathlib import Path

import yaml
from openai import OpenAI
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[2]
CHARTER = (ROOT / "ethics" / "charte-griot.md").read_text(encoding="utf8")
CHARTER_VERSION = re.search(r"Version\s+([\d.]+)", CHARTER).group(1) if re.search(r"Version\s+([\d.]+)", CHARTER) else "0.1"

LANG_RULES = {
    "fr": "Tu écris uniquement en français simple et oral, pour des élèves de 10 à 14 ans.",
    "sw": "Unaandika kwa Kiswahili sanifu, rahisi na cha mazungumzo, kwa wanafunzi wa miaka 10 hadi 14. Kiswahili tu.",
}

USER_LABELS = {
    "fr": {"journey": "Parcours", "workshop": "Atelier", "prompt": "Consigne", "expected": "Réponse attendue", "attempt": "Essai numéro {a} sur 3.", "wrote": "Le groupe a écrit sur l’ardoise", "asks": "Le groupe demande"},
    "sw": {"journey": "Safari", "workshop": "Warsha", "prompt": "Maagizo", "expected": "Jibu linalotarajiwa", "attempt": "Jaribio la {a} kati ya 3.", "wrote": "Kikundi kimeandika ubaoni", "asks": "Kikundi kinauliza"},
}


def t(d, lang):
    return d.get(lang) or d.get("fr") or ""


def load_gold(lang: str, k: int = 3) -> list[dict]:
    p = ROOT / "finetune" / "data" / "seed" / f"gold_{lang}.jsonl"
    if not p.exists():
        return []
    rows = [json.loads(l) for l in p.read_text(encoding="utf8").splitlines() if l.strip()]
    return random.sample(rows, min(k, len(rows)))


def pick_weighted(items):
    weights = [i.get("weight", 1) for i in items]
    return random.choices(items, weights=weights, k=1)[0]


def build_request(topics: dict, lang: str) -> tuple[str, dict]:
    culture = random.choice(topics["cultures"])
    subject_id = random.choice(list(topics["subjects"].keys()))
    subject = topics["subjects"][subject_id]
    notion = random.choice(subject["notions"])
    error = random.choice(subject["typical_errors"])
    situation = pick_weighted(topics["situations"])
    gold = load_gold(lang)

    examples = "\n\n".join(
        f"EXEMPLE DE STYLE {i + 1}\nUSER:\n{g['messages'][0]['content']}\nASSISTANT:\n{g['messages'][1]['content']}" for i, g in enumerate(gold)
    )
    labels = USER_LABELS[lang]
    attempt = situation.get("attempt")
    spec = f"""Génère UN exercice et UN échange professeur-groupe, au format JSON strict :
{{"journey": "titre court du parcours", "workshop": "titre court de l'atelier", "prompt": "la consigne posée au groupe", "expected": "réponse attendue courte ou vide si ouverte", "student": "ce que le groupe a écrit ou demandé", "assistant": "la réponse du Griot"}}

Contexte culturel : {t(culture['label'], lang)} (objets : {t(culture['objects'], lang)}).
Matière : {subject_id}. Notion du programme : {t(notion, lang)}.
Situation : {t(situation, lang)}.
{"Erreur typique de l'élève à mettre en scène : " + t(error, lang) if situation['kind'] in ('hint', 'answer') else ''}
{"Numéro d'essai : " + str(attempt) + " sur 3." if attempt else ''}

Règles pour « assistant » : 2 à 4 phrases, oral, sans liste, sans markdown ; nomme ce qui est juste dans la tentative ; indice ou question socratique si essai 1 ou 2 ; solution complète et raisonnée si essai 3 ; jamais la réponse avant l'essai 3. {LANG_RULES[lang]}
« student » est écrit comme un élève de 12 ans l'écrirait, court.

{examples}

Réponds uniquement avec l'objet JSON."""
    meta = {
        "source": "synthetic",
        "lang": lang,
        "region": culture["region"],
        "subject": subject_id,
        "kind": situation["kind"],
        "attempt": attempt,
        "charter_version": CHARTER_VERSION,
        "author": "generate_synthetic.py",
        "reviewed": False,
        "grade": topics.get("grade", "10-14"),
        "seed": {"culture": culture["id"], "notion": notion["id"]},
    }
    return spec, meta


def to_example(obj: dict, meta: dict, lang: str) -> dict | None:
    labels = USER_LABELS[lang]
    for k in ("journey", "workshop", "prompt", "student", "assistant"):
        if not isinstance(obj.get(k), str) or not obj[k].strip():
            return None
    lines = [f"{labels['journey']} : {obj['journey'].strip()}.", f"{labels['workshop']} : {obj['workshop'].strip()}.", f"{labels['prompt']} : {obj['prompt'].strip()}"]
    if obj.get("expected"):
        lines.append(f"{labels['expected']} : {str(obj['expected']).strip()}")
    if meta.get("attempt"):
        lines.append(labels["attempt"].format(a=meta["attempt"]))
    kind = meta["kind"]
    if kind in ("tell", "ask"):
        user = "\n".join(lines[:2]) + "\n\n" + obj["student"].strip()
    else:
        who = labels["wrote"] if kind in ("hint", "answer", "feedback") and meta.get("attempt") else labels["asks"]
        user = "\n".join(lines) + f"\n\n{who} : « {obj['student'].strip()} »"
    return {"messages": [{"role": "user", "content": user}, {"role": "assistant", "content": obj["assistant"].strip()}], "meta": meta}


def extract_json(raw: str) -> dict | None:
    m = re.search(r"\{[\s\S]*\}", raw)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["fr", "sw"], required=True)
    ap.add_argument("--n", type=int, default=200)
    ap.add_argument("--out", required=True)
    ap.add_argument("--base-url", default="http://localhost:11434/v1")
    ap.add_argument("--api-key", default="ollama")
    ap.add_argument("--model", default="gemma3:4b")
    ap.add_argument("--temperature", type=float, default=0.9)
    ap.add_argument("--topics", default=str(ROOT / "finetune" / "seeds" / "topics.yaml"))
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)
    topics = yaml.safe_load(Path(args.topics).read_text(encoding="utf8"))
    client = OpenAI(base_url=args.base_url, api_key=args.api_key)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    system = CHARTER + "\n\n## Rôle\nTu es l'auteur des données d'entraînement du Griot. Tu respectes la charte ci-dessus à la lettre. " + LANG_RULES[args.lang]
    ok = 0
    with out.open("a", encoding="utf8") as f, tqdm(total=args.n, desc=f"synthétique {args.lang}") as bar:
        attempts = 0
        while ok < args.n and attempts < args.n * 3:
            attempts += 1
            spec, meta = build_request(topics, args.lang)
            try:
                res = client.chat.completions.create(
                    model=args.model,
                    messages=[{"role": "system", "content": system}, {"role": "user", "content": spec}],
                    temperature=args.temperature,
                    max_tokens=700,
                )
                raw = res.choices[0].message.content or ""
            except Exception as exc:  # réseau, quota, modèle absent
                print(f"\n[erreur modèle] {exc}", file=sys.stderr)
                continue
            obj = extract_json(raw)
            ex = to_example(obj, meta, args.lang) if obj else None
            if not ex:
                continue
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")
            f.flush()
            ok += 1
            bar.update(1)
    print(f"{ok} exemples écrits dans {out} ({attempts} appels). Lancer ensuite validate.py.")


if __name__ == "__main__":
    main()
