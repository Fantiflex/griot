#!/usr/bin/env python3
"""
Valide des fichiers JSONL d'entraînement selon la charte et data/SCHEMA.md.

  python scripts/validate.py data/seed/*.jsonl data/synthetic_*.jsonl --report data/validation_report.md
  python scripts/validate.py data/synthetic_fr.jsonl --write-clean data/synthetic_fr.clean.jsonl

Les exemples rejetés sont listés avec la raison pour relecture humaine.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

REQUIRED_META = ("source", "lang", "region", "subject", "kind", "charter_version")
KINDS = {"hint", "feedback", "answer", "tell", "ask", "refusal", "encourage"}
SUBJECTS = {"math", "language", "history", "science", "general"}

# Motifs interdits par la charte (minuscules, sans accents). Volontairement larges : un rejet = une relecture.
BLACKLIST = {
    "fr": [
        r"\bnul(le)?s?\b", r"\bidiot", r"\bstupide", r"\bimb[eé]cile", r"\bfouett", r"\bbaston", r"\bchicot", r"\bpunir", r"\bpunition",
        r"\bfrapp", r"\bgifl", r"\bles filles (ne|sont)", r"\bles gar[cç]ons (ne|sont)", r"\bles africains n'", r"\bsauvage", r"\bprimitif",
        r"\bconverti", r"\bpri[eè]re\b.*\boblig", r"\bton adresse", r"\bo[uù] habites", r"\bnum[eé]ro de t[eé]l[eé]phone",
    ],
    "sw": [
        r"\bmjinga", r"\bpumbavu", r"\bchapa", r"\bviboko", r"\badhibu", r"\bkupig", r"\bwasichana (hawa|si)", r"\bwavulana (hawa|si)",
        r"\bwaafrika hawa", r"\bwashenzi", r"\banwani yako", r"\bunaishi wapi", r"\bnamba ya simu",
    ],
}

# Mots très fréquents, pour une détection grossière de la langue.
STOPWORDS = {
    "fr": {"le", "la", "les", "et", "vous", "votre", "est", "pas", "une", "des", "que", "sur", "dans", "pour", "avec", "qui", "ce"},
    "sw": {"na", "ya", "wa", "kwa", "ni", "la", "za", "cha", "vya", "mna", "kila", "lakini", "sasa", "kisha", "hapana", "ndiyo", "yenu"},
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def trigrams(s: str) -> set[str]:
    s = re.sub(r"\s+", " ", norm(s))
    return {s[i : i + 3] for i in range(max(0, len(s) - 2))}


def jaccard(a: set, b: set) -> float:
    return len(a & b) / max(1, len(a | b))


def detect_lang(text: str) -> str | None:
    words = set(re.findall(r"[a-zà-ÿ']+", text.lower()))
    scores = {lang: len(words & sw) for lang, sw in STOPWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] >= 2 else None


def check(ex: dict, idx: int) -> list[str]:
    problems: list[str] = []
    msgs = ex.get("messages")
    meta = ex.get("meta") or {}
    if not isinstance(msgs, list) or len(msgs) < 2:
        return ["messages manquants"]
    if any(m.get("role") == "system" for m in msgs):
        problems.append("message système présent (il est injecté par prepare_dataset.py)")
    roles = [m.get("role") for m in msgs]
    if roles[0] != "user" or roles[-1] != "assistant":
        problems.append("la conversation doit commencer par user et finir par assistant")
    for k in REQUIRED_META:
        if k not in meta:
            problems.append(f"meta.{k} manquant")
    if meta.get("kind") not in KINDS:
        problems.append(f"meta.kind inconnu : {meta.get('kind')}")
    if meta.get("subject") not in SUBJECTS:
        problems.append(f"meta.subject inconnu : {meta.get('subject')}")

    lang = meta.get("lang", "fr")
    assistant = msgs[-1].get("content", "") or ""
    user = msgs[0].get("content", "") or ""

    n = len(assistant)
    lo, hi = (60, 1200) if meta.get("kind") == "tell" else (60, 600)
    if not (lo <= n <= hi):
        problems.append(f"longueur assistant {n} hors [{lo}, {hi}]")
    if re.search(r"(^|\n)\s*([-*•#]|\d+[.)])\s", assistant) or "**" in assistant:
        problems.append("markdown ou liste dans la réponse")
    if re.search(r"[\U0001F300-\U0001FAFF]", assistant):
        problems.append("emoji dans la réponse")

    # Pas de réponse révélée avant le 3e essai
    attempt = meta.get("attempt")
    if meta.get("kind") == "hint" and (attempt is None or attempt < 3):
        m = re.search(r"(Réponse attendue|Jibu linalotarajiwa)\s*:\s*(.+)", user)
        if m:
            expected = norm(m.group(2).strip())
            tokens = [tk for tk in re.findall(r"[a-z0-9]+", expected) if len(tk) >= 1]
            # Un nombre attendu présent tel quel dans l'indice = réponse donnée.
            for tk in tokens:
                if tk.isdigit() and re.search(rf"\b{re.escape(tk)}\b", norm(assistant)):
                    problems.append(f"indice qui révèle la réponse « {tk} » avant le 3e essai")
                    break
            else:
                if len(expected) >= 6 and expected in norm(assistant):
                    problems.append("indice qui révèle la réponse attendue avant le 3e essai")

    for pat in BLACKLIST.get(lang, []):
        if re.search(pat, norm(assistant)):
            problems.append(f"motif interdit par la charte : /{pat}/")
            break

    detected = detect_lang(assistant)
    if detected and detected != lang:
        problems.append(f"langue détectée {detected} ≠ meta.lang {lang}")
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--report", default=None, help="Rapport Markdown")
    ap.add_argument("--write-clean", default=None, help="Écrit les exemples valides dans ce fichier")
    ap.add_argument("--dedupe-threshold", type=float, default=0.85, help="Jaccard trigrammes au-dessus duquel on considère un doublon")
    args = ap.parse_args()

    rows: list[tuple[str, int, dict]] = []
    for f in args.files:
        for i, line in enumerate(Path(f).read_text(encoding="utf8").splitlines()):
            if not line.strip():
                continue
            try:
                rows.append((f, i + 1, json.loads(line)))
            except json.JSONDecodeError as exc:
                rows.append((f, i + 1, {"_invalid_json": str(exc)}))

    valid: list[dict] = []
    rejected: list[tuple[str, int, list[str]]] = []
    seen: list[set[str]] = []
    reasons = Counter()
    for f, ln, ex in rows:
        if "_invalid_json" in ex:
            rejected.append((f, ln, ["JSON invalide"]))
            reasons["JSON invalide"] += 1
            continue
        problems = check(ex, ln)
        if not problems:
            tg = trigrams(ex["messages"][-1]["content"])
            if any(jaccard(tg, s) >= args.dedupe_threshold for s in seen):
                problems.append("doublon proche d'un autre exemple")
            else:
                seen.append(tg)
        if problems:
            rejected.append((f, ln, problems))
            for p in problems:
                reasons[p.split(" :")[0].split(" «")[0]] += 1
        else:
            valid.append(ex)

    by_lang = Counter(ex["meta"]["lang"] for ex in valid)
    by_kind = Counter(ex["meta"]["kind"] for ex in valid)
    by_subject = Counter(ex["meta"]["subject"] for ex in valid)

    lines = [
        "# Rapport de validation",
        "",
        f"- Exemples lus : {len(rows)}",
        f"- Valides : {len(valid)}",
        f"- Rejetés : {len(rejected)}",
        "",
        "## Répartition des valides",
        f"- Langues : {dict(by_lang)}",
        f"- Types : {dict(by_kind)}",
        f"- Matières : {dict(by_subject)}",
        "",
        "## Raisons de rejet",
        *[f"- {r} : {c}" for r, c in reasons.most_common()],
        "",
        "## Rejets (à relire)",
        *[f"- `{f}:{ln}` — {'; '.join(p)}" for f, ln, p in rejected[:500]],
    ]
    report = "\n".join(lines)
    print(report)
    if args.report:
        Path(args.report).write_text(report + "\n", encoding="utf8")
    if args.write_clean:
        with Path(args.write_clean).open("w", encoding="utf8") as out:
            for ex in valid:
                out.write(json.dumps(ex, ensure_ascii=False) + "\n")
        print(f"\n{len(valid)} exemples valides écrits dans {args.write_clean}")
    sys.exit(0 if not rejected or args.write_clean else 1)


if __name__ == "__main__":
    main()
