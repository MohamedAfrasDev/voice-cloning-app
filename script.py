import modal

image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "chatterbox-tts==0.1.7",
    "fastapi[standard]==0.124.4",
    "peft==0.18.0",
    "setuptools<82",
)
