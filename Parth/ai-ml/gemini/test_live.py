from gemini.analysis import generate_text


if __name__ == "__main__":
    result = generate_text(
        "Explain in one sentence why low wind speed can increase "
        "local pollution accumulation."
    )

    print(result)