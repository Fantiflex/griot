#!/usr/bin/env python3
"""
Entraîne le petit lecteur de chiffres manuscrits utilisé par la démo du site (dans le navigateur).

- Données : MNIST (60 000 chiffres manuscrits), téléchargé une fois.
- Augmentations pour coller à l'écriture au doigt sur une ardoise : rotation, échelle,
  décalage, épaisseur du trait.
- Modèle : perceptron 784 -> 192 -> 10 (scikit-learn), exporté en int8 (≈ 150 Ko)
  dans site/public/models/digits.json, lu par site/src/demo/digits.ts.

Usage : python scripts/train-digits.py
"""

from __future__ import annotations

import base64
import json
import os
import time
import urllib.request
from pathlib import Path

import numpy as np
from scipy import ndimage
from sklearn.neural_network import MLPClassifier

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get("TMP", "/tmp")) / "mnist.npz"
OUT = ROOT / "site" / "public" / "models" / "digits.json"
URL = "https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz"
HIDDEN = 192
rng = np.random.default_rng(7)


def load():
    if not CACHE.exists():
        print("Téléchargement de MNIST…")
        urllib.request.urlretrieve(URL, CACHE)
    d = np.load(CACHE)
    return d["x_train"], d["y_train"], d["x_test"], d["y_test"]


def normalize(img: np.ndarray) -> np.ndarray:
    """Même normalisation que dans le navigateur : boîte 20x20 conservant les proportions,
    centrée sur le centre de masse dans 28x28."""
    img = img.astype(np.float32)
    ys, xs = np.nonzero(img > 0.1 * img.max()) if img.max() > 0 else (np.array([]), np.array([]))
    if len(xs) == 0:
        return np.zeros((28, 28), np.float32)
    crop = img[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    h, w = crop.shape
    s = 20.0 / max(h, w)
    nh, nw = max(1, round(h * s)), max(1, round(w * s))
    crop = ndimage.zoom(crop, (nh / h, nw / w), order=1)
    canvas = np.zeros((28, 28), np.float32)
    top, left = (28 - crop.shape[0]) // 2, (28 - crop.shape[1]) // 2
    canvas[top : top + crop.shape[0], left : left + crop.shape[1]] = crop[:28, :28]
    cy, cx = ndimage.center_of_mass(canvas)
    canvas = ndimage.shift(canvas, (14 - cy, 14 - cx), order=1, mode="constant")
    m = canvas.max()
    return canvas / m if m > 0 else canvas


def augment(img: np.ndarray) -> np.ndarray:
    a = img.astype(np.float32) / 255.0
    a = ndimage.rotate(a, rng.uniform(-14, 14), reshape=False, order=1)
    sx, sy = rng.uniform(0.8, 1.15), rng.uniform(0.8, 1.15)
    a = ndimage.zoom(a, (sy, sx), order=1)
    r = rng.random()
    if r < 0.3:
        a = ndimage.grey_dilation(a, size=(2, 2))
    elif r < 0.45:
        a = ndimage.grey_erosion(a, size=(2, 2)) * 0.5 + a * 0.5
    return a


def main():
    t0 = time.time()
    xtr, ytr, xte, yte = load()
    print("Normalisation et augmentations…")
    X, Y = [], []
    for img, y in zip(xtr, ytr):
        X.append(normalize(img.astype(np.float32) / 255.0).ravel())
        Y.append(y)
        X.append(normalize(augment(img)).ravel())
        Y.append(y)
    X = np.asarray(X, np.float32)
    Y = np.asarray(Y)
    Xte = np.asarray([normalize(i.astype(np.float32) / 255.0).ravel() for i in xte], np.float32)
    print(f"{len(X)} exemples ({time.time() - t0:.0f} s)")

    clf = MLPClassifier(hidden_layer_sizes=(HIDDEN,), activation="relu", alpha=1e-4, batch_size=256,
                        learning_rate_init=1e-3, max_iter=18, early_stopping=False, verbose=True, random_state=1)
    clf.fit(X, Y)
    acc = (clf.predict(Xte) == yte).mean()
    print(f"Précision sur le jeu de test MNIST : {acc:.4f} ({time.time() - t0:.0f} s)")

    def q(m: np.ndarray):
        scale = float(np.abs(m).max() / 127.0) or 1.0
        qm = np.clip(np.round(m / scale), -127, 127).astype(np.int8)
        return {"shape": list(m.shape), "scale": scale, "data": base64.b64encode(qm.tobytes()).decode()}

    W1, W2 = clf.coefs_
    b1, b2 = clf.intercepts_
    model = {
        "name": "legriot-digits-mlp",
        "input": "28x28, 0..1, MNIST normalisation (20x20 box, centre of mass)",
        "test_accuracy": round(float(acc), 4),
        "W1": q(W1), "b1": [round(float(v), 5) for v in b1],
        "W2": q(W2), "b2": [round(float(v), 5) for v in b2],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(model), encoding="utf8")
    print(f"Modèle écrit : {OUT} ({OUT.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    main()
