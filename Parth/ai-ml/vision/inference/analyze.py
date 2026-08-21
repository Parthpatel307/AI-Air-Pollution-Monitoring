"""Vision evidence analysis entry point."""


def analyze_evidence(image, prompt=None):
    """Return an analysis request payload for the configured vision service."""
    return {"image": image, "prompt": prompt}