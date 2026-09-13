import re

MOROCCAN_MOBILE_ERROR = "Veuillez saisir un numéro mobile marocain valide (06 ou 07)."


def normalize_moroccan_phone(candidate: str) -> str | None:
    compact = re.sub(r"[\s-]", "", candidate)
    if compact.startswith("00212"):
        compact = "+212" + compact[5:]
    elif compact.startswith("212"):
        compact = "+" + compact
    elif compact.startswith("0"):
        compact = "+212" + compact[1:]
    if re.fullmatch(r"\+212[67]\d{8}", compact):
        return compact
    return None
