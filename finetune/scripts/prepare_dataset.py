#!/usr/bin/env python3
"""
Assemble les sources (gold, synthétique validé, dialogues de classe) en train.jsonl / val.jsonl,
en injectant le prompt système construit à partir de la charte.

  python scripts/prepare_dataset.py --inputs data/seed/*.jsonl data/synthetic_*.clean.jsonl data/classroom_*.jsonl \
      --out-dir data --val-ratio 0.08

Équilibrage : on plafonne chaque (langue, kind) à --cap exemples pour éviter qu'un type domine.
Les exemples « gold » sont toujours gardés et dupliqués --gold-weight fois (ancrage du style).
Les exemples de classe non produits par le modèle (fromModel=false, texte scripté) sont écartés :
ils n'apprennent rien de nouveau au modèle.
"""

from __future__ import annotations

import argparse
import json
import random
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHARTER = (ROOT / "ethics" / "charte-griot.md").read_text(encoding="utf8")

LANG_RULE = {
    "fr": "Langue de la classe : Français. Tu réponds uniquement en français simple, oral, pour des élèves de 10 à 14 ans.",
    "sw": "Langue de la classe : Kiswahili. Unajibu kwa Kiswahili sanifu, rahisi na cha mazungumzo, kwa wanafunzi wa miaka 10 hadi 14. Jibu kwa Kiswahili tu.",
}


def system_prompt(lang: str) -> str:
    # Identique à server/griot/prompts.ts : le modèle voit à l'entraînement ce qu'il verra en production.
    return "\n".join(
        [
            CHARTER,
            "",
            "## Consignes de génération",
            LANG_RULE.get(lang, LANG_RULE["fr"]),
            "Deux à quatre phrases maximum, pensées pour être lues à voix haute. Pas de listes, pas de titres, pas de markdown, pas d’emoji.",
            "Tu parles au groupe (« vous »), jamais à un seul élève.",
            "Tu ne donnes jamais la réponse brute avant le troisième essai sincère du groupe.",
        ]
    )


def load(paths: list[str]) -> list[dict]:
    rows = []
    for p in paths:
        for path in sorted(Path().glob(p)) if any(ch in p for ch in "*?[") else [Path(p)]:
            if not path.exists():
                continue
            for line in path.read_text(encoding="utf8").splitlines():
                if line.strip():
                    rows.append(json.loads(line))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--inputs", nargs="+", required=True)
    ap.add_argument("--out-dir", default="data")
    ap.add_argument("--val-ratio", type=float, default=0.08)
    ap.add_argument("--cap", type=int, default=600, help="max par (langue, kind)")
    ap.add_argument("--gold-weight", type=int, default=3)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    random.seed(args.seed)

    rows = load(args.inputs)
    buckets: dict[tuple[str, str], list[dict]] = defaultdict(list)
    gold: list[dict] = []
    dropped = 0
    for ex in rows:
        meta = ex.get("meta", {})
        if meta.get("source") == "classroom" and not meta.get("fromModel", True):
            dropped += 1
            continue
        if any(m.get("role") == "system" for m in ex["messages"]):
            ex["messages"] = [m for m in ex["messages"] if m.get("role") != "system"]
        if meta.get("source") == "gold":
            gold.append(ex)
        else:
            buckets[(meta.get("lang", "fr"), meta.get("kind", "hint"))].append(ex)

    selected: list[dict] = []
    for key, items in sorted(buckets.items()):
        random.shuffle(items)
        selected.extend(items[: args.cap])

    random.shuffle(selected)
    n_val = max(1, int(len(selected) * args.val_ratio)) if selected else 0
    val, train = selected[:n_val], selected[n_val:]
    # Le gold va dans train (dupliqué) et une copie unique dans val pour mesurer le style.
    train.extend(gold * args.gold_weight)
    val.extend(gold)
    random.shuffle(train)

    def finalize(ex: dict) -> dict:
        lang = ex.get("meta", {}).get("lang", "fr")
        return {"messages": [{"role": "system", "content": system_prompt(lang)}, *ex["messages"]], "meta": ex.get("meta", {})}

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, items in (("train.jsonl", train), ("val.jsonl", val)):
        with (out / name).open("w", encoding="utf8") as f:
            for ex in items:
                f.write(json.dumps(finalize(ex), ensure_ascii=False) + "\n")

    stats = {
        "inputs": len(rows),
        "dropped_scripted_classroom": dropped,
        "gold": len(gold),
        "train": len(train),
        "val": len(val),
        "by_lang_kind": {f"{k[0]}/{k[1]}": min(len(v), args.cap) for k, v in sorted(buckets.items())},
        "charter_version": (re.search(r"Version\s+([\d.]+)", CHARTER) or [None, "?"])[1],
    }
    (out / "dataset_stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
